import { HashRouter, Navigate, NavLink, Outlet, Route, Routes } from 'react-router'
import ExercisesPage from './pages/ExercisesPage'
import ExerciseDetailPage from './pages/ExerciseDetailPage'
import ExerciseFormPage from './pages/ExerciseFormPage'
import TrainingsPage from './pages/TrainingsPage'
import TrainingDetailPage from './pages/TrainingDetailPage'
import TrainingFormPage from './pages/TrainingFormPage'

/** Screens with the bottom navigation. */
function TabLayout() {
  return (
    <div className="app">
      <main className="content">
        <Outlet />
      </main>
      <nav className="tabbar" aria-label="Main">
        <NavLink to="/exercises" className="tab">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
          Exercises
        </NavLink>
        <NavLink to="/trainings" className="tab">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2.5 2.5M9 2h6" />
          </svg>
          Trainings
        </NavLink>
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<TabLayout />}>
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/exercises/:id" element={<ExerciseDetailPage />} />
          <Route path="/trainings" element={<TrainingsPage />} />
          <Route path="/trainings/:id" element={<TrainingDetailPage />} />
        </Route>
        <Route path="/exercises/new" element={<ExerciseFormPage />} />
        <Route path="/exercises/:id/edit" element={<ExerciseFormPage />} />
        <Route path="/trainings/new" element={<TrainingFormPage />} />
        <Route path="/trainings/:id/edit" element={<TrainingFormPage />} />
        <Route path="*" element={<Navigate to="/trainings" replace />} />
      </Routes>
    </HashRouter>
  )
}
