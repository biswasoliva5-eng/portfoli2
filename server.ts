import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  destroyAllUserSessions,
  requireAdminAuth,
  AuthenticatedRequest,
} from './server/auth.js';
import { upload, storageProvider } from './server/storage.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '250mb' }));
  app.use(express.urlencoded({ extended: true, limit: '250mb' }));

  // Static uploads directory
  const uploadsPath = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsPath));

  // -------------------------------------------------------------
  // Public API Endpoints
  // -------------------------------------------------------------

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get full consolidated portfolio data for fast initial hydrate
  app.get('/api/portfolio/all', (_req, res) => {
    try {
      const data = db.getPublicData();
      res.json(data);
    } catch (err: any) {
      console.error('Error fetching public portfolio data:', err);
      res.status(500).json({ error: 'Failed to retrieve portfolio data' });
    }
  });

  app.get('/api/artworks', (req, res) => {
    try {
      let artworks = db.getArtworks();
      const { category, featured, search } = req.query;

      if (category) {
        artworks = artworks.filter(a => a.categorySlug === category);
      }
      if (featured === 'true') {
        artworks = artworks.filter(a => a.isFeatured);
      }
      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        artworks = artworks.filter(
          a =>
            a.title.toLowerCase().includes(q) ||
            a.medium.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q)
        );
      }
      res.json(artworks);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve artworks' });
    }
  });

  app.get('/api/artworks/:slug', (req, res) => {
    try {
      const artwork = db.getArtworkBySlug(req.params.slug);
      if (!artwork) {
        return res.status(404).json({ error: 'Artwork not found' });
      }
      res.json(artwork);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch artwork' });
    }
  });

  app.get('/api/categories', (_req, res) => {
    res.json(db.getCategories());
  });

  app.get('/api/years', (_req, res) => {
    res.json(db.getYears());
  });

  app.get('/api/exhibitions', (_req, res) => {
    res.json(db.getExhibitions());
  });

  app.get('/api/about', (_req, res) => {
    res.json(db.getAbout());
  });

  app.get('/api/cv', (_req, res) => {
    res.json(db.getCV());
  });

  app.get('/api/settings', (_req, res) => {
    res.json(db.getSettings());
  });

  // Contact form submission
  app.post('/api/contact', (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
      }

      // Basic email regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email address.' });
      }

      const newMsg = db.addMessage({
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        subject: String(subject || 'Portfolio Inquiry').trim(),
        message: String(message).trim(),
      });

      res.status(201).json({ success: true, message: 'Message sent successfully.', id: newMsg.id });
    } catch (err) {
      console.error('Contact error:', err);
      res.status(500).json({ error: 'Failed to send message.' });
    }
  });

  // -------------------------------------------------------------
  // Authentication Endpoints
  // -------------------------------------------------------------

  app.post('/api/auth/login', (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
      }

      const admin = db.getAdmin();
      const inputUsername = String(username).toLowerCase().trim();
      const isUsernameMatch = admin.username.toLowerCase() === inputUsername;
      const isPasswordValid = verifyPassword(String(password), admin.passwordHash);

      if (!isUsernameMatch || !isPasswordValid) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      const token = createSession(admin.username);
      res.json({
        success: true,
        token,
        username: admin.username,
        message: 'Authentication successful',
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Authentication failed.' });
    }
  });

  app.get('/api/auth/me', requireAdminAuth, (req: AuthenticatedRequest, res) => {
    const admin = db.getAdmin();
    res.json({
      authenticated: true,
      username: admin.username,
      updatedAt: admin.updatedAt,
    });
  });

  app.post('/api/auth/logout', requireAdminAuth, (req: AuthenticatedRequest, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      destroySession(token);
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  app.post('/api/auth/change-password', requireAdminAuth, (req: AuthenticatedRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required.' });
      }

      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      }

      const admin = db.getAdmin();
      if (!verifyPassword(currentPassword, admin.passwordHash)) {
        return res.status(400).json({ error: 'Incorrect current password.' });
      }

      const newHash = hashPassword(newPassword);
      db.updateAdminCredentials(admin.username, newHash);

      // Invalidate existing sessions and create a fresh one for the current user
      destroyAllUserSessions(admin.username);
      const newToken = createSession(admin.username);

      res.json({
        success: true,
        token: newToken,
        message: 'Password updated successfully.',
      });
    } catch (err) {
      console.error('Password change error:', err);
      res.status(500).json({ error: 'Failed to update password.' });
    }
  });

  // -------------------------------------------------------------
  // Protected Admin Management Endpoints
  // -------------------------------------------------------------

  // Admin Dashboard summary
  app.get('/api/admin/dashboard', requireAdminAuth, (_req, res) => {
    try {
      const artworks = db.getArtworks();
      const categories = db.getCategories();
      const exhibitions = db.getExhibitions();
      const cv = db.getCV();
      const messages = db.getMessages();
      const settings = db.getSettings();

      res.json({
        stats: {
          totalArtworks: artworks.length,
          featuredArtworks: artworks.filter(a => a.isFeatured).length,
          totalCategories: categories.length,
          totalExhibitions: exhibitions.length,
          hasCV: Boolean(cv && cv.url),
          unreadMessages: messages.filter(m => !m.read).length,
          totalMessages: messages.length,
        },
        recentArtworks: artworks.slice(0, 5),
        recentMessages: messages.slice(0, 5),
        coverImage: settings.coverImage,
        cv,
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to load dashboard data.' });
    }
  });

  // Upload single file (image or pdf)
  app.post('/api/admin/upload', requireAdminAuth, upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }
      const url = storageProvider.getFileUrl(req.file.filename);
      res.json({
        success: true,
        filename: req.file.filename,
        url,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'File upload failed.' });
    }
  });

  // Upload multiple artwork images
  app.post('/api/admin/upload-multiple', requireAdminAuth, upload.array('files', 10), (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded.' });
      }
      const uploaded = files.map((f, index) => ({
        id: `img-${Date.now()}-${index}`,
        filename: f.filename,
        url: storageProvider.getFileUrl(f.filename),
        size: f.size,
        order: index + 1,
      }));
      res.json({ success: true, files: uploaded });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Multiple upload failed.' });
    }
  });

  // Save image edited client-side (crop, rotate, filters)
  app.post('/api/admin/save-edited-image', requireAdminAuth, async (req, res) => {
    try {
      const { dataUrl, prefix } = req.body;
      if (!dataUrl) {
        return res.status(400).json({ error: 'dataUrl is required' });
      }
      const fileUrl = await storageProvider.saveBase64Image(dataUrl, prefix || 'edited');
      res.json({ success: true, url: fileUrl });
    } catch (err: any) {
      console.error('Save edited image error:', err);
      res.status(500).json({ error: err.message || 'Failed to save edited image.' });
    }
  });

  // Artworks CRUD
  app.post('/api/admin/artworks', requireAdminAuth, (req, res) => {
    try {
      const {
        title,
        year,
        categorySlug,
        medium,
        dimensions,
        description,
        mainImage,
        images,
        isFeatured,
        notes,
      } = req.body;

      if (!title || !categorySlug || !mainImage) {
        return res.status(400).json({ error: 'Title, category, and main image are required.' });
      }

      // Generate slug
      const baseSlug = String(title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

      // Lookup category name
      const categories = db.getCategories();
      const cat = categories.find(c => c.slug === categorySlug);
      const categoryName = cat ? cat.name : categorySlug;

      const artwork = db.addArtwork({
        slug,
        title: String(title).trim(),
        year: year || new Date().getFullYear(),
        categorySlug,
        categoryName,
        medium: String(medium || '').trim(),
        dimensions: String(dimensions || '').trim(),
        description: String(description || '').trim(),
        mainImage,
        images: Array.isArray(images) && images.length > 0 ? images : [
          { id: `img-${Date.now()}`, url: mainImage, alt: title, order: 1, isPrimary: true }
        ],
        isFeatured: Boolean(isFeatured),
        notes: notes ? String(notes).trim() : undefined,
        videoUrl: req.body.videoUrl ? String(req.body.videoUrl).trim() : undefined,
        videoTitle: req.body.videoTitle ? String(req.body.videoTitle).trim() : undefined,
        mediaType: req.body.mediaType || (req.body.videoUrl ? 'video' : 'image'),
      });

      res.status(201).json(artwork);
    } catch (err) {
      console.error('Error creating artwork:', err);
      res.status(500).json({ error: 'Failed to create artwork.' });
    }
  });

  app.put('/api/admin/artworks/:id', requireAdminAuth, (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.categorySlug && !updates.categoryName) {
        const cat = db.getCategories().find(c => c.slug === updates.categorySlug);
        if (cat) updates.categoryName = cat.name;
      }

      const updated = db.updateArtwork(id, updates);
      if (!updated) {
        return res.status(404).json({ error: 'Artwork not found.' });
      }
      res.json(updated);
    } catch (err) {
      console.error('Error updating artwork:', err);
      res.status(500).json({ error: 'Failed to update artwork.' });
    }
  });

  app.delete('/api/admin/artworks/:id', requireAdminAuth, (req, res) => {
    try {
      const { id } = req.params;
      const success = db.deleteArtwork(id);
      if (!success) {
        return res.status(404).json({ error: 'Artwork not found.' });
      }
      res.json({ success: true, message: 'Artwork deleted successfully.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete artwork.' });
    }
  });

  app.post('/api/admin/artworks/:id/toggle-featured', requireAdminAuth, (req, res) => {
    try {
      const { id } = req.params;
      const artwork = db.getArtworks().find(a => a.id === id);
      if (!artwork) {
        return res.status(404).json({ error: 'Artwork not found.' });
      }
      const updated = db.updateArtwork(id, { isFeatured: !artwork.isFeatured });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to toggle featured status.' });
    }
  });

  // Categories CRUD
  app.post('/api/admin/categories', requireAdminAuth, (req, res) => {
    try {
      const { name, slug, description, coverImage } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Category name is required.' });
      }

      const finalSlug = slug
        ? String(slug).toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const existingCats = db.getCategories();
      if (existingCats.some(c => c.slug === finalSlug)) {
        return res.status(400).json({ error: 'A category with this slug already exists.' });
      }

      const newCat = db.addCategory({
        name: String(name).trim(),
        slug: finalSlug,
        description: description ? String(description).trim() : undefined,
        order: existingCats.length + 1,
        coverImage,
      });

      res.status(201).json(newCat);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create category.' });
    }
  });

  app.put('/api/admin/categories/:id', requireAdminAuth, (req, res) => {
    try {
      const { id } = req.params;
      const updated = db.updateCategory(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Category not found.' });
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update category.' });
    }
  });

  app.delete('/api/admin/categories/:id', requireAdminAuth, (req, res) => {
    try {
      const { id } = req.params;
      const cat = db.getCategories().find(c => c.id === id);
      if (!cat) {
        return res.status(404).json({ error: 'Category not found.' });
      }

      // Check if artworks exist in this category
      const associatedArtworks = db.getArtworks().filter(a => a.categorySlug === cat.slug);
      if (associatedArtworks.length > 0) {
        return res.status(400).json({
          error: `Cannot delete category "${cat.name}". It contains ${associatedArtworks.length} artwork(s). Reassign them first.`,
        });
      }

      const success = db.deleteCategory(id);
      res.json({ success, message: 'Category deleted.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete category.' });
    }
  });

  app.put('/api/admin/categories/reorder', requireAdminAuth, (req, res) => {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ error: 'orderedIds array required' });
      }
      const updated = db.reorderCategories(orderedIds);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to reorder categories.' });
    }
  });

  // Years Management CRUD
  app.post('/api/admin/years', requireAdminAuth, (req, res) => {
    try {
      const { year } = req.body;
      if (!year) {
        return res.status(400).json({ error: 'Year is required.' });
      }
      const updatedYears = db.addYear(String(year));
      res.status(201).json(updatedYears);
    } catch (err) {
      res.status(500).json({ error: 'Failed to add year.' });
    }
  });

  app.delete('/api/admin/years/:year', requireAdminAuth, (req, res) => {
    try {
      const { year } = req.params;
      const updatedYears = db.removeYear(year);
      res.json(updatedYears);
    } catch (err) {
      res.status(500).json({ error: 'Failed to remove year.' });
    }
  });

  app.put('/api/admin/years', requireAdminAuth, (req, res) => {
    try {
      const { years } = req.body;
      if (!Array.isArray(years)) {
        return res.status(400).json({ error: 'years must be an array.' });
      }
      const updatedYears = db.setYears(years);
      res.json(updatedYears);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update years.' });
    }
  });

  // Exhibitions CRUD
  app.post('/api/admin/exhibitions', requireAdminAuth, (req, res) => {
    try {
      const { title, year, dateString, venue, location, type, description, externalLink } = req.body;
      if (!title || !venue || !location) {
        return res.status(400).json({ error: 'Title, venue, and location are required.' });
      }

      const ex = db.addExhibition({
        title: String(title).trim(),
        year: year || new Date().getFullYear(),
        dateString: dateString ? String(dateString).trim() : undefined,
        venue: String(venue).trim(),
        location: String(location).trim(),
        type: type || 'Solo',
        description: String(description || '').trim(),
        externalLink: externalLink ? String(externalLink).trim() : undefined,
        order: db.getExhibitions().length + 1,
      });

      res.status(201).json(ex);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create exhibition.' });
    }
  });

  app.put('/api/admin/exhibitions/:id', requireAdminAuth, (req, res) => {
    try {
      const { id } = req.params;
      const updated = db.updateExhibition(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Exhibition not found.' });
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update exhibition.' });
    }
  });

  app.delete('/api/admin/exhibitions/:id', requireAdminAuth, (req, res) => {
    try {
      const { id } = req.params;
      const success = db.deleteExhibition(id);
      if (!success) {
        return res.status(404).json({ error: 'Exhibition not found.' });
      }
      res.json({ success: true, message: 'Exhibition deleted.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete exhibition.' });
    }
  });

  // About Content
  app.put('/api/admin/about', requireAdminAuth, (req, res) => {
    try {
      const updated = db.updateAbout(req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update About content.' });
    }
  });

  // CV Management
  app.post('/api/admin/cv/upload', requireAdminAuth, upload.single('cvFile'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No CV file uploaded.' });
      }
      const cvDoc = {
        id: `cv-${Date.now()}`,
        filename: req.file.originalname,
        url: storageProvider.getFileUrl(req.file.filename),
        uploadedAt: new Date().toISOString(),
        sizeBytes: req.file.size,
      };
      db.updateCV(cvDoc);
      res.json(cvDoc);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to upload CV.' });
    }
  });

  app.delete('/api/admin/cv', requireAdminAuth, (req, res) => {
    try {
      const current = db.getCV();
      if (current && current.url) {
        storageProvider.deleteFile(current.url);
      }
      db.updateCV(null);
      res.json({ success: true, message: 'CV deleted.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete CV.' });
    }
  });

  // Social Links
  app.put('/api/admin/social', requireAdminAuth, (req, res) => {
    try {
      const { links } = req.body;
      if (!Array.isArray(links)) {
        return res.status(400).json({ error: 'links must be an array.' });
      }
      const updated = db.updateSocialLinks(links);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update social links.' });
    }
  });

  // Site Settings
  app.put('/api/admin/settings', requireAdminAuth, (req, res) => {
    try {
      const updated = db.updateSettings(req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update settings.' });
    }
  });

  // Admin Username update
  app.post('/api/admin/change-username', requireAdminAuth, (req: AuthenticatedRequest, res) => {
    try {
      const { newUsername } = req.body;
      if (!newUsername || typeof newUsername !== 'string' || newUsername.trim().length < 3) {
        return res.status(400).json({ error: 'New username must be at least 3 characters.' });
      }
      db.updateAdminCredentials(newUsername.trim());
      res.json({ success: true, username: newUsername.trim() });
    } catch (err) {
      res.status(500).json({ error: 'Failed to change username.' });
    }
  });

  // Contact Messages management
  app.get('/api/admin/messages', requireAdminAuth, (_req, res) => {
    res.json(db.getMessages());
  });

  app.put('/api/admin/messages/:id/read', requireAdminAuth, (req, res) => {
    db.markMessageRead(req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/admin/messages/:id', requireAdminAuth, (req, res) => {
    const success = db.deleteMessage(req.params.id);
    res.json({ success });
  });

  // -------------------------------------------------------------
  // Vite Middleware / Static Serving
  // -------------------------------------------------------------

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Oliva Biswas Portfolio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
