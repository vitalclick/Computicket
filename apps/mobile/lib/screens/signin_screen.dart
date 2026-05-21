import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../api/models.dart';
import '../state/auth_store.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});
  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _totp = TextEditingController();
  String? _challengeToken;
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    _totp.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final auth = context.read<AuthStore>();
      if (_challengeToken != null) {
        await auth.signin2FA(_challengeToken!, _totp.text.trim());
        if (mounted) context.go('/events');
        return;
      }
      final res = await auth.signin(_email.text.trim(), _password.text);
      if (res is Signin2FAChallenge) {
        setState(() => _challengeToken = res.challengeToken);
      } else if (mounted) {
        context.go('/events');
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final showing2FA = _challengeToken != null;
    return Scaffold(
      appBar: AppBar(title: const Text('Sign in')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Image.asset(
                  'assets/icon.png',
                  width: 72,
                  height: 72,
                  semanticLabel: 'Computicket Nigeria',
                ),
              ),
              const SizedBox(height: 16),
              Text(
                showing2FA
                    ? 'Enter the 6-digit code from your authenticator app.'
                    : 'Access your tickets and bookings.',
                style: const TextStyle(color: Colors.grey),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              if (!showing2FA) ...[
                TextField(
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(labelText: 'Email'),
                  autofillHints: const [AutofillHints.email],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _password,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: 'Password'),
                  autofillHints: const [AutofillHints.password],
                ),
              ] else ...[
                TextField(
                  controller: _totp,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  textAlign: TextAlign.center,
                  style: const TextStyle(letterSpacing: 4, fontFamily: 'monospace'),
                  decoration: const InputDecoration(labelText: '6-digit code'),
                  autofillHints: const [AutofillHints.oneTimeCode],
                ),
              ],
              if (_error != null) ...[
                const SizedBox(height: 8),
                Text(_error!, style: const TextStyle(color: Colors.red)),
              ],
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _busy ? null : _submit,
                child: _busy
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white),
                      )
                    : Text(showing2FA ? 'Verify' : 'Sign in'),
              ),
              if (!showing2FA) ...[
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => context.push('/signup'),
                  child: const Text('Create an account'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
