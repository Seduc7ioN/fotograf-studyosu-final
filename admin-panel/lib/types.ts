import { Timestamp } from "firebase/firestore";

export type UserRole = "admin" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  fcmToken?: string;
  notes?: string;        // YENİ: CRM notu
  birthday?: string;     // YENİ: YYYY-MM-DD
  createdAt: Timestamp;
}

export interface IncomeRecord {
  id: string;
  title: string;
  amount: number;
  customerName?: string;
  note?: string;
  paidAt: Timestamp;
  createdAt: Timestamp;
}

export interface CreateIncomeRecordInput {
  title: string;
  amount: number;
  customerName?: string;
  note?: string;
  paidAt: Date;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  eventDate: Timestamp;
  eventDateKey: string;
  startTime?: string;
  location?: string;
  note?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateScheduleEventInput {
  title: string;
  eventDate: Date;
  eventDateKey: string;
  startTime?: string;
  location?: string;
  note?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  notes?: string;
  birthday?: string;
}

export type AlbumStatus = "draft" | "ready" | "archived";

export interface Album {
  id: string;
  customerId: string;
  customerName?: string;
  title: string;
  coverImagePath?: string;
  coverImageUrl?: string;
  downloadEnabled: boolean;
  status: AlbumStatus;
  photoCount: number;
  expiresAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // YENİ: Analitik sayaçlar (PicPeak'ten ilham)
  viewCount: number;
  downloadCount: number;
  // YENİ: Filigran (PicPeak'ten ilham)
  watermarkEnabled: boolean;
  watermarkText?: string;
  // YENİ: Şifresiz paylaşım linki + QR (PicPeak'ten ilham)
  shareToken?: string;
  shareEnabled: boolean;
  // YENİ: Seçim onay modu (Lightfolio'dan ilham)
  selectionMode: boolean;
  selectionDeadline?: Timestamp;
}

export interface CreateAlbumInput {
  customerId: string;
  title: string;
  downloadEnabled?: boolean;
  expiresAt?: Date;
  watermarkEnabled?: boolean;
  watermarkText?: string;
  selectionMode?: boolean;
}

export interface Photo {
  id: string;
  albumId: string;
  storagePath: string;
  thumbnailPath?: string;
  thumbnailUrl?: string;
  originalUrl?: string;
  isDownloadable: boolean;
  order: number;
  createdAt: Timestamp;
  selectionStatus?: "none" | "selected" | "approved" | "rejected"; // YENİ
}

export interface Favorite {
  id: string;
  customerId: string;
  albumId: string;
  photoId: string;
  createdAt: Timestamp;
}

// YENİ: Müşteri yorumu (PicPeak'ten ilham)
export interface Comment {
  id: string;
  albumId: string;
  photoId?: string;
  customerId: string;
  customerName: string;
  text: string;
  createdAt: Timestamp;
}

// YENİ: Albüm analitik
export interface AlbumAnalytics {
  albumId: string;
  viewCount: number;
  downloadCount: number;
  lastViewedAt?: Timestamp;
  dailyViews: Record<string, number>;
}

export interface DashboardStats {
  totalCustomers: number;
  totalAlbums: number;
  totalPhotos: number;
  totalViews: number;
  recentAlbums: Album[];
}
