import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../state/auth_store.dart';

const _webBase = String.fromEnvironment(
  'WEB_BASE_URL',
  defaultValue: 'https://computicket.ng',
);

Future<void> _openLink(String path) async {
  final uri = Uri.parse('$_webBase$path');
  await launchUrl(uri, mode: LaunchMode.externalApplication);
}

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthStore>();
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        children: [
          const SizedBox(height: 24),
          Center(
            child: CircleAvatar(
              radius: 36,
              child: Text(
                (auth.name ?? auth.email ?? '?').substring(0, 1).toUpperCase(),
                style: const TextStyle(fontSize: 24),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Center(
            child: Text(auth.name ?? 'Computicket member',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w500)),
          ),
          if (auth.email != null)
            Center(
              child: Text(auth.email!, style: const TextStyle(color: Colors.grey)),
            ),
          const SizedBox(height: 24),
          ListTile(
            leading: const Icon(Icons.confirmation_number_outlined),
            title: const Text('My tickets'),
            onTap: () => context.go('/tickets'),
          ),
          ListTile(
            leading: const Icon(Icons.account_balance_wallet_outlined),
            title: const Text('Wallet'),
            onTap: () => context.go('/wallet'),
          ),
          ListTile(
            leading: const Icon(Icons.event_outlined),
            title: const Text('Browse events'),
            onTap: () => context.go('/events'),
          ),
          const Divider(),
          // Always-visible: the dashboard handles its own empty state
          // when the user isn't a member of any organizer, and the
          // scanner shows a clear 403 when the API refuses.
          ListTile(
            leading: const Icon(Icons.business_outlined),
            title: const Text('Organizer dashboard'),
            subtitle: const Text('If you run events on Computicket'),
            onTap: () => context.go('/dashboard'),
          ),
          ListTile(
            leading: const Icon(Icons.qr_code_scanner_outlined),
            title: const Text('Scan tickets'),
            subtitle: const Text('For organizer staff at the gate'),
            onTap: () => context.go('/scanner'),
          ),
          const Divider(),
          // Legal links required by both App Store and Play Store
          // reviewer checklists. Each opens in the system browser.
          ListTile(
            leading: const Icon(Icons.privacy_tip_outlined),
            title: const Text('Privacy policy'),
            trailing: const Icon(Icons.open_in_new, size: 16),
            onTap: () => _openLink('/privacy'),
          ),
          ListTile(
            leading: const Icon(Icons.description_outlined),
            title: const Text('Terms of service'),
            trailing: const Icon(Icons.open_in_new, size: 16),
            onTap: () => _openLink('/terms'),
          ),
          ListTile(
            leading: const Icon(Icons.help_outline),
            title: const Text('Help & support'),
            trailing: const Icon(Icons.open_in_new, size: 16),
            onTap: () => _openLink('/help'),
          ),
          ListTile(
            leading: const Icon(Icons.shield_outlined),
            title: const Text('Buyer protection'),
            trailing: const Icon(Icons.open_in_new, size: 16),
            onTap: () => _openLink('/buyer-protection'),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('Sign out', style: TextStyle(color: Colors.red)),
            onTap: () async {
              await auth.signOut();
              if (context.mounted) context.go('/events');
            },
          ),
          const SizedBox(height: 16),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'Computicket Nigeria · v0.1.0',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey, fontSize: 11),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}
