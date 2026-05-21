'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth';

export function NavAuthLink() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setSignedIn(Boolean(getToken()));
    const onStorage = () => setSignedIn(Boolean(getToken()));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (signedIn === null) return <span className="text-gray-400 text-sm">…</span>;
  if (signedIn) {
    return (
      <Link href="/account" className="hover:text-brand-dark">
        Account
      </Link>
    );
  }
  return (
    <Link href="/signin" className="hover:text-brand-dark">
      Sign in
    </Link>
  );
}
