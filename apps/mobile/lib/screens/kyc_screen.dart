import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../api/api_client.dart';
import '../state/auth_store.dart';

/// Submits BVN + government ID to /v1/me/wallet/kyc. The API validates
/// the BVN format (11 digits, Nigerian Bank Verification Number) and
/// queues the submission for admin review — the tier doesn't move
/// until an admin approves.
class KycScreen extends StatefulWidget {
  const KycScreen({super.key});
  @override
  State<KycScreen> createState() => _KycScreenState();
}

class _KycScreenState extends State<KycScreen> {
  final _form = GlobalKey<FormState>();
  final _bvn = TextEditingController();
  final _idNumber = TextEditingController();
  final _docUrl = TextEditingController();
  bool _busy = false;
  String? _error;
  bool _done = false;

  @override
  void dispose() {
    _bvn.dispose();
    _idNumber.dispose();
    _docUrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final token = context.read<AuthStore>().token!;
      await context.read<ApiClient>().submitKyc(
        token: token,
        bvn: _bvn.text.trim(),
        idNumber: _idNumber.text.trim(),
        idDocumentUrl: _docUrl.text.trim().isEmpty ? null : _docUrl.text.trim(),
      );
      if (mounted) setState(() => _done = true);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Verify identity'),
        leading: BackButton(onPressed: () => context.go('/wallet')),
      ),
      body: _done ? _SuccessBanner() : _form_(),
    );
  }

  Widget _form_() {
    return Form(
      key: _form,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Why we ask',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
          const Text(
            'Nigerian financial regulations require us to verify your identity '
            'before raising your wallet top-up cap. Submissions are reviewed '
            'within one business day. We don\'t share your BVN with third '
            'parties.',
            style: TextStyle(color: Colors.grey, height: 1.4),
          ),
          const SizedBox(height: 24),
          TextFormField(
            controller: _bvn,
            decoration: const InputDecoration(
              labelText: 'Bank Verification Number (BVN)',
              helperText: '11 digits',
            ),
            keyboardType: TextInputType.number,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(11)],
            validator: (v) {
              if (v == null || v.trim().length != 11) return 'BVN must be exactly 11 digits';
              return null;
            },
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _idNumber,
            decoration: const InputDecoration(
              labelText: 'Government ID number',
              helperText: 'NIN, passport, or driver\'s licence',
            ),
            validator: (v) =>
                (v == null || v.trim().length < 5) ? 'Required' : null,
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _docUrl,
            decoration: const InputDecoration(
              labelText: 'ID document URL (optional)',
              helperText: 'Link to a photo of the ID — Dropbox, Drive, etc.',
            ),
            keyboardType: TextInputType.url,
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: const TextStyle(color: Colors.red)),
          ],
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _busy ? null : _submit,
            child: _busy
                ? const SizedBox(
                    width: 20, height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : const Text('Submit for review'),
          ),
        ],
      ),
    );
  }
}

class _SuccessBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.verified_outlined, size: 64, color: Colors.green),
            const SizedBox(height: 16),
            const Text(
              'Submission received',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            const Text(
              'An admin will review your details within one business day. '
              'You\'ll see your tier change once it\'s approved.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go('/wallet'),
              child: const Text('Back to wallet'),
            ),
          ],
        ),
      ),
    );
  }
}
