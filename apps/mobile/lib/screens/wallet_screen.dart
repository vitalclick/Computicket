import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../api/api_client.dart';
import '../api/models.dart';
import '../state/auth_store.dart';
import '../theme.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});
  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  Future<WalletOverview>? _future;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  void _reload() {
    final token = context.read<AuthStore>().token;
    if (token == null) return;
    setState(() {
      _future = context.read<ApiClient>().walletOverview(token);
    });
  }

  Future<void> _topUp(int amountKobo) async {
    final token = context.read<AuthStore>().token;
    if (token == null) return;
    try {
      final res = await context
          .read<ApiClient>()
          .walletTopUp(token: token, amountKobo: amountKobo);
      final opened = await launchUrl(
        Uri.parse(res.authorizationUrl),
        mode: LaunchMode.externalApplication,
      );
      if (!opened && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Couldn\'t open the payment page')),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Top-up failed: $e')),
      );
    }
  }

  Future<void> _promptTopUpAmount() async {
    final controller = TextEditingController(text: '5000');
    final result = await showDialog<int>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Top up wallet'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Amount in Naira (₦100 minimum)'),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              autofocus: true,
              decoration: const InputDecoration(prefixText: '₦ '),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              final naira = int.tryParse(controller.text.trim()) ?? 0;
              if (naira < 100) {
                ScaffoldMessenger.of(ctx).showSnackBar(
                  const SnackBar(content: Text('Minimum top-up is ₦100')),
                );
                return;
              }
              Navigator.pop(ctx, naira * 100); // kobo
            },
            child: const Text('Continue to Paystack'),
          ),
        ],
      ),
    );
    if (result != null) await _topUp(result);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Wallet'),
        actions: [IconButton(onPressed: _reload, icon: const Icon(Icons.refresh))],
      ),
      body: RefreshIndicator(
        onRefresh: () async => _reload(),
        child: FutureBuilder<WalletOverview>(
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
            final data = snap.data!;
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _BalanceCard(balanceKobo: data.balanceKobo, onTopUp: _promptTopUpAmount),
                const SizedBox(height: 12),
                Card(
                  child: ListTile(
                    leading: const Icon(Icons.verified_user_outlined),
                    title: const Text('Verify identity'),
                    subtitle: const Text('Raise your top-up cap by submitting BVN + ID'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => context.go('/wallet/kyc'),
                  ),
                ),
                const SizedBox(height: 24),
                const Text('Recent activity',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                if (data.transactions.isEmpty)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 16),
                    child: Text('No transactions yet.', style: TextStyle(color: Colors.grey)),
                  )
                else
                  ...data.transactions.map((t) => _TxRow(tx: t)),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _BalanceCard extends StatelessWidget {
  final int balanceKobo;
  final VoidCallback onTopUp;
  const _BalanceCard({required this.balanceKobo, required this.onTopUp});

  @override
  Widget build(BuildContext context) {
    return Card(
      color: brandGreen,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Available balance',
                style: TextStyle(color: Colors.white70, fontSize: 13)),
            const SizedBox(height: 4),
            Text(formatNaira(balanceKobo),
                style: const TextStyle(
                    color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onTopUp,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: brandGreen,
                ),
                child: const Text('Top up'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TxRow extends StatelessWidget {
  final WalletTransaction tx;
  const _TxRow({required this.tx});

  @override
  Widget build(BuildContext context) {
    final df = DateFormat.yMMMd('en_NG').add_jm();
    final positive = tx.amountKobo > 0;
    return ListTile(
      contentPadding: EdgeInsets.zero,
      dense: true,
      leading: Icon(
        positive ? Icons.add_circle_outline : Icons.remove_circle_outline,
        color: positive ? Colors.green : Colors.red,
      ),
      title: Text(tx.note ?? tx.type),
      subtitle: Text(df.format(tx.createdAt)),
      trailing: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            '${positive ? '+' : ''}${formatNaira(tx.amountKobo)}',
            style: TextStyle(
              color: positive ? Colors.green : Colors.red,
              fontWeight: FontWeight.w600,
            ),
          ),
          Text('bal ${formatNaira(tx.balanceAfterKobo)}',
              style: const TextStyle(color: Colors.grey, fontSize: 11)),
        ],
      ),
    );
  }
}
