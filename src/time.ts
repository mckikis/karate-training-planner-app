import type { Timing, TrainingItem } from './db'

/** Seconds of work in one set. */
export function workPerSet(t: Timing): number {
  return t.mode === 'time' ? t.workSeconds : t.reps * t.secondsPerRep
}

/**
 * Time of one exercise in a training:
 * sets × work + rests between sets + rest before the next exercise (not after the last one).
 */
export function itemSeconds(item: TrainingItem, isLast: boolean): number {
  const work = item.sets * workPerSet(item)
  const rests = Math.max(0, item.sets - 1) * item.restBetweenSets
  const after = isLast ? 0 : item.restAfter
  return Math.round(work + rests + after)
}

export function trainingSeconds(items: TrainingItem[]): number {
  return items.reduce((sum, item, i) => sum + itemSeconds(item, i === items.length - 1), 0)
}

/** 95 → "1:35", 3725 → "1:02:05" */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

/** "3 × 10 reps" or "2 × 30 s" */
export function timingSummary(t: Timing): string {
  return t.mode === 'time' ? `${t.sets} × ${t.workSeconds} s` : `${t.sets} × ${t.reps} reps`
}

export function formatDate(isoDate: string): string {
  if (!isoDate) return ''
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function todayIso(): string {
  const d = new Date()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}
