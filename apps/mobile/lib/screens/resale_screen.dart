import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../api/api_client.dart';
import '../state/auth_store.dart';

final _ngn = NumberFormat.currency(locale: 'en_NG', symbol: '₦', decimalDigits: 0);
final _date = DateFormat('EEE d MMM');

class ResaleScreen extends StatefulWidget {
  const ResaleScreen({super.key});

  @override
  State<ResaleScreen> createState() => _ResaleScreenState();
}

class _ResaleScreenState extends State<ResaleScreen> {
  late Future<List<ResaleListing>> _future;

  @override
  void initState() {
    super.initState();
    _future = context.read<ApiClient>().listResale();
  }

  Future<void> _refresh() async {
    setState(() {
      _future = context.read<ApiClient>().listResale();
    });
    await _future;
  }

  Future<void> _buy(ResaleListing l) async {
    final auth = context.read<AuthStore>();
    final api = context.read<ApiClient>();
    if (auth.token == null) {
      context.go('/signin');
      return;
    }
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Buy ${l.tierName}?'),
        content: Text(
          '${_ngn.format(l.askKobo / 100)} from your wallet for ${l.eventTitle}.\n\nThe ticket transfers to you instantly. Resales are wallet-only.',
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel')),
          FilledButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Confirm')),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      final res = await api.buyResaleListing(token: auth.token!, listingId: l.id);
      if (mounted) {
        context.go('/tickets/${res['ticketCode']}');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Resale floor')),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: FutureBuilder<List<ResaleListing>>(
          future: _future,
          builder: (ctx, snap) {
            if (snap.connectionState != ConnectionState.done) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snap.hasError) {
              return ListView(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text('${snap.error}',
                        style: const TextStyle(color: Colors.red)),
                  ),
                ],
              );
            }
            final listings = snap.data ?? const <ResaleListing>[];
            if (listings.isEmpty) {
              return ListView(
                children: const [
                  Padding(
                    padding: EdgeInsets.all(32),
                    child: Column(
                      children: [
                        Text(
                          'No active resale listings right now.',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                        ),
                        SizedBox(height: 8),
                        Text(
                          'When buyers re-list a ticket they can\'t use, it shows up here instantly. Pull to refresh.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                ],
              );
            }
            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: listings.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, i) {
                final l = listings[i];
                final savings = l.originalPriceKobo - l.askKobo;
                return Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: BorderSide(color: Colors.grey.shade300),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: Colors.purple.shade50,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text(
                                'RESALE',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 1,
                                  color: Colors.purple,
                                ),
                              ),
                            ),
                            const Spacer(),
                            Text(_date.format(l.startsAt.toLocal()),
                                style: const TextStyle(
                                    color: Colors.grey, fontSize: 12)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(l.eventTitle,
                            style: const TextStyle(
                                fontSize: 17, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 4),
                        Text('${l.tierName} · ${l.venue}, ${l.city}',
                            style: const TextStyle(
                                color: Colors.grey, fontSize: 13)),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Ask',
                                    style: TextStyle(
                                        fontSize: 11, color: Colors.grey)),
                                Text(
                                  _ngn.format(l.askKobo / 100),
                                  style: const TextStyle(
                                      fontSize: 20, fontWeight: FontWeight.w700),
                                ),
                              ],
                            ),
                            const Spacer(),
                            if (savings > 0)
                              Text(
                                'Save ${_ngn.format(savings / 100)}',
                                style: const TextStyle(
                                    color: Colors.green,
                                    fontWeight: FontWeight.w600),
                              )
                            else if (savings < 0)
                              Text(
                                '${_ngn.format(-savings / 100)} over face',
                                style: TextStyle(
                                    color: Colors.orange.shade700,
                                    fontWeight: FontWeight.w600),
                              )
                            else
                              const Text('At face value',
                                  style: TextStyle(color: Colors.grey)),
                          ],
                        ),
                        const SizedBox(height: 14),
                        SizedBox(
                          width: double.infinity,
                          child: FilledButton(
                            onPressed: () => _buy(l),
                            child: const Text('Buy with wallet'),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
