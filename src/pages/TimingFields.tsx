import type { Mode, Timing } from '../db'
import { NumberField } from '../components'

/** Sets, reps or time, and rest – shared by the exercise form and the training form. */
export function TimingFields<T extends Timing>({ value, onChange }: { value: T; onChange: (value: T) => void }) {
  const set = (patch: Partial<Timing>) => onChange({ ...value, ...patch })

  return (
    <div className="timing">
      <div className="segmented" role="group" aria-label="Measure by">
        {(['reps', 'time'] as Mode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            className={value.mode === mode ? 'segment segment-on' : 'segment'}
            aria-pressed={value.mode === mode}
            onClick={() => set({ mode })}
          >
            {mode === 'reps' ? 'Reps' : 'Time'}
          </button>
        ))}
      </div>

      <div className="grid-3">
        <NumberField label="Sets" value={value.sets} onChange={(sets) => set({ sets })} />
        {value.mode === 'reps' ? (
          <>
            <NumberField label="Reps" value={value.reps} onChange={(reps) => set({ reps })} />
            <NumberField
              label="Sec / rep"
              value={value.secondsPerRep}
              onChange={(secondsPerRep) => set({ secondsPerRep })}
              decimal
              suffix="s"
            />
          </>
        ) : (
          <NumberField
            label="One set"
            value={value.workSeconds}
            onChange={(workSeconds) => set({ workSeconds })}
            suffix="s"
          />
        )}
        <NumberField
          label="Rest between sets"
          value={value.restBetweenSets}
          onChange={(restBetweenSets) => set({ restBetweenSets })}
          suffix="s"
        />
      </div>
    </div>
  )
}
