import 'dotenv/config';
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { eq, ne } from 'drizzle-orm';
import { db } from '../lib/db';
import { incidents, meshNodes, responders } from '../drizzle/schema';
import { publishEvent } from '../lib/events';
import { rescoreIncident } from '../lib/ops';

const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

async function tickDeadman() {
  const rows = await db.select().from(responders);
  const now = Date.now();
  for (const r of rows) {
    const elapsed = (now - r.lastCheckInAt.getTime()) / 1000;
    if (elapsed > r.deadmanTimeoutSec && r.status !== 'Check-in Warning' && r.status !== 'SOS Alert') {
      await db.update(responders).set({ status: 'Check-in Warning' }).where(eq(responders.id, r.id));
      await publishEvent('responder.timeout', { id: r.id, name: r.name });
    }
  }
}

async function tickMesh() {
  const rows = await db.select().from(meshNodes);
  const now = Date.now();
  for (const n of rows) {
    const age = (now - n.lastPingAt.getTime()) / 1000;
    let next = n.status;
    if (age > 300) next = 'Offline';
    else if (age > 60) next = 'Degraded';
    else next = 'Active';
    if (next !== n.status) {
      await db.update(meshNodes).set({ status: next }).where(eq(meshNodes.id, n.id));
      if (next === 'Offline') {
        await publishEvent('mesh.node_offline', { id: n.id });
      } else {
        await publishEvent('mesh.heartbeat', { id: n.id, status: next });
      }
    }
  }
}

async function tickScoring() {
  const rows = await db.select({ id: incidents.id }).from(incidents).where(ne(incidents.status, 'Resolved'));
  for (const row of rows) {
    await rescoreIncident(row.id);
  }
}

const queueName = 'ops';
const worker = new Worker(
  queueName,
  async () => {
    await tickDeadman();
    await tickMesh();
    await tickScoring();
  },
  { connection }
);

worker.on('failed', (job, err) => {
  console.error('ops tick failed', job?.id, err);
});

const queue = new Queue(queueName, { connection });
await queue.upsertJobScheduler(
  'tick',
  { every: 10_000 },
  { name: 'tick', data: {} }
);

console.log('RescueNet worker running (10s tick)');
