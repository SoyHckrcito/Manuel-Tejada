export type UserRole = 'OWNER' | 'ADMIN' | 'MODERATOR' | 'USER' | 'VISITOR';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface User {
  id: number;
  uid: string;
  email: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string | null;
  createdAt: string;
  lastActivityAt?: string;
}

export interface SectionContent {
  [key: string]: any;
}

export interface SiteSection {
  id: string;
  type: 'hero' | 'bio' | 'discography' | 'works' | 'studio' | 'videos' | 'gallery' | 'news' | 'announcements' | 'contact' | 'custom';
  title: string;
  subtitle?: string;
  visible: boolean;
  order: number;
  content: SectionContent;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  authorId?: number | null;
  authorName: string;
  authorRole: UserRole;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteTheme {
  name: string;
  primaryAccent: string;
  bgCanvas: string;
  cardBg: string;
  fontFamily: string;
  borderRadius: string;
}

export interface SiteContentData {
  theme: SiteTheme;
  navigation: {
    brandName: string;
    links: { id: string; label: string; href: string }[];
  };
  sections: SiteSection[];
}

export interface AuditLogItem {
  id: number;
  actorId: number | null;
  actorUsername: string | null;
  action: string;
  targetId: string | null;
  details: string | null;
  createdAt: string;
}

export interface VisitorActivityItem {
  id: number;
  sessionId: string;
  userId: number | null;
  isAnonymous: boolean;
  pagePath: string;
  userAgent: string | null;
  durationSeconds: number;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  anonymousVisits: number;
  registeredVisits: number;
  topPages: { page_path: string; views: string | number; avg_duration: string | number }[];
  recentVisits: VisitorActivityItem[];
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isReviewed: boolean;
  isHidden: boolean;
  createdAt: string;
}
