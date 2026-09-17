'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  AthleteDTO,
  CompletionDTO,
  ExerciseDTO,
  StateDTO,
} from '@/lib/types'
import { DAYS } from '@/lib/types'

function upsertCompletion(
  list: CompletionDTO[],
  athleteId: string,
  exerciseId: string,
  done: boolean,
): CompletionDTO[] {
  const idx = list.findIndex(
    (c) => c.athleteId === athleteId && c.exerciseId === exerciseId,
  )
  if (idx >= 0) {
    const next = [...list]
    next[idx] = { ...next[idx], done }
    return next
  }
  return [...list, { athleteId, exerciseId, done }]
}

export function useDashboard() {
  const [weekKey, setWeekKey] = useState<string | null>(null)
  const [data, setData] = useState<StateDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Keeps the pre-mutation snapshot so a failed save can roll back cleanly.
  const snapshotRef = useRef<StateDTO | null>(null)

  const load = useCallback(async (key?: string | null) => {
    setLoading(true)
    try {
      const url =
        '/api/state' + (key ? `?week=${encodeURIComponent(key)}` : '')
      const res = await fetch(url)
      if (!res.ok) throw new Error('Could not load the tracker')
      const json = (await res.json()) as StateDTO
      setData(json)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the tracker')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(weekKey)
  }, [weekKey, load])

  const setDone = useCallback(
    (athleteId: string, exerciseId: string, done: boolean) => {
      setData((prev) => {
        if (!prev) return prev
        snapshotRef.current = prev
        return {
          ...prev,
          completions: upsertCompletion(
            prev.completions,
            athleteId,
            exerciseId,
            done,
          ),
        }
      })
      const weekId = data?.week.id
      if (!weekId) return
      fetch('/api/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athleteId,
          weekId,
          items: [{ exerciseId, done }],
        }),
      }).catch(() => {
        // Roll back to the pre-mutation snapshot if the save failed.
        if (snapshotRef.current) setData(snapshotRef.current)
      })
    },
    [data?.week.id],
  )

  const setMany = useCallback(
    (athleteId: string, exerciseIds: string[], done: boolean) => {
      if (exerciseIds.length === 0) return
      setData((prev) => {
        if (!prev) return prev
        snapshotRef.current = prev
        let completions = prev.completions
        for (const exerciseId of exerciseIds) {
          completions = upsertCompletion(
            completions,
            athleteId,
            exerciseId,
            done,
          )
        }
        return { ...prev, completions }
      })
      const weekId = data?.week.id
      if (!weekId) return
      fetch('/api/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athleteId,
          weekId,
          items: exerciseIds.map((exerciseId) => ({ exerciseId, done })),
        }),
      }).catch(() => {
        if (snapshotRef.current) setData(snapshotRef.current)
      })
    },
    [data?.week.id],
  )

  const addAthlete = useCallback(async (name: string) => {
    const res = await fetch('/api/athletes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as
        | { error?: string }
        | null
      throw new Error(body?.error ?? 'Could not add the athlete')
    }
    const athlete = (await res.json()) as AthleteDTO
    setData((prev) =>
      prev ? { ...prev, athletes: [...prev.athletes, athlete] } : prev,
    )
    return athlete
  }, [])

  const removeAthlete = useCallback(async (id: string) => {
    const res = await fetch(`/api/athletes?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Could not remove the athlete')
    setData((prev) =>
      prev
        ? {
            ...prev,
            athletes: prev.athletes.filter((a) => a.id !== id),
            completions: prev.completions.filter((c) => c.athleteId !== id),
          }
        : prev,
    )
  }, [])

  const shiftWeek = useCallback(
    (delta: number) => {
      setWeekKey((prev) => {
        const base = prev ?? data?.week.key
        if (!base) return prev
        const m = /^(\d{4})-W(\d{2})$/.exec(base)
        if (!m) return prev
        // Safe month-based arithmetic: step through Jan 4 of the year.
        let year = Number(m[1])
        let week = Number(m[2]) + delta
        while (week < 1) {
          year -= 1
          week += 52
        }
        while (week > 52) {
          year += 1
          week -= 52
        }
        return `${year}-W${String(week).padStart(2, '0')}`
      })
    },
    [data?.week.key],
  )

  const backToCurrent = useCallback(() => setWeekKey(null), [])

  const exerciseMap = useMemo(() => {
    const map = new Map<string, ExerciseDTO>()
    for (const ex of data?.exercises ?? []) map.set(ex.id, ex)
    return map
  }, [data?.exercises])

  const doneByAthlete = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const c of data?.completions ?? []) {
      if (!c.done) continue
      let set = map.get(c.athleteId)
      if (!set) {
        set = new Set<string>()
        map.set(c.athleteId, set)
      }
      set.add(c.exerciseId)
    }
    return map
  }, [data?.completions])

  const dayExercises = useMemo(() => {
    const groups = new Map<string, ExerciseDTO[]>()
    for (const day of DAYS) groups.set(day, [])
    for (const ex of data?.exercises ?? []) {
      groups.get(ex.day)?.push(ex)
    }
    return groups
  }, [data?.exercises])

  return {
    data,
    loading,
    error,
    retry: () => load(weekKey),
    setDone,
    setMany,
    addAthlete,
    removeAthlete,
    shiftWeek,
    backToCurrent,
    exerciseMap,
    doneByAthlete,
    dayExercises,
  }
}
