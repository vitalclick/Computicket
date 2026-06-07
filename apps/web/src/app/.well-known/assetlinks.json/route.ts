import { NextResponse } from 'next/server';

/**
 * Digital Asset Links — Android App Links.
 *
 * Tells Android that this domain authorizes the Computicket app to
 * intercept https://computicket.ng/... URLs as Verified App Links
 * (the autoVerify flag in AndroidManifest), so the disambiguation
 * sheet ("Open with…") doesn't pop up.
 *
 * Configure at deploy time:
 *   ANDROID_APP_PACKAGE             (defaults to ng.computicket.app)
 *   ANDROID_APP_SHA256_FINGERPRINTS (comma-separated upper-case SHA-256
 *                                    cert fingerprints — get them with
 *                                    `keytool -list -v -keystore $KEY`)
 *
 * For Play App Signing, list the App Signing Key from the Play Console.
 * Add the upload key too if you also deploy debug builds with deep
 * links. Up to a handful of fingerprints are allowed.
 *
 * Reference: https://developer.android.com/training/app-links/verify-android-applinks
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function GET() {
  const packageName = process.env.ANDROID_APP_PACKAGE ?? 'ng.computicket.app';
  const fingerprintEnv =
    process.env.ANDROID_APP_SHA256_FINGERPRINTS ??
    // Visible placeholder so an early-deploy file is still well-formed
    // JSON — Android won't verify against it (the hash doesn't match
    // any real signing cert) but at least the response shape is right.
    'AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF';
  const fingerprints = fingerprintEnv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const body = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: packageName,
        sha256_cert_fingerprints: fingerprints,
      },
    },
    // get_login_creds lets Android surface the Credential Manager
    // password store for the app on the same domain.
    {
      relation: ['delegate_permission/common.get_login_creds'],
      target: {
        namespace: 'android_app',
        package_name: packageName,
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ];

  return NextResponse.json(body, {
    headers: {
      'cache-control': 'public, max-age=3600',
      'content-type': 'application/json',
    },
  });
}
