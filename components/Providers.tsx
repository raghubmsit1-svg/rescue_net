'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';
import { LiveEventsListener } from './LiveEventsListener';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 5_000, refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={client}>
        <LiveEventsListener />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
