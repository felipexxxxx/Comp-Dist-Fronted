import { readJson, removeItem, writeJson } from './storage';
import type { AuthSession } from './types';

const SESSION_KEY = 'healthsys-session';

export function readSession() {
  return readJson<AuthSession | null>(SESSION_KEY, null);
}

export function persistSession(session: AuthSession | null) {
  if (session) {
    writeJson(SESSION_KEY, session);
    return;
  }

  removeItem(SESSION_KEY);
}
