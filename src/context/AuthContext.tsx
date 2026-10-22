import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types.ts';
import { api, tokenStorage } from '../lib/api.ts';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  canManageContent: boolean;
  canAccessAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ message: string; user: User }>;
  register: (email: string, user: string, pass: string, avatarUrl?: string) => Promise<{ message: string; user: User }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { username?: string; avatarUrl?: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
  // Modal states
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  isProfileOpen: boolean;
  isRecoveryOpen: boolean;
  isLegalOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  openRegister: () => void;
  closeRegister: () => void;
  openProfile: () => void;
  closeProfile: () => void;
  openRecovery: () => void;
  closeRecovery: () => void;
  openLegal: () => void;
  closeLegal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string): { id: number; email: string; role: string; exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Immediate hydration from token to eliminate blank session flash
    const token = tokenStorage.get();
    if (token) {
      const payload = parseJwt(token);
      if (payload && (!payload.exp || Date.now() < payload.exp)) {
        return {
          id: payload.id,
          uid: `usr_${payload.id}`,
          email: payload.email,
          username: payload.email.split('@')[0],
          role: (payload.role as any) || 'USER',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        };
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);

  const refreshUser = async () => {
    const token = tokenStorage.get();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const payload = parseJwt(token);
    if (payload && payload.exp && Date.now() > payload.exp) {
      tokenStorage.clear();
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.auth.getMe();
      if (data && data.user) {
        setUser(data.user);
      } else if (payload) {
        // Fallback to parsed JWT user instead of clearing session
        setUser({
          id: payload.id,
          uid: `usr_${payload.id}`,
          email: payload.email,
          username: payload.email.split('@')[0],
          role: (payload.role as any) || 'USER',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.warn('Could not refresh user session:', err);
      if (payload) {
        setUser({
          id: payload.id,
          uid: `usr_${payload.id}`,
          email: payload.email,
          username: payload.email.split('@')[0],
          role: (payload.role as any) || 'USER',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.auth.login({ email, password: pass });
    tokenStorage.set(res.token);
    setUser(res.user);
    setIsLoginOpen(false);
    return res;
  };

  const register = async (email: string, username: string, pass: string, avatarUrl?: string) => {
    const res = await api.auth.register({ email, username, password: pass, avatarUrl });
    tokenStorage.set(res.token);
    setUser(res.user);
    setIsRegisterOpen(false);
    return res;
  };

  const logout = () => {
    tokenStorage.clear();
    setUser(null);
  };

  const updateProfile = async (data: { username?: string; avatarUrl?: string; currentPassword?: string; newPassword?: string }) => {
    const res = await api.auth.updateProfile(data);
    setUser(res.user);
  };

  const role: UserRole = user ? user.role : 'VISITOR';
  const isOwner = role === 'OWNER';
  const isAdmin = role === 'ADMIN';
  const isModerator = role === 'MODERATOR';
  const canManageContent = isOwner || isAdmin;
  const canAccessAdmin = isOwner || isAdmin || isModerator;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        isOwner,
        isAdmin,
        isModerator,
        canManageContent,
        canAccessAdmin,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        isLoginOpen,
        isRegisterOpen,
        isProfileOpen,
        isRecoveryOpen,
        isLegalOpen,
        openLogin: () => setIsLoginOpen(true),
        closeLogin: () => setIsLoginOpen(false),
        openRegister: () => setIsRegisterOpen(true),
        closeRegister: () => setIsRegisterOpen(false),
        openProfile: () => setIsProfileOpen(true),
        closeProfile: () => setIsProfileOpen(false),
        openRecovery: () => setIsRecoveryOpen(true),
        closeRecovery: () => setIsRecoveryOpen(false),
        openLegal: () => setIsLegalOpen(true),
        closeLegal: () => setIsLegalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
