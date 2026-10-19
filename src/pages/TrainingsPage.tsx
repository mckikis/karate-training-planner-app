import { Link } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { formatDate, formatDuration, trainingSeconds } from '../time'
import { EmptyState } from '../components'

export default function TrainingsPage() {
  const trainings = useLiveQuery(() => db.trainings.orderBy('date').reverse().toArray(), [])
  if (!trainings) return null

  return (
    <div className="page">
      <h1 className="page-title">Tréningy</h1>

      {trainings.length === 0 ? (
        <EmptyState
          title="Žiadne dostupné tréningy"
          text="Vyber cvičenia, zadaj série a počty opakovaní pre vypočítanie celkovej dĺžky tréningu."
          action={<Link to="/trainings/new" className="button button-primary">Vytvoriť prvý tréning</Link>}
        />
      ) : (
        <ul className="list">
          {trainings.map((t) => (
            <li key={t.id}>
              <Link to={`/trainings/${t.id}`} className="row training-row">
                <span className="row-main">
                  <span className="row-title">{t.name}</span>
                  <span className="row-sub">
                    {formatDate(t.date)}
                    {t.startTime && ` · ${t.startTime}`} · {t.items.length} exercises
                  </span>
                  {t.tag && <span className="tag">{t.tag}</span>}
                </span>
                <span className="row-time">{formatDuration(trainingSeconds(t.items))}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {trainings.length > 0 && (
        <Link to="/trainings/new" className="fab">+ Nový tréning</Link>
      )}
    </div>
  )
}
