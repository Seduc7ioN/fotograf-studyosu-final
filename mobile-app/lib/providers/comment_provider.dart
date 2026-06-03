import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/models/models.dart';

final _commentsDb = FirebaseFirestore.instance;

final photoCommentsProvider = StreamProvider.family<List<CommentModel>,
    ({String albumId, String photoId})>(
  (ref, params) {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return const Stream.empty();

    return _commentsDb
        .collection('comments')
        .where('albumId', isEqualTo: params.albumId)
        .where('photoId', isEqualTo: params.photoId)
        .where('customerId', isEqualTo: uid)
        .snapshots()
        .map((snap) {
      final comments =
          snap.docs.map((d) => CommentModel.fromFirestore(d)).toList();
      comments.sort((a, b) => a.createdAt.compareTo(b.createdAt));
      return comments;
    });
  },
);

final photoCommentCountProvider =
    StreamProvider.family<int, ({String albumId, String photoId})>(
  (ref, params) {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return const Stream.empty();

    return _commentsDb
        .collection('comments')
        .where('albumId', isEqualTo: params.albumId)
        .where('photoId', isEqualTo: params.photoId)
        .where('customerId', isEqualTo: uid)
        .snapshots()
        .map((snap) => snap.size);
  },
);

final commentServiceProvider =
    Provider<CommentService>((ref) => CommentService());

class CommentService {
  Future<void> addPhotoComment({
    required String albumId,
    required String photoId,
    required String customerName,
    required String text,
  }) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) throw Exception('Giriş gerekli.');

    final cleanText = text.trim();
    if (cleanText.isEmpty) return;
    if (cleanText.length > 500) {
      throw Exception('Yorum 500 karakterden uzun olamaz.');
    }

    await _commentsDb.collection('comments').add({
      'albumId': albumId,
      'photoId': photoId,
      'customerId': uid,
      'customerName':
          customerName.trim().isEmpty ? 'Müşteri' : customerName.trim(),
      'text': cleanText,
      'createdAt': FieldValue.serverTimestamp(),
    });
  }
}
