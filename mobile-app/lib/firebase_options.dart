// File generated for the Firebase project used by this app.
// Keep values in sync with Firebase Console > Project settings > Your apps.

import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show TargetPlatform, defaultTargetPlatform, kIsWeb;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      throw UnsupportedError('Web is not configured for the mobile app.');
    }

    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are only configured for Android and iOS.',
        );
    }
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyDK8F_9jQk9sWbP5GdWPF7e9mFHy87ySF8',
    appId: '1:350847112281:android:6420d5e87e2ca9e5118d48',
    messagingSenderId: '350847112281',
    projectId: 'lumeartwedding-e973a',
    storageBucket: 'lumeartwedding-e973a.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyCKKGbZNhQPOYSQGqGZE0YmdiZq9qzQY_g',
    appId: '1:350847112281:ios:a218b6d0d5dfae9f118d48',
    messagingSenderId: '350847112281',
    projectId: 'lumeartwedding-e973a',
    storageBucket: 'lumeartwedding-e973a.firebasestorage.app',
    iosBundleId: 'com.fotostudyo.musteri',
  );
}
