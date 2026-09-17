'use client'

import type { AthleteDTO, ExerciseDTO } from '@/lib/types'
import { DAYS } from '@/lib/types'
import { EMPHASIS } from '@/lib/protocol-meta'

type WeekBoardProps = {
  dayExercises: Map<string, ExerciseDTO[]>
  doneByAthlete: Map<string, Set<string>>
  athletes: AthleteDTO[]
  /** In session mode rails reflect the selected athlete; in crew mode the aggregate. */
  mode: 'session' | 'crew'
  selectedAthleteId: string | null
  selectedDay: string
  onSelectDay: (day: string) => void
}

function abbreviate(day: string) {
  return day.slice(0, 3)
}

export function WeekBoard({
  dayExercises,
  doneByAthlete,
  athletes,
  mode,
  selectedAthleteId,
  selectedDay,
  onSelectDay,
}: WeekBoardProps) {
  return (
    <section aria-label="Week tally board" className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {DAYS.map((day) => {
          const list = dayExercises.get(day) ?? []
          const total = list.length
          let done = 0
          if (mode === 'session') {
            const set = selectedAthleteId
              ? doneByAthlete.get(selectedAthleteId)
              : undefined
            done = list.filter((e) => set?.has(e.id)).length
          } else {
            for (const e of list) {
              for (const a of athletes) {
                if (doneByAthlete.get(a.id)?.has(e.id)) done += 1
              }
            }
          }
          const capacity = mode === 'session' ? total : total * Math.max(athletes.length, 1)
          const fraction = capacity > 0 ? done / capacity : 0
          const emphasis = EMPHASIS[day]
          const selected = mode === 'session' && selectedDay === day

          return (
            <button
              key={day}
              onClick={() => onSelectDay(day)}
              aria-pressed={selected}
              className={`rounded-[2px] border p-3 text-left transition-colors ${
                selected
                  ? 'border-ink bg-card shadow-none ring-1 ring-ink'
                  : 'border-line bg-card hover:border-ink/40'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-display text-lg leading-none">{abbreviate(day)}</span>
                <span
                  className={`text-xs tabular-nums ${
                    fraction === 1 ? 'font-semibold text-pine' : 'text-ink/60'
                  }`}
                >
                  {done}/{capacity}
                </span>
              </div>
              <div
                aria-hidden
                className="relative mt-2.5 h-24 overflow-hidden rounded-[1px] bg-rail sm:h-28"
              >
                <div
                  className="anim-rail absolute bottom-0 left-0 w-full bg-pine"
                  style={{ height: `${Math.round(fraction * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] leading-tight text-ink/60">
                {emphasis?.primary}
              </p>
            </button>
          )
        })}

        {/* Sunday — recovery, not tracked. */}
        <div
          aria-label="Sunday, active recovery"
          className="rounded-[2px] border border-dashed border-line p-3 text-left"
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-display text-lg leading-none text-ink/40">SUN</span>
          </div>
          <p className="mt-2.5 text-[11px] leading-snug text-ink/50 sm:mt-3">
            Active recovery only. 30–45 min easy walking + 20–30 min light
            mobility. No lifting, no failure work.
          </p>
        </div>
      </div>
    </section>
  )
}
