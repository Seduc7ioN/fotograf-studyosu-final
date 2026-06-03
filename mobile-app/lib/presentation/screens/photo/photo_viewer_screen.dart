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
          ],
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
