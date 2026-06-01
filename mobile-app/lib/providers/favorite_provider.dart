import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/models/models.dart';

final _db = FirebaseFirestore.instance;

final favoritesProvider = StreamProvider<List<FavoriteModel>>((ref) {
  final uid = FirebaseAuth.instance.currentUser?.uid;
  if (uid == null) return const Stream.empty();

  return _db
      .collection('favorites')
      .where('customerId', isEqualTo: uid)
      .orderBy('createdAt', descending: true)
      .snapshots()
      .map((snap) => snap.docs
          .map((d) => FavoriteModel.fromFirestore(
              d as DocumentSnapshot<Map<String, dynamic>>))
          .toList());
});

final isFavoriteProvider =
    Provider.family<bool, ({String albumId, String photoId})>((ref, params) {
  final favorites = ref.watch(favoritesProvider).value ?? [];
  return favorites.any(
    (f) => f.albumId == params.albumId && f.photoId == params.photoId,
  );
});

final favoriteServiceProvider =
    Provider<FavoriteService>((ref) => FavoriteService());

class FavoriteService {
  final _db = FirebaseFirestore.instance;

  Future<void> toggleFavorite({
    required String albumId,
    required String photoId,
  }) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return;

    final existing = await _db
        .collection('favorites')
        .where('customerId', isEqualTo: uid)
        .where('albumId', isEqualTo: albumId)
        .where('photoId', isEqualTo: photoId)
        .limit(1)
        .get();

    if (existing.docs.isNotEmpty) {
      await existing.docs.first.reference.delete();
    } else {
      final fav = FavoriteModel(
        id: '',
        customerId: uid,
        albumId: albumId,
        photoId: photoId,
        createdAt: DateTime.now(),
      );
      await _db.collection('favorites').add(fav.toMap());
    }
  }
}
