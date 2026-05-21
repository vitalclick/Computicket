import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:computicket_mobile/theme.dart';

void main() {
  test('formatNaira renders thousands separators and ₦ prefix', () {
    expect(formatNaira(0), '₦0');
    expect(formatNaira(500), '₦5');
    expect(formatNaira(1500000), '₦15,000');
    expect(formatNaira(12345678900), '₦123,456,789');
  });

  test('buildTheme yields a Material3 ThemeData with the brand seed', () {
    final t = buildTheme();
    expect(t.useMaterial3, isTrue);
    expect(t.colorScheme.primary, isNot(const Color(0x00000000)));
    expect(t.elevatedButtonTheme.style, isNotNull);
  });
}
