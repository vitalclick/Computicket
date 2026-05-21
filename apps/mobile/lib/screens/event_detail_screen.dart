import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../api/api_client.dart';
import '../api/models.dart';
import '../state/auth_store.dart';
import '../theme.dart';

class EventDetailScreen extends StatefulWidget {
  final String slug;
  const EventDetailScreen({super.key, required this.slug});

  @override
  State<EventDetailScreen> createState() => _EventDetailScreenState();
}

class _EventDetailScreenState extends State<EventDetailScreen> {
  Future<EventSummary>? _future;

  @override
  void initState() {
    super.initState();
    _future = context.read<ApiClient>().getEvent(widget.slug);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(leading: BackButton(onPressed: () => context.go('/events'))),
      body: FutureBuilder<EventSummary>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError || snap.data == null) {
            return Center(child: Text('Couldn\'t load: ${snap.error ?? 'unknown'}'));
          }
          return _EventDetailBody(event: snap.data!);
        },
      ),
    );
  }
}

class _EventDetailBody extends StatefulWidget {
  final EventSummary event;
  const _EventDetailBody({required this.event});
  @override
  State<_EventDetailBody> createState() => _EventDetailBodyState();
}

class _EventDetailBodyState extends State<_EventDetailBody> {
  String? _selectedTicketTypeId;
  int _quantity = 1;
  bool _buying = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.event.ticketTypes.isNotEmpty) {
      _selectedTicketTypeId = widget.event.ticketTypes.first.id;
    }
  }

  Future<void> _buy() async {
    final auth = context.read<AuthStore>();
    final email = auth.email;
    if (email == null) {
      context.go('/signin?next=/events/${widget.event.slug}');
      return;
    }
    final tt = widget.event.ticketTypes.firstWhere(
      (t) => t.id == _selectedTicketTypeId,
      orElse: () => widget.event.ticketTypes.first,
    );
    setState(() {
      _buying = true;
      _error = null;
    });
    try {
      final res = await context.read<ApiClient>().createOrder(
            eventSlug: widget.event.slug,
            buyerEmail: email,
            buyerName: auth.name,
            ticketTypeId: tt.id,
            quantity: _quantity,
            token: auth.token,
          );
      final url = Uri.parse(res.authorizationUrl);
      final opened = await launchUrl(url, mode: LaunchMode.externalApplication);
      if (!opened && mounted) {
        setState(() => _error = 'Couldn\'t open the payment page. Try again.');
      }
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _buying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final e = widget.event;
    final df = DateFormat.yMMMEd('en_NG').add_jm();
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(e.organizer.name,
              style: const TextStyle(color: brandGreen, fontWeight: FontWeight.w500)),
          const SizedBox(height: 4),
          Text(e.title,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Text('${e.venue}, ${e.city}'),
          Text('${df.format(e.startsAt)} — ${df.format(e.endsAt)}',
              style: const TextStyle(color: Colors.grey)),
          if (e.description != null) ...[
            const SizedBox(height: 16),
            Text(e.description!, style: const TextStyle(height: 1.4)),
          ],
          const SizedBox(height: 24),
          const Text('Tickets', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
          const SizedBox(height: 8),
          ...e.ticketTypes.map((t) {
            final remaining = t.capacity - t.sold;
            final available = remaining > 0;
            return RadioListTile<String>(
              value: t.id,
              groupValue: _selectedTicketTypeId,
              onChanged: available
                  ? (v) => setState(() => _selectedTicketTypeId = v)
                  : null,
              title: Text(t.name),
              subtitle: Text(available ? '$remaining left' : 'Sold out'),
              secondary: Text(formatNaira(t.priceKobo),
                  style: const TextStyle(fontWeight: FontWeight.w600)),
            );
          }),
          const SizedBox(height: 8),
          Row(
            children: [
              const Text('Quantity', style: TextStyle(fontWeight: FontWeight.w500)),
              const Spacer(),
              IconButton(
                onPressed: _quantity > 1 ? () => setState(() => _quantity--) : null,
                icon: const Icon(Icons.remove_circle_outline),
              ),
              Text('$_quantity', style: const TextStyle(fontSize: 16)),
              IconButton(
                onPressed: _quantity < 10 ? () => setState(() => _quantity++) : null,
                icon: const Icon(Icons.add_circle_outline),
              ),
            ],
          ),
          if (_error != null) ...[
            const SizedBox(height: 8),
            Text(_error!, style: const TextStyle(color: Colors.red)),
          ],
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _buying || _selectedTicketTypeId == null ? null : _buy,
            child: _buying
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : const Text('Pay with Paystack'),
          ),
          const SizedBox(height: 8),
          const Text(
            'You\'ll be taken to Paystack to complete payment. Your tickets appear under "Tickets" once payment confirms.',
            style: TextStyle(fontSize: 12, color: Colors.grey),
          ),
        ],
      ),
    );
  }
}
