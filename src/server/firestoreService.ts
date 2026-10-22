import { initializeApp as initClientApp, getApps as getClientApps } from 'firebase/app';
import {
  getFirestore as getClientFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { initialSiteContent } from './defaultContent.ts';

// Initialize Client App instance for server environment
const clientApp = !getClientApps().length
  ? initClientApp(firebaseConfig)
  : getClientApps()[0];

const firestore = getClientFirestore(clientApp, firebaseConfig.firestoreDatabaseId);

// In-memory fallback caches to ensure ultra-fast response and 100% resilience
let inMemoryUsers: any[] = [];
let nextUserId = 1;

let inMemoryContent: {
  publishedData: string;
  draftData: string;
  lastUpdatedBy: string;
  updatedAt: string;
} = {
  publishedData: JSON.stringify(initialSiteContent),
  draftData: JSON.stringify(initialSiteContent),
  lastUpdatedBy: 'Sistema Inicial',
  updatedAt: new Date().toISOString(),
};

let inMemoryAuditLogs: any[] = [];
let nextAuditId = 1;

let inMemoryActivity: any[] = [];
let nextActivityId = 1;

let inMemoryMessages: any[] = [];
let nextMsgId = 1;

let inMemoryAnnouncements: any[] = [
  {
    id: 1,
    title: 'Manuel Tejada galardonado con el Premio a la Excelencia Musical',
    content: 'En una emotiva ceremonia de gala, la academia musical reconoció la trayectoria de más de cuatro décadas del maestro Manuel Tejada como arreglista, compositor y pionero de la música sinfónica y tropical contemporánea.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    authorId: null,
    authorName: 'Oficina de Prensa',
    authorRole: 'ADMIN',
    isPinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Masterclass Magistral: Orquestación y Armonía Moderna',
    content: 'El maestro Manuel Tejada impartirá una sesión intensiva de arreglos para cuerdas y metales aplicada a las producciones de gran formato. Abierto a compositores noveles y estudiantes avanzados.',
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
    authorId: null,
    authorName: 'Manuel Tejada',
    authorRole: 'OWNER',
    isPinned: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];
let nextAnnouncementId = 3;

// --- FIRESTORE DATA ACCESS LAYER ---

export const firestoreService = {
  // Users
  users: {
    async getAll(): Promise<any[]> {
      try {
        const snap = await getDocs(collection(firestore, 'users'));
        if (!snap.empty) {
          const list: any[] = [];
          snap.forEach((d) => list.push(d.data()));
          list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          inMemoryUsers = list;
          return list;
        }
      } catch (err) {
        console.warn('Firestore users read error, using in-memory cache:', err);
      }
      return inMemoryUsers;
    },

    async getById(id: number): Promise<any | null> {
      const all = await this.getAll();
      return all.find((u) => u.id === id) || null;
    },

    async getByEmail(email: string): Promise<any | null> {
      const normalized = email.trim().toLowerCase();
      const all = await this.getAll();
      return all.find((u) => (u.email || '').toLowerCase() === normalized) || null;
    },

    async getCount(): Promise<number> {
      const all = await this.getAll();
      return all.length;
    },

    async getOwnerCount(): Promise<number> {
      const all = await this.getAll();
      return all.filter((u) => u.role === 'OWNER').length;
    },

    async create(user: any): Promise<any> {
      const all = await this.getAll();
      const newId = all.length > 0 ? Math.max(...all.map((u) => u.id || 0)) + 1 : 1;
      const record = {
        ...user,
        id: newId,
        createdAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      };

      inMemoryUsers.push(record);

      try {
        await setDoc(doc(firestore, 'users', String(record.uid || `usr_${newId}`)), record);
      } catch (err) {
        console.warn('Firestore setDoc user error:', err);
      }

      return record;
    },

    async update(id: number, updates: any): Promise<any | null> {
      const all = await this.getAll();
      const idx = inMemoryUsers.findIndex((u) => u.id === id);
      if (idx === -1) return null;

      const updated = {
        ...inMemoryUsers[idx],
        ...updates,
        lastActivityAt: new Date().toISOString(),
      };
      inMemoryUsers[idx] = updated;

      try {
        const docId = String(updated.uid || `usr_${id}`);
        await updateDoc(doc(firestore, 'users', docId), {
          ...updates,
          lastActivityAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore updateDoc user error:', err);
      }

      return updated;
    },

    async delete(id: number): Promise<boolean> {
      const all = await this.getAll();
      const target = all.find((u) => u.id === id);
      if (!target) return false;

      inMemoryUsers = inMemoryUsers.filter((u) => u.id !== id);

      try {
        const docId = String(target.uid || `usr_${id}`);
        await deleteDoc(doc(firestore, 'users', docId));
      } catch (err) {
        console.warn('Firestore deleteDoc user error:', err);
      }

      return true;
    },
  },

  // Site Content
  content: {
    async get(isDraft: boolean): Promise<{
      content: any;
      isDraft: boolean;
      lastUpdatedBy: string;
      updatedAt: string;
    }> {
      try {
        const docRef = doc(firestore, 'site_content', 'main_site');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          inMemoryContent = {
            publishedData: data.publishedData || JSON.stringify(initialSiteContent),
            draftData: data.draftData || JSON.stringify(initialSiteContent),
            lastUpdatedBy: data.lastUpdatedBy || 'Sistema',
            updatedAt: data.updatedAt || new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('Firestore content fetch error, using cache:', err);
      }

      const targetDataString = isDraft && inMemoryContent.draftData
        ? inMemoryContent.draftData
        : inMemoryContent.publishedData;

      let parsed: any;
      try {
        parsed = JSON.parse(targetDataString);
      } catch {
        parsed = initialSiteContent;
      }

      return {
        content: parsed,
        isDraft,
        lastUpdatedBy: inMemoryContent.lastUpdatedBy,
        updatedAt: inMemoryContent.updatedAt,
      };
    },

    async saveDraft(content: any, updatedBy: string): Promise<void> {
      const stringified = JSON.stringify(content);
      inMemoryContent.draftData = stringified;
      inMemoryContent.lastUpdatedBy = updatedBy;
      inMemoryContent.updatedAt = new Date().toISOString();

      try {
        await setDoc(
          doc(firestore, 'site_content', 'main_site'),
          {
            draftData: stringified,
            lastUpdatedBy: updatedBy,
            updatedAt: inMemoryContent.updatedAt,
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Firestore saveDraft error:', err);
      }
    },

    async publish(content: any | null, updatedBy: string): Promise<any> {
      let dataToPublish = content;
      if (!dataToPublish) {
        try {
          dataToPublish = JSON.parse(inMemoryContent.draftData);
        } catch {
          dataToPublish = initialSiteContent;
        }
      }

      const stringified = JSON.stringify(dataToPublish);
      inMemoryContent.publishedData = stringified;
      inMemoryContent.draftData = stringified;
      inMemoryContent.lastUpdatedBy = updatedBy;
      inMemoryContent.updatedAt = new Date().toISOString();

      try {
        await setDoc(doc(firestore, 'site_content', 'main_site'), {
          publishedData: stringified,
          draftData: stringified,
          lastUpdatedBy: updatedBy,
          updatedAt: inMemoryContent.updatedAt,
        });
      } catch (err) {
        console.warn('Firestore publish error:', err);
      }

      return dataToPublish;
    },

    async resetDefault(updatedBy: string): Promise<any> {
      const stringified = JSON.stringify(initialSiteContent);
      inMemoryContent.publishedData = stringified;
      inMemoryContent.draftData = stringified;
      inMemoryContent.lastUpdatedBy = updatedBy;
      inMemoryContent.updatedAt = new Date().toISOString();

      try {
        await setDoc(doc(firestore, 'site_content', 'main_site'), {
          publishedData: stringified,
          draftData: stringified,
          lastUpdatedBy: updatedBy,
          updatedAt: inMemoryContent.updatedAt,
        });
      } catch (err) {
        console.warn('Firestore resetDefault error:', err);
      }

      return initialSiteContent;
    },
  },

  // Audit Logs
  audit: {
    async log(actorId: number | null, actorUsername: string | null, action: string, targetId: string | null, details: string) {
      const record = {
        id: nextAuditId++,
        actorId,
        actorUsername: actorUsername || 'Sistema',
        action,
        targetId,
        details,
        createdAt: new Date().toISOString(),
      };

      inMemoryAuditLogs.unshift(record);
      if (inMemoryAuditLogs.length > 200) inMemoryAuditLogs.pop();

      try {
        await setDoc(doc(firestore, 'audit_logs', `log_${record.id}_${Date.now()}`), record);
      } catch (err) {
        console.warn('Firestore log write error:', err);
      }
    },

    async getRecent(limitCount = 100): Promise<any[]> {
      try {
        const snap = await getDocs(collection(firestore, 'audit_logs'));
        if (!snap.empty) {
          const list: any[] = [];
          snap.forEach((d) => list.push(d.data()));
          list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          inMemoryAuditLogs = list.slice(0, limitCount);
          return inMemoryAuditLogs;
        }
      } catch (err) {
        console.warn('Firestore getRecent audit logs error:', err);
      }
      return inMemoryAuditLogs.slice(0, limitCount);
    },
  },

  // Activity Tracking & Analytics
  activity: {
    async track(sessionId: string, pagePath: string, durationSeconds: number, isAnonymous: boolean, userId: number | null, userAgent: string) {
      const record = {
        id: nextActivityId++,
        sessionId: String(sessionId).slice(0, 64),
        userId,
        isAnonymous,
        pagePath: String(pagePath).slice(0, 255),
        userAgent: userAgent.slice(0, 120),
        durationSeconds: Number(durationSeconds) || 0,
        createdAt: new Date().toISOString(),
      };

      inMemoryActivity.unshift(record);
      if (inMemoryActivity.length > 500) inMemoryActivity.pop();

      try {
        await setDoc(doc(firestore, 'visitor_activity', `act_${record.id}_${Date.now()}`), record);
      } catch (err) {
        // silent fail
      }
    },

    async getAnalytics() {
      try {
        const snap = await getDocs(collection(firestore, 'visitor_activity'));
        if (!snap.empty) {
          const list: any[] = [];
          snap.forEach((d) => list.push(d.data()));
          list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          inMemoryActivity = list;
        }
      } catch (err) {
        console.warn('Firestore getAnalytics error:', err);
      }

      const totalViews = inMemoryActivity.length;
      let anonymousVisits = 0;
      let registeredVisits = 0;
      const pageCounts: Record<string, { views: number; totalDuration: number }> = {};

      for (const item of inMemoryActivity) {
        if (item.isAnonymous) anonymousVisits++;
        else registeredVisits++;

        const page = item.pagePath || '/';
        if (!pageCounts[page]) pageCounts[page] = { views: 0, totalDuration: 0 };
        pageCounts[page].views++;
        pageCounts[page].totalDuration += (item.durationSeconds || 0);
      }

      const topPages = Object.entries(pageCounts)
        .map(([page_path, data]) => ({
          page_path,
          views: data.views,
          avg_duration: data.views > 0 ? (data.totalDuration / data.views).toFixed(1) : '0',
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      return {
        totalViews,
        anonymousVisits,
        registeredVisits,
        topPages,
        recentVisits: inMemoryActivity.slice(0, 30),
      };
    },
  },

  // Contact Messages
  messages: {
    async create(msg: { name: string; email: string; subject: string; message: string }) {
      const record = {
        id: nextMsgId++,
        name: msg.name.trim(),
        email: msg.email.trim(),
        subject: msg.subject.trim(),
        message: msg.message.trim(),
        isReviewed: false,
        isHidden: false,
        createdAt: new Date().toISOString(),
      };

      inMemoryMessages.unshift(record);

      try {
        await setDoc(doc(firestore, 'contact_messages', `msg_${record.id}_${Date.now()}`), record);
      } catch (err) {
        console.warn('Firestore create message error:', err);
      }

      return record;
    },

    async getAll(limitCount = 50) {
      try {
        const snap = await getDocs(collection(firestore, 'contact_messages'));
        if (!snap.empty) {
          const list: any[] = [];
          snap.forEach((d) => list.push(d.data()));
          list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          inMemoryMessages = list;
          return list.slice(0, limitCount);
        }
      } catch (err) {
        console.warn('Firestore getAll messages error:', err);
      }
      return inMemoryMessages.slice(0, limitCount);
    },

    async updateStatus(id: number, updates: { isReviewed?: boolean; isHidden?: boolean }) {
      const idx = inMemoryMessages.findIndex((m) => m.id === id);
      if (idx !== -1) {
        inMemoryMessages[idx] = { ...inMemoryMessages[idx], ...updates };
      }

      try {
        await updateDoc(doc(firestore, 'contact_messages', `msg_${id}`), updates);
      } catch (err) {
        // Fallback
      }
    },
  },

  // Announcements
  announcements: {
    async getAll(): Promise<any[]> {
      try {
        const snap = await getDocs(collection(firestore, 'announcements'));
        if (!snap.empty) {
          const list: any[] = [];
          snap.forEach((d) => list.push(d.data()));
          list.sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          });
          inMemoryAnnouncements = list;
          return list;
        }
      } catch (err) {
        console.warn('Firestore getAll announcements error:', err);
      }
      return inMemoryAnnouncements;
    },

    async create(item: any): Promise<any> {
      const all = await this.getAll();
      const newId = all.length > 0 ? Math.max(...all.map((a) => a.id || 0)) + 1 : 1;
      const record = {
        ...item,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      inMemoryAnnouncements.unshift(record);

      try {
        await setDoc(doc(firestore, 'announcements', `ann_${newId}`), record);
      } catch (err) {
        console.warn('Firestore create announcement error:', err);
      }

      return record;
    },

    async update(id: number, updates: any): Promise<any | null> {
      const all = await this.getAll();
      const idx = inMemoryAnnouncements.findIndex((a) => a.id === id);
      if (idx === -1) return null;

      const updated = {
        ...inMemoryAnnouncements[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      inMemoryAnnouncements[idx] = updated;

      try {
        await updateDoc(doc(firestore, 'announcements', `ann_${id}`), {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore update announcement error:', err);
      }

      return updated;
    },

    async delete(id: number): Promise<boolean> {
      inMemoryAnnouncements = inMemoryAnnouncements.filter((a) => a.id !== id);
      try {
        await deleteDoc(doc(firestore, 'announcements', `ann_${id}`));
      } catch (err) {
        console.warn('Firestore delete announcement error:', err);
      }
      return true;
    },
  },
};
