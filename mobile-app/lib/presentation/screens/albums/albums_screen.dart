import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../providers/album_provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../data/models/models.dart';
import '../../constants/app_colors.dart';

class AlbumsScreen extends ConsumerWidget {
  const AlbumsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final albumsAsync = ref.watch(albumsProvider);
    final userAsync = ref.watch(currentUserProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Merhaba,',
                          style: TextStyle(
                              color: AppColors.textSecondary, fontSize: 14),
                        ),
                        userAsync.when(
                          data: (user) => Text(
                            user?.name ?? 'Kullanıcı',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                          loading: () => const SizedBox(height: 28),
                          error: (_, __) => const SizedBox(height: 28),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Icon(
                    Icons.camera_alt_rounded,
                    color: AppColors.primary,
                    size: 28,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 8),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Divider(color: AppColors.border),
            ),
            const SizedBox(height: 8),

            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                'Albümlerim',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const SizedBox(height: 12),

            Expanded(
              child: albumsAsync.when(
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
                data: (albums) {
                  if (albums.isEmpty) {
                    return const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.photo_library_outlined,
                              size: 56, color: AppColors.textMuted),
                          SizedBox(height: 12),
                          Text(
                            'Henüz albüm yok',
                            style:
                                TextStyle(color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    );
                  }

                  return ListView.separated(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                    itemCount: albums.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (_, i) => _AlbumCard(album: albums[i]),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AlbumCard extends StatelessWidget {
  final AlbumModel album;
  const _AlbumCard({required this.album});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/albums/${album.id}'),
      child: Container(
        height: 110,
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            // Cover
            ClipRRect(
              borderRadius:
                  const BorderRadius.horizontal(left: Radius.circular(15)),
              child: SizedBox(
                width: 100,
                height: double.infinity,
                child: album.coverImageUrl != null
                    ? Image.network(
                        album.coverImageUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          color: AppColors.surfaceLight,
                          child: const Icon(Icons.photo_library_outlined,
                              color: AppColors.textMuted, size: 28),
                        ),
                      )
                    : Container(
                        color: AppColors.surfaceLight,
                        child: const Icon(Icons.photo_library_outlined,
                            color: AppColors.textMuted, size: 28),
                      ),
              ),
            ),

            // Info
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(
                    horizontal: 12, vertical: 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      album.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Row(
                      children: [
                        const Icon(Icons.photo_outlined,
                            size: 13, color: AppColors.textMuted),
                        const SizedBox(width: 4),
                        Text(
                          '${album.photoCount} fotoğraf',
                          style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 12),
                        ),
                        if (album.downloadEnabled) ...[
                          const SizedBox(width: 8),
                          const Icon(Icons.download_outlined,
                              size: 13, color: AppColors.primary),
                        ],
                        if (album.customerUploadEnabled) ...[
                          const SizedBox(width: 8),
                          const Icon(Icons.add_photo_alternate_outlined,
                              size: 13, color: AppColors.primary),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ),

            const Padding(
              padding: EdgeInsets.only(right: 10),
              child: Icon(Icons.chevron_right,
                  color: AppColors.textMuted, size: 20),
            ),
          ],
        ),
      ),
    );
  }
}
