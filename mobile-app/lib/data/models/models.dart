import 'package:cloud_firestore/cloud_firestore.dart';

// ─── UserModel ───────────────────────────────────────────────────────────────

class UserModel {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String role;
  final DateTime createdAt;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    required this.role,
    required this.createdAt,
  });

  factory UserModel.fromFirestore(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data()!;
    return UserModel(
      id: doc.id,
      name: data['name'] as String? ?? '',
      email: data['email'] as String? ?? '',
      phone: data['phone'] as String?,
      role: data['role'] as String? ?? 'customer',
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }
}

// ─── AlbumModel ──────────────────────────────────────────────────────────────

class AlbumModel {
  final String id;
  final String customerId;
  final String title;
  final String? coverImagePath;
  final String? coverImageUrl;
  final bool downloadEnabled;
  final String status;
  final int photoCount;
  final DateTime? expiresAt;
  final DateTime createdAt;
  final bool customerUploadEnabled;

  const AlbumModel({
    required this.id,
    required this.customerId,
    required this.title,
    this.coverImagePath,
    this.coverImageUrl,
    required this.downloadEnabled,
    required this.status,
    required this.photoCount,
    this.expiresAt,
    required this.createdAt,
    required this.customerUploadEnabled,
  });

  factory AlbumModel.fromFirestore(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data()!;
    return AlbumModel(
      id: doc.id,
      customerId: data['customerId'] as String? ?? '',
      title: data['title'] as String? ?? '',
      coverImagePath: data['coverImagePath'] as String?,
      coverImageUrl: data['coverImageUrl'] as String?,
      downloadEnabled: data['downloadEnabled'] as bool? ?? false,
      status: data['status'] as String? ?? 'draft',
      photoCount: data['photoCount'] as int? ?? 0,
      expiresAt: (data['expiresAt'] as Timestamp?)?.toDate(),
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      customerUploadEnabled: data['customerUploadEnabled'] as bool? ?? false,
    );
  }

  bool get isExpired =>
      expiresAt != null && expiresAt!.isBefore(DateTime.now());
}

// ─── PhotoModel ──────────────────────────────────────────────────────────────

class PhotoModel {
  final String id;
  final String albumId;
  final String storagePath;
  final String? thumbnailPath;
  final bool isDownloadable;
  final int order;
  final bool uploadedByCustomer;

  const PhotoModel({
    required this.id,
    required this.albumId,
    required this.storagePath,
    this.thumbnailPath,
    required this.isDownloadable,
    required this.order,
    required this.uploadedByCustomer,
  });

  factory PhotoModel.fromFirestore(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data()!;
    return PhotoModel(
      id: doc.id,
      albumId: data['albumId'] as String? ?? '',
      storagePath: data['storagePath'] as String? ?? '',
      thumbnailPath: data['thumbnailPath'] as String?,
      isDownloadable: data['isDownloadable'] as bool? ?? false,
      order: data['order'] as int? ?? 0,
      uploadedByCustomer: data['uploadedByCustomer'] as bool? ?? false,
    );
  }
}

// ─── FavoriteModel ───────────────────────────────────────────────────────────

class FavoriteModel {
  final String id;
  final String customerId;
  final String albumId;
  final String photoId;
  final DateTime createdAt;

  const FavoriteModel({
    required this.id,
    required this.customerId,
    required this.albumId,
    required this.photoId,
    required this.createdAt,
  });

  factory FavoriteModel.fromFirestore(
      DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data()!;
    return FavoriteModel(
      id: doc.id,
      customerId: data['customerId'] as String? ?? '',
      albumId: data['albumId'] as String? ?? '',
      photoId: data['photoId'] as String? ?? '',
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() => {
        'customerId': customerId,
        'albumId': albumId,
        'photoId': photoId,
        'createdAt': FieldValue.serverTimestamp(),
      };
}

class CommentModel {
  final String id;
  final String albumId;
  final String? photoId;
  final String customerId;
  final String customerName;
  final String text;
  final DateTime createdAt;

  const CommentModel({
    required this.id,
    required this.albumId,
    this.photoId,
    required this.customerId,
    required this.customerName,
    required this.text,
    required this.createdAt,
  });

  factory CommentModel.fromFirestore(
      DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data()!;
    return CommentModel(
      id: doc.id,
      albumId: data['albumId'] as String? ?? '',
      photoId: data['photoId'] as String?,
      customerId: data['customerId'] as String? ?? '',
      customerName: data['customerName'] as String? ?? 'Müşteri',
      text: data['text'] as String? ?? '',
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }
}
