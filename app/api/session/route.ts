import { NextResponse } from 'next/server';
import { SESSION_COOKIE, createSession, getSessionUser } from '@/lib/server/session';

export async function GET() {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const userId = body?.userId;

  if (typeof userId !== 'string') {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const session = createSession(userId);
  if (!session) {
    return NextResponse.json({ error: 'Unknown user' }, { status: 401 });
  }

  const response = NextResponse.json({ user: session.user });
  response.cookies.set(SESSION_COOKIE, session.sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  });
  return response;
}
