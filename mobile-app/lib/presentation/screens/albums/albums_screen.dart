import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../data/models/models.dart';
import '../../../providers/album_provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../core/constants/studio_brand.dart';
import '../../constants/app_colors.dart';

class AlbumsScreen extends ConsumerWidget {
  const AlbumsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final albumsAsync = ref.watch(albumsProvider);
    final userAsync = ref.watch(currentUserProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: DecoratedBox(
        decoration: const BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.topRight,
            radius: 1.25,
            colors: [
              Color(0x443A1B10),
              AppColors.background,
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 0),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Merhaba,',
                            style: TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 13,
                              letterSpacing: 1.5,
                            ),
                          ),
                          userAsync.when(
                            data: (user) => Text(
                              user?.name ?? 'Kullanıcı',
                              style: const TextStyle(
                                color: AppColors.cream,
                                fontSize: 25,
                                fontWeight: FontWeight.w600,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                            loading: () => const SizedBox(height: 30),
                            error: (_, __) => const SizedBox(height: 30),
                          ),
                        ],
                      ),
                    ),
                    Image.asset(
                      'assets/images/lumeart_logo.png',
                      width: 112,
                      fit: BoxFit.contain,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  height: 1,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        AppColors.primary,
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: Text(
                  'Albümlerim',
                  style: TextStyle(
                    color: AppColors.cream,
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.4,
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
                      child: _FriendlyError(
                        message:
                            'Albümler yüklenemedi. Lütfen biraz sonra tekrar deneyin.',
                        detail: '$e',
                      ),
                    ),
                  ),
                  data: (albums) {
                    if (albums.isEmpty) {
                      return const _EmptyAlbumsState();
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
      ),
    );
  }
}

class _EmptyAlbumsState extends StatelessWidget {
  const _EmptyAlbumsState();

  Future<void> _open(String url) async {
    final uri = Uri.parse(url);
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            color: AppColors.surface.withOpacity(0.94),
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Image.asset('assets/images/lumeart_logo.png', width: 130),
              const SizedBox(height: 18),
              const Icon(
                Icons.photo_library_outlined,
                size: 44,
                color: AppColors.textMuted,
              ),
              const SizedBox(height: 12),
              const Text(
                'Henüz albümünüz yok',
                style: TextStyle(
                  color: AppColors.cream,
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Albümünüz hazır olduğunda burada görünecek. Sorunuz varsa stüdyoya doğrudan ulaşabilirsiniz.',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _open(
                        'https://wa.me/${StudioBrand.whatsappPhone}',
                      ),
                      icon: const Icon(Icons.chat_outlined, size: 17),
                      label: const Text('WhatsApp'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.black,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _open('tel:${StudioBrand.phoneDial}'),
                      icon: const Icon(Icons.phone_outlined, size: 17),
                      label: const Text('Ara'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.cream,
                        side: const BorderSide(color: AppColors.border),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              TextButton.icon(
                onPressed: () => _open('mailto:${StudioBrand.email}'),
                icon: const Icon(Icons.mail_outline, size: 17),
                label: Text(StudioBrand.email),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FriendlyError extends StatelessWidget {
  final String message;
  final String detail;

  const _FriendlyError({required this.message, required this.detail});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.error_outline, color: AppColors.error, size: 34),
        const SizedBox(height: 10),
        Text(
          message,
          style: const TextStyle(
            color: AppColors.error,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
          textAlign: TextAlign.center,
        ),
        if (detail.contains('failed-precondition')) ...[
          const SizedBox(height: 8),
          const Text(
            'Sistem hazırlanıyor. Kısa süre sonra tekrar açın.',
            style: TextStyle(color: AppColors.textMuted, fontSize: 12),
            textAlign: TextAlign.center,
          ),
        ],
      ],
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
        height: 116,
        decoration: BoxDecoration(
          color: AppColors.surface.withOpacity(0.94),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.18),
              blurRadius: 24,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.horizontal(
                left: Radius.circular(17),
              ),
              child: SizedBox(
                width: 104,
                height: double.infinity,
                child: album.coverImageUrl != null
                    ? Image.network(
                        album.coverImageUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _coverPlaceholder(),
                      )
                    : _coverPlaceholder(),
              ),
            ),
            Expanded(
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 13, vertical: 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      album.title,
                      style: const TextStyle(
                        color: AppColors.cream,
                        fontWeight: FontWeight.w600,
                        fontSize: 15,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.14),
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(
                            color: AppColors.primary.withOpacity(0.25),
                          ),
                        ),
                        child: Text(
                          album.statusLabel,
                          style: const TextStyle(
                            color: AppColors.primary,
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                    Row(
                      children: [
                        const Icon(
                          Icons.photo_outlined,
                          size: 13,
                          color: AppColors.textMuted,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${album.photoCount} fotoğraf',
                          style: const TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 12,
                          ),
                        ),
                        if (album.downloadEnabled) ...[
                          const SizedBox(width: 8),
                          const Icon(
                            Icons.download_outlined,
                            size: 13,
                            color: AppColors.primary,
                          ),
                        ],
                        if (album.customerUploadEnabled) ...[
                          const SizedBox(width: 8),
                          const Icon(
                            Icons.add_photo_alternate_outlined,
                            size: 13,
                            color: AppColors.primary,
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const Padding(
              padding: EdgeInsets.only(right: 10),
              child: Icon(
                Icons.chevron_right,
                color: AppColors.textMuted,
                size: 20,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _coverPlaceholder() {
    return Container(
      color: AppColors.surfaceLight,
      child: const Icon(
        Icons.photo_library_outlined,
        color: AppColors.textMuted,
        size: 28,
      ),
    );
  }
}
