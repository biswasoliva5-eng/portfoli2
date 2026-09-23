import {
  PortfolioData,
  Artwork,
  Category,
  Exhibition,
  AboutContent,
  CVDoc,
  SocialLink,
  SiteSettings,
  ContactMessage,
  AdminAuthResponse,
} from '../types.js';
import {
  getLocalPortfolioData,
  getLocalPortfolioDataAsync,
  saveLocalPortfolioData,
  saveLocalPortfolioDataAsync,
  getLocalAdminPassword,
  setLocalAdminPassword,
} from '../data/defaultPortfolioData.js';
import { compressImage } from '../utils/imageCompressor.js';
import {
  getFirestorePortfolioData,
  saveFirestoreSettings,
  saveFirestoreArtwork,
  deleteFirestoreArtwork,
  saveFirestoreCategory,
  deleteFirestoreCategory,
  saveFirestoreExhibition,
  deleteFirestoreExhibition,
  saveFirestoreAbout,
  saveFirestoreCV,
  saveFirestoreSocialLinks,
  saveFirestoreInquiry,
  deleteFirestoreInquiry,
} from '../lib/firestoreService.js';

const AUTH_TOKEN_KEY = 'oliva_biswas_admin_token';
const AUTH_USER_KEY = 'oliva_biswas_admin_user';

let detectedStaticHost: boolean | null = null;

export function isStaticHost(): boolean {
  if (detectedStaticHost !== null) return detectedStaticHost;
  const token = getStoredToken();
  if (token && token.startsWith('static_auth_')) {
    detectedStaticHost = true;
    return true;
  }
  return false;
}

export function setStaticHostDetected(isStatic: boolean) {
  detectedStaticHost = isStatic;
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string, username: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, username);
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export function clearStoredToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export function getStoredUsername(): string | null {
  try {
    return localStorage.getItem(AUTH_USER_KEY);
  } catch {
    return null;
  }
}

function isStaticHostingError(err: any): boolean {
  if (detectedStaticHost === true) return true;
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  const isMatch = (
    msg.includes('404') ||
    msg.includes('405') ||
    msg.includes('method not allowed') ||
    msg.includes('not found') ||
    msg.includes('html') ||
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('unexpected token') ||
    msg.includes('static host detected') ||
    msg.includes('load failed') ||
    msg.includes('quotaexceedederror')
  );
  if (isMatch) {
    detectedStaticHost = true;
  }
  return isMatch;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Do not set Content-Type if body is FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    throw new Error('Static host detected (Server returned HTML instead of API JSON)');
  }

  if (!response.ok) {
    let errMsg = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const json = await response.json();
      if (json.error) errMsg = json.error;
    } catch {
      // fallback
    }
    throw new Error(errMsg);
  }

  return response.json();
}

