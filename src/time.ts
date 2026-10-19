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

export interface ScheduleRow {
  item: TrainingItem
  start: number // seconds from the start of the training
  end: number // when the exercise itself ends (without the break after it)
  breakAfter: number // break before the next exercise (0 after the last one)
}

/** When each exercise starts and ends, counted from the start of the training. */
export function schedule(items: TrainingItem[]): ScheduleRow[] {
  const rows: ScheduleRow[] = []
  let start = 0
  items.forEach((item, i) => {
    const isLast = i === items.length - 1
    const end = start + itemSeconds(item, true)
    const breakAfter = isLast ? 0 : item.restAfter
    rows.push({ item, start, end, breakAfter })
    start = end + breakAfter
  })
  return rows
}

/** "17:00" + 1020 seconds → "17:17". Seconds are shown only when they are not 0. */
export function clockAt(startTime: string, offsetSeconds: number): string {
  const [h, m] = startTime.split(':').map(Number)
  const total = (((h * 3600 + m * 60 + Math.round(offsetSeconds)) % 86400) + 86400) % 86400
  const hh = String(Math.floor(total / 3600)).padStart(2, '0')
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const ss = total % 60
  return ss === 0 ? `${hh}:${mm}` : `${hh}:${mm}:${String(ss).padStart(2, '0')}`
}

/** Reads "15:00", "2:30" or "90" (seconds). Returns undefined if it is not a valid time. */
export function parseDuration(text: string): number | undefined {
  const value = text.trim().replace(',', '.')
  if (value === '') return undefined
  if (value.includes(':')) {
    const [min, sec = '0'] = value.split(':')
    const m = Number(min)
    const s = Number(sec)
    if (Number.isNaN(m) || Number.isNaN(s) || m < 0 || s < 0) return undefined
    return Math.round(m * 60 + s)
  }
  const seconds = Number(value)
  return Number.isNaN(seconds) || seconds < 0 ? undefined : Math.round(seconds)
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
  if (t.mode === 'reps') return `${t.sets} × ${t.reps} reps`
  return t.workSeconds >= 60
    ? `${t.sets} × ${formatDuration(t.workSeconds)} min`
    : `${t.sets} × ${t.workSeconds} s`
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
