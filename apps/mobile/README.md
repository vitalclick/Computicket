# Computicket Nigeria — Mobile

Flutter app for buyers: browse events, sign in (with 2FA), buy tickets through
Paystack's hosted checkout, and display tickets as QR codes.

## Scope (v1)

- Sign up / sign in (email + password, with TOTP 2FA challenge step)
- Browse + search published events
- Event detail with multi-tier ticket selection and quantity picker
- "Buy" opens the Paystack authorization URL in the device browser; once
  the buyer returns, the new ticket appears in the Tickets tab
- "My tickets" lists paid orders; tapping a ticket shows its QR code
- Sign out

Out of scope for v1: organizer dashboard, scanner, wallet top-ups,
add-ons, seat picker, white-label theming. The web app covers all of
those today.

## First-time setup

This repo deliberately does **not** check in the auto-generated platform
shells (`ios/`, `android/`, `web/`, `linux/`, `macos/`, `windows/`).
They're regenerated on demand so the upstream Flutter SDK can evolve
without polluting the diff. Before your first run:

```sh
cd apps/mobile
flutter create --no-overwrite --org ng.computicket --project-name computicket_mobile .
flutter pub get
dart run flutter_launcher_icons
```

The third command reads the `flutter_launcher_icons:` block in
`pubspec.yaml` and rasters `assets/icon.png` into every Android density
bucket, the iOS asset catalogue, and the web `favicon.png`. Re-run it
whenever `assets/icon.png` changes. The CI workflow at
`.github/workflows/mobile.yml` does both steps automatically.

## Pointing at the API

The base URL is a compile-time constant resolved from the `API_URL`
dart-define, defaulting to `http://10.0.2.2:4000/v1` (the Android
emulator's host loopback). Override per build:

```sh
# Local API on a physical device
flutter run --dart-define=API_URL=http://192.168.1.10:4000/v1

# Staging
flutter run --dart-define=API_URL=https://staging.computicket.ng/v1
```

iOS Simulator hits `http://localhost:4000/v1` directly — pass that via
`--dart-define`.

## Development

```sh
flutter pub get
flutter analyze
flutter test
flutter run            # device/emulator
```

## What's stored where

- JWT + email + display name → `shared_preferences`. For a production
  release move the JWT into `flutter_secure_storage` so it's
  keychain/keystore-backed; the AuthStore interface won't change.
- No other client-side persistence. Orders, tickets, and event data are
  fetched on demand.

## Architecture notes

- `lib/api/` — HTTP client and JSON models. Stateless; constructed once
  in `main.dart` and injected via `provider`.
- `lib/state/auth_store.dart` — `ChangeNotifier` that owns auth state;
  the `GoRouter` listens to it so login/logout redirects are reactive.
- `lib/screens/` — one file per route. `shell.dart` is the bottom-nav
  scaffold for the three tabs (Events, Tickets, Profile).
- `lib/router.dart` — `go_router` config with auth-aware redirect.

## Known follow-ups

- Move JWT to `flutter_secure_storage`
- In-app web view for Paystack instead of the external browser, so the
  return URL can be intercepted and the Tickets tab refreshed
  automatically
- Push notifications when an order completes
- Localisation (i18n) beyond `en_NG`
- App icon + splash screen artwork (the `flutter create` defaults ship
  the Flutter dash; the `docs/Computicket-icon.png` checked into the
  repo can be wired in via `flutter_launcher_icons`)
