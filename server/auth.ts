import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// In-memory active tokens mapped to username with expiration
interface Session {
  username: string;
  createdAt: number;
  expiresAt: number;
}

const activeSessions = new Map<string, Session>();
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): string {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
  } catch (err) {
    return false;
  }
}

export function createSession(username: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  activeSessions.set(token, {
    username,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  });
  return token;
}

export function validateSession(token: string): string | null {
  if (!token) return null;
  const session = activeSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }
  return session.username;
}

export function destroySession(token: string): boolean {
  return activeSessions.delete(token);
}

export function destroyAllUserSessions(username: string): void {
  for (const [token, session] of activeSessions.entries()) {
    if (session.username === username) {
      activeSessions.delete(token);
    }
  }
}

export interface AuthenticatedRequest extends Request {
  adminUser?: string;
}

export function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Admin authentication token required.' });
  }

  const token = authHeader.substring(7).trim();
  const username = validateSession(token);
  if (!username) {
    return res.status(401).json({ error: 'Session invalid or expired. Please log in again.' });
  }

  req.adminUser = username;
  next();
}
