import { onLiveEvent } from '../../../lib/events';
import { requireUser } from '../../../lib/authz';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const { error } = await requireUser();
  if (error) return error;

  const encoder = new TextEncoder();
  let unsub = () => {};

  const stream = new ReadableStream({
    start(controller) {
      const send = (raw: string) => {
        try {
          controller.enqueue(encoder.encode(`data: ${raw}\n\n`));
        } catch {
          /* closed */
        }
      };
      unsub = onLiveEvent(send);
      send(
        JSON.stringify({
          id: 'hello',
          type: 'connected',
          payload: {},
          at: new Date().toISOString(),
        })
      );
    },
    cancel() {
      unsub();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
