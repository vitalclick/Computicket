import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../api/api_client.dart';
import '../state/auth_store.dart';

class TicketDetailScreen extends StatelessWidget {
  final String code;
  const TicketDetailScreen({super.key, required this.code});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(leading: BackButton(onPressed: () => context.go('/tickets'))),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 16),
              const Text('Show this at the gate',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500)),
              const SizedBox(height: 4),
              const Text('One scan only.', style: TextStyle(color: Colors.grey)),
              const SizedBox(height: 32),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(color: Colors.black12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: QrImageView(
                  data: code,
                  size: 280,
                  backgroundColor: Colors.white,
                  errorCorrectionLevel: QrErrorCorrectLevel.M,
                ),
              ),
              const SizedBox(height: 20),
              SelectableText(
                code,
                style: const TextStyle(
                  fontFamily: 'monospace',
                  fontSize: 14,
                  letterSpacing: 1,
                ),
              ),
              const SizedBox(height: 32),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.send_outlined, size: 18),
                      label: const Text('Transfer'),
                      onPressed: () => _openTransfer(context),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.sell_outlined, size: 18),
                      label: const Text('Resell'),
                      onPressed: () => _openResell(context),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _openTransfer(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (_) => _TransferDialog(code: code),
    );
  }

  void _openResell(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (_) => _ResellDialog(code: code),
    );
  }
}

class _TransferDialog extends StatefulWidget {
  const _TransferDialog({required this.code});
  final String code;

  @override
  State<_TransferDialog> createState() => _TransferDialogState();
}

class _TransferDialogState extends State<_TransferDialog> {
  final _emailController = TextEditingController();
  bool _busy = false;
  String? _error;
  TicketTransferTicket? _result;

  Future<void> _generate() async {
    final auth = context.read<AuthStore>();
    final api = context.read<ApiClient>();
    if (auth.token == null) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final res = await api.createTicketTransfer(
        token: auth.token!,
        code: widget.code,
        recipientEmail: _emailController.text.trim().isEmpty
            ? null
            : _emailController.text.trim(),
      );
      setState(() => _result = res);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final result = _result;
    return AlertDialog(
      title: const Text('Transfer ticket'),
      content: result == null
          ? Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Generate a single-use link. The recipient signs in to claim — your QR stops scanning the moment they do.',
                  style: TextStyle(fontSize: 13),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  autocorrect: false,
                  decoration: const InputDecoration(
                    labelText: 'Recipient email (optional)',
                  ),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 8),
                  Text(_error!, style: const TextStyle(color: Colors.red)),
                ],
              ],
            )
          : Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Send this link:',
                    style: TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.black12,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: SelectableText(
                    result.link,
                    style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Expires ${result.expiresAt.toLocal()}',
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ],
            ),
      actions: [
        if (result == null) ...[
          TextButton(
            onPressed: _busy ? null : () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: _busy ? null : _generate,
            child: Text(_busy ? 'Generating…' : 'Generate link'),
          ),
        ] else ...[
          TextButton(
            onPressed: () {
              Clipboard.setData(ClipboardData(text: result.link));
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Link copied')),
              );
            },
            child: const Text('Copy'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Done'),
          ),
        ],
      ],
    );
  }
}

class _ResellDialog extends StatefulWidget {
  const _ResellDialog({required this.code});
  final String code;

  @override
  State<_ResellDialog> createState() => _ResellDialogState();
}

class _ResellDialogState extends State<_ResellDialog> {
  final _askController = TextEditingController();
  bool _busy = false;
  String? _error;
  bool _listed = false;

  Future<void> _submit() async {
    final auth = context.read<AuthStore>();
    final api = context.read<ApiClient>();
    final ngn = double.tryParse(_askController.text.trim());
    if (ngn == null || ngn < 100) {
      setState(() => _error = 'Ask must be at least ₦100.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await api.createResaleListing(
        token: auth.token!,
        ticketCode: widget.code,
        askKobo: (ngn * 100).round(),
      );
      setState(() => _listed = true);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_listed) {
      return AlertDialog(
        title: const Text('Listed for resale'),
        content: const Text(
          'Your ticket is on the resale floor. We will credit your wallet the moment it sells.',
        ),
        actions: [
          FilledButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Done'),
          ),
        ],
      );
    }
    return AlertDialog(
      title: const Text('Resell ticket'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Set your ask in Naira. Buyers pay from their wallet; you receive the ask minus a 10% platform fee. Cancel anytime before someone buys.',
            style: TextStyle(fontSize: 13),
          ),
          const SizedBox(height: 14),
          TextField(
            controller: _askController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: const InputDecoration(
              labelText: 'Ask price (NGN)',
              prefixText: '₦ ',
            ),
          ),
          if (_error != null) ...[
            const SizedBox(height: 8),
            Text(_error!, style: const TextStyle(color: Colors.red)),
          ],
        ],
      ),
      actions: [
        TextButton(
          onPressed: _busy ? null : () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: _busy ? null : _submit,
          child: Text(_busy ? 'Listing…' : 'List on resale floor'),
        ),
      ],
    );
  }
}
