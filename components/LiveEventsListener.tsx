'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import type { LiveEvent } from '../lib/events';

export function LiveEventsListener() {
  const qc = useQueryClient();
  const { status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated') return;
    const es = new EventSource('/api/events');
    es.onmessage = (ev) => {
      try {
        const event = JSON.parse(ev.data) as LiveEvent;
        const t = event.type as string;
        if (
          t.startsWith('incident') ||
          t === 'sos.received' ||
          t === 'agency.assigned' ||
          t === 'log.appended'
        ) {
          qc.invalidateQueries({ queryKey: ['incidents'] });
          qc.invalidateQueries({ queryKey: ['incident'] });
          qc.invalidateQueries({ queryKey: ['matches'] });
          qc.invalidateQueries({ queryKey: ['stats'] });
        }
        if (t.startsWith('responder')) {
          qc.invalidateQueries({ queryKey: ['responders'] });
        }
        if (t.startsWith('mesh')) {
          qc.invalidateQueries({ queryKey: ['mesh-nodes'] });
          qc.invalidateQueries({ queryKey: ['mesh-packets'] });
          qc.invalidateQueries({ queryKey: ['stats'] });
        }
      } catch {
        /* ignore malformed frames */
      }
    };
    return () => es.close();
  }, [qc, status]);

  return null;
}
