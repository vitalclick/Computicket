import { NextResponse } from 'next/server';

/**
 * Apple App Site Association — universal links for iOS.
 *
 * Apple's CDN crawls this file periodically and downloads it again on
 * every fresh install of the app. Tapping a https://computicket.ng/...
 * link in Messages / Mail / Safari then opens the Flutter app at the
 * matching deep route, falling back to the website if the app isn't
 * installed.
 *
 * Configure at deploy time:
 *   IOS_APP_TEAM_ID       (10-char Apple Developer team ID, e.g. ABCD123456)
 *   IOS_APP_BUNDLE_ID     (defaults to ng.computicket.app)
 *
 * The file MUST be served with Content-Type: application/json and no
 * file extension — the URL is /.well-known/apple-app-site-association.
 * A route handler beats a static file here because we control the
 * Content-Type directly and can compute the appID from env without a
 * build-time substitution.
 *
 * Reference: https://developer.apple.com/documentation/xcode/supporting-associated-domains
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function GET() {
  const teamId = process.env.IOS_APP_TEAM_ID ?? 'TEAMIDPLACE';
  const bundleId = process.env.IOS_APP_BUNDLE_ID ?? 'ng.computicket.app';
  const appID = `${teamId}.${bundleId}`;

  const body = {
    applinks: {
      apps: [],
      details: [
        {
          appID,
          appIDs: [appID],
          paths: [
            // Marketing surface
            '/',
            '/app',
            '/events',
            '/events/*',
            '/concerts',
            '/concerts/*',
            '/cinema',
            '/cinema/*',
            '/experiences',
            '/experiences/*',
            '/flights',
            '/buses',
            '/hotels',
            '/getaways',
            '/festivals',
            // Buyer surface
            '/tickets/*',
            '/transfer/*',
            '/resale',
            '/checkout/return',
            '/account',
            '/account/*',
            '/support',
            // Not handled by the app — bounce to Safari
            'NOT /admin/*',
            'NOT /scan',
            'NOT /dashboard/*',
            'NOT /signin/*',
            'NOT /signup',
          ],
          components: [
            { '/': '/transfer/*', comment: 'Open the transfer claim flow' },
            { '/': '/tickets/*', comment: 'Open the boarding pass' },
          ],
        },
      ],
    },
    // Webcredentials lets iOS surface saved passwords / passkeys for
    // the app when it shares the domain.
    webcredentials: {
      apps: [appID],
    },
  };

  return NextResponse.json(body, {
    headers: {
      'cache-control': 'public, max-age=3600',
      // iOS is forgiving about the Content-Type but the spec is
      // application/json; setting it explicitly avoids edge cases on
      // CDNs that sniff for an extension.
      'content-type': 'application/json',
    },
  });
}
