'use client';

import type { ReactNode } from 'react';

import { AuthProvider } from '@/contexts/auth-context';

type AuthAppProviderProps = {
  children: ReactNode;
};

// Mantém os providers client-side separados do layout principal.
// Assim, o layout pode continuar sendo um Server Component.
export function AuthAppProvider({
  children,
}: AuthAppProviderProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}