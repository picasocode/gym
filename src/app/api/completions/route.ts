import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

type Item = { exerciseId: string; done: boolean }

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      athleteId?: string
      weekId?: string
      items?: Item[]
    }

    const { athleteId, weekId } = body
    const items = Array.isArray(body.items) ? body.items : []
    if (!athleteId || !weekId || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing athlete, week, or items' },
        { status: 400 },
      )
    }
    if (items.length > 120) {
      return NextResponse.json(
        { error: 'Too many items in one batch' },
        { status: 400 },
      )
    }

    await db.$transaction(
      items.map((item) =>
        db.completion.upsert({
          where: {
            athleteId_exerciseId_weekId: {
              athleteId,
              exerciseId: item.exerciseId,
              weekId,
            },
          },
          update: { done: item.done, doneAt: item.done ? new Date() : null },
          create: {
            athleteId,
            exerciseId: item.exerciseId,
            weekId,
            done: item.done,
            doneAt: item.done ? new Date() : null,
          },
        }),
      ),
    )

    return NextResponse.json({ ok: true, count: items.length })
  } catch (err) {
    console.error('POST /api/completions failed', err)
    return NextResponse.json(
      { error: 'Could not save the update' },
      { status: 500 },
    )
  }
}
