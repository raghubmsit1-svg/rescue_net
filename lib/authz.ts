import { NextResponse } from 'next/server';
import { auth } from '../auth';
import type { UserRole } from '../types/rescue';

export async function requireUser(roles?: UserRole[]) {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), session: null };
  }
  const role = session.user.role;
  if (roles && role !== 'hq' && !roles.includes(role)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), session: null };
  }
  return { error: null, session };
}

export function ingestAuthorized(req: Request) {
  const key = req.headers.get('x-ingest-key');
  return Boolean(process.env.INGEST_KEY && key === process.env.INGEST_KEY);
}
