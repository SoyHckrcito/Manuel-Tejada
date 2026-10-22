import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { initialSiteContent } from './defaultContent.ts';

const DATA_DIR = path.resolve(process.cwd(), 'src/data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface StoredUser {
  id: number;
  uid: string;
  email: string;
  username: string;
  passwordHash?: string;
  salt?: string;
  avatarUrl?: string | null;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'USER';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  lastActivityAt: string;
}

export interface StoredData {
  users: StoredUser[];
  siteContent: {
    publishedData: string;
    draftData: string;
    lastUpdatedBy: string;
    updatedAt: string;
  };
  auditLogs: any[];
  visitorActivity: any[];
  contactMessages: any[];
  announcements: any[];
}

function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

// Generate default owner hash for pre-seeded owners (default password: 'owner' or 'admin123')
const defaultPass = hashPassword('owner123');

const defaultDb: StoredData = {
  users: [
    {
      id: 1,
      uid: 'usr_owner_sologemiiiii',
      email: 'sologemiiiii@gmail.com',
      username: 'Manuel Tejada (Owner)',
      passwordHash: defaultPass.hash,
      salt: defaultPass.salt,
      avatarUrl: null,
      role: 'OWNER',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    },
    {
      id: 2,
      uid: 'usr_owner_soloplaycinco',
      email: 'soloplaycinco@gmail.com',
      username: 'Manuel Tejada',
      passwordHash: defaultPass.hash,
      salt: defaultPass.salt,
      avatarUrl: null,
      role: 'OWNER',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    },
  ],
  siteContent: {
    publishedData: JSON.stringify(initialSiteContent),
    draftData: JSON.stringify(initialSiteContent),
    lastUpdatedBy: 'Sistema Inicial',
    updatedAt: new Date().toISOString(),
  },
  auditLogs: [
    {
      id: 1,
      actorId: 1,
      actorUsername: 'Sistema',
      action: 'SYSTEM_INIT',
      targetId: 'main_site',
      details: 'Base de datos inicializada con control de roles y CMS para Manuel Tejada.',
      createdAt: new Date().toISOString(),
    },
  ],
  visitorActivity: [],
  contactMessages: [],
  announcements: [
    {
      id: 1,
      title: 'Manuel Tejada galardonado con el Premio a la Excelencia Musical',
      content: 'En una emotiva ceremonia de gala, la academia musical reconoció la trayectoria de más de cuatro décadas del maestro Manuel Tejada como arreglista, compositor y pionero de la música sinfónica y tropical contemporánea.',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
      authorId: 1,
      authorName: 'Oficina de Prensa',
      authorRole: 'OWNER',
      isPinned: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Masterclass Magistral: Orquestación y Armonía Moderna',
      content: 'El maestro Manuel Tejada impartirá una sesión intensiva de arreglos para cuerdas y metales aplicada a las producciones de gran formato. Abierto a compositores noveles y estudiantes avanzados.',
      imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
      authorId: 1,
      authorName: 'Manuel Tejada',
      authorRole: 'OWNER',
      isPinned: false,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ],
};

class PersistentStorage {
  private data: StoredData;

  constructor() {
    this.data = this.load();
  }

  private load(): StoredData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure all required fields exist
        return {
          users: Array.isArray(parsed.users) ? parsed.users : defaultDb.users,
          siteContent: parsed.siteContent || defaultDb.siteContent,
          auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : defaultDb.auditLogs,
          visitorActivity: Array.isArray(parsed.visitorActivity) ? parsed.visitorActivity : [],
          contactMessages: Array.isArray(parsed.contactMessages) ? parsed.contactMessages : [],
          announcements: Array.isArray(parsed.announcements) ? parsed.announcements : defaultDb.announcements,
        };
      }
    } catch (err) {
      console.warn('Error reading db.json, using default data:', err);
    }

    this.persist(defaultDb);
    return JSON.parse(JSON.stringify(defaultDb));
  }

  private persist(dataToSave: StoredData) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json:', err);
    }
  }

  private save() {
    this.persist(this.data);
  }

  // --- Users Operations ---
  users = {
    getAll: (): StoredUser[] => {
      return [...this.data.users];
    },

    getById: (id: number | string): StoredUser | null => {
      const numericId = Number(id);
      return this.data.users.find((u) => u.id === numericId) || null;
    },

    getByEmail: (email: string): StoredUser | null => {
      const normalized = (email || '').trim().toLowerCase();
      return this.data.users.find((u) => u.email.toLowerCase() === normalized) || null;
    },

    getCount: (): number => {
      return this.data.users.length;
    },

    getOwnerCount: (): number => {
      return this.data.users.filter((u) => u.role === 'OWNER').length;
    },

    create: (userData: Omit<StoredUser, 'id' | 'createdAt' | 'lastActivityAt'> & { id?: number }): StoredUser => {
      const maxId = this.data.users.reduce((max, u) => Math.max(max, u.id), 0);
      const newUser: StoredUser = {
        ...userData,
        id: userData.id || maxId + 1,
        createdAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      };
      this.data.users.push(newUser);
      this.save();
      return newUser;
    },

    update: (id: number | string, updates: Partial<StoredUser>): StoredUser | null => {
      const numericId = Number(id);
      const idx = this.data.users.findIndex((u) => u.id === numericId);
      if (idx === -1) return null;

      this.data.users[idx] = {
        ...this.data.users[idx],
        ...updates,
        lastActivityAt: new Date().toISOString(),
      };
      this.save();
      return this.data.users[idx];
    },

    delete: (id: number | string): boolean => {
      const numericId = Number(id);
      const initialLength = this.data.users.length;
      this.data.users = this.data.users.filter((u) => u.id !== numericId);
      if (this.data.users.length !== initialLength) {
        this.save();
        return true;
      }
      return false;
    },
  };

  // --- Site Content Operations ---
  content = {
    get: (isDraft: boolean) => {
      const dataStr = isDraft && this.data.siteContent.draftData
        ? this.data.siteContent.draftData
        : this.data.siteContent.publishedData;

      let parsed: any;
      try {
        parsed = JSON.parse(dataStr);
      } catch {
        parsed = initialSiteContent;
      }

      return {
        content: parsed,
        isDraft,
        lastUpdatedBy: this.data.siteContent.lastUpdatedBy,
        updatedAt: this.data.siteContent.updatedAt,
      };
    },

    saveDraft: (contentObj: any, updatedBy: string) => {
      const stringified = JSON.stringify(contentObj);
      this.data.siteContent.draftData = stringified;
      this.data.siteContent.lastUpdatedBy = updatedBy;
      this.data.siteContent.updatedAt = new Date().toISOString();
      this.save();
    },

    publish: (contentObj: any | null, updatedBy: string) => {
      let dataToPublish = contentObj;
      if (!dataToPublish) {
        try {
          dataToPublish = JSON.parse(this.data.siteContent.draftData);
        } catch {
          dataToPublish = initialSiteContent;
        }
      }

      const stringified = JSON.stringify(dataToPublish);
      this.data.siteContent.publishedData = stringified;
      this.data.siteContent.draftData = stringified;
      this.data.siteContent.lastUpdatedBy = updatedBy;
      this.data.siteContent.updatedAt = new Date().toISOString();
      this.save();
      return dataToPublish;
    },

    resetDefault: (updatedBy: string) => {
      const stringified = JSON.stringify(initialSiteContent);
      this.data.siteContent.publishedData = stringified;
      this.data.siteContent.draftData = stringified;
      this.data.siteContent.lastUpdatedBy = updatedBy;
      this.data.siteContent.updatedAt = new Date().toISOString();
      this.save();
      return initialSiteContent;
    },
  };

  // --- Audit Logs Operations ---
  audit = {
    log: (actorId: number | null, actorUsername: string | null, action: string, targetId: string | null, details: string) => {
      const maxId = this.data.auditLogs.reduce((max, l) => Math.max(max, l.id || 0), 0);
      const record = {
        id: maxId + 1,
        actorId,
        actorUsername: actorUsername || 'Sistema',
        action,
        targetId,
        details,
        createdAt: new Date().toISOString(),
      };
      this.data.auditLogs.unshift(record);
      if (this.data.auditLogs.length > 500) {
        this.data.auditLogs = this.data.auditLogs.slice(0, 500);
      }
      this.save();
      return record;
    },

    getRecent: (limitCount = 100) => {
      return this.data.auditLogs.slice(0, limitCount);
    },
  };

  // --- Visitor Activity Operations ---
  activity = {
    track: (sessionId: string, pagePath: string, durationSeconds: number, isAnonymous: boolean, userId: number | null, userAgent: string) => {
      const maxId = this.data.visitorActivity.reduce((max, a) => Math.max(max, a.id || 0), 0);
      const record = {
        id: maxId + 1,
        sessionId: String(sessionId).slice(0, 64),
        userId,
        isAnonymous,
        pagePath: String(pagePath).slice(0, 255),
        userAgent: String(userAgent).slice(0, 120),
        durationSeconds: Number(durationSeconds) || 0,
        createdAt: new Date().toISOString(),
      };
      this.data.visitorActivity.unshift(record);
      if (this.data.visitorActivity.length > 500) {
        this.data.visitorActivity = this.data.visitorActivity.slice(0, 500);
      }
      this.save();
    },

    getAnalytics: () => {
      const totalViews = this.data.visitorActivity.length;
      let anonymousVisits = 0;
      let registeredVisits = 0;
      const pageCounts: Record<string, { views: number; totalDuration: number }> = {};

      for (const item of this.data.visitorActivity) {
        if (item.isAnonymous) anonymousVisits++;
        else registeredVisits++;

        const page = item.pagePath || '/';
        if (!pageCounts[page]) pageCounts[page] = { views: 0, totalDuration: 0 };
        pageCounts[page].views++;
        pageCounts[page].totalDuration += (item.durationSeconds || 0);
      }

      const topPages = Object.entries(pageCounts)
        .map(([page_path, d]) => ({
          page_path,
          views: d.views,
          avg_duration: d.views > 0 ? (d.totalDuration / d.views).toFixed(1) : '0',
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      return {
        totalViews,
        anonymousVisits,
        registeredVisits,
        topPages,
        recentVisits: this.data.visitorActivity.slice(0, 30),
      };
    },
  };

  // --- Contact Messages Operations ---
  messages = {
    create: (msg: { name: string; email: string; subject: string; message: string }) => {
      const maxId = this.data.contactMessages.reduce((max, m) => Math.max(max, m.id || 0), 0);
      const record = {
        id: maxId + 1,
        name: msg.name.trim(),
        email: msg.email.trim(),
        subject: msg.subject.trim(),
        message: msg.message.trim(),
        isReviewed: false,
        isHidden: false,
        createdAt: new Date().toISOString(),
      };
      this.data.contactMessages.unshift(record);
      this.save();
      return record;
    },

    getAll: (limitCount = 50) => {
      return this.data.contactMessages.slice(0, limitCount);
    },

    updateStatus: (id: number | string, updates: { isReviewed?: boolean; isHidden?: boolean }) => {
      const numericId = Number(id);
      const idx = this.data.contactMessages.findIndex((m) => m.id === numericId);
      if (idx !== -1) {
        this.data.contactMessages[idx] = {
          ...this.data.contactMessages[idx],
          ...updates,
        };
        this.save();
      }
    },
  };

  // --- Announcements Operations ---
  announcements = {
    getAll: () => {
      return [...this.data.announcements].sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    },

    create: (item: any) => {
      const maxId = this.data.announcements.reduce((max, a) => Math.max(max, a.id || 0), 0);
      const record = {
        ...item,
        id: maxId + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.announcements.unshift(record);
      this.save();
      return record;
    },

    update: (id: number | string, updates: any) => {
      const numericId = Number(id);
      const idx = this.data.announcements.findIndex((a) => a.id === numericId);
      if (idx === -1) return null;

      this.data.announcements[idx] = {
        ...this.data.announcements[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.save();
      return this.data.announcements[idx];
    },

    delete: (id: number | string) => {
      const numericId = Number(id);
      const initialLength = this.data.announcements.length;
      this.data.announcements = this.data.announcements.filter((a) => a.id !== numericId);
      if (this.data.announcements.length !== initialLength) {
        this.save();
        return true;
      }
      return false;
    },
  };
}

export const storage = new PersistentStorage();
