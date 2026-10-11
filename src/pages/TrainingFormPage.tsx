import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, TRAINING_TAGS, type Exercise, type TrainingItem } from '../db'
import { formatDuration, itemSeconds, todayIso, trainingSeconds } from '../time'
import { NumberField, TopBar } from '../components'
import { TimingFields } from './TimingFields'

const DEFAULT_REST_AFTER = 60

function itemFromExercise(e: Exercise): TrainingItem {
  return {
    exerciseId: e.id,
    name: e.name,
    mode: e.mode,
    sets: e.sets,
    reps: e.reps,
    secondsPerRep: e.secondsPerRep,
    workSeconds: e.workSeconds,
    restBetweenSets: e.restBetweenSets,
    restAfter: DEFAULT_REST_AFTER,
  }
}

export default function TrainingFormPage() {
  const params = useParams()
  const editingId = params.id ? Number(params.id) : undefined
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [date, setDate] = useState(todayIso())
  const [tag, setTag] = useState(TRAINING_TAGS[0])
  const [description, setDescription] = useState('')
  const [items, setItems] = useState<TrainingItem[]>([])
  const [picking, setPicking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!editingId) return
    db.trainings.get(editingId).then((t) => {
      if (!t) return
      setName(t.name)
      setDate(t.date)
      setTag(t.tag)
      setDescription(t.description)
      setItems(t.items)
    })
  }, [editingId])

  function toggleExercise(e: Exercise) {
    setItems((current) =>
      current.some((i) => i.exerciseId === e.id)
        ? current.filter((i) => i.exerciseId !== e.id)
        : [...current, itemFromExercise(e)],
    )
  }

  function updateItem(index: number, item: TrainingItem) {
    setItems((current) => current.map((old, i) => (i === index ? item : old)))
  }

  async function save() {
    if (!name.trim()) {
      setError('Please enter a name for the training.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const data = { name: name.trim(), date, tag, description: description.trim(), items, updatedAt: Date.now() }
    if (editingId) {
      await db.trainings.update(editingId, data)
      navigate(-1)
    } else {
      const id = await db.trainings.add({ ...data, createdAt: Date.now() })
      navigate(`/trainings/${id}`, { replace: true })
    }
  }

  if (picking) {
    return (
      <ExercisePicker
        selectedIds={items.map((i) => i.exerciseId)}
        onToggle={toggleExercise}
        onDone={() => setPicking(false)}
      />
    )
  }

  return (
    <div className="page page-form page-with-bar">
      <TopBar title={editingId ? 'Edit training' : 'New training'} />

      <div className="form">
        <label className="field">
          <span className="field-label">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kids – kicks and games" />
        </label>

        <div className="grid-2">
          <label className="field">
            <span className="field-label">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">Type</span>
            <select value={tag} onChange={(e) => setTag(e.target.value)}>
              {TRAINING_TAGS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span className="field-label">Description</span>
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Goal of the training" />
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <h2 className="section-title">Exercises ({items.length})</h2>

        {items.map((item, index) => (
          <article key={item.exerciseId} className="card item-card">
            <header className="item-head">
              <span className="item-number">{index + 1}</span>
              <span className="item-name">{item.name}</span>
              <span className="item-time">{formatDuration(itemSeconds(item, index === items.length - 1))}</span>
              <button
                type="button"
                className="icon-button small"
                aria-label={`Remove ${item.name}`}
                onClick={() => setItems(items.filter((_, i) => i !== index))}
              >
                ✕
              </button>
            </header>
            <TimingFields value={item} onChange={(next) => updateItem(index, next)} />
            {index < items.length - 1 && (
              <div className="grid-3">
                <NumberField
                  label="Break before next"
                  value={item.restAfter}
                  onChange={(restAfter) => updateItem(index, { ...item, restAfter })}
                  suffix="s"
                />
              </div>
            )}
          </article>
        ))}

        <button type="button" className="button button-outline" onClick={() => setPicking(true)}>
          {items.length === 0 ? '+ Select exercises' : '+ Add or remove exercises'}
        </button>
      </div>

      <div className="bottom-bar">
        <div>
          <span className="total-label">Total time</span>
          <span className="total-value">{formatDuration(trainingSeconds(items))}</span>
        </div>
        <button type="button" className="button button-primary" onClick={save}>Save</button>
      </div>
    </div>
  )
}

function ExercisePicker({
  selectedIds,
  onToggle,
  onDone,
}: {
  selectedIds: number[]
  onToggle: (e: Exercise) => void
  onDone: () => void
}) {
  const categories = useLiveQuery(() => db.categories.orderBy('order').toArray(), [])
  const exercises = useLiveQuery(() => db.exercises.orderBy('name').toArray(), [])
  const [search, setSearch] = useState('')

  if (!categories || !exercises) return null
  const query = search.trim().toLowerCase()
  const visible = exercises.filter((e) => !query || e.name.toLowerCase().includes(query))

  return (
    <div className="page page-form page-with-bar">
      <header className="topbar">
        <span />
        <h1 className="topbar-title">Select exercises</h1>
        <span />
      </header>

      <input
        className="search"
        type="search"
        placeholder="Search exercises"
        aria-label="Search exercises"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {categories.map((c) => {
        const inCategory = visible.filter((e) => e.categoryId === c.id)
        if (inCategory.length === 0) return null
        return (
          <section key={c.id} className="group">
            <h2 className="group-title">{c.name}</h2>
            <ul className="list">
              {inCategory.map((e) => {
                const order = selectedIds.indexOf(e.id)
                const checked = order !== -1
                return (
                  <li key={e.id}>
                    <label className={`row check-row ${checked ? 'check-row-on' : ''}`}>
                      <input type="checkbox" checked={checked} onChange={() => onToggle(e)} />
                      <span className="check-box" aria-hidden="true">{checked ? order + 1 : ''}</span>
                      <span className="row-title">{e.name}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}

      <div className="bottom-bar">
        <span className="total-label">{selectedIds.length} selected</span>
        <button type="button" className="button button-primary" onClick={onDone}>Done</button>
      </div>
    </div>
  )
}
