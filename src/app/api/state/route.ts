import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isValidWeekKey, labelOf, mondayOfKey, weekKeyOf } from '@/lib/week'
import type { StateDTO } from '@/lib/types'

export const dynamic = 'force-dynamic'

async function ensureWeek(key?: string) {
  const resolved = isValidWeekKey(key) ? key : weekKeyOf(new Date())
  const monday = mondayOfKey(resolved)
  const label = labelOf(monday)
  const week = await db.week.upsert({
    where: { key: resolved },
    update: { label },
    create: { key: resolved, startsAt: monday, label },
  })
  return { week, isCurrentWeek: resolved === weekKeyOf(new Date()) }
}

export async function GET(req: NextRequest) {
  try {
    const key = req.nextUrl.searchParams.get('week')
    const { week, isCurrentWeek } = await ensureWeek(key)

    const [athletes, exercises, completions] = await Promise.all([
      db.athlete.findMany({
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true, color: true },
      }),
      db.exercise.findMany({
        orderBy: { order: 'asc' },
        select: {
          id: true,
          day: true,
          block: true,
          name: true,
          sets: true,
          reps: true,
          rest: true,
          focus: true,
          order: true,
        },
      }),
      db.completion.findMany({
        where: { weekId: week.id },
        select: { athleteId: true, exerciseId: true, done: true },
      }),
    ])

    const payload: StateDTO = {
      athletes,
      week: {
        id: week.id,
        key: week.key,
        startsAt: week.startsAt.toISOString(),
        label: week.label,
      },
      isCurrentWeek,
      exercises,
      completions,
    }

    return NextResponse.json(payload)
  } catch (err) {
    console.error('GET /api/state failed', err)
    return NextResponse.json(
      { error: 'Could not load the tracker state' },
      { status: 500 },
    )
  }
}
