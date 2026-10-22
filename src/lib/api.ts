import {
  User,
  UserRole,
  UserStatus,
  SiteContentData,
  AuditLogItem,
  AnalyticsSummary,
  ContactMessage,
  Announcement,
} from '../types.ts';

const TOKEN_KEY = 'mt_auth_token';

export const tokenStorage = {
  get: () => {
    try {
      const val = localStorage.getItem(TOKEN_KEY);
      if (!val || val === 'null' || val === 'undefined') return null;
      return val.trim();
    } catch {
      return null;
    }
  },
  set: (token: string) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token.trim());
      }
    } catch {}
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
};

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Error en la solicitud (${response.status})`);
  }

  return data as T;
}

export const api = {
  auth: {
    register: (body: { email: string; username: string; password: string; avatarUrl?: string }) =>
      apiFetch<{ message: string; user: User; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    login: (body: { email: string; password: string }) =>
      apiFetch<{ message: string; user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    getMe: () => apiFetch<{ user: User | null }>('/api/auth/me'),

    updateProfile: (body: { username?: string; avatarUrl?: string; currentPassword?: string; newPassword?: string }) =>
      apiFetch<{ message: string; user: User }>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    recoverPassword: (body: { email: string; newPassword?: string; recoveryCode?: string }) =>
      apiFetch<{ message: string; recoveryCode?: string }>('/api/auth/recover-password', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  content: {
    get: (draft = false) =>
      apiFetch<{ content: SiteContentData; isDraft: boolean; lastUpdatedBy?: string; updatedAt?: string }>(
        `/api/content${draft ? '?draft=true' : ''}`
      ),

    saveDraft: (content: SiteContentData) =>
      apiFetch<{ message: string }>('/api/content/draft', {
        method: 'PUT',
        body: JSON.stringify({ content }),
      }),

    publish: (content?: SiteContentData) =>
      apiFetch<{ message: string; content: SiteContentData }>('/api/content/publish', {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),

    resetDefault: () =>
      apiFetch<{ message: string; content: SiteContentData }>('/api/content/reset-default', {
        method: 'POST',
      }),
  },

  admin: {
    getUsers: () => apiFetch<{ users: User[] }>('/api/admin/users'),

    updateRole: (userId: number, role: UserRole) =>
      apiFetch<{ message: string; updatedUser: { id: number; username: string; role: UserRole } }>(
        `/api/admin/users/${userId}/role`,
        {
          method: 'PUT',
          body: JSON.stringify({ role }),
        }
      ),

    updateStatus: (userId: number, status: UserStatus) =>
      apiFetch<{ message: string; status: UserStatus }>(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),

    deleteUser: (userId: number) =>
      apiFetch<{ message: string }>(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      }),

    getAuditLogs: () => apiFetch<{ logs: AuditLogItem[] }>('/api/admin/audit-logs'),

    getAnalytics: () => apiFetch<AnalyticsSummary>('/api/admin/analytics'),
  },

  activity: {
    track: (sessionId: string, pagePath: string, durationSeconds: number) =>
      apiFetch<{ tracked: boolean }>('/api/activity/track', {
        method: 'POST',
        body: JSON.stringify({ sessionId, pagePath, durationSeconds }),
      }).catch(() => ({ tracked: false })),
  },

  contact: {
    send: (body: { name: string; email: string; subject: string; message: string }) =>
      apiFetch<{ message: string }>('/api/contact', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    getMessages: () => apiFetch<{ messages: ContactMessage[] }>('/api/admin/messages'),

    updateStatus: (msgId: number, updates: { isReviewed?: boolean; isHidden?: boolean }) =>
      apiFetch<{ message: string }>(`/api/admin/messages/${msgId}/status`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
  },

  announcements: {
    getAll: () => apiFetch<{ announcements: Announcement[] }>('/api/announcements'),

    create: (body: { title: string; content: string; imageUrl?: string; isPinned?: boolean }) =>
      apiFetch<{ message: string; announcement: Announcement }>('/api/announcements', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    update: (id: number, body: { title?: string; content?: string; imageUrl?: string; isPinned?: boolean }) =>
      apiFetch<{ message: string; announcement: Announcement }>(`/api/announcements/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    delete: (id: number) =>
      apiFetch<{ message: string }>(`/api/announcements/${id}`, {
        method: 'DELETE',
      }),
  },

  upload: {
    image: (dataUrl: string) =>
      apiFetch<{ url: string }>('/api/upload', {
        method: 'POST',
        body: JSON.stringify({ image: dataUrl }),
      }),
  },
};
