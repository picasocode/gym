'use client'

import type { AthleteDTO, ExerciseDTO } from '@/lib/types'
import { DAYS } from '@/lib/types'

type CrewViewProps = {
  athletes: AthleteDTO[]
  exercises: ExerciseDTO[]
  dayExercises: Map<string, ExerciseDTO[]>
  doneByAthlete: Map<string, Set<string>>
  onRemoveAthlete: (id: string) => void
}

export function CrewView({
  athletes,
  exercises,
  dayExercises,
  doneByAthlete,
  onRemoveAthlete,
}: CrewViewProps) {
  const totalExercises = exercises.length
  const totalCapacity = totalExercises * Math.max(athletes.length, 1)
  let crewDone = 0
  for (const a of athletes) {
    crewDone += doneByAthlete.get(a.id)?.size ?? 0
  }
  const crewPending = totalCapacity - crewDone

  const perAthlete = athletes.map((a) => {
    const doneSet = doneByAthlete.get(a.id)
    const done = doneSet?.size ?? 0
    const perDay = DAYS.map((day) => {
      const list = dayExercises.get(day) ?? []
      const dayDone = list.filter((e) => doneSet?.has(e.id)).length
      return { day, done: dayDone, total: list.length }
    })
    return { athlete: a, done, perDay }
  })

  const totalDoneForSplit = Math.max(crewDone, 1)
  const split = perAthlete
    .map((p) => ({
      name: p.athlete.name,
      color: p.athlete.color,
      pct: Math.round(((p.done / totalDoneForSplit) * 100)),
    }))
    .filter((s) => s.pct > 0)

  return (
    <section aria-label="Crew load" className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b-2 border-ink pb-3">
        <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
          Crew load
        </h2>
        <p className="flex items-baseline gap-2 text-sm tabular-nums">
          <span>
            {crewDone} of {totalCapacity} done
          </span>
          {crewPending > 0 ? (
            <span className="rounded-[2px] border border-signal/60 px-1.5 py-0.5 text-xs font-medium text-signal">
              {crewPending} pending
            </span>
          ) : (
            <span className="rounded-[2px] border border-pine/60 px-1.5 py-0.5 text-xs font-medium text-pine">
              week cleared
            </span>
          )}
        </p>
      </div>

      {athletes.length === 0 ? (
        <p className="py-10 text-sm text-ink/60">
          No athletes on the board yet. Use “Add athlete” above to start
          tracking the workload.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {perAthlete.map(({ athlete, done, perDay }) => {
            const pct = totalExercises ? Math.round((done / totalExercises) * 100) : 0
            return (
              <li key={athlete.id} className="py-4">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="h-3 w-3 shrink-0 rounded-full ring-1 ring-inset ring-ink/20"
                    style={{ backgroundColor: athlete.color }}
                  />
                  <p className="flex-1 text-sm font-semibold">{athlete.name}</p>
                  <p className="text-sm tabular-nums">
                    {done}/{totalExercises}
                  </p>
                  <p className="w-12 text-right text-sm tabular-nums text-ink/60">
                    {pct}%
                  </p>
                  <button
                    aria-label={`Remove ${athlete.name}`}
                    onClick={() => onRemoveAthlete(athlete.id)}
                    className="text-xs text-ink/40 underline decoration-line underline-offset-2 transition-colors hover:text-ink hover:decoration-ink"
                  >
                    Remove
                  </button>
                </div>

                <div
                  className="mt-2 h-2.5 overflow-hidden rounded-[1px] bg-rail"
                  role="progressbar"
                  aria-valuenow={done}
                  aria-valuemin={0}
                  aria-valuemax={totalExercises}
                  aria-label={`${athlete.name} weekly completion`}
                >
                  <div
                    className="anim-rail h-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: athlete.color,
                    }}
                  />
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {perDay.map(({ day, done: dayDone, total: dayTotal }) => {
                    const frac = dayTotal ? dayDone / dayTotal : 0
                    const state =
                      frac === 0 ? 'empty' : frac === 1 ? 'full' : 'partial'
                    return (
                      <span
                        key={day}
                        title={`${day}: ${dayDone}/${dayTotal}`}
                        className="relative inline-grid h-7 w-12 place-items-center overflow-hidden rounded-[1px] border border-line text-[10px] font-medium tabular-nums"
                      >
                        {state === 'full' && (
                          <span aria-hidden className="absolute inset-0 bg-pine" />
                        )}
                        {state === 'partial' && (
                          <span
                            aria-hidden
                            className="absolute bottom-0 left-0 h-1.5 w-full bg-signal"
                          />
                        )}
                        <span
                          className={`relative ${
                            state === 'full' ? 'text-paper' : 'text-ink/70'
                          }`}
                        >
                          {day.slice(0, 1)}
                          {dayDone}/{dayTotal}
                        </span>
                      </span>
                    )
                  })}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {athletes.length > 0 && (
        <div className="mt-6 border-t border-line pt-5">
          <h3 className="text-sm font-semibold">Share of completed work</h3>
          <div
            className="mt-2 flex h-3 overflow-hidden rounded-[1px] bg-rail"
            aria-hidden
          >
            {split.map((s) => (
              <span
                key={s.name}
                className="h-full"
                style={{ width: `${s.pct}%`, backgroundColor: s.color }}
              />
            ))}
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
            {split.map((s) => (
              <li key={s.name} className="flex items-center gap-1.5 text-xs text-ink/70">
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="font-medium">{s.name}</span>
                <span className="tabular-nums">{s.pct}%</span>
              </li>
            ))}
          </ul>
          {crewDone === 0 && (
            <p className="mt-2 text-xs text-ink/55">
              Nothing checked off yet this week — the split appears as the crew
              logs work.
            </p>
          )}
        </div>
      )}
    </section>
  )
}
