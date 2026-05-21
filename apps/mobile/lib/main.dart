import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'api/api_client.dart';
import 'router.dart';
import 'state/auth_store.dart';
import 'state/push_client.dart';
import 'theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final api = ApiClient();
  final push = PushClient(api);
  // No-op when FIREBASE_ENABLED isn't set as a --dart-define. Real
  // builds with the google-services.json / Info.plist secrets in place
  // get full FCM registration on signin.
  await push.initialise();

  final auth = AuthStore(api, push: push);
  await auth.hydrate();
  // If the user is already signed in from a previous launch, send the
  // current FCM token up so server-side notifications can find them.
  if (auth.isSignedIn) {
    final t = auth.token;
    if (t != null) await push.registerForUser(t);
  }

  runApp(ComputicketApp(api: api, auth: auth));
}

class ComputicketApp extends StatelessWidget {
  final ApiClient api;
  final AuthStore auth;
  const ComputicketApp({super.key, required this.api, required this.auth});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<ApiClient>.value(value: api),
        ChangeNotifierProvider<AuthStore>.value(value: auth),
      ],
      child: MaterialApp.router(
        title: 'Computicket Nigeria',
        debugShowCheckedModeBanner: false,
        theme: buildTheme(),
        routerConfig: buildRouter(auth),
      ),
    );
  }
}