export const api = {
  // Public Data
  getPublicData: async (): Promise<PortfolioData> => {
    try {
      return await request<PortfolioData>('/api/portfolio/all');
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        // Try Cloud Firestore first for persistent real-time database across all devices
        try {
          const fsData = await getFirestorePortfolioData();
          if (fsData) {
            saveLocalPortfolioData(fsData);
            return fsData;
          }
        } catch (fsErr) {
          console.warn('Cloud Firestore fetch fallback to local:', fsErr);
        }
        return await getLocalPortfolioDataAsync();
      }
      throw err;
    }
  },

  getArtworks: async (params?: { category?: string; featured?: boolean; search?: string }): Promise<Artwork[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.category) q.set('category', params.category);
      if (params?.featured) q.set('featured', 'true');
      if (params?.search) q.set('search', params.search);
      return await request<Artwork[]>(`/api/artworks?${q.toString()}`);
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        let list = local.artworks;
        if (params?.category) list = list.filter(a => a.categorySlug === params.category);
        if (params?.featured) list = list.filter(a => a.isFeatured);
        if (params?.search) {
          const s = params.search.toLowerCase();
          list = list.filter(a => a.title.toLowerCase().includes(s) || a.medium.toLowerCase().includes(s));
        }
        return list;
      }
      throw err;
    }
  },

  getArtworkBySlug: async (slug: string): Promise<Artwork> => {
    try {
      return await request<Artwork>(`/api/artworks/${slug}`);
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        const art = local.artworks.find(a => a.slug === slug || a.id === slug);
        if (art) return art;
      }
      throw err;
    }
  },

  sendContactMessage: async (data: { name: string; email: string; subject?: string; message: string }) => {
    try {
      return await request<{ success: boolean; message: string }>('/api/contact', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        const newMsg: ContactMessage = {
          id: `msg-${Date.now()}`,
          name: data.name,
          email: data.email,
          subject: data.subject || 'General Inquiry',
          message: data.message,
          receivedAt: new Date().toISOString(),
          read: false,
        };
        local.messages = [newMsg, ...(local.messages || [])];
        saveLocalPortfolioData(local);

        // Also save directly to Cloud Firestore database
        saveFirestoreInquiry(newMsg).catch(e => console.warn('Firestore inquiry sync note:', e));

        return { success: true, message: 'Message recorded successfully.' };
      }
      throw err;
    }
  },

  // Auth
  login: async (username: string, password: string): Promise<AdminAuthResponse> => {
    try {
      const res = await request<AdminAuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      if (res.token && res.username) {
        setStoredToken(res.token, res.username);
      }
      return res;
    } catch (err: any) {
      // If server is absent (e.g. Netlify static hosting where Node backend is not running)
      if (isStaticHostingError(err)) {
        const validPassword = getLocalAdminPassword();
        const normalizedUser = username.trim().toLowerCase();
        if (
          (normalizedUser === 'olivabiswas' || normalizedUser === 'admin') &&
          password.trim() === validPassword
        ) {
          const fallbackToken = `static_auth_${Date.now()}`;
          setStoredToken(fallbackToken, username.trim());
          return {
            success: true,
            token: fallbackToken,
            username: username.trim(),
          };
        } else {
          throw new Error('Invalid username or password. Please verify credentials.');
        }
      }
      throw err;
    }
  },

  getMe: async (): Promise<{ authenticated: boolean; username: string }> => {
    try {
      return await request<{ authenticated: boolean; username: string }>('/api/auth/me');
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const token = getStoredToken();
        const username = getStoredUsername();
        if (token && username) {
          return { authenticated: true, username };
        }
      }
      throw err;
    }
  },

  logout: async () => {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      clearStoredToken();
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      return await request<{ success: boolean; token: string; message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const stored = getLocalAdminPassword();
        if (currentPassword !== stored) {
          throw new Error('Current password does not match.');
        }
        setLocalAdminPassword(newPassword);
        const token = `static_auth_${Date.now()}`;
        setStoredToken(token, getStoredUsername() || 'olivabiswas');
        return { success: true, token, message: 'Password updated successfully.' };
      }
      throw err;
    }
  },

  changeUsername: async (newUsername: string) => {
    try {
      return await request<{ success: boolean; username: string }>('/api/admin/change-username', {
        method: 'POST',
        body: JSON.stringify({ newUsername }),
      });
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        setStoredToken(getStoredToken() || 'static_auth', newUsername);
        return { success: true, username: newUsername };
      }
      throw err;
    }
  },

  // Admin Dashboard
  getDashboard: async () => {
    try {
      return await request<any>('/api/admin/dashboard');
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        return {
          stats: {
            totalArtworks: local.artworks.length,
            featuredArtworks: local.artworks.filter(a => a.isFeatured).length,
            totalCategories: local.categories.length,
            totalExhibitions: local.exhibitions.length,
            hasCV: !!local.cv,
            unreadMessages: (local.messages || []).filter(m => !m.read).length,
            totalMessages: (local.messages || []).length,
          },
          recentArtworks: local.artworks.slice(0, 5),
          recentMessages: (local.messages || []).slice(0, 5),
          coverImage: local.settings.coverImage,
          cv: local.cv,
        };
      }
      throw err;
    }
  },

  // Artwork Management
  addArtwork: async (artwork: Partial<Artwork>): Promise<Artwork> => {
    try {
      const created = await request<Artwork>('/api/admin/artworks', {
        method: 'POST',
        body: JSON.stringify(artwork),
      });
      // Also sync to Firestore and local IndexedDB cache in background
      saveFirestoreArtwork(created).catch(() => {});
      const local = getLocalPortfolioData();
      local.artworks.unshift(created);
      saveLocalPortfolioData(local);
      return created;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        const newArt: Artwork = {
          id: `art-${Date.now()}`,
          slug: (artwork.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          title: artwork.title || 'Untitled Work',
          year: artwork.year || new Date().getFullYear(),
          categorySlug: artwork.categorySlug || 'painting',
          categoryName: artwork.categoryName || 'Painting',
          medium: artwork.medium || '',
          dimensions: artwork.dimensions || '',
          description: artwork.description || '',
          mainImage: artwork.mainImage || '',
          images: artwork.images || [],
          isFeatured: artwork.isFeatured || false,
          notes: artwork.notes || '',
          videoUrl: artwork.videoUrl || '',
          videoTitle: artwork.videoTitle || '',
          mediaType: artwork.mediaType || (artwork.videoUrl ? 'video' : 'image'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        local.artworks.unshift(newArt);
        await saveLocalPortfolioDataAsync(local);

        // Sync to Cloud Firestore database
        saveFirestoreArtwork(newArt).catch(e => console.warn('Firestore artwork sync note:', e));

        return newArt;
      }
      throw err;
    }
  },

  createArtwork: async (artwork: Partial<Artwork>): Promise<Artwork> => {
    return api.addArtwork(artwork);
  },

  updateArtwork: async (id: string, updates: Partial<Artwork>): Promise<Artwork> => {
    try {
      const updated = await request<Artwork>(`/api/admin/artworks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      // Sync to Firestore & local IndexedDB
      saveFirestoreArtwork(updated).catch(() => {});
      const local = getLocalPortfolioData();
      const idx = local.artworks.findIndex(a => a.id === id);
      if (idx !== -1) {
        local.artworks[idx] = updated;
        saveLocalPortfolioData(local);
      }
      return updated;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        const idx = local.artworks.findIndex(a => a.id === id);
        if (idx !== -1) {
          local.artworks[idx] = {
            ...local.artworks[idx],
            ...updates,
            updatedAt: new Date().toISOString()
          };
          await saveLocalPortfolioDataAsync(local);

          // Sync to Cloud Firestore database
          saveFirestoreArtwork(local.artworks[idx]).catch(e => console.warn('Firestore artwork sync note:', e));

          return local.artworks[idx];
        }
      }
      throw err;
    }
  },

  deleteArtwork: async (id: string) => {
    try {
      const res = await request<{ success: boolean }>(`/api/admin/artworks/${id}`, {
        method: 'DELETE',
      });
      // Sync deletion to Firestore & local cache
      deleteFirestoreArtwork(id).catch(() => {});
      const local = getLocalPortfolioData();
      local.artworks = local.artworks.filter(a => a.id !== id);
      saveLocalPortfolioData(local);
      return res;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        local.artworks = local.artworks.filter(a => a.id !== id);
        await saveLocalPortfolioDataAsync(local);

        // Sync deletion to Cloud Firestore database
        deleteFirestoreArtwork(id).catch(e => console.warn('Firestore artwork delete note:', e));

        return { success: true };
      }
      throw err;
    }
  },

  toggleFeatured: async (id: string): Promise<Artwork> => {
    try {
      return await request<Artwork>(`/api/admin/artworks/${id}/toggle-featured`, {
        method: 'POST',
      });
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        const idx = local.artworks.findIndex(a => a.id === id);
        if (idx !== -1) {
          local.artworks[idx].isFeatured = !local.artworks[idx].isFeatured;
          saveLocalPortfolioData(local);
          return local.artworks[idx];
        }
      }
      throw err;
    }
  },

  // Categories
  addCategory: async (category: Partial<Category>): Promise<Category> => {
    try {
      const created = await request<Category>('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify(category),
      });
      saveFirestoreCategory(created).catch(() => {});
      const local = getLocalPortfolioData();
      local.categories.push(created);
      saveLocalPortfolioData(local);
      return created;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        const newCat: Category = {
          id: `cat-${Date.now()}`,
          name: category.name || 'New Category',
          slug: (category.slug || category.name || 'category').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: category.description || '',
          order: category.order || local.categories.length + 1,
          coverImage: category.coverImage || '',
        };
        local.categories.push(newCat);
        await saveLocalPortfolioDataAsync(local);
        saveFirestoreCategory(newCat).catch(() => {});
        return newCat;
      }
      throw err;
    }
  },

  createCategory: async (category: Partial<Category>): Promise<Category> => {
    return api.addCategory(category);
  },

  updateCategory: async (id: string, updates: Partial<Category>): Promise<Category> => {
    try {
      const updated = await request<Category>(`/api/admin/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      saveFirestoreCategory(updated).catch(() => {});
      const local = getLocalPortfolioData();
      const idx = local.categories.findIndex(c => c.id === id);
      if (idx !== -1) {
        local.categories[idx] = updated;
        saveLocalPortfolioData(local);
      }
      return updated;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        const idx = local.categories.findIndex(c => c.id === id);
        if (idx !== -1) {
          local.categories[idx] = { ...local.categories[idx], ...updates };
          await saveLocalPortfolioDataAsync(local);
          saveFirestoreCategory(local.categories[idx]).catch(() => {});
          return local.categories[idx];
        }
      }
      throw err;
    }
  },

  deleteCategory: async (id: string) => {
    try {
      const res = await request<{ success: boolean }>(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });
      deleteFirestoreCategory(id).catch(() => {});
      const local = getLocalPortfolioData();
      local.categories = local.categories.filter(c => c.id !== id);
      saveLocalPortfolioData(local);
      return res;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        local.categories = local.categories.filter(c => c.id !== id);
        await saveLocalPortfolioDataAsync(local);
        deleteFirestoreCategory(id).catch(() => {});
        return { success: true };
      }
      throw err;
    }
  },

  reorderCategories: async (orderedIds: string[]): Promise<Category[]> => {
    try {
      return await request<Category[]>('/api/admin/categories/reorder', {
        method: 'PUT',
        body: JSON.stringify({ orderedIds }),
      });
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        local.categories.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
        await saveLocalPortfolioDataAsync(local);
        local.categories.forEach(c => saveFirestoreCategory(c).catch(() => {}));
        return local.categories;
      }
      throw err;
    }
  },

  // Exhibitions
  addExhibition: async (exhibition: Partial<Exhibition>): Promise<Exhibition> => {
    try {
      const created = await request<Exhibition>('/api/admin/exhibitions', {
        method: 'POST',
        body: JSON.stringify(exhibition),
      });
      saveFirestoreExhibition(created).catch(() => {});
      const local = getLocalPortfolioData();
      local.exhibitions.push(created);
      saveLocalPortfolioData(local);
      return created;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        const newEx: Exhibition = {
          id: `ex-${Date.now()}`,
          title: exhibition.title || 'Exhibition Title',
          year: exhibition.year || new Date().getFullYear(),
          dateString: exhibition.dateString || '',
          venue: exhibition.venue || '',
          location: exhibition.location || '',
          type: exhibition.type || 'Solo',
          description: exhibition.description || '',
          externalLink: exhibition.externalLink,
          order: exhibition.order || local.exhibitions.length + 1,
        };
        local.exhibitions.push(newEx);
        await saveLocalPortfolioDataAsync(local);
        saveFirestoreExhibition(newEx).catch(() => {});
        return newEx;
      }
      throw err;
    }
  },

  createExhibition: async (exhibition: Partial<Exhibition>): Promise<Exhibition> => {
    return api.addExhibition(exhibition);
  },

  updateExhibition: async (id: string, updates: Partial<Exhibition>): Promise<Exhibition> => {
    try {
      const updated = await request<Exhibition>(`/api/admin/exhibitions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      saveFirestoreExhibition(updated).catch(() => {});
      const local = getLocalPortfolioData();
      const idx = local.exhibitions.findIndex(e => e.id === id);
      if (idx !== -1) {
        local.exhibitions[idx] = updated;
        saveLocalPortfolioData(local);
      }
      return updated;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        const idx = local.exhibitions.findIndex(e => e.id === id);
        if (idx !== -1) {
          local.exhibitions[idx] = { ...local.exhibitions[idx], ...updates };
          await saveLocalPortfolioDataAsync(local);
          saveFirestoreExhibition(local.exhibitions[idx]).catch(() => {});
          return local.exhibitions[idx];
        }
      }
      throw err;
    }
  },

  deleteExhibition: async (id: string) => {
    try {
      const res = await request<{ success: boolean }>(`/api/admin/exhibitions/${id}`, {
        method: 'DELETE',
      });
      deleteFirestoreExhibition(id).catch(() => {});
      const local = getLocalPortfolioData();
      local.exhibitions = local.exhibitions.filter(e => e.id !== id);
      saveLocalPortfolioData(local);
      return res;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        local.exhibitions = local.exhibitions.filter(e => e.id !== id);
        await saveLocalPortfolioDataAsync(local);
        deleteFirestoreExhibition(id).catch(() => {});
        return { success: true };
      }
      throw err;
    }
  },

  // About
  updateAbout: async (about: Partial<AboutContent>): Promise<AboutContent> => {
    try {
      const updated = await request<AboutContent>('/api/admin/about', {
        method: 'PUT',
        body: JSON.stringify(about),
      });
      saveFirestoreAbout(updated).catch(() => {});
      const local = getLocalPortfolioData();
      local.about = { ...local.about, ...updated };
      saveLocalPortfolioData(local);
      return updated;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        local.about = { ...local.about, ...about };
        await saveLocalPortfolioDataAsync(local);
        saveFirestoreAbout(local.about).catch(() => {});
        return local.about;
      }
      throw err;
    }
  },

  // Uploads
  uploadFile: async (file: File): Promise<{ url: string; filename: string; size: number; fileUrl?: string }> => {
    let fileToUpload = file;
    let fallbackDataUrl = '';

    if (file.type.startsWith('image/')) {
      try {
        const compressed = await compressImage(file, 2048, 2048, 0.85);
        fileToUpload = compressed.file;
        fallbackDataUrl = compressed.dataUrl;
      } catch (e) {
        console.warn('Image compression note:', e);
      }
    }

    // If static hosting is already known, return compressed data URL directly
    if (isStaticHost() && fallbackDataUrl) {
      return {
        url: fallbackDataUrl,
        filename: fileToUpload.name,
        size: fileToUpload.size,
        fileUrl: fallbackDataUrl,
      };
    }

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      const res = await request<{ url: string; filename: string; size: number }>('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      return { ...res, fileUrl: res.url };
    } catch (err: any) {
      if (isStaticHostingError(err) || fallbackDataUrl) {
        if (!fallbackDataUrl) {
          fallbackDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read upload file'));
            reader.readAsDataURL(fileToUpload);
          });
        }
        return {
          url: fallbackDataUrl,
          filename: fileToUpload.name,
          size: fileToUpload.size,
          fileUrl: fallbackDataUrl,
        };
      }
      throw err;
    }
  },

  uploadMultipleFiles: async (
    files: File[]
  ): Promise<{ success: boolean; files: Array<{ id: string; url: string; filename: string; order: number }> }> => {
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      return await request('/api/admin/upload-multiple', {
        method: 'POST',
        body: formData,
      });
    } catch (err: any) {
      const results: Array<{ id: string; url: string; filename: string; order: number }> = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const res = await api.uploadFile(f);
        results.push({
          id: `img-${Date.now()}-${i}`,
          url: res.url,
          filename: res.filename,
          order: i + 1,
        });
      }
      return { success: true, files: results };
    }
  },

  saveEditedImage: async (dataUrl: string, _prefix = 'edited'): Promise<{ success: boolean; url: string; fileUrl: string }> => {
    try {
      const res = await request<{ success: boolean; url: string }>('/api/admin/save-edited-image', {
        method: 'POST',
        body: JSON.stringify({ dataUrl, prefix: _prefix }),
      });
      return { ...res, fileUrl: res.url };
    } catch (err: any) {
      return { success: true, url: dataUrl, fileUrl: dataUrl };
    }
  },

  // CV
  uploadCV: async (file: File): Promise<CVDoc> => {
    try {
      const formData = new FormData();
      formData.append('cvFile', file);
      const res = await request<CVDoc>('/api/admin/cv/upload', {
        method: 'POST',
        body: formData,
      });
      saveFirestoreCV(res).catch(() => {});
      const local = getLocalPortfolioData();
      local.cv = res;
      saveLocalPortfolioData(local);
      return res;
    } catch (err: any) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = reader.result as string;
          const cv: CVDoc = {
            id: `cv-${Date.now()}`,
            url: dataUrl,
            filename: file.name,
            uploadedAt: new Date().toISOString(),
            sizeBytes: file.size,
          };
          const local = await getLocalPortfolioDataAsync();
          local.cv = cv;
          await saveLocalPortfolioDataAsync(local);
          saveFirestoreCV(cv).catch(() => {});
          resolve(cv);
        };
        reader.onerror = () => reject(new Error('Failed to read CV file'));
        reader.readAsDataURL(file);
      });
    }
  },

  deleteCV: async () => {
    try {
      const res = await request<{ success: boolean }>('/api/admin/cv', {
        method: 'DELETE',
      });
      saveFirestoreCV(null).catch(() => {});
      const local = getLocalPortfolioData();
      local.cv = null;
      saveLocalPortfolioData(local);
      return res;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        local.cv = null;
        await saveLocalPortfolioDataAsync(local);
        saveFirestoreCV(null).catch(() => {});
        return { success: true };
      }
      throw err;
    }
  },

  // Social & Settings
  updateSocialLinks: async (links: SocialLink[]): Promise<SocialLink[]> => {
    try {
      const res = await request<SocialLink[]>('/api/admin/social', {
        method: 'PUT',
        body: JSON.stringify({ links }),
      });
      saveFirestoreSocialLinks(links).catch(() => {});
      const local = getLocalPortfolioData();
      local.socialLinks = links;
      saveLocalPortfolioData(local);
      return res;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        local.socialLinks = links;
        await saveLocalPortfolioDataAsync(local);
        saveFirestoreSocialLinks(links).catch(() => {});
        return links;
      }
      throw err;
    }
  },

  createSocialLink: async (link: { platform: string; url: string; label?: string; order?: number }) => {
    const data = await api.getPublicData();
    const newLinks: SocialLink[] = [
      ...(data.socialLinks || []),
      {
        id: `soc-${Date.now()}`,
        platform: link.platform,
        label: link.label || link.platform,
        url: link.url,
        isEnabled: true,
        order: link.order || (data.socialLinks ? data.socialLinks.length + 1 : 1),
      },
    ];
    return api.updateSocialLinks(newLinks);
  },

  updateSocialLink: async (id: string, updates: Partial<SocialLink>) => {
    const data = await api.getPublicData();
    const newLinks: SocialLink[] = (data.socialLinks || []).map(l => (l.id === id ? { ...l, ...updates } : l));
    return api.updateSocialLinks(newLinks);
  },

  deleteSocialLink: async (id: string) => {
    const data = await api.getPublicData();
    const newLinks: SocialLink[] = (data.socialLinks || []).filter(l => l.id !== id);
    return api.updateSocialLinks(newLinks);
  },

  updateSettings: async (settings: Partial<SiteSettings>): Promise<SiteSettings> => {
    try {
      const res = await request<SiteSettings>('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      saveFirestoreSettings(settings).catch(() => {});
      const local = getLocalPortfolioData();
      local.settings = { ...local.settings, ...settings };
      saveLocalPortfolioData(local);
      return res;
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = await getLocalPortfolioDataAsync();
        local.settings = { ...local.settings, ...settings };
        await saveLocalPortfolioDataAsync(local);

        // Sync settings to Cloud Firestore database
        saveFirestoreSettings(settings).catch(e => console.warn('Firestore settings sync note:', e));

        return local.settings;
      }
      throw err;
    }
  },

  // Years
  getYears: async (): Promise<string[]> => {
    try {
      return await request<string[]>('/api/years');
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        return local.years || ['2025', '2024', '2023', '2022', '2021', '2020'];
      }
      throw err;
    }
  },

  addYear: async (year: string): Promise<string[]> => {
    try {
      return await request<string[]>('/api/admin/years', {
        method: 'POST',
        body: JSON.stringify({ year }),
      });
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        const years = new Set(local.years || []);
        years.add(year);
        local.years = Array.from(years).sort((a, b) => Number(b) - Number(a));
        saveLocalPortfolioData(local);
        return local.years;
      }
      throw err;
    }
  },

  deleteYear: async (year: string): Promise<string[]> => {
    try {
      return await request<string[]>(`/api/admin/years/${encodeURIComponent(year)}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        local.years = (local.years || []).filter(y => y !== year);
        saveLocalPortfolioData(local);
        return local.years;
      }
      throw err;
    }
  },

  updateYears: async (years: string[]): Promise<string[]> => {
    try {
      return await request<string[]>('/api/admin/years', {
        method: 'PUT',
        body: JSON.stringify({ years }),
      });
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        local.years = years;
        saveLocalPortfolioData(local);
        return local.years;
      }
      throw err;
    }
  },

  // Messages
  getMessages: async (): Promise<ContactMessage[]> => {
    try {
      return await request<ContactMessage[]>('/api/admin/messages');
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        return local.messages || [];
      }
      throw err;
    }
  },

  markMessageRead: async (id: string) => {
    try {
      return await request<{ success: boolean }>(`/api/admin/messages/${id}/read`, {
        method: 'PUT',
      });
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        const msg = (local.messages || []).find(m => m.id === id);
        if (msg) msg.read = true;
        saveLocalPortfolioData(local);
        return { success: true };
      }
      throw err;
    }
  },

  updateInquiry: async (id: string, updates: { read?: boolean }) => {
    return api.markMessageRead(id);
  },

  deleteMessage: async (id: string) => {
    try {
      return await request<{ success: boolean }>(`/api/admin/messages/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      if (isStaticHostingError(err)) {
        const local = getLocalPortfolioData();
        local.messages = (local.messages || []).filter(m => m.id !== id);
        saveLocalPortfolioData(local);
        return { success: true };
      }
      throw err;
    }
  },

  deleteInquiry: async (id: string) => {
    return api.deleteMessage(id);
  },
};
