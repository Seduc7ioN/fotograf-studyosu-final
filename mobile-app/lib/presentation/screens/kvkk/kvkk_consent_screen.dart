import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../../constants/app_colors.dart';

/// KVKK m.10 — Aydınlatma Yükümlülüğü & m.5 — Açık Rıza
/// Kullanıcı ilk girişte bu ekranı görür.
/// Zorunlu: Aydınlatma metni onayı (hizmet için gerekli)
/// Opsiyonel: Push bildirim, telefon numarası iletişim rızası
class KvkkConsentScreen extends ConsumerStatefulWidget {
  final VoidCallback onAccepted;
  const KvkkConsentScreen({super.key, required this.onAccepted});

  @override
  ConsumerState<KvkkConsentScreen> createState() => _KvkkConsentScreenState();
}

class _KvkkConsentScreenState extends ConsumerState<KvkkConsentScreen> {
  // Zorunlu — aydınlatma metni
  bool _readAndUnderstood = false;
  // Opsiyonel rızalar
  bool _consentPushNotification = false;
  bool _consentPhoneContact = false;

  bool _saving = false;

  Future<void> _save() async {
    if (!_readAndUnderstood) return;

    setState(() => _saving = true);

    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return;

    // Rıza kayıtlarını Firestore'a yaz (denetim izi)
    await FirebaseFirestore.instance.collection('users').doc(uid).update({
      'kvkkConsentDate': FieldValue.serverTimestamp(),
      'kvkkConsentVersion': '1.0',
      'consentPushNotification': _consentPushNotification,
      'consentPhoneContact': _consentPhoneContact,
      'kvkkConsentAccepted': true,
    });

    // Denetim logu
    await FirebaseFirestore.instance.collection('audit_logs').add({
      'type': 'KVKK_CONSENT_RECORDED',
      'uid': uid,
      'consentVersion': '1.0',
      'consentDate': FieldValue.serverTimestamp(),
      'consentPushNotification': _consentPushNotification,
      'consentPhoneContact': _consentPhoneContact,
      'legalBasis':
          'KVKK m.3/a — Belirli konuya ilişkin, bilgilendirilmeye dayanan, özgür iradeyle açıklanan rıza',
    });

    if (mounted) {
      setState(() => _saving = false);
      widget.onAccepted();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
              child: Column(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: AppColors.amber_dim,
                      borderRadius: BorderRadius.circular(16),
                      border:
                          Border.all(color: AppColors.primary.withOpacity(.3)),
                    ),
                    child: const Icon(Icons.shield_outlined,
                        color: AppColors.primary, size: 28),
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'Gizlilik ve Kişisel Veriler',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Hizmeti kullanmadan önce lütfen\naşağıdaki bilgileri okuyun.',
                    style:
                        TextStyle(color: AppColors.textSecondary, fontSize: 13),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),
            const Divider(color: AppColors.border),

            Expanded(
              child: ListView(
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                children: [
                  // Aydınlatma metni özeti
                  _InfoCard(
                    icon: Icons.info_outline_rounded,
                    title: 'Hangi verileriniz işlenir?',
                    items: const [
                      'Ad, soyad, e-posta — kimlik doğrulama için',
                      'Albümlerinizdeki fotoğraf ve videolar — hizmet teslimi için',
                      'Uygulama kullanım tarihleri — hizmet kalitesi için',
                    ],
                  ),
                  const SizedBox(height: 12),
                  _InfoCard(
                    icon: Icons.lock_outline_rounded,
                    title: 'Verileriniz nasıl korunur?',
                    items: const [
                      'Şifreli bağlantı (HTTPS/TLS) ile iletilir',
                      'Fotoğraflara herkese açık link verilmez',
                      'Üçüncü taraflarla paylaşılmaz',
                    ],
                  ),
                  const SizedBox(height: 12),
                  _InfoCard(
                    icon: Icons.delete_outline_rounded,
                    title: 'Verileriniz ne zaman silinir?',
                    items: const [
                      'Albüm süresi dolunca fotoğraflar otomatik silinir',
                      'Hesap silme talebinizde tüm veriler imha edilir',
                      'Saklama süreleri aydınlatma metninde belirtilmiştir',
                    ],
                  ),

                  const SizedBox(height: 20),

                  // ─── ZORUNLU: Aydınlatma metni onayı ────────────
                  _ConsentTile(
                    value: _readAndUnderstood,
                    onChanged: (v) => setState(() => _readAndUnderstood = v),
                    isRequired: true,
                    title: 'Aydınlatma metnini okudum ve anladım',
                    subtitle:
                        'KVKK kapsamında kişisel verilerimin işleneceğini kabul ediyorum.',
                    linkText: 'Aydınlatma Metnini Oku',
                    onLinkTap: () => _showFullText(context, 'aydinlatma'),
                  ),

                  const SizedBox(height: 10),

                  // ─── OPSİYONEL: Push bildirim ────────────────────
                  _ConsentTile(
                    value: _consentPushNotification,
                    onChanged: (v) =>
                        setState(() => _consentPushNotification = v),
                    isRequired: false,
                    title: 'Push bildirimleri (opsiyonel)',
                    subtitle:
                        'Yeni albüm hazır olduğunda bildirim almak istiyorum.',
                  ),

                  const SizedBox(height: 10),

                  // ─── OPSİYONEL: Telefon iletişim ─────────────────
                  _ConsentTile(
                    value: _consentPhoneContact,
                    onChanged: (v) => setState(() => _consentPhoneContact = v),
                    isRequired: false,
                    title: 'Telefon ile iletişim (opsiyonel)',
                    subtitle:
                        'Stüdyonun hizmetle ilgili SMS/WhatsApp göndermesine izin veriyorum.',
                  ),

                  const SizedBox(height: 16),

                  // Rıza geri alma notu
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: const Text(
                      '💡 Opsiyonel rızaları istediğiniz zaman Profil ekranından geri alabilirsiniz. '
                      'Zorunlu onay olmadan hizmet kullanılamaz.',
                      style: TextStyle(
                          color: AppColors.textSecondary, fontSize: 11),
                    ),
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),

            // Devam butonu
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
              child: SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: (_readAndUnderstood && !_saving) ? _save : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.black,
                    disabledBackgroundColor: AppColors.primary.withOpacity(.3),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                  child: _saving
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.black))
                      : const Text('Devam Et',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.w700)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showFullText(BuildContext context, String type) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: .85,
        maxChildSize: .95,
        builder: (_, ctrl) => ListView(
          controller: ctrl,
          padding: const EdgeInsets.all(20),
          children: const [
            Text('Aydınlatma Metni',
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold)),
            SizedBox(height: 12),
            Text(
              'Tam metin için uygulamanın kvkk/AYDINLATMA_METNI.md dosyasını '
              'veya stüdyonun web sitesini ziyaret edin.\n\n'
              'Bu metinde işlenen veriler, amaçları, saklama süreleri ve '
              'haklarınız detaylı olarak açıklanmaktadır.',
              style: TextStyle(
                  color: AppColors.textSecondary, fontSize: 13, height: 1.6),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Yardımcı Widget'lar ──────────────────────────────────────────────────────

class _InfoCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final List<String> items;
  const _InfoCard(
      {required this.icon, required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Icon(icon, color: AppColors.primary, size: 16),
            const SizedBox(width: 8),
            Text(title,
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w600)),
          ]),
          const SizedBox(height: 8),
          ...items.map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('• ',
                        style: TextStyle(
                            color: AppColors.textMuted, fontSize: 12)),
                    Expanded(
                      child: Text(item,
                          style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 12,
                              height: 1.4)),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }
}

class _ConsentTile extends StatelessWidget {
  final bool value;
  final ValueChanged<bool> onChanged;
  final bool isRequired;
  final String title;
  final String subtitle;
  final String? linkText;
  final VoidCallback? onLinkTap;

