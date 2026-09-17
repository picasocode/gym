import { readFileSync } from 'fs'
import { join } from 'path'
import { labelOf, mondayOfKey, weekKeyOf } from '../src/lib/week'
import { db } from '../src/lib/db'

type ExerciseSeed = {
  day: string
  block: string
  name: string
  sets: string
  reps: string
  rest: string
  focus: string
  order: number
}

async function main() {
  const raw = JSON.parse(
    readFileSync(join(__dirname, 'protocol_data.json'), 'utf-8'),
  ) as { exercises: ExerciseSeed[] }

  // 1. Exercises — upsert the full protocol from the sheet.
  for (const e of raw.exercises) {
    await db.exercise.upsert({
      where: {
        day_block_name: { day: e.day, block: e.block, name: e.name },
      },
      update: {
        sets: e.sets,
        reps: e.reps,
        rest: e.rest,
        focus: e.focus,
        order: e.order,
      },
      create: {
        day: e.day,
        block: e.block,
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        rest: e.rest,
        focus: e.focus,
        order: e.order,
      },
    })
  }
  console.log(`exercises ready: ${raw.exercises.length}`)

  // 2. Athletes — seed a small demo crew on first run.
  const athleteCount = await db.athlete.count()
  if (athleteCount === 0) {
    await db.athlete.createMany({
      data: [
        { name: 'Alex', color: '#E4572E' },
        { name: 'Sam', color: '#3E6B4F' },
        { name: 'Jordan', color: '#A87B2F' },
      ],
    })
    console.log('seeded 3 demo athletes')
  }

  // 3. Current week.
  const key = weekKeyOf(new Date())
  const monday = mondayOfKey(key)
  const week = await db.week.upsert({
    where: { key },
    update: { label: labelOf(monday) },
    create: { key, startsAt: monday, label: labelOf(monday) },
  })
  console.log(`week ready: ${week.key} (${week.label})`)

  // 4. A little demo progress so the crew view has shape on first load.
  const completionCount = await db.completion.count()
  if (completionCount === 0) {
    const athletes = await db.athlete.findMany({ orderBy: { createdAt: 'asc' } })
    const exercises = await db.exercise.findMany({ orderBy: { order: 'asc' } })

    const alex = athletes[0]
    const sam = athletes[1]
    if (alex) {
      // Alex: all of Monday + the first 8 of Tuesday.
      const mondayDone = exercises.filter((e) => e.day === 'Monday')
      const tuesdayDone = exercises.filter((e) => e.day === 'Tuesday').slice(0, 8)
      await db.completion.createMany({
        data: [...mondayDone, ...tuesdayDone].map((e) => ({
          athleteId: alex.id,
          exerciseId: e.id,
          weekId: week.id,
          done: true,
          doneAt: new Date(),
        })),
      })
    }
    if (sam) {
      // Sam: first 10 of Monday (warm-up, mobility, part of strength).
      const samDone = exercises.filter((e) => e.day === 'Monday').slice(0, 10)
      await db.completion.createMany({
        data: samDone.map((e) => ({
          athleteId: sam.id,
          exerciseId: e.id,
          weekId: week.id,
          done: true,
          doneAt: new Date(),
        })),
      })
    }
    console.log('seeded demo completions')
  }

  const totals = {
    exercises: await db.exercise.count(),
    athletes: await db.athlete.count(),
    weeks: await db.week.count(),
    completions: await db.completion.count(),
  }
  console.log('seed complete', totals)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
