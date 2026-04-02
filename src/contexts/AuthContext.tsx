import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { apiClient } from '../services/api/client';
import { persistSession, readSession } from '../services/api/session';
import type { AuthSession, LoginInput } from '../services/api/types';

type AuthContextValue = {
  session: AuthSession | null;
  userName: string;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  signIn: (input: LoginInput) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    setSession(readSession());
    setIsBootstrapping(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      userName: session?.user.name ?? 'Guest',
      isAuthenticated: Boolean(session),
      isBootstrapping,
      signIn: async (input: LoginInput) => {
        const nextSession = await apiClient.login(input);
        setSession(nextSession);
        persistSession(nextSession);
      },
      signOut: () => {
        setSession(null);
        persistSession(null);
      }
    }),
    [isBootstrapping, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }

  return context;
}
