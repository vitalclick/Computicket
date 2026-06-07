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
    List<String>? seatIds,
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
          {
            'ticketTypeId': ticketTypeId,
            'quantity': quantity,
            if (seatIds != null && seatIds.isNotEmpty) 'seatIds': seatIds,
          },
        ],
      },
    );
    return CreateOrderResponse.fromJson(raw);
  }

  Future<List<Seat>> listSeats(String ticketTypeId) async {
    final raw = await _send('GET', '/ticket-types/$ticketTypeId/seats');
    return ((raw['data'] ?? <dynamic>[]) as List<dynamic>)
        .map((s) => Seat.fromJson(s as Map<String, dynamic>))
        .toList();
  }

  // ---------- Wallet ----------

  Future<WalletOverview> walletOverview(String token) async {
    final raw = await _send('GET', '/me/wallet', token: token);
    return WalletOverview.fromJson(raw);
  }

  Future<TopUpResponse> walletTopUp({
    required String token,
    required int amountKobo,
    String? callbackUrl,
  }) async {
    final raw = await _send(
      'POST',
      '/me/wallet/top-ups',
      token: token,
      body: {
        'amountKobo': amountKobo,
        if (callbackUrl != null) 'callbackUrl': callbackUrl,
      },
    );
    return TopUpResponse.fromJson(raw);
  }

  // ---------- Scanner ----------

  Future<ScanResult> scanTicket({required String token, required String code}) async {
    final raw = await _send(
      'POST',
      '/tickets/scan',
      token: token,
      body: {'code': code},
    );
    return ScanResult.fromJson(raw);
  }

  // ---------- Organizer write actions ----------

  Future<EventSummary> updateEvent({
    required String slug,
    required String token,
    String? title,
    String? description,
    String? venue,
    String? city,
    DateTime? startsAt,
    DateTime? endsAt,
  }) async {
    final raw = await _send(
      'PATCH',
      '/events/$slug',
      token: token,
      body: {
        if (title != null) 'title': title,
        if (description != null) 'description': description,
        if (venue != null) 'venue': venue,
        if (city != null) 'city': city,
        if (startsAt != null) 'startsAt': startsAt.toUtc().toIso8601String(),
        if (endsAt != null) 'endsAt': endsAt.toUtc().toIso8601String(),
      },
    );
    return EventSummary.fromJson(raw);
  }

  Future<List<Map<String, dynamic>>> listOrganizerOrders({
    required String token,
    required String organizerSlug,
    required String eventSlug,
  }) async {
    final raw = await _send(
      'GET',
      '/dashboard/organizers/$organizerSlug/events/$eventSlug/orders',
      token: token,
    );
    final list = (raw['orders'] ?? <dynamic>[]) as List<dynamic>;
    return list.map((o) => o as Map<String, dynamic>).toList();
  }

  Future<Map<String, dynamic>> refundOrder({
    required String token,
    required String orderId,
    int? amountKobo,
    String? reason,
  }) async {
    return _send(
      'POST',
      '/dashboard/orders/$orderId/refund',
      token: token,
      body: {
        if (amountKobo != null) 'amountKobo': amountKobo,
        if (reason != null) 'reason': reason,
      },
    );
  }

  Future<Map<String, dynamic>> submitKyc({
    required String token,
    required String bvn,
    required String idNumber,
    String? idDocumentUrl,
  }) async {
    return _send(
      'POST',
      '/me/wallet/kyc',
      token: token,
      body: {
        'bvn': bvn,
        'idNumber': idNumber,
        if (idDocumentUrl != null) 'idDocumentUrl': idDocumentUrl,
      },
    );
  }

  // ---------- Push notifications ----------

  Future<void> registerDevice({
    required String authToken,
    required String token,
    required String platform,
  }) async {
    await _send(
      'POST',
      '/me/devices',
      token: authToken,
      body: {'token': token, 'platform': platform},
    );
  }

  Future<void> unregisterDevice({required String authToken, required String token}) async {
    await _send('DELETE', '/me/devices/$token', token: authToken);
  }

  // ---------- Organizer dashboard ----------

  Future<List<Membership>> myMemberships(String token) async {
    final raw = await _send('GET', '/auth/me', token: token);
    final list = (raw['memberships'] ?? <dynamic>[]) as List<dynamic>;
    return list.map((m) => Membership.fromJson(m as Map<String, dynamic>)).toList();
  }

  Future<DashboardOverview> dashboardOverview(String token, String organizerSlug) async {
    final raw = await _send('GET', '/dashboard/organizers/$organizerSlug', token: token);
    return DashboardOverview.fromJson(raw);
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

  // ---------- Ticket transfers ----------

  /// Generate a one-time transfer link for [code]. Optionally emails the
  /// recipient. Returns the plaintext token + the shareable web link.
  Future<TicketTransferTicket> createTicketTransfer({
    required String token,
    required String code,
    String? recipientEmail,
  }) async {
    final raw = await _send(
      'POST',
      '/tickets/$code/transfer',
      token: token,
      body: {
        if (recipientEmail != null && recipientEmail.isNotEmpty)
          'recipientEmail': recipientEmail,
      },
    );
    return TicketTransferTicket(
      token: raw['token'] as String,
      link: raw['link'] as String,
      expiresAt: DateTime.parse(raw['expiresAt'] as String),
    );
  }

  Future<void> cancelTicketTransfer({
    required String token,
    required String code,
  }) async {
    await _send('DELETE', '/tickets/$code/transfer', token: token);
  }

  // ---------- Resale marketplace ----------

  Future<List<ResaleListing>> listResale() async {
    final raw = await _send('GET', '/resale');
    return ((raw['data'] ?? raw) as List<dynamic>)
        .map((m) => ResaleListing.fromJson(m as Map<String, dynamic>))
        .toList();
  }

  Future<Map<String, dynamic>> createResaleListing({
    required String token,
    required String ticketCode,
    required int askKobo,
  }) async {
    return _send('POST', '/resale', token: token, body: {
      'ticketCode': ticketCode,
      'askKobo': askKobo,
    });
  }

  Future<Map<String, dynamic>> buyResaleListing({
    required String token,
    required String listingId,
  }) async {
    return _send('POST', '/resale/$listingId/buy', token: token);
  }
}

