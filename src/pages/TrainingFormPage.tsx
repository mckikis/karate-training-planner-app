import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, TRAINING_TAGS, type Exercise, type TrainingItem } from '../db'
import { clockAt, formatDuration, schedule, todayIso, trainingSeconds } from '../time'
import { DurationField, Thumb, TopBar } from '../components'
import { TimingFields } from './TimingFields'

const DEFAULT_REST_AFTER = 60
const DEFAULT_START_TIME = '17:00'

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
  const [startTime, setStartTime] = useState(DEFAULT_START_TIME)
  const [tag, setTag] = useState(TRAINING_TAGS[0])
  const [description, setDescription] = useState('')
  const [items, setItems] = useState<TrainingItem[]>([])
  const [picking, setPicking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editingId) {
      db.trainings.get(editingId).then((t) => {
        if (!t) return
        setName(t.name)
        setDate(t.date)
        setStartTime(t.startTime ?? '')
        setTag(t.tag)
        setDescription(t.description)
        setItems(t.items)
      })
    } else {
      // New training: use the start time of the last saved training (most trainings start at the same time).
      db.trainings.orderBy('id').last().then((last) => {
        if (last?.startTime) setStartTime(last.startTime)
      })
    }
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
      setError('Zadaj názov tréningu.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const data = {
      name: name.trim(),
      date,
      startTime,
      tag,
      description: description.trim(),
      items,
      updatedAt: Date.now(),
    }
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

  const rows = schedule(items)
  const total = trainingSeconds(items)
  const at = (offset: number) => (startTime ? clockAt(startTime, offset) : formatDuration(offset))

  return (
    <div className="page page-form page-with-bar">
      <TopBar title={editingId ? 'Upraviť tréning' : 'Nový tréning'} />

      <div className="form">
        <label className="field">
          <span className="field-label">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kids – kicks and games" />
        </label>

        <div className="grid-2">
          <label className="field">
            <span className="field-label">Dátum</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">Začiatok</span>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </label>
        </div>

        <label className="field">
          <span className="field-label">Typ tréningu</span>
          <select value={tag} onChange={(e) => setTag(e.target.value)}>
            {TRAINING_TAGS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Popis</span>
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Goal of the training" />
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <h2 className="section-title">Cviky ({items.length})</h2>

        {rows.map(({ item, start, end }, index) => (
          <article key={item.exerciseId} className="card item-card">
            <header className="item-head">
              <span className="item-number">{index + 1}</span>
              <span className="item-title">
                <span className="item-name">{item.name}</span>
                <span className="item-clock">
                  {at(start)} – {at(end)} · {formatDuration(end - start)} min
                </span>
              </span>
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
                <DurationField
                  label="Break before next"
                  value={item.restAfter}
                  onChange={(restAfter) => updateItem(index, { ...item, restAfter })}
                />
              </div>
            )}
          </article>
        ))}

        <button type="button" className="button button-outline" onClick={() => setPicking(true)}>
          {items.length === 0 ? '+ Výber cvikov' : '+ Pridať alebo vymazať cviky'}
        </button>
      </div>

      <div className="bottom-bar">
        <div>
          <span className="total-label">
            Celkový čas{startTime && items.length > 0 && ` · ends ${clockAt(startTime, total)}`}
          </span>
          <span className="total-value">{formatDuration(total)}</span>
        </div>
        <button type="button" className="button button-primary" onClick={save}>Uložiť</button>
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
        <h1 className="topbar-title">Výber cvikov</h1>
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
                      <Thumb blob={e.media} type={e.mediaType} label={e.name} />
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
        <button type="button" className="button button-primary" onClick={onDone}>Hotovo</button>
      </div>
    </div>
  )
}
