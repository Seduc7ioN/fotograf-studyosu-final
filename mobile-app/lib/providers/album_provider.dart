import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_functions/cloud_functions.dart';

import '../data/models/models.dart';

final _db = FirebaseFirestore.instance;
final _fn = FirebaseFunctions.instanceFor(region: 'europe-west1');

// Müşterinin hazır albümleri
final albumsProvider = StreamProvider<List<AlbumModel>>((ref) {
  final uid = FirebaseAuth.instance.currentUser?.uid;
  if (uid == null) return const Stream.empty();

  return _db
      .collection('albums')
      .where('customerId', isEqualTo: uid)
      .where('status', isEqualTo: 'ready')
      .snapshots()
      .map((snap) {
    final albums = snap.docs.map((d) => AlbumModel.fromFirestore(d)).toList();
    albums.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return albums;
  });
});

// Tek albüm (detay sayfası için)
final albumProvider =
    StreamProvider.family<AlbumModel?, String>((ref, albumId) {
  return _db
      .collection('albums')
      .doc(albumId)
      .snapshots()
      .map((d) => d.exists ? AlbumModel.fromFirestore(d) : null);
});

// Albüm fotoğrafları
final albumPhotosProvider =
    StreamProvider.family<List<PhotoModel>, String>((ref, albumId) {
  return _db
      .collection('albums')
      .doc(albumId)
      .collection('photos')
      .orderBy('order')
      .snapshots()
      .map(
          (snap) => snap.docs.map((d) => PhotoModel.fromFirestore(d)).toList());
});

// Fotoğraf için güvenli görüntüleme URL'i (signed URL)
final photoUrlProvider = FutureProvider.family<String?,
    ({String albumId, String photoId, bool isThumbnail})>((ref, params) async {
  try {
    final result = await _fn.httpsCallable('getSignedPhotoUrl').call({
      'albumId': params.albumId,
      'photoId': params.photoId,
      'isThumbnail': params.isThumbnail,
    });
    return result.data['url'] as String?;
  } catch (_) {
    return null;
  }
});
