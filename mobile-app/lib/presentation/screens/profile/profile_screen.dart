import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/constants/studio_brand.dart';
import '../../../providers/auth_provider.dart';
import '../../constants/app_colors.dart';
import '../kvkk/kvkk_rights_screen.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userAsync = ref.watch(currentUserProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: DecoratedBox(
        decoration: const BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.topCenter,
            radius: 1.2,
            colors: [Color(0x443A1B10), AppColors.background],
          ),
        ),
        child: SafeArea(
          child: userAsync.when(
            loading: () => const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            ),
            error: (e, _) => Center(
              child: Text('$e', style: const TextStyle(color: AppColors.error)),
            ),
            data: (user) {
              if (user == null) return const SizedBox.shrink();

              return ListView(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Profil',
                              style: TextStyle(
                                color: AppColors.textMuted,
                                fontSize: 13,
                                letterSpacing: 1.5,
                              ),
                            ),
                            Text(
                              user.name,
                              style: const TextStyle(
                                color: AppColors.cream,
                                fontSize: 25,
                                fontWeight: FontWeight.w700,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      Image.asset(
                        'assets/images/lumeart_logo.png',
                        width: 106,
                        fit: BoxFit.contain,
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  _profileCard(user.name, user.email),
                  const SizedBox(height: 18),
                  _sectionTitle('Stüdyo İletişim'),
                  const SizedBox(height: 10),
                  _tile(
                    context,
                    icon: Icons.chat_outlined,
                    label: 'WhatsApp mesajı gönder',
                    subtitle: StudioBrand.phoneDisplay,
                    color: AppColors.success,
                    onTap: () => _openUri(
                      context,
                      Uri.parse(
                        'https://wa.me/${StudioBrand.whatsappPhone}?text=${Uri.encodeComponent('Merhaba Lume Art Wedding, fotoğraflarım hakkında bilgi almak istiyorum.')}',
                      ),
                      'WhatsApp açılamadı.',
                    ),
                  ),
                  _tile(
                    context,
                    icon: Icons.mail_outline,
                    label: 'E-posta gönder',
                    subtitle: StudioBrand.email,
                    onTap: () => _openUri(
                      context,
                      Uri.parse(
                        'mailto:${StudioBrand.email}?subject=${Uri.encodeComponent('Fotoğraf albümüm hakkında')}&body=${Uri.encodeComponent('Merhaba Lume Art Wedding,')}',
                      ),
                      'E-posta uygulaması açılamadı.',
                    ),
                  ),
                  _tile(
                    context,
                    icon: Icons.phone_outlined,
                    label: 'Stüdyoyu ara',
                    subtitle: StudioBrand.phoneDisplay,
                    onTap: () => _openUri(
                      context,
                      Uri.parse('tel:${StudioBrand.phoneDial}'),
                      'Telefon araması başlatılamadı.',
                    ),
                  ),
                  _tile(
                    context,
                    icon: Icons.camera_alt_outlined,
                    label: 'Instagram',
                    subtitle: StudioBrand.instagramHandle,
                    onTap: () => _openUri(
                      context,
                      Uri.parse(StudioBrand.instagramUrl),
                      'Instagram açılamadı.',
                    ),
                  ),
                  const SizedBox(height: 18),
                  _sectionTitle('Hesap'),
                  const SizedBox(height: 10),
                  _tile(
                    context,
                    icon: Icons.shield_outlined,
                    label: 'Gizlilik ve Veri Haklarım',
                    subtitle: 'KVKK taleplerinizi yönetin',
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const KvkkRightsScreen()),
                    ),
                  ),
                  _tile(
                    context,
                    icon: Icons.logout_rounded,
                    label: 'Çıkış Yap',
                    subtitle: 'Oturumu kapat',
                    color: AppColors.error,
                    onTap: () => _confirmSignOut(context, ref),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _profileCard(String name, String email) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 58,
            height: 58,
            decoration: BoxDecoration(
              color: AppColors.amber_dim,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.primary, width: 1.5),
            ),
            child: Center(
              child: Text(
                name.isNotEmpty ? name[0].toUpperCase() : '?',
                style: const TextStyle(
                  color: AppColors.primary,
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    color: AppColors.cream,
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  email,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 13,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        color: AppColors.textMuted,
        fontSize: 12,
        fontWeight: FontWeight.w700,
        letterSpacing: 1.2,
      ),
    );
  }

  Widget _tile(
    BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    String? subtitle,
    Color? color,
  }) {
    final iconColor = color ?? AppColors.primary;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: iconColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: iconColor, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        label,
                        style: const TextStyle(
                          color: AppColors.cream,
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      if (subtitle != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          subtitle,
                          style: const TextStyle(
                            color: AppColors.textMuted,
                            fontSize: 12,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right,
                    color: AppColors.textMuted, size: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _openUri(
    BuildContext context,
    Uri uri,
    String fallbackMessage,
  ) async {
    final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!opened && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(fallbackMessage)),
      );
    }
  }

  Future<void> _confirmSignOut(BuildContext context, WidgetRef ref) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text(
          'Çıkış Yap',
          style: TextStyle(color: AppColors.cream),
        ),
        content: const Text(
          'Çıkış yapmak istediğinize emin misiniz?',
          style: TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Vazgeç'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text(
              'Çıkış Yap',
              style: TextStyle(color: AppColors.error),
            ),
          ),
        ],
      ),
    );
    if (confirm == true && context.mounted) {
      await ref.read(authServiceProvider).signOut();
    }
  }
}
