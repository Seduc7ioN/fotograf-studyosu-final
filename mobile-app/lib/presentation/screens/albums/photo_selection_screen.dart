import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_functions/cloud_functions.dart';

import '../../../providers/album_provider.dart';
import '../../../data/models/models.dart';
import '../../constants/app_colors.dart';

/// YENİ — Lightfolio'dan ilham
/// Seçim modunda müşteri fotoğrafları seçer.
/// Üst bar: kaç fotoğraf seçildiğini gösterir.
/// Her fotoğrafa tıklandığında selected/none toggle edilir.
class PhotoSelectionScreen extends ConsumerStatefulWidget {
  final String albumId;
  const PhotoSelectionScreen({super.key, required this.albumId});

  @override
  ConsumerState<PhotoSelectionScreen> createState() => _PhotoSelectionScreenState();
}

class _PhotoSelectionScreenState extends ConsumerState<PhotoSelectionScreen> {
  final Set<String> _selected = {};
  bool _submitting = false;
  final _functions = FirebaseFunctions.instanceFor(region: 'europe-west1');

  void _toggleSelection(String photoId) {
    setState(() {
      if (_selected.contains(photoId)) {
        _selected.remove(photoId);
      } else {
        _selected.add(photoId);
      }
    });
  }

  Future<void> _submitSelections() async {
    if (_selected.isEmpty) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text('Seçimi Onayla',
            style: TextStyle(color: Colors.white)),
        content: Text(
          '${_selected.length} fotoğraf seçtiniz. Seçiminizi göndermek istiyor musunuz?',
          style: const TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Vazgeç'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Gönder',
                style: TextStyle(color: AppColors.primary)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _submitting = true);

    try {
      // Seçilen fotoğrafları "selected" olarak işaretle
      await Future.wait(_selected.map((photoId) =>
          _functions.httpsCallable('selectPhoto').call({
            'albumId': widget.albumId,
            'photoId': photoId,
            'selected': true,
          })));

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Seçimleriniz stüdyoya iletildi!'),
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Seçim gönderilemedi.')),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final photosAsync = ref.watch(albumPhotosProvider(widget.albumId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Fotoğraf Seç', style: TextStyle(fontSize: 16)),
            Text(
              '${_selected.length} seçildi',
              style: const TextStyle(color: AppColors.primary, fontSize: 12),
            ),
          ],
        ),
        actions: [
          if (_selected.isNotEmpty)
            TextButton(
              onPressed: _submitting ? null : _submitSelections,
              child: _submitting
                  ? const SizedBox(
                      width: 16, height: 16,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: AppColors.primary),
                    )
                  : const Text(
                      'Gönder',
                      style: TextStyle(
                          color: AppColors.primary, fontWeight: FontWeight.w600),
                    ),
            ),
        ],
      ),
      body: Column(
        children: [
          // Bilgi bandı
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: AppColors.amber_dim,
            child: const Text(
              '💡 Beğendiğiniz fotoğraflara dokunarak seçin. Seçimleriniz stüdyoya iletilecektir.',
              style: TextStyle(color: AppColors.primary, fontSize: 12),
              textAlign: TextAlign.center,
            ),
          ),

          Expanded(
            child: photosAsync.when(
              loading: () => const Center(
                  child: CircularProgressIndicator(color: AppColors.primary)),
              error: (e, _) => Center(child: Text('$e')),
              data: (photos) => GridView.builder(
                padding: const EdgeInsets.all(2),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 2,
                  mainAxisSpacing: 2,
                ),
                itemCount: photos.length,
                itemBuilder: (_, i) {
                  final photo = photos[i];
                  final isSelected = _selected.contains(photo.id);
                  return GestureDetector(
                    onTap: () => _toggleSelection(photo.id),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        // Thumbnail placeholder
                        Container(
                          color: AppColors.surfaceLight,
                          child: const Center(
                            child: Icon(Icons.image_outlined,
                                color: AppColors.textMuted),
                          ),
                        ),

                        // Seçim overlay
                        if (isSelected)
                          Container(
                            color: AppColors.primary.withOpacity(0.4),
                          ),

                        // Checkbox
                        Positioned(
                          top: 6, right: 6,
                          child: Container(
                            width: 22, height: 22,
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? AppColors.primary
                                  : Colors.black.withOpacity(.5),
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isSelected
                                    ? AppColors.primary
                                    : Colors.white38,
                                width: 1.5,
                              ),
                            ),
                            child: isSelected
                                ? const Icon(Icons.check,
                                    color: Colors.black, size: 14)
                                : null,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
