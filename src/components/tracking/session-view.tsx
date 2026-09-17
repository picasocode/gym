'use client'

import { Check } from 'lucide-react'
import type { ExerciseDTO } from '@/lib/types'
import { EMPHASIS, stars } from '@/lib/protocol-meta'

type SessionViewProps = {
  day: string
  exercises: ExerciseDTO[]
  doneSet: Set<string>
  onToggle: (exerciseId: string, done: boolean) => void
  onSetMany: (exerciseIds: string[], done: boolean) => void
  athleteName: string
}

type BlockGroup = {
  block: string
  exercises: ExerciseDTO[]
}

function groupConsecutive(exercises: ExerciseDTO[]): BlockGroup[] {
  const groups: BlockGroup[] = []
  for (const ex of exercises) {
    const last = groups[groups.length - 1]
    if (last && last.block === ex.block) {
      last.exercises.push(ex)
    } else {
      groups.push({ block: ex.block, exercises: [ex] })
    }
  }
  return groups
}

export function SessionView({
  day,
  exercises,
  doneSet,
  onToggle,
  onSetMany,
  athleteName,
}: SessionViewProps) {
  const done = exercises.filter((e) => doneSet.has(e.id)).length
  const total = exercises.length
  const pending = total - done
  const emphasis = EMPHASIS[day]

  return (
    <section aria-label={`${day} session`} className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b-2 border-ink pb-3">
        <h2 className="font-display text-2xl tracking-tight sm:text-3xl">{day}</h2>
        <p className="text-sm text-ink/70">{emphasis?.primary}</p>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-ink/70">
          <span>
            Strength <span className="tabular-nums">{stars(emphasis?.strength ?? 0)}</span>
          </span>
          <span>
            Iso <span className="tabular-nums">{stars(emphasis?.isometric ?? 0)}</span>
          </span>
          <span>
            Cond <span className="tabular-nums">{stars(emphasis?.conditioning ?? 0)}</span>
          </span>
        </div>
        <p className="ml-auto flex items-baseline gap-2 text-sm tabular-nums">
          <span>
            {done} of {total} done
          </span>
          {pending > 0 ? (
            <span className="rounded-[2px] border border-signal/60 px-1.5 py-0.5 text-xs font-medium text-signal">
              {pending} pending
            </span>
          ) : (
            <span className="rounded-[2px] border border-pine/60 px-1.5 py-0.5 text-xs font-medium text-pine">
              day cleared
            </span>
          )}
        </p>
      </div>

      <div
        className="mt-3 h-1.5 overflow-hidden rounded-[1px] bg-rail"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${day} completion`}
      >
        <div
          className="anim-rail h-full bg-pine"
          style={{ width: `${total ? Math.round((done / total) * 100) : 0}%` }}
        />
      </div>

      <p className="mt-6 text-sm text-ink/60">
        Tracking <span className="font-semibold text-ink">{athleteName}</span> —
        check each exercise off as it happens.
      </p>

      <div className="mt-2 divide-y divide-line">
        {groupConsecutive(exercises).map((group) => {
          const groupDone = group.exercises.filter((e) => doneSet.has(e.id)).length
          const allDone = groupDone === group.exercises.length
          return (
            <div key={group.block} className="py-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="flex items-baseline gap-2 text-sm font-semibold">
                  {group.block}
                  <span className="text-xs font-normal tabular-nums text-ink/50">
                    {groupDone}/{group.exercises.length}
                  </span>
                </h3>
                <button
                  onClick={() =>
                    onSetMany(
                      group.exercises.map((e) => e.id),
                      !allDone,
                    )
                  }
                  className="text-xs text-ink/55 underline decoration-line underline-offset-2 transition-colors hover:text-ink hover:decoration-ink"
                >
                  {allDone ? 'Clear block' : 'Mark block done'}
                </button>
              </div>

              <ul className="mt-1">
                {group.exercises.map((ex) => {
                  const isDone = doneSet.has(ex.id)
                  return (
                    <li
                      key={ex.id}
                      className="group flex cursor-pointer items-start gap-3 rounded-[2px] px-2 py-2.5 transition-colors hover:bg-rail/60"
                      onClick={() => onToggle(ex.id, !isDone)}
                    >
                      <button
                        role="checkbox"
                        aria-checked={isDone}
                        aria-label={`${isDone ? 'Uncheck' : 'Check'} ${ex.name}`}
                        onClick={(ev) => {
                          ev.stopPropagation()
                          onToggle(ex.id, !isDone)
                        }}
                        className={`anim-check mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[2px] border-2 transition-colors ${
                          isDone
                            ? 'border-pine bg-pine text-paper'
                            : 'border-ink bg-transparent hover:bg-rail'
                        }`}
                      >
                        {isDone && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium leading-snug ${
                            isDone ? 'text-ink/45 line-through' : ''
                          }`}
                        >
                          {ex.name}
                        </p>
                        <p className="mt-0.5 text-xs text-ink/55">
                          {ex.focus}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm tabular-nums">
                          {ex.sets} × {ex.reps}
                        </p>
                        <p className="mt-0.5 text-xs text-ink/55">
                          {ex.rest === '—' ? 'no rest' : `rest ${ex.rest}`}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
