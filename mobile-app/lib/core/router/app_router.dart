import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../data/models/models.dart';
import '../../providers/auth_provider.dart';
import '../../presentation/screens/albums/album_detail_screen.dart';
import '../../presentation/screens/albums/albums_screen.dart';
import '../../presentation/screens/auth/login_screen.dart';
import '../../presentation/screens/favorites/favorites_screen.dart';
import '../../presentation/screens/photo/photo_viewer_screen.dart';
import '../../presentation/screens/profile/profile_screen.dart';
import '../../presentation/screens/share/qr_share_screen.dart';
import '../../presentation/screens/splash/splash_screen.dart';
import '../constants/app_colors.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    debugLogDiagnostics: false,
    redirect: (context, state) {
      final isLoggedIn = authState.value != null;
      final loc = state.matchedLocation;
      final isOnAuth = loc == '/login';
      final isOnShare = loc.startsWith('/share/');

      if (isOnShare) return null;
      if (!isLoggedIn && !isOnAuth) return '/login';
      if (isLoggedIn && isOnAuth) return '/albums';
      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (_, __) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (_, __) => const LoginScreen(),
      ),
      GoRoute(
        path: '/share/:token',
        builder: (_, state) => QRShareScreen(
          token: state.pathParameters['token']!,
        ),
      ),
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: '/albums',
            builder: (_, __) => const AlbumsScreen(),
          ),
          GoRoute(
            path: '/albums/:albumId',
            builder: (_, state) => AlbumDetailScreen(
              albumId: state.pathParameters['albumId']!,
            ),
          ),
          GoRoute(
            path: '/favorites',
            builder: (_, __) => const FavoritesScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (_, __) => const ProfileScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/photo',
        builder: (_, state) {
          final extra = state.extra as Map<String, dynamic>;
          return PhotoViewerScreen(
            photos: extra['photos'] as List<PhotoModel>,
            initialIndex: extra['initialIndex'] as int? ?? 0,
            albumId: extra['albumId'] as String,
          );
        },
      ),
    ],
    initialLocation: '/albums',
  );
});

class MainShell extends StatelessWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;

    int currentIndex = 0;
    if (location.startsWith('/favorites')) currentIndex = 1;
    if (location.startsWith('/profile')) currentIndex = 2;

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        backgroundColor: AppColors.coffee,
        indicatorColor: AppColors.primary.withOpacity(0.18),
        surfaceTintColor: AppColors.coffee,
        onDestinationSelected: (index) {
          switch (index) {
            case 0:
              context.go('/albums');
            case 1:
              context.go('/favorites');
            case 2:
              context.go('/profile');
          }
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.photo_library_outlined),
            selectedIcon: Icon(Icons.photo_library, color: AppColors.primary),
            label: 'Albümlerim',
          ),
          NavigationDestination(
            icon: Icon(Icons.favorite_outline),
            selectedIcon: Icon(Icons.favorite, color: AppColors.primary),
            label: 'Favoriler',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person, color: AppColors.primary),
            label: 'Profil',
          ),
        ],
      ),
    );
  }
}
