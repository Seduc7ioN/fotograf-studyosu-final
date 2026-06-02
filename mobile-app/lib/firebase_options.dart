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
    apiKey: 'AIzaSyAnEWM0ZAUU4A7Qv6uq716AAK2aauY3JAk',
    appId: '1:105780771464:android:8f183e9ed9dca1f620fd3d',
    messagingSenderId: '105780771464',
    projectId: 'fotostudyo',
    storageBucket: 'fotostudyo.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyDNeWlCy9w6EmFQAE0MeRyePLyGMA-82TM',
    appId: '1:105780771464:ios:56efe75bca330c2720fd3d',
    messagingSenderId: '105780771464',
    projectId: 'fotostudyo',
    storageBucket: 'fotostudyo.firebasestorage.app',
    iosBundleId: 'com.fotostudyo.musteri',
  );
}
