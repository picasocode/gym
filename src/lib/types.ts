// Shared DTO types between API and UI

export type AthleteDTO = {
  id: string
  name: string
  color: string
}

export type ExerciseDTO = {
  id: string
  day: string
  block: string
  name: string
  sets: string
  reps: string
  rest: string
  focus: string
  order: number
}

export type WeekDTO = {
  id: string
  key: string
  startsAt: string
  label: string
}

export type CompletionDTO = {
  athleteId: string
  exerciseId: string
  done: boolean
}

export type StateDTO = {
  athletes: AthleteDTO[]
  week: WeekDTO
  isCurrentWeek: boolean
  exercises: ExerciseDTO[]
  completions: CompletionDTO[]
}

export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
] as const

export type Day = (typeof DAYS)[number]

// Rotation used when creating new athletes from the UI.
export const ATHLETE_COLORS = [
  '#E4572E', // signal
  '#3E6B4F', // pine
  '#A87B2F', // ochre
  '#7D4A5E', // plum
  '#4E5A48', // moss
  '#8C3B2E', // rust
]
