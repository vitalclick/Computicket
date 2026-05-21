'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { MagicLinkForm } from '@/components/auth/MagicLinkForm';
import { AuthDivider, SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { api } from '@/lib/api';
import { setToken } from '@/lib/auth';

function SignUpForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') ?? '/account';
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.signup({ email, password, name: name || undefined });
      setToken(res.token);
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold">Create an account</h1>
      <p className="mt-2 text-sm text-gray-600">Track your tickets and bookings in one place.</p>
      <div className="mt-8">
        <SocialAuthButtons next={next} onSuccess={(n) => router.push(n)} />
        <AuthDivider label="or use email" />
      </div>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
        <div>
          <label htmlFor="signup-name" className="sr-only">Your name</label>
          <input id="signup-name" type="text" placeholder="Your name" autoComplete="name"
            value={name} onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        <div>
          <label htmlFor="signup-email" className="sr-only">Email address</label>
          <input id="signup-email" type="email" required placeholder="Email"
            autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        <div>
          <label htmlFor="signup-password" className="sr-only">Password</label>
          <input id="signup-password" type="password" required minLength={8}
            placeholder="Password (8+ characters)" autoComplete="new-password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        {error && (
          <div className="text-sm text-red-600" role="alert" aria-live="polite">{error}</div>
        )}
        <button type="submit" disabled={submitting}
          className="w-full bg-brand text-white font-medium py-2.5 rounded-md hover:bg-brand-dark disabled:bg-gray-300">
          {submitting ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <div className="mt-6">
        <AuthDivider label="passwordless" />
        <div className="mt-3">
          <MagicLinkForm />
        </div>
      </div>
      <p className="mt-6 text-sm text-gray-600">
        {/* Underline always: the brand-dark vs gray-600 contrast is only
            1.1:1, well below the WCAG 3:1 threshold for "link distinguishable
            from surrounding text by colour alone". Underline restores
            discoverability without a colour-contrast dependency. */}
        Already have an account? <Link href="/signin" className="text-brand-dark underline">Sign in</Link>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
