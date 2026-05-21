import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'models.dart';

class ApiException implements Exception {
  final int status;
  final String message;
  ApiException(this.status, this.message);
  @override
  String toString() => 'ApiException($status): $message';
}

/// Single HTTP client for the Computicket API. Tokens are passed in from
/// AuthStore — this class is stateless so it stays cheap to construct
/// for tests.
class ApiClient {
  final Uri baseUrl;
  final http.Client _http;

  ApiClient({Uri? baseUrl, http.Client? httpClient})
      : baseUrl = baseUrl ??
            Uri.parse(
              const String.fromEnvironment(
                'API_URL',
                defaultValue: 'http://10.0.2.2:4000/v1',
              ),
            ),
        _http = httpClient ?? http.Client();

  Future<Map<String, dynamic>> _send(
    String method,
    String path, {
    Map<String, String>? query,
    Map<String, dynamic>? body,
    String? token,
  }) async {
    // Compose path + query separately — Uri.replace(path:) otherwise
    // percent-encodes any `?` or `=` we inlined into `path`, silently
    // breaking GETs with query strings.
    final url = baseUrl.replace(
      path: '${baseUrl.path}$path',
      queryParameters: query,
    );
    final headers = <String, String>{
      'content-type': 'application/json',
      'accept': 'application/json',
      if (token != null) 'authorization': 'Bearer $token',
    };
    late http.Response res;
    final encoded = body == null ? null : jsonEncode(body);
    switch (method) {
      case 'GET':
        res = await _http.get(url, headers: headers);
        break;
      case 'POST':
        res = await _http.post(url, headers: headers, body: encoded);
        break;
      case 'DELETE':
        res = await _http.delete(url, headers: headers, body: encoded);
        break;
      default:
        throw ArgumentError('Unsupported method $method');
    }
    if (res.statusCode >= 400) {
      String message = 'HTTP ${res.statusCode}';
      try {
        final parsed = jsonDecode(res.body) as Map<String, dynamic>;
        final m = parsed['message'];
        if (m is String) message = m;
        if (m is List) message = m.join('; ');
      } catch (_) {
        // ignore: parse failure means the body wasn't JSON
      }
      throw ApiException(res.statusCode, message);
    }
    if (res.body.isEmpty) return <String, dynamic>{};
    final decoded = jsonDecode(res.body);
    if (decoded is Map<String, dynamic>) return decoded;
    return <String, dynamic>{'data': decoded};
  }

  // ---------- Auth ----------

  Future<SigninResult> signin(String email, String password,
      {String? totpCode}) async {
    final body = <String, dynamic>{'email': email, 'password': password};
    if (totpCode != null) body['totpCode'] = totpCode;
    final raw = await _send('POST', '/auth/signin', body: body);
    if (raw['requires2FA'] == true) {
      return Signin2FAChallenge(raw['challengeToken'] as String);
    }
    return SigninSuccess(AuthSession.fromJson(raw));
  }

  Future<AuthSession> signin2FA(String challengeToken, String totpCode) async {
    final raw = await _send(
      'POST',
      '/auth/signin/2fa',
      body: {'challengeToken': challengeToken, 'totpCode': totpCode},
    );
    return AuthSession.fromJson(raw);
  }

  Future<AuthSession> signup({
    required String email,
    required String password,
    String? name,
  }) async {
    final raw = await _send(
      'POST',
      '/auth/signup',
      body: {
        'email': email,
        'password': password,
        if (name != null && name.isNotEmpty) 'name': name,
      },
    );
    return AuthSession.fromJson(raw);
  }

  // ---------- Events ----------

  Future<List<EventSummary>> listEvents({String? city}) async {
    final raw = await _send(
      'GET',
      '/events',
      query: city != null && city.isNotEmpty ? {'city': city} : null,
    );
    return ((raw['data'] ?? <dynamic>[]) as List<dynamic>)
        .map((e) => EventSummary.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<EventSummary>> searchEvents(String q) async {
    if (q.trim().isEmpty) return listEvents();
    final raw = await _send('GET', '/events/search', query: {'q': q.trim()});
    return ((raw['data'] ?? <dynamic>[]) as List<dynamic>)
        .map((e) => EventSummary.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<EventSummary> getEvent(String slug) async {
    final raw = await _send('GET', '/events/$slug');
    return EventSummary.fromJson(raw);
  }

  Future<CreateOrderResponse> createOrder({
    required String eventSlug,
    required String buyerEmail,
    String? buyerName,
    required String ticketTypeId,
    required int quantity,
    String? token,
  }) async {
    final raw = await _send(
      'POST',
      '/orders',
      token: token,
      body: {
        'eventSlug': eventSlug,
        'buyerEmail': buyerEmail,
        if (buyerName != null) 'buyerName': buyerName,
        'items': [
          {'ticketTypeId': ticketTypeId, 'quantity': quantity},
        ],
      },
    );
    return CreateOrderResponse.fromJson(raw);
  }

  // ---------- Buyer self ----------

  Future<List<OrderRow>> myOrders(String token) async {
    final raw = await _send('GET', '/me/orders', token: token);
    return ((raw['data'] ?? <dynamic>[]) as List<dynamic>)
        .map((o) => OrderRow.fromJson(o as Map<String, dynamic>))
        .toList();
  }

  Future<Map<String, dynamic>> me(String token) async {
    return _send('GET', '/auth/me', token: token);
  }

  String ticketQrUrl(String code) =>
      baseUrl.replace(path: '${baseUrl.path}/tickets/$code/qr.png').toString();
}

@visibleForTesting
ApiClient debugClient(http.Client http, {String base = 'http://test/v1'}) =>
    ApiClient(baseUrl: Uri.parse(base), httpClient: http);
