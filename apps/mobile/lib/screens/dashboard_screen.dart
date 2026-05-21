import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../api/api_client.dart';
import '../api/models.dart';
import '../state/auth_store.dart';
import '../theme.dart';

/// Lists the organizers the signed-in user is a member of; tap one to
/// drill into its events. The API enforces membership on every nested
/// call, so the worst a non-member can do is see an empty list here.
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Future<List<Membership>>? _future;

  @override
  void initState() {
    super.initState();
    final token = context.read<AuthStore>().token;
    if (token != null) {
      _future = context.read<ApiClient>().myMemberships(token);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Organizer dashboard')),
      body: FutureBuilder<List<Membership>>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) {
            return Center(child: Text('Couldn\'t load: ${snap.error}'));
          }
          final memberships = snap.data ?? const <Membership>[];
          if (memberships.isEmpty) {
            return const Padding(
              padding: EdgeInsets.all(32),
              child: Center(
                child: Text(
                  'You\'re not a member of any organizer.\n\nIf you run events, '
                  'sign up as an organizer on computicket.ng and an admin will '
                  'approve you.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey),
                ),
              ),
            );
          }
          return ListView.separated(
            itemCount: memberships.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (_, i) {
              final m = memberships[i];
              return ListTile(
                leading: const Icon(Icons.business_outlined),
                title: Text(m.organizerName),
                subtitle: Text(m.role),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => context.go('/dashboard/${m.organizerSlug}'),
              );
            },
          );
        },
      ),
    );
  }
}

class OrganizerDashboardScreen extends StatefulWidget {
  final String organizerSlug;
  const OrganizerDashboardScreen({super.key, required this.organizerSlug});
  @override
  State<OrganizerDashboardScreen> createState() => _OrganizerDashboardScreenState();
}

class _OrganizerDashboardScreenState extends State<OrganizerDashboardScreen> {
  Future<DashboardOverview>? _future;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  void _reload() {
    final token = context.read<AuthStore>().token;
    if (token == null) return;
    setState(() {
      _future = context.read<ApiClient>().dashboardOverview(token, widget.organizerSlug);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: BackButton(onPressed: () => context.go('/dashboard')),
        actions: [
          IconButton(onPressed: _reload, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => _reload(),
        child: FutureBuilder<DashboardOverview>(
          future: _future,
          builder: (context, snap) {
            if (snap.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snap.hasError) {
              return Center(child: Text('Couldn\'t load: ${snap.error}'));
            }
            final data = snap.data!;
            final totalSold = data.events.fold<int>(0, (a, e) => a + e.sold);
            final totalRevenue = data.events.fold<int>(0, (a, e) => a + e.revenueKobo);
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text(data.organizerName,
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text('${data.events.length} event${data.events.length == 1 ? '' : 's'}',
                    style: const TextStyle(color: Colors.grey)),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: _Stat(label: 'Tickets sold', value: '$totalSold')),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _Stat(label: 'Gross revenue', value: formatNaira(totalRevenue)),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                const Text('Events',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                if (data.events.isEmpty)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 16),
                    child: Text('No events yet.', style: TextStyle(color: Colors.grey)),
                  )
                else
                  ...data.events.map(
                    (e) => _EventCard(event: e, organizerSlug: widget.organizerSlug),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  final String label;
  final String value;
  const _Stat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
            const SizedBox(height: 4),
            Text(value,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}

class _EventCard extends StatelessWidget {
  final DashboardEventRow event;
  final String organizerSlug;
  const _EventCard({required this.event, required this.organizerSlug});

  @override
  Widget build(BuildContext context) {
    final pct = event.capacity == 0 ? 0.0 : event.sold / event.capacity;
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(event.title,
                      style: const TextStyle(fontWeight: FontWeight.w600)),
                ),
                _StatusChip(status: event.status),
              ],
            ),
            const SizedBox(height: 4),
            Text(event.city, style: const TextStyle(color: Colors.grey, fontSize: 13)),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(value: pct, minHeight: 6),
            ),
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('${event.sold}/${event.capacity} sold',
                    style: const TextStyle(fontSize: 12, color: Colors.grey)),
                Text('${event.paidOrders} orders · ${formatNaira(event.revenueKobo)}',
                    style: const TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton.icon(
                  onPressed: () => context.go(
                    '/dashboard/$organizerSlug/events/${event.slug}/orders',
                  ),
                  icon: const Icon(Icons.receipt_long_outlined, size: 18),
                  label: const Text('Orders'),
                ),
                const SizedBox(width: 8),
                TextButton.icon(
                  onPressed: () => context.go(
                    '/dashboard/$organizerSlug/events/${event.slug}/edit',
                  ),
                  icon: const Icon(Icons.edit_outlined, size: 18),
                  label: const Text('Edit'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String status;
  const _StatusChip({required this.status});

  Color get _bg {
    switch (status) {
      case 'PUBLISHED':
        return Colors.green.shade100;
      case 'DRAFT':
        return Colors.grey.shade200;
      case 'CANCELLED':
        return Colors.red.shade100;
      case 'COMPLETED':
        return Colors.blue.shade100;
      default:
        return Colors.grey.shade200;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(color: _bg, borderRadius: BorderRadius.circular(10)),
      child: Text(status,
          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600)),
    );
  }
}
