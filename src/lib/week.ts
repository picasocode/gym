import { addWeeks, format, getISOWeek, getISOWeekYear, startOfISOWeek } from 'date-fns'

/** ISO week key like "2026-W38" for the ISO week containing `d`. */
export function weekKeyOf(d: Date): string {
  return `${getISOWeekYear(d)}-W${String(getISOWeek(d)).padStart(2, '0')}`
}

/** Parse "2026-W38" and return the Monday (ISO week start) of that week. */
export function mondayOfKey(key: string): Date {
  const m = /^(\d{4})-W(\d{1,2})$/.exec(key)
  if (!m) throw new Error(`Bad week key: ${key}`)
  const year = Number(m[1])
  const wk = Number(m[2])
  // Jan 4 is always inside ISO week 1.
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const base = startOfISOWeek(jan4)
  return addWeeks(base, wk - 1)
}

/** Human label for a week, e.g. "Sep 14 – Sep 20". */
export function labelOf(monday: Date): string {
  const sunday = new Date(monday.getTime())
  sunday.setDate(sunday.getDate() + 6)
  return `${format(monday, 'MMM d')} – ${format(sunday, 'MMM d')}`
}

export function isValidWeekKey(key: string | null | undefined): key is string {
  return !!key && /^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/.test(key)
}
