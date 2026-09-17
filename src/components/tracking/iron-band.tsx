'use client'

import { ChevronLeft, ChevronRight, NotebookText, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PROTOCOL } from '@/lib/protocol-meta'
import type { AthleteDTO } from '@/lib/types'

type IronBandProps = {
  athletes: AthleteDTO[]
  selectedAthleteId: string | null
  onSelectAthlete: (id: string) => void
  onRemoveAthlete: (id: string) => void
  onAddAthlete: () => void
  view: 'session' | 'crew'
  onViewChange: (view: 'session' | 'crew') => void
  weekLabel: string
  isCurrentWeek: boolean
  onPrevWeek: () => void
  onNextWeek: () => void
  onCurrentWeek: () => void
  weekPct: Map<string, number>
}

export function IronBand({
  athletes,
  selectedAthleteId,
  onSelectAthlete,
  onRemoveAthlete,
  onAddAthlete,
  view,
  onViewChange,
  weekLabel,
  isCurrentWeek,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  weekPct,
}: IronBandProps) {
  return (
    <header className="bg-iron text-paper">
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <div>
            <h1 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">
              {PROTOCOL.title}
            </h1>
            <p className="mt-2 max-w-md text-sm text-paper/60">
              {PROTOCOL.subtitle}. Five tracked training days, 93 exercises,
              about 120 minutes a session — check work off as the crew gets
              through it.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous week"
                className="h-8 w-8 rounded-[2px] border-paper/25 bg-transparent text-paper hover:bg-paper/10 hover:text-paper"
                onClick={onPrevWeek}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-36 text-center">
                <p className="text-[11px] text-paper/55">
                  {isCurrentWeek ? 'This week' : 'Viewing'}
                </p>
                <p className="text-sm font-semibold tabular-nums">{weekLabel}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                aria-label="Next week"
                className="h-8 w-8 rounded-[2px] border-paper/25 bg-transparent text-paper hover:bg-paper/10 hover:text-paper"
                onClick={onNextWeek}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {!isCurrentWeek && (
                <button
                  onClick={onCurrentWeek}
                  className="rounded-[2px] px-1 text-xs text-paper/60 underline decoration-paper/30 underline-offset-2 hover:text-paper"
                >
                  Back to this week
                </button>
              )}
              <ProtocolNotesDialog />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {athletes.map((a) => {
            const selected = a.id === selectedAthleteId
            const pct = weekPct.get(a.id) ?? 0
            return (
              <div
                key={a.id}
                className={`group flex items-center gap-2 rounded-[2px] border px-3 py-1.5 text-sm transition-colors ${
                  selected
                    ? 'border-paper bg-paper text-ink'
                    : 'border-paper/25 text-paper hover:border-paper/50'
                }`}
              >
                <button
                  className="flex items-center gap-2"
                  onClick={() => onSelectAthlete(a.id)}
                  aria-pressed={selected}
                >
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-ink/20"
                    style={{ backgroundColor: a.color }}
                  />
                  <span className="font-medium">{a.name}</span>
                  <span
                    className={`text-xs tabular-nums ${
                      selected ? 'text-ink/60' : 'text-paper/50'
                    }`}
                  >
                    {pct}%
                  </span>
                </button>
                <button
                  aria-label={`Remove ${a.name} and their tracked work`}
                  className={`ml-0.5 grid h-4 w-4 place-items-center rounded-full ${
                    selected
                      ? 'text-ink/40 hover:text-ink'
                      : 'text-paper/30 opacity-0 hover:text-paper group-hover:opacity-100'
                  }`}
                  onClick={() => onRemoveAthlete(a.id)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )
          })}

          <button
            onClick={onAddAthlete}
            className="flex items-center gap-1.5 rounded-[2px] border border-dashed border-paper/30 px-3 py-1.5 text-sm text-paper/70 transition-colors hover:border-paper/60 hover:text-paper"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Add athlete
          </button>

          <div className="ml-auto flex rounded-[2px] border border-paper/25 p-0.5" role="tablist" aria-label="Tracking view">
            {(['session', 'crew'] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => onViewChange(v)}
                className={`rounded-[1px] px-3 py-1 text-sm font-medium capitalize transition-colors ${
                  view === v
                    ? 'bg-paper text-ink'
                    : 'text-paper/60 hover:text-paper'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}

function ProtocolNotesDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-[2px] px-1 text-xs text-paper/60 underline decoration-paper/30 underline-offset-2 transition-colors hover:text-paper">
          <NotebookText className="h-3.5 w-3.5" aria-hidden />
          Protocol notes
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto rounded-[3px] sm:rounded-[3px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight">
            Protocol notes
          </DialogTitle>
          <DialogDescription>
            From the Overview sheet of the training plan.
          </DialogDescription>
        </DialogHeader>
        <dl className="space-y-4 text-sm">
          <NoteRow label="Goal" value={PROTOCOL.goal} />
          <NoteRow label="Training days" value={PROTOCOL.trainingDays} />
          <NoteRow label="Session target" value={PROTOCOL.sessionTarget} />
          <NoteRow label="Strength style" value={PROTOCOL.strengthStyle} />
          <NoteRow label="Hypertrophy" value={PROTOCOL.hypertrophy} />
          <NoteRow label="Isometrics" value={PROTOCOL.isometrics} />
          <NoteRow label="Intensity rules" value={PROTOCOL.intensityRules} />
          <NoteRow label="Sunday recovery" value={PROTOCOL.sundayRecovery} />
        </dl>
      </DialogContent>
    </Dialog>
  )
}

function NoteRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold">{label}</dt>
      <dd className="mt-0.5 text-ink/70">{value}</dd>
    </div>
  )
}
