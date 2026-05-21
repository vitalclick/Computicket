import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../api/api_client.dart';
import '../api/models.dart';
import 'push_client.dart';

const _tokenKey = 'ctng_token';
const _emailKey = 'ctng_email';
const _nameKey = 'ctng_name';

/// Persisted auth state. Exposes a token + identity, plus convenience
/// flags for the UI to gate behind. Persistence is shared_preferences;
/// for production we should swap to flutter_secure_storage so the JWT
/// is keychain/keystore-backed.
class AuthStore extends ChangeNotifier {
  final ApiClient api;
  final PushClient? push;
  String? _token;
  String? _email;
  String? _name;
  String? _userId;

  AuthStore(this.api, {this.push});

  bool get isSignedIn => _token != null;
  String? get token => _token;
  String? get email => _email;
  String? get name => _name;
  String? get userId => _userId;

  Future<void> hydrate() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(_tokenKey);
    _email = prefs.getString(_emailKey);
    _name = prefs.getString(_nameKey);
    notifyListeners();
  }

  Future<void> _persist(AuthSession session) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, session.token);
    await prefs.setString(_emailKey, session.email);
    if (session.name != null) {
      await prefs.setString(_nameKey, session.name!);
    }
    _token = session.token;
    _email = session.email;
    _name = session.name;
    _userId = session.userId;
    notifyListeners();
    // Fire-and-forget: server should receive the FCM token shortly
    // after signin. Failures are logged inside PushClient. We don't
    // block the signin completion on the round trip.
    unawaited(push?.registerForUser(session.token) ?? Future.value());
  }

  Future<SigninResult> signin(String email, String password,
      {String? totpCode}) async {
    final res = await api.signin(email, password, totpCode: totpCode);
    if (res is SigninSuccess) await _persist(res.session);
    return res;
  }

  Future<AuthSession> signin2FA(String challengeToken, String totpCode) async {
    final session = await api.signin2FA(challengeToken, totpCode);
    await _persist(session);
    return session;
  }

  Future<AuthSession> signup({
    required String email,
    required String password,
    String? name,
  }) async {
    final session = await api.signup(email: email, password: password, name: name);
    await _persist(session);
    return session;
  }

  Future<void> signOut() async {
    final prefs = await SharedPreferences.getInstance();
    // Tell the server to stop addressing this device before clearing
    // the token — once it's gone we can't authenticate the DELETE.
    final t = _token;
    if (t != null) {
      await push?.deregister(t);
    }
    await prefs.remove(_tokenKey);
    await prefs.remove(_emailKey);
    await prefs.remove(_nameKey);
    _token = null;
    _email = null;
    _name = null;
    _userId = null;
    notifyListeners();
  }
}
