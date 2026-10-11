import { Link, useNavigate, useParams } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { formatDate, formatDuration, itemSeconds, timingSummary, trainingSeconds } from '../time'
import { TopBar } from '../components'

export default function TrainingDetailPage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const training = useLiveQuery(() => db.trainings.get(id), [id])

  if (!training) return null

  async function remove() {
    if (!window.confirm(`Delete "${training!.name}"?`)) return
    await db.trainings.delete(id)
    navigate('/trainings', { replace: true })
  }

  // Start time of each exercise from the beginning of the training (0:00, 4:00, 9:36 …)
  const durations = training.items.map((item, i) => itemSeconds(item, i === training.items.length - 1))
  const rows = training.items.map((item, i) => ({
    item,
    seconds: durations[i],
    startsAt: durations.slice(0, i).reduce((sum, s) => sum + s, 0),
  }))

  return (
    <div className="page">
      <TopBar
        title=""
        right={<Link to={`/trainings/${id}/edit`} className="text-button">Edit</Link>}
      />

      <p className="eyebrow">{formatDate(training.date)}</p>
      <h1 className="page-title">{training.name}</h1>
      {training.tag && <span className="tag">{training.tag}</span>}
      {training.description && <p className="body-text">{training.description}</p>}

      <div className="total-card">
        <span className="total-label">Total time</span>
        <span className="total-value">{formatDuration(trainingSeconds(training.items))}</span>
      </div>

      <ol className="plan">
        {rows.map(({ item, seconds, startsAt }, i) => (
          <li key={i} className="plan-row">
            <span className="plan-start">{formatDuration(startsAt)}</span>
            <span className="row-main">
              <span className="row-title">{item.name}</span>
              <span className="row-sub">
                {timingSummary(item)}
                {item.sets > 1 && ` · rest ${item.restBetweenSets} s`}
                {i < rows.length - 1 && item.restAfter > 0 && ` · then ${item.restAfter} s break`}
              </span>
            </span>
            <span className="row-time">{formatDuration(seconds)}</span>
          </li>
        ))}
      </ol>

      <button type="button" className="button button-danger-ghost" onClick={remove}>
        Delete training
      </button>
    </div>
  )
}
