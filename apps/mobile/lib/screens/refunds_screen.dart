import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../api/api_client.dart';
import '../state/auth_store.dart';
import '../theme.dart';

/// Lists paid orders for one event and exposes a per-row refund action.
/// API enforces the organizer-finance role; non-finance members will
/// see the list but the refund call returns 403, which we surface
/// inline instead of pre-disabling.
class RefundsScreen extends StatefulWidget {
  final String organizerSlug;
  final String eventSlug;
  const RefundsScreen({super.key, required this.organizerSlug, required this.eventSlug});

  @override
  State<RefundsScreen> createState() => _RefundsScreenState();
}

class _RefundsScreenState extends State<RefundsScreen> {
  Future<List<Map<String, dynamic>>>? _future;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  void _reload() {
    final token = context.read<AuthStore>().token;
    if (token == null) return;
    setState(() {
      _future = context.read<ApiClient>().listOrganizerOrders(
        token: token,
        organizerSlug: widget.organizerSlug,
        eventSlug: widget.eventSlug,
      );
    });
  }

  Future<void> _confirmRefund(Map<String, dynamic> order) async {
    final orderId = order['id'] as String;
    final paid = order['totalKobo'] as int;
    final reasonCtl = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Issue full refund'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Refund ${formatNaira(paid)} to ${order['buyerEmail']}'),
            const SizedBox(height: 12),
            TextField(
              controller: reasonCtl,
              maxLength: 200,
              decoration: const InputDecoration(
                labelText: 'Reason (optional)',
                hintText: 'Visible to the buyer in the refund email',
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'All tickets on this order will be voided.',
              style: TextStyle(color: Colors.red, fontSize: 12),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Refund'),
          ),
        ],
      ),
    );
    if (ok != true) return;
    if (!mounted) return;
    final auth = context.read<AuthStore>();
    final api = context.read<ApiClient>();
    try {
      await api.refundOrder(
        token: auth.token!,
        orderId: orderId,
        reason: reasonCtl.text.trim().isEmpty ? null : reasonCtl.text.trim(),
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Refund issued')),
        );
        _reload();
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Refund failed: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final df = DateFormat.yMMMd('en_NG').add_jm();
    return Scaffold(
      appBar: AppBar(
        title: const Text('Orders & refunds'),
        leading: BackButton(onPressed: () => context.go('/dashboard/${widget.organizerSlug}')),
        actions: [IconButton(onPressed: _reload, icon: const Icon(Icons.refresh))],
      ),
      body: RefreshIndicator(
        onRefresh: () async => _reload(),
        child: FutureBuilder<List<Map<String, dynamic>>>(
          future: _future,
          builder: (context, snap) {
            if (snap.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snap.hasError) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text('Couldn\'t load: ${snap.error}'),
                ),
              );
            }
            final orders = snap.data ?? const <Map<String, dynamic>>[];
            if (orders.isEmpty) {
              return const Center(child: Text('No paid orders yet.'));
            }
            return ListView.separated(
              itemCount: orders.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (_, i) {
                final o = orders[i];
                final status = o['status'] as String;
                final refunded = (o['refundedKobo'] as int? ?? 0) > 0;
                final paidAt = o['paidAt'] as String?;
                return ListTile(
                  title: Text(o['buyerEmail'] as String),
                  subtitle: Text(
                    '${o['ticketCount']} ticket${o['ticketCount'] == 1 ? '' : 's'} · '
                    '${formatNaira(o['totalKobo'] as int)}'
                    '${paidAt != null ? ' · ${df.format(DateTime.parse(paidAt))}' : ''}',
                  ),
                  trailing: refunded
                      ? const Chip(label: Text('Refunded'))
                      : status == 'PAID'
                          ? IconButton(
                              icon: const Icon(Icons.money_off, color: Colors.red),
                              tooltip: 'Refund',
                              onPressed: () => _confirmRefund(o),
                            )
                          : Text(status, style: const TextStyle(color: Colors.grey)),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
