// Boots the real ComputicketApp with an in-memory ApiClient and AuthStore
// so the router can render without hitting the network. The smoke goal is
// "the app constructs and reaches its initial location without throwing".
//
// Deeper widget tests live next to the screens they exercise (TBD).

import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:computicket_mobile/api/api_client.dart';
import 'package:computicket_mobile/main.dart';
import 'package:computicket_mobile/state/auth_store.dart';

void main() {
  testWidgets('App boots to /events without throwing', (tester) async {
    // shared_preferences uses a platform channel; the test plugin
    // gives us an in-memory backing store so AuthStore.hydrate() works.
    SharedPreferences.setMockInitialValues(<String, Object>{});
    final api = ApiClient(baseUrl: Uri.parse('http://localhost:4000/v1'));
    final auth = AuthStore(api);
    await auth.hydrate();

    await tester.pumpWidget(ComputicketApp(api: api, auth: auth));
    await tester.pump();

    // The bottom nav scaffold renders three tabs immediately, before
    // any data fetch resolves — that's enough to prove the routing
    // graph compiles and the root MaterialApp.router is wired.
    expect(find.text('Events'), findsOneWidget);
    expect(find.text('Tickets'), findsOneWidget);
    expect(find.text('Profile'), findsOneWidget);
  });
}
