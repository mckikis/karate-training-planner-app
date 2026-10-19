import { Link, useNavigate, useParams } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { clockAt, formatDate, formatDuration, schedule, timingSummary, trainingSeconds } from '../time'
import { Thumb, TopBar } from '../components'

export default function TrainingDetailPage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const training = useLiveQuery(() => db.trainings.get(id), [id])
  // Load the exercises of this training, so we can show their photos and videos.
  const exercises = useLiveQuery(
    () => (training ? db.exercises.bulkGet(training.items.map((i) => i.exerciseId)) : []),
    [training],
  )

  if (!training) return null

  async function remove() {
    if (!window.confirm(`Delete "${training!.name}"?`)) return
    await db.trainings.delete(id)
    navigate('/trainings', { replace: true })
  }

  const rows = schedule(training.items)
  const total = trainingSeconds(training.items)
  // With a start time we show the clock (17:17), without it the time from the start (0:00).
  const at = (offset: number) => (training.startTime ? clockAt(training.startTime, offset) : formatDuration(offset))

  return (
    <div className="page">
      <TopBar
        title=""
        right={<Link to={`/trainings/${id}/edit`} className="text-button">Upraviť</Link>}
      />

      <p className="eyebrow">
        {formatDate(training.date)}
        {training.startTime && ` · ${training.startTime}`}
      </p>
      <h1 className="page-title">{training.name}</h1>
      {training.tag && <span className="tag tag-large">{training.tag}</span>}
      {training.description && <p className="body-text">{training.description}</p>}

      <ol className="plan">
        {rows.map(({ item, start, end, breakAfter }, i) => {
          const exercise = exercises?.[i]
          return (
            <li key={i}>
              <div className="plan-row">
                <Thumb blob={exercise?.media} type={exercise?.mediaType} label={item.name} size="large" />
                <div className="row-main">
                  <span className="plan-clock">
                    {at(start)} – {at(end)}
                  </span>
                  <span className="row-title">{item.name}</span>
                  <span className="row-sub">
                    {timingSummary(item)}
                    {item.sets > 1 && ` · rest ${item.restBetweenSets} s`}
                    {` · ${formatDuration(end - start)} min`}
                  </span>
                </div>
              </div>
              {breakAfter > 0 && (
                <p className="plan-break">Break {formatDuration(breakAfter)} min</p>
              )}
            </li>
          )
        })}
      </ol>

      <p className="total-small">
        Celkový čas <strong>{formatDuration(total)}</strong>
        {training.startTime && ` · ${training.startTime} – ${clockAt(training.startTime, total)}`}
      </p>

      <button type="button" className="button button-danger-ghost" onClick={remove}>
        Vymazať tréning
      </button>
    </div>
  )
}
