import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_functions/cloud_functions.dart';

import '../../constants/app_colors.dart';

/// YENİ — PicPeak'ten ilham
/// Müşteri albüm veya fotoğraf hakkında yorum bırakabilir.
class CommentsSheet extends ConsumerStatefulWidget {
  final String albumId;
  final String? photoId;

  const CommentsSheet({super.key, required this.albumId, this.photoId});

  @override
  ConsumerState<CommentsSheet> createState() => _CommentsSheetState();
}

class _CommentsSheetState extends ConsumerState<CommentsSheet> {
  final _controller = TextEditingController();
  List<Map<String, dynamic>> _comments = [];
  bool _loading = true;
  bool _sending = false;

  final _functions = FirebaseFunctions.instanceFor(region: 'europe-west1');

  @override
  void initState() {
    super.initState();
    _loadComments();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _loadComments() async {
    try {
      final result = await _functions.httpsCallable('getComments').call({
        'albumId': widget.albumId,
        if (widget.photoId != null) 'photoId': widget.photoId,
      });
      setState(() {
        _comments = List<Map<String, dynamic>>.from(result.data as List);
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _sendComment() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    setState(() => _sending = true);
    try {
      await _functions.httpsCallable('addComment').call({
        'albumId': widget.albumId,
        if (widget.photoId != null) 'photoId': widget.photoId,
        'text': text,
      });
      _controller.clear();
      await _loadComments();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Yorum gönderilemedi.')),
        );
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.65,
      decoration: const BoxDecoration(
        color: Color(0xFF111111),
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Handle
          Container(
            margin: const EdgeInsets.only(top: 10),
            width: 36, height: 4,
            decoration: BoxDecoration(
              color: Colors.white24,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                const Text(
                  'Yorumlar',
                  style: TextStyle(
                      color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
                ),
                if (_comments.isNotEmpty) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0x1FF59E0B),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      '${_comments.length}',
                      style: const TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ],
            ),
          ),

          const Divider(color: Color(0xFF2a2a2a), height: 1),

          // Comments list
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : _comments.isEmpty
                    ? const Center(
                        child: Text(
                          'Henüz yorum yok.\nİlk yorumu siz yapın!',
                          style: TextStyle(color: AppColors.textSecondary),
                          textAlign: TextAlign.center,
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        itemCount: _comments.length,
                        separatorBuilder: (_, __) =>
                            const Divider(color: Color(0xFF1e1e1e), height: 1),
                        itemBuilder: (_, i) => _CommentTile(comment: _comments[i]),
                      ),
          ),

          // Input
          Container(
            padding: EdgeInsets.fromLTRB(
                16, 12, 16, 12 + MediaQuery.of(context).viewInsets.bottom),
            decoration: const BoxDecoration(
              color: Color(0xFF0e0e0e),
              border: Border(top: BorderSide(color: Color(0xFF2a2a2a))),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    maxLines: 1,
                    textInputAction: TextInputAction.send,
                    onSubmitted: (_) => _sendComment(),
                    decoration: InputDecoration(
                      hintText: 'Yorum yaz...',
                      hintStyle: const TextStyle(color: AppColors.textMuted),
                      filled: true,
                      fillColor: const Color(0xFF1a1a1a),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 10),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                GestureDetector(
                  onTap: _sending ? null : _sendComment,
                  child: Container(
                    width: 40, height: 40,
                    decoration: BoxDecoration(
                      color: _sending ? AppColors.primary.withOpacity(.5) : AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: _sending
                        ? const Padding(
                            padding: EdgeInsets.all(10),
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.black),
                          )
                        : const Icon(Icons.send_rounded, color: Colors.black, size: 18),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CommentTile extends StatelessWidget {
  final Map<String, dynamic> comment;
  const _CommentTile({required this.comment});

  @override
  Widget build(BuildContext context) {
    final name = comment['customerName'] as String? ?? 'Müşteri';
    final text = comment['text'] as String? ?? '';

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: AppColors.amber_dim,
            child: Text(
              name.isNotEmpty ? name[0].toUpperCase() : '?',
              style: const TextStyle(
                  color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name,
                    style: const TextStyle(
                        color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(text,
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
