'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

const ACCOUNTS = [
  { email: 'hq@rescuenet.local', role: 'HQ Command', dest: '/' },
  { email: 'responder@rescuenet.local', role: 'Field Responder', dest: '/field-ops' },
  { email: 'civilian@rescuenet.local', role: 'Civilian SOS', dest: '/sos' },
];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('hq@rescuenet.local');
  const [password, setPassword] = useState('rescuenet');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (nextEmail = email, nextPassword = password, dest?: string) => {
    setPending(true);
    setError(null);
    const res = await signIn('credentials', {
      email: nextEmail,
      password: nextPassword,
      redirect: false,
    });
    setPending(false);
    if (!res?.ok) {
      setError('Invalid credentials. Use seed password rescuenet.');
      return;
    }
    const callback = params.get('callbackUrl');
    router.push(dest || callback || '/');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4 font-headline">
      <div className="w-full max-w-md bg-[#eee9e0] brutal-border brutal-shadow-lg p-6">
        <div className="flex items-center gap-3 border-b-4 border-[#1a1a1a] pb-4 mb-5">
          <div className="w-11 h-11 brutal-border bg-[#e63b2e] text-white flex items-center justify-center font-black">
            RN
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">RescueNet Login</h1>
            <p className="text-xs font-bold uppercase text-[#4a4a4a]">Kerala Floods &apos;26 Command Grid</p>
          </div>
        </div>

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <label className="block text-xs font-black uppercase text-[#4a4a4a]">
            Email
            <input
              className="mt-1 w-full bg-[#f5f0e8] brutal-border p-3 font-bold text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </label>
          <label className="block text-xs font-black uppercase text-[#4a4a4a]">
            Password
            <input
              className="mt-1 w-full bg-[#f5f0e8] brutal-border p-3 font-bold text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </label>
          {error && (
            <p className="bg-[#e63b2e] text-white text-xs font-bold uppercase p-2 brutal-border">{error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full neo-button bg-[#0055ff] text-white py-3 text-sm font-black"
          >
            {pending ? 'AUTHENTICATING...' : 'ENTER COMMAND GRID'}
          </button>
        </form>

        <div className="mt-5 space-y-2">
          <p className="text-[10px] font-black uppercase text-[#4a4a4a]">Demo accounts (password: rescuenet)</p>
          {ACCOUNTS.map((a) => (
            <button
              key={a.email}
              type="button"
              onClick={() => {
                setEmail(a.email);
                void submit(a.email, 'rescuenet', a.dest);
              }}
              className="w-full text-left brutal-border bg-[#f5f0e8] p-3 hover:bg-[#ffcc00] text-xs font-bold uppercase"
            >
              {a.role} — {a.email}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
