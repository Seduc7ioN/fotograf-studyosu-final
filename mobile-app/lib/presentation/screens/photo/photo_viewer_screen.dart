import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:photo_view/photo_view.dart';
import 'package:photo_view/photo_view_gallery.dart';
import 'package:go_router/go_router.dart';

import '../../../providers/album_provider.dart';
import '../../../providers/comment_provider.dart';
import '../../../providers/favorite_provider.dart';
import '../../../data/models/models.dart';
import '../../constants/app_colors.dart';
import '../albums/comments_sheet.dart';

class PhotoViewerScreen extends ConsumerStatefulWidget {
  final List<PhotoModel> photos;
  final int initialIndex;
  final String albumId;

  const PhotoViewerScreen({
    super.key,
    required this.photos,
    required this.initialIndex,
    required this.albumId,
  });

  @override
  ConsumerState<PhotoViewerScreen> createState() => _PhotoViewerScreenState();
}

class _PhotoViewerScreenState extends ConsumerState<PhotoViewerScreen> {
  late int _currentIndex;
  late PageController _pageController;
  bool _showUI = true;
  final Map<String, String> _localSelectionStatuses = {};

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
    // Tam ekran — status bar gizle
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  }

  @override
  void dispose() {
    _pageController.dispose();
    // Status bar'ı geri getir
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  void _toggleUI() => setState(() => _showUI = !_showUI);

  void _openComments(String photoId) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      useSafeArea: true,
      builder: (_) => CommentsSheet(
        albumId: widget.albumId,
        photoId: photoId,
      ),
    );
  }

  Future<void> _setSelectionStatus(String status) async {
    final photo = widget.photos[_currentIndex];
    setState(() => _localSelectionStatuses[photo.id] = status);
    try {
      await ref.read(photoSelectionServiceProvider).setSelectionStatus(
            albumId: widget.albumId,
            photoId: photo.id,
            status: status,
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_selectionSnackText(status)),
          backgroundColor: AppColors.surfaceLight,
        ),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Seçim kaydedilemedi. Lütfen tekrar deneyin.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  String _selectionSnackText(String status) {
    switch (status) {
      case 'selected':
        return 'Fotoğraf seçildi.';
      case 'retouch':
        return 'Rötuş isteği kaydedildi.';
      case 'rejected':
        return 'Fotoğraf beğenilmedi olarak işaretlendi.';
      default:
        return 'Seçim güncellendi.';
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.photos.isEmpty) {
      return Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(
          backgroundColor: Colors.black,
          leading: IconButton(
            icon: const Icon(Icons.close, color: Colors.white),
            onPressed: () => context.pop(),
          ),
        ),
        body: const Center(
          child: Text('Fotoğraf bulunamadı.',
              style: TextStyle(color: Colors.white54)),
        ),
      );
    }

    final currentPhoto = widget.photos[_currentIndex];
    final currentSelection =
        _localSelectionStatuses[currentPhoto.id] ?? currentPhoto.selectionStatus;
    final isFav = ref.watch(isFavoriteProvider(
        (albumId: widget.albumId, photoId: currentPhoto.id)));
    final commentCountAsync = ref.watch(photoCommentCountProvider(
      (albumId: widget.albumId, photoId: currentPhoto.id),
    ));

    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        onTap: _toggleUI,
        child: Stack(
          children: [
            // Fotoğraf galerisi
            PhotoViewGallery.builder(
              pageController: _pageController,
              itemCount: widget.photos.length,
              onPageChanged: (i) => setState(() => _currentIndex = i),
              builder: (_, index) {
                final photo = widget.photos[index];
                return PhotoViewGalleryPageOptions.customChild(
                  child: _PhotoItem(photo: photo, albumId: widget.albumId),
                  minScale: PhotoViewComputedScale.contained,
                  maxScale: PhotoViewComputedScale.covered * 3,
                );
              },
              loadingBuilder: (_, __) => const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
            ),

            // Üst bar
            AnimatedOpacity(
              opacity: _showUI ? 1.0 : 0.0,
              duration: const Duration(milliseconds: 200),
              child: SafeArea(
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.close,
                          color: Colors.white, size: 26),
                      onPressed: () => context.pop(),
                    ),
                    const Spacer(),
                    Text(
                      '${_currentIndex + 1} / ${widget.photos.length}',
                      style:
                          const TextStyle(color: Colors.white70, fontSize: 14),
                    ),
                    const Spacer(),
                    IconButton(
                      icon: Stack(
                        clipBehavior: Clip.none,
                        children: [
                          const Icon(
                            Icons.mode_comment_outlined,
                            color: Colors.white,
                            size: 25,
                          ),
                          commentCountAsync.maybeWhen(
                            data: (count) => count > 0
                                ? Positioned(
                                    right: -6,
                                    top: -6,
                                    child: Container(
                                      constraints: const BoxConstraints(
                                        minWidth: 16,
                                        minHeight: 16,
                                      ),
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 4),
                                      decoration: const BoxDecoration(
                                        color: AppColors.primary,
                                        shape: BoxShape.circle,
                                      ),
                                      child: Text(
                                        count > 9 ? '9+' : '$count',
                                        textAlign: TextAlign.center,
                                        style: const TextStyle(
                                          color: AppColors.background,
                                          fontSize: 9,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ),
                                  )
                                : const SizedBox.shrink(),
                            orElse: () => const SizedBox.shrink(),
                          ),
                        ],
                      ),
                      onPressed: () => _openComments(currentPhoto.id),
                    ),
                    IconButton(
                      icon: Icon(
                        isFav ? Icons.favorite : Icons.favorite_border_rounded,
                        color: isFav ? AppColors.primary : Colors.white,
                        size: 26,
                      ),
                      onPressed: () =>
                          ref.read(favoriteServiceProvider).toggleFavorite(
                                albumId: widget.albumId,
                                photoId: currentPhoto.id,
                              ),
                    ),
                  ],
                ),
              ),
            ),

            AnimatedOpacity(
              opacity: _showUI ? 1.0 : 0.0,
              duration: const Duration(milliseconds: 200),
              child: Align(
                alignment: Alignment.bottomCenter,
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(14, 0, 14, 16),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.72),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: Colors.white12),
                      ),
                      child: Row(
                        children: [
                          _SelectionButton(
                            label: 'Seçtim',
                            icon: Icons.check_circle_outline,
                            active: currentSelection == 'selected',
                            onTap: () => _setSelectionStatus('selected'),
                          ),
                          _SelectionButton(
                            label: 'Rötuş',
                            icon: Icons.auto_fix_high_outlined,
                            active: currentSelection == 'retouch',
                            onTap: () => _setSelectionStatus('retouch'),
                          ),
                          _SelectionButton(
                            label: 'Beğenmedim',
                            icon: Icons.close_rounded,
                            active: currentSelection == 'rejected',
                            onTap: () => _setSelectionStatus('rejected'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SelectionButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool active;
  final VoidCallback onTap;

  const _SelectionButton({
    required this.label,
    required this.icon,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: TextButton.icon(
        onPressed: onTap,
        icon: Icon(icon, size: 17),
        label: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis),
        style: TextButton.styleFrom(
          foregroundColor: active ? Colors.black : Colors.white,
          backgroundColor: active ? AppColors.primary : Colors.white10,
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 10),
          textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }
}

class _PhotoItem extends ConsumerWidget {
  final PhotoModel photo;
  final String albumId;
  const _PhotoItem({required this.photo, required this.albumId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final urlAsync = ref.watch(photoUrlProvider((
      albumId: albumId,
      photoId: photo.id,
      isThumbnail: false,
    )));

    return urlAsync.when(
      data: (url) => url != null
          ? PhotoView(
              imageProvider: NetworkImage(url),
              minScale: PhotoViewComputedScale.contained,
              maxScale: PhotoViewComputedScale.covered * 3,
              backgroundDecoration: const BoxDecoration(color: Colors.black),
              loadingBuilder: (_, __) => const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
              errorBuilder: (_, __, ___) => const Center(
                child: Icon(Icons.broken_image_outlined,
                    color: Colors.white38, size: 56),
              ),
            )
          : const Center(
              child: Icon(Icons.image_not_supported_outlined,
                  color: Colors.white38, size: 56),
            ),
      loading: () => const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      ),
      error: (_, __) => const Center(
        child: Icon(Icons.error_outline, color: Colors.white38, size: 56),
      ),
    );
  }
}
