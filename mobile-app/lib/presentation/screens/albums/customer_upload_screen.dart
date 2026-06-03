import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:http/http.dart' as http;
import 'package:path/path.dart' as p;

import '../../constants/app_colors.dart';

/// Müşteri kendi albümüne fotoğraf yükler.
/// Akış:
///   1. Galeriden fotoğraf seç (çoklu)
///   2. getCustomerUploadUrl Cloud Fn → signed upload URL al
///   3. PUT ile Storage'a yükle (signed URL)
///   4. Admin onayını bekle
class CustomerUploadScreen extends ConsumerStatefulWidget {
  final String albumId;
  const CustomerUploadScreen({super.key, required this.albumId});

  @override
  ConsumerState<CustomerUploadScreen> createState() =>
      _CustomerUploadScreenState();
}

class _CustomerUploadScreenState extends ConsumerState<CustomerUploadScreen> {
  final _picker = ImagePicker();
  final _functions = FirebaseFunctions.instanceFor(region: 'europe-west1');

  List<_UploadItem> _items = [];
  bool _uploading = false;

  // Galeriden fotoğraf seç
  Future<void> _pickImages() async {
    final picked = await _picker.pickMultiImage(imageQuality: 95);
    if (picked.isEmpty) return;

    setState(() {
      _items = [
        ..._items,
        ...picked.map((xf) => _UploadItem(file: File(xf.path))),
      ];
    });
  }

  // Kamera ile çek
  Future<void> _capturePhoto() async {
    final picked =
        await _picker.pickImage(source: ImageSource.camera, imageQuality: 95);
    if (picked == null) return;
    setState(() => _items.add(_UploadItem(file: File(picked.path))));
  }

  Future<void> _uploadAll() async {
    final pending = _items.where((i) => i.status == _Status.waiting).toList();
    if (pending.isEmpty) return;
    setState(() => _uploading = true);

    for (final item in pending) {
      await _uploadOne(item);
    }

    setState(() => _uploading = false);
  }

  Future<void> _uploadOne(_UploadItem item) async {
    _setStatus(item, _Status.uploading);

    try {
      final file = item.file;
      final ext = p.extension(file.path).toLowerCase();
      final contentType = _contentType(ext);
      final fileName = '${DateTime.now().millisecondsSinceEpoch}$ext';

      // 1. Cloud Function'dan signed upload URL al
      final result =
          await _functions.httpsCallable('getCustomerUploadUrl').call({
        'albumId': widget.albumId,
        'fileName': fileName,
        'contentType': contentType,
      });

      final uploadUrl = result.data['uploadUrl'] as String;
      final bytes = await file.readAsBytes();

      // 2. Doğrudan Storage'a PUT isteği
      final response = await http.put(
        Uri.parse(uploadUrl),
        headers: {'Content-Type': contentType},
        body: bytes,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        _setStatus(item, _Status.done);
      } else {
        throw Exception('HTTP ${response.statusCode}');
      }
    } catch (e) {
      _setStatus(item, _Status.error, error: e.toString());
    }
  }

  void _setStatus(_UploadItem item, _Status status, {String? error}) {
    setState(() {
      final idx = _items.indexOf(item);
      if (idx >= 0) {
        _items[idx] = _items[idx].copyWith(status: status, error: error);
      }
    });
  }

  void _remove(_UploadItem item) {
    setState(() => _items.remove(item));
  }

