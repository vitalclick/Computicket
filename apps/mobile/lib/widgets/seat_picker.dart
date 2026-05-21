import 'package:flutter/material.dart';
import '../api/models.dart';
import '../theme.dart';

/// Tap-to-select seat grid. Reads `Seat.row` + `Seat.label` to lay out
/// rows and assumes the API has already sorted by position. SOLD and
/// HELD seats are non-interactive; AVAILABLE seats toggle selection up
/// to `maxQuantity`.
class SeatPicker extends StatelessWidget {
  final List<Seat> seats;
  final Set<String> selectedIds;
  final int maxQuantity;
  final ValueChanged<Set<String>> onChanged;

  const SeatPicker({
    super.key,
    required this.seats,
    required this.selectedIds,
    required this.maxQuantity,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    // Group by row, preserving the order the API returned them in.
    final byRow = <String, List<Seat>>{};
    for (final s in seats) {
      byRow.putIfAbsent(s.row, () => <Seat>[]).add(s);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Legend
        const Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _LegendChip(color: Colors.white, border: true, label: 'Available'),
            _LegendChip(color: brandGreen, label: 'Selected'),
            _LegendChip(color: Color(0xFFE5E7EB), label: 'Held'),
            _LegendChip(color: Color(0xFF9CA3AF), label: 'Sold'),
          ],
        ),
        const SizedBox(height: 8),
        // Screen / stage marker — purely decorative but anchors the
        // visual model so buyers know which way "the front" is.
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 24),
          padding: const EdgeInsets.symmetric(vertical: 4),
          decoration: BoxDecoration(
            color: Colors.grey.shade100,
            borderRadius: BorderRadius.circular(4),
          ),
          alignment: Alignment.center,
          child: const Text('STAGE',
              style: TextStyle(letterSpacing: 4, fontSize: 11, color: Colors.grey)),
        ),
        const SizedBox(height: 12),
        ...byRow.entries.map((entry) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                children: [
                  SizedBox(
                    width: 24,
                    child: Text(entry.key,
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
                  ),
                  Expanded(
                    child: Wrap(
                      spacing: 4,
                      runSpacing: 4,
                      children: entry.value
                          .map((s) => _SeatTile(
                                seat: s,
                                selected: selectedIds.contains(s.id),
                                onTap: () => _toggle(s),
                              ))
                          .toList(),
                    ),
                  ),
                ],
              ),
            )),
        const SizedBox(height: 8),
        Text(
          'Selected ${selectedIds.length} / $maxQuantity',
          textAlign: TextAlign.center,
          style: const TextStyle(color: Colors.grey, fontSize: 12),
        ),
      ],
    );
  }

  void _toggle(Seat s) {
    if (s.status != 'AVAILABLE') return;
    final next = Set<String>.from(selectedIds);
    if (next.contains(s.id)) {
      next.remove(s.id);
    } else {
      if (next.length >= maxQuantity) return;
      next.add(s.id);
    }
    onChanged(next);
  }
}

class _SeatTile extends StatelessWidget {
  final Seat seat;
  final bool selected;
  final VoidCallback onTap;
  const _SeatTile({required this.seat, required this.selected, required this.onTap});

  Color get _bg {
    if (selected) return brandGreen;
    switch (seat.status) {
      case 'AVAILABLE':
        return Colors.white;
      case 'HELD':
        return const Color(0xFFE5E7EB);
      case 'SOLD':
        return const Color(0xFF9CA3AF);
    }
    return Colors.white;
  }

  Color get _text =>
      selected || seat.status == 'SOLD' ? Colors.white : Colors.black87;

  @override
  Widget build(BuildContext context) {
    final tappable = seat.status == 'AVAILABLE';
    return Semantics(
      label: 'Seat ${seat.row}${seat.label}, ${seat.status.toLowerCase()}'
          '${selected ? ', selected' : ''}',
      button: tappable,
      child: GestureDetector(
        onTap: tappable ? onTap : null,
        child: Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: _bg,
            border: Border.all(color: Colors.grey.shade400),
            borderRadius: BorderRadius.circular(4),
          ),
          alignment: Alignment.center,
          child: Text(seat.label,
              style: TextStyle(fontSize: 10, color: _text, fontWeight: FontWeight.w500)),
        ),
      ),
    );
  }
}

class _LegendChip extends StatelessWidget {
  final Color color;
  final String label;
  final bool border;
  const _LegendChip({required this.color, required this.label, this.border = false});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 14,
          height: 14,
          decoration: BoxDecoration(
            color: color,
            border: border ? Border.all(color: Colors.grey.shade400) : null,
            borderRadius: BorderRadius.circular(3),
          ),
        ),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 11)),
      ],
    );
  }
}
