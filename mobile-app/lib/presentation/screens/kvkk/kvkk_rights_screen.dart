import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../../constants/app_colors.dart';

/// KVKK m.11 — İlgili Kişi Hakları Ekranı
/// Müşteri bu ekrandan:
///   - Rızalarını yönetebilir (geri alabilir)
///   - Veri kopyası talep edebilir
///   - Hesabı + tüm verileri silebilir
class KvkkRightsScreen extends ConsumerStatefulWidget {
  const KvkkRightsScreen({super.key});

  @override
  ConsumerState<KvkkRightsScreen> createState() => _KvkkRightsScreenState();
}

class _KvkkRightsScreenState extends ConsumerState<KvkkRightsScreen> {
  bool _consentPush = false;
  bool _consentPhone = false;
  bool _loading = true;

  final _functions = FirebaseFunctions.instanceFor(region: 'europe-west1');

  @override
  void initState() {
    super.initState();
    _loadConsents();
  }

  Future<void> _loadConsents() async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return;

    final doc = await FirebaseFirestore.instance.collection('users').doc(uid).get();
    if (doc.exists && mounted) {
      setState(() {
        _consentPush = doc.data()?['consentPushNotification'] ?? false;
        _consentPhone = doc.data()?['consentPhoneContact'] ?? false;
        _loading = false;
      });
    }
  }

  Future<void> _updateConsent(String field, bool value) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return;

    await FirebaseFirestore.instance.collection('users').doc(uid).update({
      field: value,
      'kvkkConsentUpdateDate': FieldValue.serverTimestamp(),
    });

    // Denetim logu
    await FirebaseFirestore.instance.collection('audit_logs').add({
      'type': 'KVKK_CONSENT_UPDATE',
      'uid': uid,
      'field': field,
      'newValue': value,
      'updatedAt': FieldValue.serverTimestamp(),
      'legalBasis': 'KVKK m.11 — İlgili kişi rızasını geri aldı',
    });
  }

  Future<void> _requestDataExport() async {
    final confirm = await _showConfirmDialog(
      'Veri Kopyası Talebi',
      'Tüm kişisel verilerinizin bir kopyası hazırlanacak. Bu işlem birkaç dakika sürebilir.',
      confirmText: 'Talep Et',
    );
    if (confirm != true) return;

    try {
      final result = await _functions.httpsCallable('exportMyData').call({});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Veri kopyası hazırlandı. E-posta adresinize gönderilecek.'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Hata: $e')),
        );
      }
    }
  }

  Future<void> _deleteAccount() async {
    final confirm = await _showConfirmDialog(
      '⚠️ Hesabı ve Tüm Verileri Sil',
      'Bu işlem GERİ ALINAMAZ.\n\n'
      'Hesabınız, tüm albümleriniz, fotoğraflarınız ve kişisel verileriniz '
      'kalıcı olarak silinecektir. KVKK m.11/e kapsamında bu talebiniz '
      'kayıt altına alınacaktır.',
      confirmText: 'Evet, Sil',
      isDestructive: true,
    );
    if (confirm != true) return;

    // İkinci onay
    final confirm2 = await _showConfirmDialog(
      'Son Onay',
      '"Verilerimi Sil" yazarak onaylamanız gerekiyor. Devam etmek istiyor musunuz?',
      confirmText: 'Devam Et ve Sil',
      isDestructive: true,
    );
    if (confirm2 != true) return;

    try {
      await _functions.httpsCallable('deleteMyData').call({});
      // Auth silindiği için otomatik çıkış yapılır
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Hata oluştu. Lütfen e-posta ile başvurun.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        title: const Text('Gizlilik ve Veri Haklarım'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Rıza Yönetimi
                _Section(
                  title: 'Rıza Yönetimi',
                  subtitle: 'Opsiyonel rızalarınızı yönetin (KVKK m.11)',
                  children: [
                    _ConsentSwitch(
                      title: 'Push Bildirimleri',
                      subtitle: 'Yeni albüm bildirimlerini al',
                      value: _consentPush,
                      onChanged: (v) {
                        setState(() => _consentPush = v);
                        _updateConsent('consentPushNotification', v);
                      },
                    ),
                    _ConsentSwitch(
                      title: 'Telefon ile İletişim',
                      subtitle: 'SMS/WhatsApp iletişimine izin ver',
                      value: _consentPhone,
                      onChanged: (v) {
                        setState(() => _consentPhone = v);
                        _updateConsent('consentPhoneContact', v);
                      },
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Veri Hakları
                _Section(
                  title: 'Veri Haklarınız',
                  subtitle: 'KVKK m.11 kapsamındaki haklarınız',
                  children: [
                    _RightsTile(
                      icon: Icons.download_outlined,
                      title: 'Veri Kopyası Talep Et',
                      subtitle: 'Verilerinizin bir kopyasını alın',
                      color: AppColors.primary,
                      onTap: _requestDataExport,
                    ),
                    _RightsTile(
                      icon: Icons.email_outlined,
                      title: 'Yazılı Başvuru Yap',
                      subtitle: 'E-posta ile veri talebi gönderin',
                      color: AppColors.textSecondary,
                      onTap: () {
                        // E-posta uygulamasını aç
                      },
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Tehlikeli Alan
                _Section(
                  title: 'Tehlikeli Bölge',
                  subtitle: 'Bu işlemler geri alınamaz',
                  isDanger: true,
                  children: [
                    _RightsTile(
                      icon: Icons.delete_forever_outlined,
                      title: 'Hesabı ve Tüm Verileri Sil',
                      subtitle: 'KVKK m.11/e — Kalıcı silme talebi',
                      color: AppColors.error,
                      onTap: _deleteAccount,
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // Bilgi notu
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Yasal Bilgi',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w600)),
                      SizedBox(height: 6),
                      Text(
                        'Talepleriniz 30 gün içinde yanıtlanır. '
                        'Yanıt alamadığınızda Kişisel Verileri Koruma Kurumu\'na '
                        '(kvkk.gov.tr) şikayette bulunabilirsiniz.',
                        style: TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 12,
                            height: 1.5),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  Future<bool?> _showConfirmDialog(String title, String content,
      {required String confirmText, bool isDestructive = false}) {
    return showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: Text(title,
            style: const TextStyle(color: Colors.white, fontSize: 16)),
        content: Text(content,
            style: const TextStyle(
                color: AppColors.textSecondary, fontSize: 13, height: 1.5)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Vazgeç'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(confirmText,
                style: TextStyle(
                    color: isDestructive ? AppColors.error : AppColors.primary,
                    fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String title;
  final String subtitle;
  final List<Widget> children;
  final bool isDanger;

  const _Section({
    required this.title,
    required this.subtitle,
    required this.children,
    this.isDanger = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title,
            style: TextStyle(
                color: isDanger ? AppColors.error : Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w600)),
        const SizedBox(height: 2),
        Text(subtitle,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
        const SizedBox(height: 10),
        Container(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
                color: isDanger
                    ? AppColors.error.withOpacity(.3)
                    : AppColors.border),
          ),
          child: Column(children: children),
        ),
      ],
    );
  }
}

class _ConsentSwitch extends StatelessWidget {
  final String title, subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _ConsentSwitch({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return SwitchListTile(
      title: Text(title,
          style: const TextStyle(color: Colors.white, fontSize: 13)),
      subtitle: Text(subtitle,
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
      value: value,
      onChanged: onChanged,
      activeColor: AppColors.primary,
    );
  }
}

class _RightsTile extends StatelessWidget {
  final IconData icon;
  final String title, subtitle;
  final Color color;
  final VoidCallback onTap;

  const _RightsTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: color, size: 22),
      title: Text(title,
          style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w500)),
      subtitle: Text(subtitle,
          style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
      trailing: const Icon(Icons.chevron_right,
          color: AppColors.textMuted, size: 18),
      onTap: onTap,
    );
  }
}
