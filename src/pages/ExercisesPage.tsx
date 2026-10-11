import { useState } from 'react'
import { Link } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Exercise } from '../db'
import { timingSummary } from '../time'
import { EmptyState, Thumb } from '../components'

export default function ExercisesPage() {
  const categories = useLiveQuery(() => db.categories.orderBy('order').toArray(), [])
  const exercises = useLiveQuery(() => db.exercises.orderBy('name').toArray(), [])

  const [filter, setFilter] = useState<number | 'all'>('all')
  const [search, setSearch] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')

  if (!categories || !exercises) return null

  const query = search.trim().toLowerCase()
  const visible = exercises.filter(
    (e) => (filter === 'all' || e.categoryId === filter) && (!query || e.name.toLowerCase().includes(query)),
  )
  const shownCategories = categories.filter((c) => visible.some((e) => e.categoryId === c.id))

  async function addCategory() {
    const name = newCategory.trim()
    if (!name) return
    const order = categories!.reduce((max, c) => Math.max(max, c.order), -1) + 1
    const id = await db.categories.add({ name, order })
    setNewCategory('')
    setAddingCategory(false)
    setFilter(id as number)
  }

  return (
    <div className="page">
      <h1 className="page-title">Exercises</h1>

      <input
        className="search"
        type="search"
        placeholder="Search exercises"
        aria-label="Search exercises"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="chips" role="group" aria-label="Categories">
        <button type="button" className={`chip ${filter === 'all' ? 'chip-on' : ''}`} onClick={() => setFilter('all')}>
          All
        </button>
        {categories.map((c) => (
          <button
            type="button"
            key={c.id}
            className={`chip ${filter === c.id ? 'chip-on' : ''}`}
            onClick={() => setFilter(c.id)}
          >
            {c.name}
          </button>
        ))}
        <button type="button" className="chip chip-dashed" onClick={() => setAddingCategory(true)}>
          + Category
        </button>
      </div>

      {addingCategory && (
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault()
            addCategory()
          }}
        >
          <input
            autoFocus
            placeholder="New category name"
            aria-label="New category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button type="submit" className="button button-small">Add</button>
          <button type="button" className="button button-small button-ghost" onClick={() => setAddingCategory(false)}>
            Cancel
          </button>
        </form>
      )}

      {visible.length === 0 ? (
        <EmptyState
          title="No exercises here yet"
          text="Add your first exercise to this category."
        />
      ) : (
        shownCategories.map((c) => (
          <section key={c.id} className="group">
            {filter === 'all' && <h2 className="group-title">{c.name}</h2>}
            <ul className="list">
              {visible
                .filter((e) => e.categoryId === c.id)
                .map((e) => (
                  <ExerciseRow key={e.id} exercise={e} />
                ))}
            </ul>
          </section>
        ))
      )}

      <Link to="/exercises/new" className="fab">
        + New exercise
      </Link>
    </div>
  )
}

function ExerciseRow({ exercise }: { exercise: Exercise }) {
  return (
    <li>
      <Link to={`/exercises/${exercise.id}`} className="row">
        <Thumb blob={exercise.media} type={exercise.mediaType} label={exercise.name} />
        <span className="row-main">
          <span className="row-title">{exercise.name}</span>
          <span className="row-sub">{timingSummary(exercise)}</span>
        </span>
        <span className="chevron" aria-hidden="true">›</span>
      </Link>
    </li>
  )
}
