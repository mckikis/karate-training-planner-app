import { Link, useNavigate, useParams } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { formatDuration, timingSummary, workPerSet } from '../time'
import { Media, TopBar } from '../components'

export default function ExerciseDetailPage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const exercise = useLiveQuery(() => db.exercises.get(id), [id])
  const category = useLiveQuery(
    () => (exercise ? db.categories.get(exercise.categoryId) : undefined),
    [exercise?.categoryId],
  )

  if (!exercise) return null

  async function remove() {
    if (!window.confirm(`Delete "${exercise!.name}"? Trainings that already use it will keep it.`)) return
    await db.exercises.delete(id)
    navigate('/exercises', { replace: true })
  }

  const setSeconds = workPerSet(exercise)

  return (
    <div className="page">
      <TopBar
        title=""
        right={<Link to={`/exercises/${id}/edit`} className="text-button">Edit</Link>}
      />

      {exercise.media && <Media blob={exercise.media} type={exercise.mediaType} className="hero-media" />}

      <p className="eyebrow">{category?.name}</p>
      <h1 className="page-title">{exercise.name}</h1>
      {exercise.description && <p className="body-text">{exercise.description}</p>}

      <section className="card">
        <h2 className="card-title">Predvolené časy</h2>
        <dl className="facts">
          <div><dt>Série</dt><dd>{timingSummary(exercise)}</dd></div>
          <div><dt>Jedna séria</dt><dd>{formatDuration(setSeconds)}</dd></div>
          <div><dt>Oddych</dt><dd>{exercise.restBetweenSets} s</dd></div>
        </dl>
        <p className="hint">Je možné zmeniť pri každom tréningu.</p>
      </section>

      <button type="button" className="button button-danger-ghost" onClick={remove}>
        Vymazať cvik
      </button>
    </div>
  )
}
