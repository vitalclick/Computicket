import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../api/api_client.dart';
import '../state/auth_store.dart';

final _date = DateFormat('EEE d MMM, h:mm a');

/// Recipient landing page for a ticket transfer link. Mirrors the web
/// /transfer/[token] route: describe → sign-in if needed → Accept.
class TransferClaimScreen extends StatefulWidget {
  const TransferClaimScreen({super.key, required this.token});
  final String token;

  @override
  State<TransferClaimScreen> createState() => _TransferClaimScreenState();
}

class _TransferClaimScreenState extends State<TransferClaimScreen> {
  late Future<TransferDescribe> _future;
  bool _claiming = false;
  TransferClaim? _claimed;
  String? _claimError;

  @override
  void initState() {
    super.initState();
    _future = context.read<ApiClient>().describeTicketTransfer(widget.token);
  }

  Future<void> _accept() async {
    final auth = context.read<AuthStore>();
    if (auth.token == null) {
      // Bounce through signin then back here.
      context.go('/signin?next=/transfer/${widget.token}');
      return;
    }
    setState(() {
      _claiming = true;
      _claimError = null;
    });
    try {
      final res = await context.read<ApiClient>().claimTicketTransfer(
            authToken: auth.token!,
            transferToken: widget.token,
          );
      setState(() => _claimed = res);
    } catch (e) {
      setState(() => _claimError = e.toString());
    } finally {
      if (mounted) setState(() => _claiming = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ticket transfer'),
        leading: BackButton(onPressed: () => context.go('/events')),
      ),
      body: SafeArea(
        child: FutureBuilder<TransferDescribe>(
          future: _future,
          builder: (ctx, snap) {
            if (snap.connectionState != ConnectionState.done) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snap.hasError) {
              return _Error(message: snap.error.toString());
            }
            final info = snap.data!;
            final claimed = _claimed;
            if (claimed != null) {
              return _Success(claim: claimed);
            }
            if (info.state != 'pending') {
              return _Unavailable(state: info.state);
            }
            return _Pending(
              info: info,
              busy: _claiming,
              error: _claimError,
              onAccept: _accept,
            );
          },
        ),
      ),
    );
  }
}

class _Pending extends StatelessWidget {
  const _Pending({
    required this.info,
    required this.busy,
    required this.error,
    required this.onAccept,
  });

  final TransferDescribe info;
  final bool busy;
  final String? error;
  final VoidCallback onAccept;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Someone is sending you a ticket',
              style: TextStyle(color: Colors.grey, fontSize: 12, letterSpacing: 1)),
          const SizedBox(height: 6),
          Text(info.eventTitle,
              style: const TextStyle(
                  fontSize: 22, fontWeight: FontWeight.w700)),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _row(Icons.confirmation_number_outlined,
                    '${info.ticketTypeName} · ${info.ticketCode}'),
                const SizedBox(height: 8),
                _row(Icons.event_outlined,
                    _date.format(info.startsAt.toLocal())),
                const SizedBox(height: 8),
                _row(Icons.place_outlined, '${info.eventVenue}, ${info.eventCity}'),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Accepting transfers ownership to your account. The sender\'s copy stops scanning the moment you claim.',
            style: TextStyle(fontSize: 13, color: Colors.black54, height: 1.5),
          ),
          if (error != null) ...[
            const SizedBox(height: 12),
            Text(error!, style: const TextStyle(color: Colors.red)),
          ],
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: busy ? null : onAccept,
              child: Text(busy ? 'Claiming…' : 'Accept ticket'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _row(IconData icon, String text) {
    return Row(children: [
      Icon(icon, size: 16, color: Colors.black54),
      const SizedBox(width: 8),
      Expanded(child: Text(text, style: const TextStyle(fontSize: 13))),
    ]);
  }
}

class _Success extends StatelessWidget {
  const _Success({required this.claim});
  final TransferClaim claim;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: const BoxDecoration(
                color: Colors.green,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check, color: Colors.white, size: 32),
            ),
            const SizedBox(height: 16),
            const Text('Ticket claimed',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            if (claim.eventTitle != null)
              Text("You're going to ${claim.eventTitle}.",
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.black54)),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: () => context.go('/tickets/${claim.ticketCode}'),
              child: const Text('Open boarding pass'),
            ),
          ],
        ),
      ),
    );
  }
}

class _Unavailable extends StatelessWidget {
  const _Unavailable({required this.state});
  final String state;

  @override
  Widget build(BuildContext context) {
    final message = switch (state) {
      'expired' => 'This transfer link has expired. Ask the sender to share a new one.',
      'claimed' => 'This transfer has already been claimed.',
      'cancelled' => 'This transfer was cancelled.',
      _ => 'Transfer unavailable.',
    };
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Transfer unavailable',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            Text(message,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.black54)),
            const SizedBox(height: 24),
            OutlinedButton(
              onPressed: () => context.go('/events'),
              child: const Text('Back to events'),
            ),
          ],
        ),
      ),
    );
  }
}

class _Error extends StatelessWidget {
  const _Error({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text("Couldn't open transfer",
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            Text(message,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 24),
            OutlinedButton(
              onPressed: () => context.go('/events'),
              child: const Text('Back to events'),
            ),
          ],
        ),
      ),
    );
  }
}