class TicketTransferTicket {
  TicketTransferTicket({
    required this.token,
    required this.link,
    required this.expiresAt,
  });
  final String token;
  final String link;
  final DateTime expiresAt;
}

class ResaleListing {
  ResaleListing({
    required this.id,
    required this.askKobo,
    required this.ticketCode,
    required this.tierName,
    required this.originalPriceKobo,
    required this.eventSlug,
    required this.eventTitle,
    required this.startsAt,
    required this.city,
    required this.venue,
  });
  factory ResaleListing.fromJson(Map<String, dynamic> j) {
    final ticket = (j['ticket'] ?? const {}) as Map<String, dynamic>;
    final event = (j['event'] ?? const {}) as Map<String, dynamic>;
    return ResaleListing(
      id: j['id'] as String,
      askKobo: (j['askKobo'] as num).toInt(),
      ticketCode: ticket['code'] as String? ?? '',
      tierName: ticket['tierName'] as String? ?? '',
      originalPriceKobo: (ticket['originalPriceKobo'] as num?)?.toInt() ?? 0,
      eventSlug: event['slug'] as String? ?? '',
      eventTitle: event['title'] as String? ?? '',
      startsAt: DateTime.tryParse(event['startsAt'] as String? ?? '') ??
          DateTime.now(),
      city: event['city'] as String? ?? '',
      venue: event['venue'] as String? ?? '',
    );
  }
  final String id;
  final int askKobo;
  final String ticketCode;
  final String tierName;
  final int originalPriceKobo;
  final String eventSlug;
  final String eventTitle;
  final DateTime startsAt;
  final String city;
  final String venue;
}

@visibleForTesting
ApiClient debugClient(http.Client http, {String base = 'http://test/v1'}) =>
    ApiClient(baseUrl: Uri.parse(base), httpClient: http);
