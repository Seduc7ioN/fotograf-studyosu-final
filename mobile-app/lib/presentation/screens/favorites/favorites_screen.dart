import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../providers/album_provider.dart';
import '../../../providers/favorite_provider.dart';
import '../../constants/app_colors.dart';

class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favoritesAsync = ref.watch(favoritesProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Favorilerim'),
        backgroundColor: AppColors.background,
        automaticallyImplyLeading: false,
      ),
      body: favoritesAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text('Hata: $e',
                style: const TextStyle(color: AppColors.error),
                textAlign: TextAlign.center),
          ),
        ),
        data: (favorites) {
          if (favorites.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.favorite_outline,
                        size: 56, color: AppColors.textMuted),
                    SizedBox(height: 12),
                    Text(
                      'Henüz favori eklemediniz',
                      style: TextStyle(color: AppColors.textSecondary),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'Fotoğraf görüntülerken ❤️ ile favorilere ekleyin',
                      style:
                          TextStyle(color: AppColors.textMuted, fontSize: 12),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            );
          }

          return GridView.builder(
            padding: const EdgeInsets.all(2),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 2,
              mainAxisSpacing: 2,
            ),
            itemCount: favorites.length,
            itemBuilder: (_, index) {
              final fav = favorites[index];
              final urlAsync = ref.watch(photoUrlProvider((
                albumId: fav.albumId,
                photoId: fav.photoId,
                isThumbnail: true,
              )));

              return Stack(
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
                    loading: () =>
                        Container(color: AppColors.surfaceLight),
                    error: (_, __) =>
                        Container(color: AppColors.surfaceLight),
                  ),
                  const Positioned(
                    bottom: 4,
                    right: 4,
                    child: Icon(Icons.favorite,
                        color: AppColors.primary, size: 14),
                  ),
                ],
              );
            },
          );
        },
      ),
    );
  }
}
