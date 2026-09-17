import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ATHLETE_COLORS } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { name?: unknown }
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name || name.length > 40) {
      return NextResponse.json(
        { error: 'Give the athlete a name (max 40 characters).' },
        { status: 400 },
      )
    }

    const existing = await db.athlete.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    })
    const color = ATHLETE_COLORS[existing.length % ATHLETE_COLORS.length]

    const athlete = await db.athlete.create({
      data: { name, color },
      select: { id: true, name: true, color: true },
    })
    return NextResponse.json(athlete, { status: 201 })
  } catch (err) {
    console.error('POST /api/athletes failed', err)
    return NextResponse.json(
      { error: 'Could not add the athlete' },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { error: 'Missing athlete id' },
        { status: 400 },
      )
    }
    await db.athlete.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/athletes failed', err)
    return NextResponse.json(
      { error: 'Could not remove the athlete' },
      { status: 500 },
    )
  }
}
