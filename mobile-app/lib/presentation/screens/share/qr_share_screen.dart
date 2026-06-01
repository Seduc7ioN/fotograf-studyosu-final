import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:go_router/go_router.dart';

import '../../constants/app_colors.dart';

/// QR kod veya deep link ile açılan paylaşım ekranı.
/// studyo://share/{token} veya https://studyo.app/share/{token}
class QRShareScreen extends ConsumerStatefulWidget {
  final String token;
  const QRShareScreen({super.key, required this.token});

  @override
  ConsumerState<QRShareScreen> createState() => _QRShareScreenState();
}

class _QRShareScreenState extends ConsumerState<QRShareScreen> {
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _validate();
  }

  Future<void> _validate() async {
    try {
      final fn = FirebaseFunctions.instanceFor(region: 'europe-west1')
          .httpsCallable('getAlbumByShareToken');
      final result = await fn.call({'token': widget.token});
      final albumId = result.data['albumId'] as String?;

      if (albumId != null && mounted) {
        context.go('/albums/$albumId');
        return;
      }
      if (mounted) {
        setState(() {
          _error = 'Albüme erişilemiyor.';
          _loading = false;
        });
      }
    } on FirebaseFunctionsException catch (e) {
      if (mounted) {
        setState(() {
          _error = switch (e.code) {
            'not-found' => 'Bu link geçersiz veya silinmiş.',
            'deadline-exceeded' => 'Bu linkin süresi dolmuştur.',
            _ => 'Albüme erişilemiyor.',
          };
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _error = 'Bağlantı hatası oluştu.';
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: _loading
              ? const Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(color: AppColors.primary),
                    SizedBox(height: 16),
                    Text('Albüm açılıyor...',
                        style: TextStyle(color: AppColors.textSecondary)),
                  ],
                )
              : Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.link_off_rounded,
                        color: AppColors.error, size: 56),
                    const SizedBox(height: 16),
                    Text(
                      _error ?? 'Bir hata oluştu.',
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w600),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () => context.go('/albums'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Ana Sayfaya Dön',
                          style: TextStyle(fontWeight: FontWeight.w600)),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
