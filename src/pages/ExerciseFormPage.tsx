import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Timing } from '../db'
import { Media, TopBar } from '../components'
import { TimingFields } from './TimingFields'

const MAX_MEDIA_MB = 40

const DEFAULT_TIMING: Timing = {
  mode: 'reps',
  sets: 3,
  reps: 10,
  secondsPerRep: 2,
  workSeconds: 30,
  restBetweenSets: 30,
}

export default function ExerciseFormPage() {
  const params = useParams()
  const editingId = params.id ? Number(params.id) : undefined
  const navigate = useNavigate()
  const categories = useLiveQuery(() => db.categories.orderBy('order').toArray(), [])

  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState<number>()
  const [description, setDescription] = useState('')
  const [timing, setTiming] = useState<Timing>(DEFAULT_TIMING)
  const [media, setMedia] = useState<Blob>()
  const [mediaType, setMediaType] = useState<'image' | 'video'>()
  const [error, setError] = useState('')

  // When editing, load the exercise once.
  useEffect(() => {
    if (!editingId) return
    db.exercises.get(editingId).then((e) => {
      if (!e) return
      setName(e.name)
      setCategoryId(e.categoryId)
      setDescription(e.description)
      setTiming({
        mode: e.mode,
        sets: e.sets,
        reps: e.reps,
        secondsPerRep: e.secondsPerRep,
        workSeconds: e.workSeconds,
        restBetweenSets: e.restBetweenSets,
      })
      setMedia(e.media)
      setMediaType(e.mediaType)
    })
  }, [editingId])

  // New exercise: preselect the first category.
  useEffect(() => {
    if (!editingId && categoryId === undefined && categories?.length) setCategoryId(categories[0].id)
  }, [categories, categoryId, editingId])

  function pickFile(file?: File) {
    if (!file) return
    if (file.size > MAX_MEDIA_MB * 1024 * 1024) {
      setError(`The file is too big. Please use a photo or a short video under ${MAX_MEDIA_MB} MB.`)
      return
    }
    setError('')
    setMedia(file)
    setMediaType(file.type.startsWith('video') ? 'video' : 'image')
  }

  async function save() {
    if (!name.trim()) {
      setError('Please enter a name.')
      return
    }
    if (categoryId === undefined) {
      setError('Please choose a category.')
      return
    }
    const data = {
      name: name.trim(),
      categoryId,
      description: description.trim(),
      media,
      mediaType: media ? mediaType : undefined,
      ...timing,
    }
    if (editingId) {
      await db.exercises.update(editingId, data)
      navigate(-1)
    } else {
      const id = await db.exercises.add({ ...data, isDefault: false, createdAt: Date.now() })
      navigate(`/exercises/${id}`, { replace: true })
    }
  }

  return (
    <div className="page page-form">
      <TopBar title={editingId ? 'Edit exercise' : 'New exercise'} />

      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <label className="field">
          <span className="field-label">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Gyaku zuki" />
        </label>

        <label className="field">
          <span className="field-label">Category</span>
          <select value={categoryId ?? ''} onChange={(e) => setCategoryId(Number(e.target.value))}>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Description</span>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short note on how to do it"
          />
        </label>

        <div className="field">
          <span className="field-label">Photo, GIF or short video</span>
          {media ? (
            <div className="media-preview">
              <Media blob={media} type={mediaType} className="hero-media" />
              <button type="button" className="button button-small button-ghost" onClick={() => setMedia(undefined)}>
                Remove
              </button>
            </div>
          ) : (
            <label className="upload">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
              <span>+ Add photo or video</span>
            </label>
          )}
        </div>

        <fieldset className="card">
          <legend className="card-title">Default timing</legend>
          <p className="hint">Used when you add this exercise to a training. You can change it there.</p>
          <TimingFields value={timing} onChange={setTiming} />
        </fieldset>

        {error && <p className="error" role="alert">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="button button-primary">Save exercise</button>
        </div>
      </form>
    </div>
  )
}
