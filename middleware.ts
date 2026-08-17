import { auth } from './auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;
  const loggedIn = Boolean(req.auth);

  const publicPath =
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/health');

  if (publicPath) {
    return NextResponse.next();
  }

  const publicApiWrite =
    (pathname.startsWith('/api/sos') && req.method === 'POST') ||
    (pathname.startsWith('/api/mesh/heartbeat') && req.method === 'POST');

  if (!loggedIn) {
    if (publicApiWrite) return NextResponse.next();
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const login = new URL('/login', req.nextUrl.origin);
    login.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(login);
  }

  if (role === 'hq') {
    return NextResponse.next();
  }

  if (role === 'civilian') {
    const ok =
      pathname.startsWith('/sos') ||
      pathname.startsWith('/api/sos') ||
      pathname.startsWith('/api/events') ||
      pathname.startsWith('/api/stats');
    if (ok) return NextResponse.next();
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/sos', req.nextUrl.origin));
  }

  if (role === 'responder') {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/field-ops', req.nextUrl.origin));
    }
    if (pathname.startsWith('/triage') || pathname.startsWith('/mesh')) {
      return NextResponse.redirect(new URL('/field-ops', req.nextUrl.origin));
    }
    const ok =
      pathname.startsWith('/field-ops') ||
      pathname.startsWith('/sos') ||
      pathname.startsWith('/api/');
    if (ok) return NextResponse.next();
    return NextResponse.redirect(new URL('/field-ops', req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
