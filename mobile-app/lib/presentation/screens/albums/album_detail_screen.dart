import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../providers/album_provider.dart';
import '../../../providers/favorite_provider.dart';
import '../../../data/models/models.dart';
import '../../constants/app_colors.dart';
import 'customer_upload_screen.dart';

class AlbumDetailScreen extends ConsumerWidget {
  final String albumId;
  const AlbumDetailScreen({super.key, required this.albumId});

  void _openUploadSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      useSafeArea: true,
      builder: (_) => ClipRRect(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        child: CustomerUploadScreen(albumId: albumId),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final photosAsync = ref.watch(albumPhotosProvider(albumId));
    final albumAsync = ref.watch(albumProvider(albumId));

    final customerUploadEnabled =
        albumAsync.value?.customerUploadEnabled ?? false;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          albumAsync.value?.title ?? 'Albüm',
          overflow: TextOverflow.ellipsis,
        ),
        backgroundColor: AppColors.background,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.favorite_border_rounded),
            onPressed: () => context.go('/favorites'),
          ),
          if (customerUploadEnabled)
            IconButton(
              tooltip: 'Fotoğraf Yükle',
              icon: const Icon(Icons.add_photo_alternate_outlined),
              onPressed: () => _openUploadSheet(context),
            ),
        ],
      ),
      body: photosAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'Hata: $e',
              style: const TextStyle(color: AppColors.error),
              textAlign: TextAlign.center,
            ),
          ),
        ),
        data: (photos) {
          if (photos.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.photo_library_outlined,
                        size: 56, color: AppColors.textMuted),
                    const SizedBox(height: 12),
                    const Text(
                      'Bu albümde henüz fotoğraf yok.',
                      style: TextStyle(color: AppColors.textSecondary),
                      textAlign: TextAlign.center,
                    ),
                    if (customerUploadEnabled) ...[
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () => _openUploadSheet(context),
                          icon: const Icon(Icons.add_photo_alternate_outlined),
                          label: const Text('Fotoğraf Ekle'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            );
          }

          return Stack(
            children: [
              GridView.builder(
                padding: EdgeInsets.only(
                  left: 2,
                  right: 2,
                  top: 2,
                  // FAB varsa alttan boşluk bırak
                  bottom: customerUploadEnabled ? 84 : 2,
                ),
                gridDelegate:
                    const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 2,
                  mainAxisSpacing: 2,
                ),
                itemCount: photos.length,
                itemBuilder: (_, i) => _PhotoGridItem(
                  photo: photos[i],
                  onTap: () => context.push('/photo', extra: {
                    'photos': photos,
                    'initialIndex': i,
                    'albumId': albumId,
                  }),
                ),
              ),

              // Müşteri yükleme FAB
              if (customerUploadEnabled)
                Positioned(
                  bottom: 20,
                  right: 16,
                  child: FloatingActionButton.extended(
                    onPressed: () => _openUploadSheet(context),
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.black,
                    icon: const Icon(Icons.add_photo_alternate_outlined),
                    label: const Text(
                      'Fotoğraf Ekle',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

class _PhotoGridItem extends ConsumerWidget {
  final PhotoModel photo;
  final VoidCallback onTap;
  const _PhotoGridItem({required this.photo, required this.onTap});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final urlAsync = ref.watch(photoUrlProvider((
      albumId: photo.albumId,
      photoId: photo.id,
      isThumbnail: true,
    )));
    final isFav = ref.watch(
        isFavoriteProvider((albumId: photo.albumId, photoId: photo.id)));

    return GestureDetector(
      onTap: onTap,
      child: Stack(
        fit: StackFit.expand,
        children: [
          urlAsync.when(
            data: (url) => url != null
                ? Image.network(
                    url,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) =>
                        Container(color: AppColors.surfaceLight),
                  )
                : Container(color: AppColors.surfaceLight),
            loading: () => Container(
              color: AppColors.surfaceLight,
              child: const Center(
                child: CircularProgressIndicator(
                    strokeWidth: 1.5, color: AppColors.textMuted),
              ),
            ),
            error: (_, __) => Container(color: AppColors.surfaceLight),
          ),

          // Müşteri yükledi rozeti
          if (photo.uploadedByCustomer)
            Positioned(
              top: 4,
              left: 4,
              child: Container(
                padding: const EdgeInsets.all(3),
                decoration: const BoxDecoration(
                    color: Colors.black54, shape: BoxShape.circle),
                child: const Icon(Icons.person_rounded,
                    color: AppColors.primary, size: 10),
              ),
            ),

          // Favori rozeti
          if (isFav)
            Positioned(
              top: 4,
              right: 4,
              child: Container(
                padding: const EdgeInsets.all(3),
                decoration: const BoxDecoration(
                    color: Colors.black54, shape: BoxShape.circle),
                child: const Icon(Icons.favorite,
                    color: AppColors.primary, size: 12),
              ),
            ),
        ],
      ),
    );
  }
}
