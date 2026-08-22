import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { MOCK_USERS, User } from '../../types/user';

export const SESSION_COOKIE = 'ops_session';

/**
 * Server-side session store. Sessions map an opaque id to a user id; the role is
 * always looked up server-side so a client can never assert its own role.
 * A real deployment would back this with the identity provider instead of mock users.
 */
const globalForSessions = globalThis as typeof globalThis & {
  __opsSessions?: Map<string, string>;
};

const sessions = globalForSessions.__opsSessions ?? new Map<string, string>();
globalForSessions.__opsSessions = sessions;

export function createSession(userId: string): { sessionId: string; user: User } | null {
  const user = MOCK_USERS.find(u => u.id === userId);
  if (!user) return null;

  const sessionId = randomUUID();
  sessions.set(sessionId, user.id);
  return { sessionId, user };
}

export function getSessionUser(): User | null {
  const sessionId = cookies().get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const userId = sessions.get(sessionId);
  if (!userId) return null;

  return MOCK_USERS.find(u => u.id === userId) || null;
}
