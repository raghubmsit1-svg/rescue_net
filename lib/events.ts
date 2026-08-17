import { EventEmitter } from 'node:events';
import Redis from 'ioredis';
import { getRedis } from './redis';

export const EVENT_CHANNEL = 'rescuenet.events';

export type LiveEventType =
  | 'incident.created'
  | 'incident.updated'
  | 'incident.dispatched'
  | 'sos.received'
  | 'agency.assigned'
  | 'responder.heartbeat'
  | 'responder.checkin'
  | 'responder.mayday'
  | 'responder.timeout'
  | 'mesh.heartbeat'
  | 'mesh.packet'
  | 'mesh.node_offline'
  | 'log.appended';

export interface LiveEvent {
  id: string;
  type: LiveEventType;
  payload: Record<string, unknown>;
  at: string;
}

const bus = new EventEmitter();
bus.setMaxListeners(200);

const globalForSub = globalThis as unknown as {
  redisSub?: Redis;
  subscribed?: boolean;
};

function ensureSubscriber() {
  if (globalForSub.subscribed) return;
  const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
  if (!globalForSub.redisSub) {
    globalForSub.redisSub = new Redis(url, { maxRetriesPerRequest: null });
  }
  const sub = globalForSub.redisSub;
  sub.subscribe(EVENT_CHANNEL).catch((err) => {
    console.error('Redis subscribe failed', err);
  });
  sub.on('message', (_channel, message) => {
    bus.emit('event', message);
  });
  globalForSub.subscribed = true;
}

export async function publishEvent(type: LiveEventType, payload: Record<string, unknown> = {}) {
  const event: LiveEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    payload,
    at: new Date().toISOString(),
  };
  await getRedis().publish(EVENT_CHANNEL, JSON.stringify(event));
  return event;
}

export function onLiveEvent(listener: (raw: string) => void) {
  ensureSubscriber();
  bus.on('event', listener);
  return () => bus.off('event', listener);
}
