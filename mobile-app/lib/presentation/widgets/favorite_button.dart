import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/favorite_provider.dart';
import '../constants/app_colors.dart';

class FavoriteButton extends ConsumerWidget {
  final String albumId;
  final String photoId;
  final double size;

  const FavoriteButton({
    super.key,
    required this.albumId,
    required this.photoId,
    this.size = 24,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isFav =
        ref.watch(isFavoriteProvider((albumId: albumId, photoId: photoId)));

    return GestureDetector(
      onTap: () => ref
          .read(favoriteServiceProvider)
          .toggleFavorite(albumId: albumId, photoId: photoId),
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 200),
        transitionBuilder: (child, anim) =>
            ScaleTransition(scale: anim, child: child),
        child: Icon(
          isFav ? Icons.favorite : Icons.favorite_border_rounded,
          key: ValueKey(isFav),
          color: isFav ? AppColors.primary : Colors.white,
          size: size,
        ),
      ),
    );
  }
}
