// Static content lifted from the "Overview" sheet of
// death_protocol_training_plan.xlsx — kept faithful to the source.

export const PROTOCOL = {
  title: 'DEATH PROTOCOL',
  subtitle: '6-day training system',
  goal: 'Muscle gain + strength + isometric force + calisthenics + mobility + endurance',
  trainingDays: 'Monday–Saturday',
  recovery: 'Sunday — active recovery only',
  sessionTarget: '≈ 120 minutes',
  strengthStyle:
    'Mentzer-inspired high-intensity working sets with controlled volume',
  hypertrophy: 'Mostly 6–15 reps; accessories 10–20 reps',
  isometrics:
    '5–15 sec force holds + 20–60 sec strength/endurance holds',
  intensityRules:
    'Main compounds: warm up, then 1 hard working set around 1–2 RIR. Accessories: 1–3 hard sets. Isometrics: mix short high-force holds with longer positional/endurance holds. Do not force absolute failure on heavy squat/deadlift work; stop when technical form breaks.',
  sundayRecovery:
    '30–45 min easy walking + 20–30 min light mobility. No heavy lifting, no hard intervals, no failure training.',
}

// WEEKLY EMPHASIS matrix from the Overview sheet.
export const EMPHASIS: Record<
  string,
  { primary: string; strength: number; isometric: number; conditioning: number }
> = {
  Monday: { primary: 'Max strength + pull', strength: 5, isometric: 4, conditioning: 2 },
  Tuesday: { primary: 'Legs + glutes + posture', strength: 4, isometric: 4, conditioning: 3 },
  Wednesday: { primary: 'Push + shoulders', strength: 4, isometric: 5, conditioning: 3 },
  Thursday: { primary: 'Hinge + posterior chain', strength: 5, isometric: 5, conditioning: 2 },
  Friday: { primary: 'Athletic + calisthenics', strength: 3, isometric: 4, conditioning: 4 },
}

export function stars(n: number): string {
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}