  const _ConsentTile({
    required this.value,
    required this.onChanged,
    required this.isRequired,
    required this.title,
    required this.subtitle,
    this.linkText,
    this.onLinkTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color:
                value ? AppColors.primary.withOpacity(.4) : AppColors.border),
      ),
      child: CheckboxListTile(
        value: value,
        onChanged: (v) => onChanged(v ?? false),
        activeColor: AppColors.primary,
        checkColor: Colors.black,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        title: Row(children: [
          Expanded(
            child: Text(title,
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w600)),
          ),
          if (isRequired)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.red_dim,
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text('Zorunlu',
                  style: TextStyle(
                      color: AppColors.error,
                      fontSize: 9,
                      fontWeight: FontWeight.w600)),
            )
          else
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.green_dim,
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text('Opsiyonel',
                  style: TextStyle(
                      color: AppColors.success,
                      fontSize: 9,
                      fontWeight: FontWeight.w600)),
            ),
        ]),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(subtitle,
                style: const TextStyle(
                    color: AppColors.textSecondary, fontSize: 12)),
            if (linkText != null && onLinkTap != null)
              GestureDetector(
                onTap: onLinkTap,
                child: Text(linkText!,
                    style: const TextStyle(
                        color: AppColors.primary,
                        fontSize: 11,
                        decoration: TextDecoration.underline,
                        decorationColor: AppColors.primary)),
              ),
          ],
        ),
        controlAffinity: ListTileControlAffinity.leading,
      ),
    );
  }
}
