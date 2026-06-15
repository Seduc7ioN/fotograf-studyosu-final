import * as admin from "firebase-admin";

admin.initializeApp();

// Auth
export { onUserCreate, setAdminRole } from "./auth/onUserCreate";

// Albums - core
export { generateThumbnail } from "./albums/onPhotoUpload";
export { getSignedPhotoUrl, getDownloadUrl } from "./albums/getSignedUrl";

// Albums - YENİ özellikler
export { createShareLink, getAlbumByShareToken } from "./albums/shareLink";
export { applyWatermark, applyWatermarkToAlbum } from "./albums/watermark";
export { trackAlbumView, trackPhotoDownload, getAlbumAnalytics } from "./albums/analytics";
export { selectPhoto, approvePhotoSelection, getSelectionSummary } from "./albums/photoSelection";
export { addComment, getComments, deleteComment } from "./albums/comments";

// Notifications
export { sendAlbumReadyNotification, sendManualNotification } from "./notifications/sendAlbumReady";
export {
  notifyAdminsOnBookingRequest,
  sendTodayAgendaReminder,
  sendTomorrowAgendaReminder,
} from "./notifications/adminPush";

// KVKK — Kişisel Veri Hakları (m.7, m.11)
export { deleteMyData, exportMyData, periodicDataCleanup } from "./kvkk/dataRights";

// Müşteri Fotoğraf Yükleme — Onay Akışı
export {
  getCustomerUploadUrl,
  getPendingUploads,
  approveCustomerUpload,
  rejectCustomerUpload,
  onCustomerUploadComplete,
} from "./uploads/customerUpload";
