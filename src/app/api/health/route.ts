import { NextResponse } from 'next/server'
import { db, currentDbBackend } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * Liveness + database backend report.
 * Shows which backend is active (turso cloud or local sqlite fallback)
 * and pings it with a trivial query so a bad token / unreachable DB
 * is caught here instead of inside the tracker UI.
 */
export async function GET() {
  const backend = currentDbBackend()
  const startedAt = Date.now()

  try {
    await db.$queryRaw`SELECT 1`
    return NextResponse.json({
      ok: true,
      backend,
      latencyMs: Date.now() - startedAt,
    })
  } catch (err) {
    console.error('GET /api/health failed', err)
    return NextResponse.json(
      { ok: false, backend, latencyMs: Date.now() - startedAt },
      { status: 503 },
    )
  }
}
