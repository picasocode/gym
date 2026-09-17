'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useDashboard } from '@/lib/use-dashboard'
import { DAYS } from '@/lib/types'
import { IronBand } from '@/components/tracking/iron-band'
import { WeekBoard } from '@/components/tracking/week-board'
import { SessionView } from '@/components/tracking/session-view'
import { CrewView } from '@/components/tracking/crew-view'
import { PROTOCOL } from '@/lib/protocol-meta'

function defaultDay(): string {
  const js = new Date().getDay() // 0 Sun .. 6 Sat
  if (js >= 1 && js <= 5) return DAYS[js - 1]
  return 'Monday'
}

export default function Home() {
  const {
    data,
    loading,
    error,
    retry,
    setDone,
    setMany,
    addAthlete,
    removeAthlete,
    shiftWeek,
    backToCurrent,
    doneByAthlete,
    dayExercises,
  } = useDashboard()

  const { toast } = useToast()
  const [view, setView] = useState<'session' | 'crew'>('session')
  const [selectedDay, setSelectedDay] = useState<string>(defaultDay())
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  const athletes = data?.athletes ?? []
  const athlete = useMemo(() => {
    if (athletes.length === 0) return null
    return athletes.find((a) => a.id === selectedAthleteId) ?? athletes[0]
  }, [athletes, selectedAthleteId])

  const weekPct = useMemo(() => {
    const map = new Map<string, number>()
    const total = data?.exercises.length ?? 0
    if (!total) return map
    for (const a of athletes) {
      const done = doneByAthlete.get(a.id)?.size ?? 0
      map.set(a.id, Math.round((done / total) * 100))
    }
    return map
  }, [athletes, data?.exercises.length, doneByAthlete])

  const handleAddAthlete = async () => {
    const name = newName.trim()
    if (!name) {
      toast({ title: 'Give the athlete a name first.' })
      return
    }
    setAdding(true)
    try {
      const created = await addAthlete(name)
      setSelectedAthleteId(created.id)
      setAddOpen(false)
      setNewName('')
      toast({ title: `${created.name} joined the board.` })
    } catch (e) {
      toast({
        title: e instanceof Error ? e.message : 'Could not add the athlete',
        variant: 'destructive',
      })
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveAthlete = async (id: string) => {
    const target = athletes.find((a) => a.id === id)
    if (!target) return
    if (!window.confirm(`Remove ${target.name} and all their tracked work?`)) {
      return
    }
    try {
      await removeAthlete(id)
      if (selectedAthleteId === id) setSelectedAthleteId(null)
      toast({ title: `${target.name} removed from the board.` })
    } catch {
      toast({
        title: 'Could not remove the athlete',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <IronBand
        athletes={athletes}
        selectedAthleteId={athlete?.id ?? null}
        onSelectAthlete={setSelectedAthleteId}
        onRemoveAthlete={handleRemoveAthlete}
        onAddAthlete={() => setAddOpen(true)}
        view={view}
        onViewChange={setView}
        weekLabel={data?.week.label ?? '…'}
        isCurrentWeek={data?.isCurrentWeek ?? true}
        onPrevWeek={() => shiftWeek(-1)}
        onNextWeek={() => shiftWeek(1)}
        onCurrentWeek={backToCurrent}
        weekPct={weekPct}
      />

      {error && (
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
          <div className="rounded-[2px] border border-destructive/50 bg-card p-4 text-sm">
            <p className="font-semibold">{error}</p>
            <Button onClick={retry} variant="outline" size="sm" className="mt-2 rounded-[2px]">
              Try again
            </Button>
          </div>
        </div>
      )}

      {loading && !data ? (
        <LoadingBoard />
      ) : data ? (
        <>
          <WeekBoard
            dayExercises={dayExercises}
            doneByAthlete={doneByAthlete}
            athletes={athletes}
            mode={view}
            selectedAthleteId={athlete?.id ?? null}
            selectedDay={selectedDay}
            onSelectDay={(day) => {
              setSelectedDay(day)
              setView('session')
            }}
          />

          {view === 'session' ? (
            athletes.length === 0 ? (
              <EmptyCrew onAdd={() => setAddOpen(true)} />
            ) : (
              <SessionView
                day={selectedDay}
                exercises={dayExercises.get(selectedDay) ?? []}
                doneSet={doneByAthlete.get(athlete!.id) ?? new Set()}
                onToggle={(exerciseId, done) =>
                  setDone(athlete!.id, exerciseId, done)
                }
                onSetMany={(exerciseIds, done) =>
                  setMany(athlete!.id, exerciseIds, done)
                }
                athleteName={athlete!.name}
              />
            )
          ) : (
            <CrewView
              athletes={athletes}
              exercises={data.exercises}
              dayExercises={dayExercises}
              doneByAthlete={doneByAthlete}
              onRemoveAthlete={handleRemoveAthlete}
            />
          )}
        </>
      ) : null}

      <footer className="mt-auto border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-x-8 gap-y-1 px-4 py-4 text-xs text-ink/55 sm:px-6">
          <p>
            {PROTOCOL.title} — {PROTOCOL.subtitle}. Tracked from the Weekly
            Protocol sheet: 93 exercises across five days.
          </p>
          <p>
            {PROTOCOL.recovery}. {PROTOCOL.goal}.
          </p>
        </div>
      </footer>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm rounded-[3px] sm:rounded-[3px]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-tight">
              Add athlete
            </DialogTitle>
            <DialogDescription>
              Each athlete tracks their own completion of the protocol, week by
              week.
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddAthlete()
            }}
            maxLength={40}
            aria-label="Athlete name"
          />
          <DialogFooter>
            <Button
              onClick={handleAddAthlete}
              disabled={adding}
              className="rounded-[2px] bg-ink text-paper hover:bg-ink/85"
            >
              {adding ? 'Adding…' : 'Add athlete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmptyCrew({ onAdd }: { onAdd: () => void }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="rounded-[2px] border border-dashed border-line p-8 text-center">
        <p className="text-sm font-semibold">Nobody on the board yet</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-ink/60">
          Add the first athlete to start checking exercises off and tracking
          how much of the protocol is done and how much is pending.
        </p>
        <Button
          onClick={onAdd}
          className="mt-4 rounded-[2px] bg-ink text-paper hover:bg-ink/85"
        >
          Add athlete
        </Button>
      </div>
    </section>
  )
}

function LoadingBoard() {
  return (
    <div aria-hidden className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-[2px] border border-line bg-rail/70"
          />
        ))}
      </div>
    </div>
  )
}