  String _contentType(String ext) {
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.webp':
        return 'image/webp';
      case '.heic':
        return 'image/heic';
      default:
        return 'image/jpeg';
    }
  }

  int get _doneCount => _items.where((i) => i.status == _Status.done).length;
  int get _waitingCount =>
      _items.where((i) => i.status == _Status.waiting).length;
  int get _errorCount => _items.where((i) => i.status == _Status.error).length;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        title: const Text('Fotoğraf Yükle'),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          if (_waitingCount > 0)
            TextButton(
              onPressed: _uploading ? null : _uploadAll,
              child: _uploading
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: AppColors.primary),
                    )
                  : Text(
                      'Gönder ($_waitingCount)',
                      style: const TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w700),
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
            child: const Row(
              children: [
                Icon(Icons.info_outline_rounded,
                    color: AppColors.primary, size: 16),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Yüklediğiniz fotoğraflar stüdyo tarafından incelendikten sonra albüme eklenir.',
                    style: TextStyle(color: AppColors.primary, fontSize: 12),
                  ),
                ),
              ],
            ),
          ),

          // Fotoğraf seçim butonları
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: _PickButton(
                    icon: Icons.photo_library_outlined,
                    label: 'Galeriden Seç',
                    onTap: _pickImages,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _PickButton(
                    icon: Icons.camera_alt_outlined,
                    label: 'Fotoğraf Çek',
                    onTap: _capturePhoto,
                  ),
                ),
              ],
            ),
          ),

          // Fotoğraf listesi
          Expanded(
            child: _items.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.add_photo_alternate_outlined,
                            size: 56, color: AppColors.textMuted),
                        SizedBox(height: 12),
                        Text(
                          'Fotoğraf seçin veya çekin',
                          style: TextStyle(color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  )
                : GridView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      crossAxisSpacing: 8,
                      mainAxisSpacing: 8,
                    ),
                    itemCount: _items.length,
                    itemBuilder: (_, i) => _UploadTile(
                      item: _items[i],
                      onRemove: () => _remove(_items[i]),
                    ),
                  ),
          ),

          // Özet
          if (_items.isNotEmpty)
            Container(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 24),
              color: AppColors.surface,
              child: Row(
                children: [
                  if (_doneCount > 0)
                    _StatusChip(
                        label: '$_doneCount yüklendi',
                        color: AppColors.success),
                  if (_waitingCount > 0) ...[
                    const SizedBox(width: 8),
                    _StatusChip(
                        label: '$_waitingCount bekliyor',
                        color: AppColors.textSecondary),
                  ],
                  if (_errorCount > 0) ...[
                    const SizedBox(width: 8),
                    _StatusChip(
                        label: '$_errorCount hata', color: AppColors.error),
                  ],
                  const Spacer(),
                  if (_doneCount > 0)
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Tamam',
                          style: TextStyle(color: AppColors.primary)),
                    ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

// ─── Yardımcı sınıf ve widget'lar ────────────────────────────────────────────

enum _Status { waiting, uploading, done, error }

class _UploadItem {
  final File file;
  final _Status status;
  final String? error;

  const _UploadItem({
    required this.file,
    this.status = _Status.waiting,
    this.error,
  });

  _UploadItem copyWith({_Status? status, String? error}) => _UploadItem(
        file: file,
        status: status ?? this.status,
        error: error ?? this.error,
      );
}

class _UploadTile extends StatelessWidget {
  final _UploadItem item;
  final VoidCallback onRemove;
  const _UploadTile({required this.item, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        // Önizleme
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.file(item.file, fit: BoxFit.cover),
        ),

        // Durum overlay
        if (item.status != _Status.waiting)
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Container(
              color: switch (item.status) {
                _Status.uploading => Colors.black54,
                _Status.done => AppColors.success.withOpacity(.45),
                _Status.error => AppColors.error.withOpacity(.55),
                _ => Colors.transparent,
              },
              child: Center(
                child: switch (item.status) {
                  _Status.uploading => const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                          strokeWidth: 2.5, color: Colors.white),
                    ),
                  _Status.done => const Icon(Icons.check_circle_rounded,
                      color: Colors.white, size: 32),
                  _Status.error => const Icon(Icons.error_outline_rounded,
                      color: Colors.white, size: 32),
                  _ => const SizedBox.shrink(),
                },
              ),
            ),
          ),

        // Kaldır butonu (sadece bekleyenler)
        if (item.status == _Status.waiting)
          Positioned(
            top: 4,
            right: 4,
            child: GestureDetector(
              onTap: onRemove,
              child: Container(
                width: 22,
                height: 22,
                decoration: const BoxDecoration(
                    color: Colors.black54, shape: BoxShape.circle),
                child: const Icon(Icons.close, color: Colors.white, size: 14),
              ),
            ),
          ),
      ],
    );
  }
}

class _PickButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _PickButton(
      {required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: [
            Icon(icon, color: AppColors.primary, size: 26),
            const SizedBox(height: 6),
            Text(label,
                style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 12,
                    fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String label;
  final Color color;
  const _StatusChip({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(label,
          style: TextStyle(
              color: color, fontSize: 11, fontWeight: FontWeight.w600)),
    );
  }
}
