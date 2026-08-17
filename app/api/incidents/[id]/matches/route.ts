import { NextResponse } from 'next/server';
import { requireUser } from '../../../../../lib/authz';
import { matchAgencies } from '../../../../../lib/match';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error } = await requireUser(['hq']);
  if (error) return error;
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const radiusKm = Number(url.searchParams.get('radiusKm') ?? 25);
  const matches = await matchAgencies(id, Number.isFinite(radiusKm) ? radiusKm : 25);
  if (!matches) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(matches);
}
