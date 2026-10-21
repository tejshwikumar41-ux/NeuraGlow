'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthModal } from '@/components/auth/AuthModal';

export default function SignupPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-clay)]">
      <AuthModal
        isOpen={true}
        initialMode="signup"
        onClose={() => router.push('/')}
        onSuccess={() => router.push('/dashboard')}
      />
    </div>
  );
}
