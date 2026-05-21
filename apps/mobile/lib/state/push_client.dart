import 'dart:io' show Platform;
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import '../api/api_client.dart';

/// Bridges Firebase Messaging with the Computicket API.
///
/// Firebase is opt-in: builds without the `--dart-define=FIREBASE_ENABLED=true`
/// flag skip initialisation entirely. This lets us keep the
/// google-services.json / GoogleService-Info.plist files outside source
/// control (they're per-project secrets) while still keeping the mobile
/// code path live and CI-buildable.
class PushClient {
  final ApiClient api;
  bool _initialised = false;

  PushClient(this.api);

  static const _enabledFlag = bool.fromEnvironment('FIREBASE_ENABLED', defaultValue: false);

  Future<void> initialise() async {
    if (!_enabledFlag || _initialised) return;
    try {
      await Firebase.initializeApp();
      // On iOS, ask before showing alerts. Android's runtime permission
      // for POST_NOTIFICATIONS is requested by FirebaseMessaging itself
      // on Android 13+.
      final settings = await FirebaseMessaging.instance.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );
      if (settings.authorizationStatus == AuthorizationStatus.denied) {
        // User refused — bail without rotating tokens. They can flip
        // the OS-level permission back on later and we'll catch the
        // change on next app foreground.
        return;
      }
      _initialised = true;
    } catch (e) {
      // Don't let a Firebase init failure crash the app — the rest of
      // Computicket works fine without push.
      debugPrint('Firebase init failed: $e');
    }
  }

  /// Call after a successful sign-in. Sends the current FCM token up to
  /// /me/devices so server-side notifications can find this device.
  Future<void> registerForUser(String authToken) async {
    if (!_enabledFlag || !_initialised) return;
    try {
      final token = await FirebaseMessaging.instance.getToken();
      if (token == null || token.isEmpty) return;
      await api.registerDevice(
        authToken: authToken,
        token: token,
        platform: _platform(),
      );
      // FCM rotates tokens on its own schedule. Subscribe so we push
      // the new token up the moment it changes.
      FirebaseMessaging.instance.onTokenRefresh.listen((t) {
        api.registerDevice(authToken: authToken, token: t, platform: _platform());
      });
    } catch (e) {
      debugPrint('Push registration failed: $e');
    }
  }

  /// Call before signing out so the server stops addressing this device
  /// for the outgoing user. Safe to call when never initialised.
  Future<void> deregister(String authToken) async {
    if (!_enabledFlag || !_initialised) return;
    try {
      final token = await FirebaseMessaging.instance.getToken();
      if (token == null) return;
      await api.unregisterDevice(authToken: authToken, token: token);
    } catch (_) {
      // Best-effort. Server-side cleanup also happens on UNREGISTERED.
    }
  }

  String _platform() {
    if (kIsWeb) return 'WEB';
    if (Platform.isAndroid) return 'ANDROID';
    if (Platform.isIOS) return 'IOS';
    return 'WEB';
  }
}
