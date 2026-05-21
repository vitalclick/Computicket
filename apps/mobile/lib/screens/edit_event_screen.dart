import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../api/api_client.dart';
import '../api/models.dart';
import '../state/auth_store.dart';

/// Edits an existing event's metadata. Ticket types + status (publish)
/// are out of scope here — the API exposes separate endpoints for both
/// and they need bespoke flows (price changes affect already-sold
/// tickets, publishing requires admin approval).
class EditEventScreen extends StatefulWidget {
  final String organizerSlug;
  final String eventSlug;
  const EditEventScreen({super.key, required this.organizerSlug, required this.eventSlug});

  @override
  State<EditEventScreen> createState() => _EditEventScreenState();
}

class _EditEventScreenState extends State<EditEventScreen> {
  final _form = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _description = TextEditingController();
  final _venue = TextEditingController();
  final _city = TextEditingController();
  DateTime? _startsAt;
  DateTime? _endsAt;
  EventSummary? _event;
  bool _busy = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final e = await context.read<ApiClient>().getEvent(widget.eventSlug);
      _title.text = e.title;
      _description.text = e.description ?? '';
      _venue.text = e.venue;
      _city.text = e.city;
      _startsAt = e.startsAt;
      _endsAt = e.endsAt;
      if (mounted) setState(() => _event = e);
    } catch (err) {
      if (mounted) setState(() => _error = err.toString());
    }
  }

  Future<void> _pickDate(bool startField) async {
    final initial = (startField ? _startsAt : _endsAt) ?? DateTime.now().add(const Duration(days: 14));
    final date = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365 * 3)),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(initial),
    );
    if (time == null) return;
    final combined = DateTime(date.year, date.month, date.day, time.hour, time.minute);
    setState(() {
      if (startField) {
        _startsAt = combined;
      } else {
        _endsAt = combined;
      }
    });
  }

  Future<void> _save() async {
    if (!_form.currentState!.validate()) return;
    if (_startsAt == null || _endsAt == null) return;
    if (!_endsAt!.isAfter(_startsAt!)) {
      setState(() => _error = 'End time must be after the start time.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final auth = context.read<AuthStore>();
      await context.read<ApiClient>().updateEvent(
            slug: widget.eventSlug,
            token: auth.token!,
            title: _title.text.trim(),
            description: _description.text.trim().isEmpty ? null : _description.text.trim(),
            venue: _venue.text.trim(),
            city: _city.text.trim(),
            startsAt: _startsAt,
            endsAt: _endsAt,
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Event updated')));
        context.go('/dashboard/${widget.organizerSlug}');
      }
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    _venue.dispose();
    _city.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final df = DateFormat.yMMMEd('en_NG').add_jm();
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit event'),
        leading: BackButton(onPressed: () => context.go('/dashboard/${widget.organizerSlug}')),
      ),
      body: _event == null
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _form,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  TextFormField(
                    controller: _title,
                    decoration: const InputDecoration(labelText: 'Title'),
                    validator: (v) =>
                        (v == null || v.trim().length < 2) ? 'Required' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _description,
                    decoration: const InputDecoration(labelText: 'Description'),
                    maxLines: 3,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _venue,
                    decoration: const InputDecoration(labelText: 'Venue'),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _city,
                    decoration: const InputDecoration(labelText: 'City'),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                  ),
                  const SizedBox(height: 16),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Starts'),
                    subtitle: Text(_startsAt == null ? '—' : df.format(_startsAt!)),
                    trailing: const Icon(Icons.event_outlined),
                    onTap: () => _pickDate(true),
                  ),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Ends'),
                    subtitle: Text(_endsAt == null ? '—' : df.format(_endsAt!)),
                    trailing: const Icon(Icons.event_outlined),
                    onTap: () => _pickDate(false),
                  ),
                  if (_error != null) ...[
                    const SizedBox(height: 12),
                    Text(_error!, style: const TextStyle(color: Colors.red)),
                  ],
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: _busy ? null : _save,
                    child: _busy
                        ? const SizedBox(
                            width: 20, height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Text('Save changes'),
                  ),
                ],
              ),
            ),
    );
  }
}
