// Runs before any test module loads. AppModule's APP_GUARD selection
// reads DISABLE_THROTTLER at evaluation time, so it must be set here —
// flipping it later in createTestApp() is too late.
process.env.DISABLE_THROTTLER = '1';
process.env.NODE_ENV = 'test';
// Use the dev-fallback sentinel so Paystack calls don't hit the network
// (PaystackService treats this key as "not configured" and returns a
// placeholder authorization URL).
process.env.PAYSTACK_SECRET_KEY = 'sk_test_replace_me';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test_jwt';
process.env.APP_KEY = process.env.APP_KEY ?? 'test_app_key';
