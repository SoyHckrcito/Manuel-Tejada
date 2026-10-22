import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage.ts';

const SERVER_SECRET = process.env.APP_SECRET || 'manuel-tejada-auth-secret-key-2026';

export interface AuthenticatedUser {
  id: number;
  uid: string;
  email: string;
  username: string;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'USER';
  status: 'ACTIVE' | 'SUSPENDED';
  avatarUrl?: string | null;
  createdAt: string | Date;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computed = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computed, 'hex'));
}

export function generateToken(payload: { id: number; email: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', SERVER_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): { id: number; email: string; role: string; exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', SERVER_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-auth-token']) {
    token = String(req.headers['x-auth-token']).trim();
  } else if (req.cookies && req.cookies.auth_token) {
    token = String(req.cookies.auth_token).trim();
  } else if (req.query && typeof req.query.token === 'string') {
    token = req.query.token.trim();
  }

  if (!token || token === 'null' || token === 'undefined') {
    return next();
  }

  const payload = verifyToken(token);
  if (!payload) {
    return next();
  }

  try {
    let user = storage.users.getById(payload.id);
    if (!user && payload.email) {
      user = storage.users.getByEmail(payload.email);
    }

    // Resilience: If token signature is cryptographically valid, restore user record
    if (!user) {
      const isOwnerEmail =
        payload.email === 'sologemiiiii@gmail.com' ||
        payload.email === 'soloplaycinco@gmail.com' ||
        payload.role === 'OWNER';

      user = storage.users.create({
        id: payload.id,
        uid: `usr_${payload.id}`,
        email: payload.email,
        username: payload.email.split('@')[0],
        role: isOwnerEmail ? 'OWNER' : ((payload.role as any) || 'USER'),
        status: 'ACTIVE',
        avatarUrl: null,
      });
    }

    if (user.status !== 'SUSPENDED') {
      req.user = {
        id: user.id,
        uid: user.uid,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      };
      storage.users.update(user.id, { lastActivityAt: new Date().toISOString() });
    }
  } catch (err) {
    console.error('Error in authMiddleware:', err);
  }

  next();
}

export function requireRole(allowedRoles: ('OWNER' | 'ADMIN' | 'MODERATOR' | 'USER')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Acceso no autorizado. Inicia sesión.' });
    }
    if (req.user.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Tu cuenta ha sido suspendida. Contacta al administrador.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Permisos insuficientes. Requiere rol: ${allowedRoles.join(' o ')}` });
    }
    next();
  };
}
