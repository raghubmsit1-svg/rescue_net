import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from './lib/db';
import { users } from './drizzle/schema';
import type { UserRole } from './types/rescue';

declare module 'next-auth' {
  interface User {
    role: UserRole;
    responderId?: string | null;
    agencyId?: string | null;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      responderId?: string | null;
      agencyId?: string | null;
    };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role: UserRole;
    responderId?: string | null;
    agencyId?: string | null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '')
          .toLowerCase()
          .trim();
        const password = String(credentials?.password ?? '');
        if (!email || !password) return null;
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          responderId: user.responderId,
          agencyId: user.agencyId,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.responderId = user.responderId;
        token.agencyId = user.agencyId;
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.role = (token.role as UserRole) ?? 'civilian';
        session.user.responderId = (token.responderId as string | null | undefined) ?? null;
        session.user.agencyId = (token.agencyId as string | null | undefined) ?? null;
      }
      return session;
    },
  },
});
