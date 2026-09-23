import fs from 'fs';
import path from 'path';
import multer from 'multer';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${safeBase}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedExtensions = [
    // Image formats
    '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg',
    // Document formats
    '.pdf',
    // Video formats (large files supported)
    '.mp4', '.webm', '.mov', '.ogg', '.m4v', '.mkv'
  ];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error(`Unsupported file type (${ext}). Allowed: JPG, PNG, WEBP, GIF, SVG, PDF, MP4, WEBM, MOV, M4V, OGG`));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200 MB max (supports high-res video and raw footage)
  },
});

export interface IStorageProvider {
  saveBase64Image(dataUrl: string, prefix?: string): Promise<string>;
  deleteFile(filenameOrUrl: string): Promise<boolean>;
  getFileUrl(filename: string): string;
}

export class LocalStorageProvider implements IStorageProvider {
  getFileUrl(filename: string): string {
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    const cleanFilename = path.basename(filename);
    return `/uploads/${cleanFilename}`;
  }

  async saveBase64Image(dataUrl: string, prefix = 'edited'): Promise<string> {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 image data');
    }

    const mimeType = matches[1];
    let ext = '.png';
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') ext = '.jpg';
    if (mimeType === 'image/webp') ext = '.webp';

    const buffer = Buffer.from(matches[2], 'base64');
    const filename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e5)}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    await fs.promises.writeFile(filePath, buffer);
    return `/uploads/${filename}`;
  }

  async deleteFile(filenameOrUrl: string): Promise<boolean> {
    try {
      if (!filenameOrUrl || filenameOrUrl.startsWith('http')) {
        return false;
      }
      const filename = path.basename(filenameOrUrl);
      const filePath = path.join(UPLOAD_DIR, filename);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
    } catch (e) {
      console.error('Failed to delete file:', e);
    }
    return false;
  }
}

export const storageProvider = new LocalStorageProvider();
