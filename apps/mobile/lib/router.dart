import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';
import 'screens/dashboard_screen.dart';
import 'screens/edit_event_screen.dart';
import 'screens/event_detail_screen.dart';
import 'screens/events_screen.dart';
import 'screens/kyc_screen.dart';
import 'screens/my_tickets_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/refunds_screen.dart';
import 'screens/scanner_screen.dart';
import 'screens/shell.dart';
import 'screens/signin_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/ticket_detail_screen.dart';
import 'screens/wallet_screen.dart';
import 'state/auth_store.dart';

GoRouter buildRouter(AuthStore auth) {
  final tabsKey = GlobalKey<NavigatorState>();
  return GoRouter(
    initialLocation: '/events',
    refreshListenable: auth,
    redirect: (context, state) {
      final loggedIn = auth.isSignedIn;
      final atAuth = state.matchedLocation == '/signin' ||
          state.matchedLocation == '/signup';
      final needsAuth = state.matchedLocation == '/tickets' ||
          state.matchedLocation == '/profile' ||
          state.matchedLocation == '/wallet' ||
          state.matchedLocation == '/scanner' ||
          state.matchedLocation.startsWith('/dashboard');
      if (!loggedIn && needsAuth) return '/signin?next=${state.matchedLocation}';
      if (loggedIn && atAuth) return '/events';
      return null;
    },
    routes: [
      ShellRoute(
        navigatorKey: tabsKey,
        builder: (context, state, child) => AppShell(child: child),
        routes: [
          GoRoute(
            path: '/events',
            builder: (_, __) => const EventsScreen(),
            routes: [
              GoRoute(
                path: ':slug',
                builder: (_, st) =>
                    EventDetailScreen(slug: st.pathParameters['slug']!),
              ),
            ],
          ),
          GoRoute(
            path: '/tickets',
            builder: (_, __) => const MyTicketsScreen(),
            routes: [
              GoRoute(
                path: ':code',
                builder: (_, st) =>
                    TicketDetailScreen(code: st.pathParameters['code']!),
              ),
            ],
          ),
          GoRoute(
            path: '/profile',
            builder: (_, __) => const ProfileScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/wallet',
        builder: (_, __) => const WalletScreen(),
        routes: [
          GoRoute(path: 'kyc', builder: (_, __) => const KycScreen()),
        ],
      ),
      GoRoute(path: '/scanner', builder: (_, __) => const ScannerScreen()),
      GoRoute(
        path: '/dashboard',
        builder: (_, __) => const DashboardScreen(),
        routes: [
          GoRoute(
            path: ':organizerSlug',
            builder: (_, st) => OrganizerDashboardScreen(
              organizerSlug: st.pathParameters['organizerSlug']!,
            ),
            routes: [
              GoRoute(
                path: 'events/:eventSlug/edit',
                builder: (_, st) => EditEventScreen(
                  organizerSlug: st.pathParameters['organizerSlug']!,
                  eventSlug: st.pathParameters['eventSlug']!,
                ),
              ),
              GoRoute(
                path: 'events/:eventSlug/orders',
                builder: (_, st) => RefundsScreen(
                  organizerSlug: st.pathParameters['organizerSlug']!,
                  eventSlug: st.pathParameters['eventSlug']!,
                ),
              ),
            ],
          ),
        ],
      ),
      GoRoute(path: '/signin', builder: (_, __) => const SignInScreen()),
      GoRoute(path: '/signup', builder: (_, __) => const SignUpScreen()),
    ],
  );
}
