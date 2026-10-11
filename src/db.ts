import Dexie, { type EntityTable } from 'dexie'

// ---------- Data types ----------

export type Mode = 'reps' | 'time'

/** How long one exercise takes: sets × (reps × seconds per rep, or seconds) + rests. */
export interface Timing {
  mode: Mode
  sets: number
  reps: number
  secondsPerRep: number
  workSeconds: number
  restBetweenSets: number
}

export interface Category {
  id: number
  name: string
  order: number
}

export interface Exercise extends Timing {
  id: number
  name: string
  categoryId: number
  description: string
  media?: Blob
  mediaType?: 'image' | 'video'
  isDefault: boolean
  createdAt: number
}

/** An exercise inside a training. It keeps a copy of the name and timing. */
export interface TrainingItem extends Timing {
  exerciseId: number
  name: string
  restAfter: number
}

export interface Training {
  id: number
  name: string
  date: string // YYYY-MM-DD
  tag: string
  description: string
  items: TrainingItem[]
  createdAt: number
  updatedAt: number
}

export const TRAINING_TAGS = [
  'Punches',
  'Kicks',
  'Tactics',
  'Conditioning',
  'Kids (beginners)',
  'Plyometrics',
  'Mixed',
]

// ---------- Database (IndexedDB on the phone) ----------

export const db = new Dexie('karate-training-planner') as Dexie & {
  categories: EntityTable<Category, 'id'>
  exercises: EntityTable<Exercise, 'id'>
  trainings: EntityTable<Training, 'id'>
}

db.version(1).stores({
  categories: '++id, order',
  exercises: '++id, categoryId, name',
  trainings: '++id, date',
})

// ---------- Starter data (added only the first time the app opens) ----------

const reps = (sets: number, repCount: number, secondsPerRep: number, rest: number): Timing => ({
  mode: 'reps',
  sets,
  reps: repCount,
  secondsPerRep,
  workSeconds: 30,
  restBetweenSets: rest,
})

const time = (sets: number, seconds: number, rest: number): Timing => ({
  mode: 'time',
  sets,
  reps: 10,
  secondsPerRep: 2,
  workSeconds: seconds,
  restBetweenSets: rest,
})

const STARTER: { category: string; exercises: [string, string, Timing][] }[] = [
  { category: 'Karate punches', exercises: [
    ['Kizami zuki', 'Front hand punch from fighting stance.', reps(3, 10, 1.5, 30)],
    ['Gyaku zuki', 'Reverse punch with hip rotation.', reps(3, 10, 1.5, 30)],
    ['Kizami + gyaku zuki', 'Combination: front hand, then reverse punch.', reps(3, 8, 2.5, 30)],
  ] },
  { category: 'Karate kicks', exercises: [
    ['Mae geri', 'Front kick, pull the knee up first.', reps(3, 10, 2, 30)],
    ['Mawashi geri', 'Roundhouse kick to the body or head.', reps(3, 10, 2.5, 30)],
    ['Ura mawashi geri', 'Hook kick to the head.', reps(3, 8, 3, 30)],
  ] },
  { category: 'Reaction', exercises: [
    ['Clap reaction', 'Coach claps, kids attack as fast as possible.', time(4, 20, 30)],
    ['Ball drop catch', 'Partner drops a tennis ball, catch it before the second bounce.', reps(3, 10, 2, 30)],
  ] },
  { category: 'Footwork', exercises: [
    ['Stance bouncing', 'Light bouncing in fighting stance.', time(3, 30, 20)],
    ['Step in, step out', 'Quick step forward and back, keep the guard up.', time(3, 30, 20)],
  ] },
  { category: 'Warm-up', exercises: [
    ['Light jogging', 'Easy running around the dojo.', time(1, 180, 0)],
    ['Jumping jacks', 'Keep a steady rhythm.', time(2, 30, 15)],
  ] },
  { category: 'Games', exercises: [
    ['Tail tag', 'Everyone has a belt as a tail, try to catch the others.', time(1, 240, 0)],
    ['Sumo push', 'Push the partner out of the circle.', time(3, 45, 30)],
  ] },
  { category: 'Plyometrics', exercises: [
    ['Box jumps', 'Jump onto a box, step down.', reps(4, 8, 3, 60)],
    ['Skater jumps', 'Side jumps from one leg to the other.', reps(3, 10, 2, 45)],
  ] },
  { category: 'Strength – upper body', exercises: [
    ['Push-ups', 'Body in a straight line.', reps(3, 10, 2, 45)],
    ['Plank', 'Hold, do not drop the hips.', time(3, 30, 30)],
  ] },
  { category: 'Strength – legs', exercises: [
    ['Squats', 'Knees in line with the toes.', reps(3, 15, 2, 45)],
    ['Lunges', 'Alternate legs.', reps(3, 10, 2.5, 45)],
  ] },
  { category: 'Mobility', exercises: [
    ['Hip circles', 'Big circles in both directions.', time(2, 30, 10)],
    ['Ankle mobility', 'Knee over the toes, heel on the floor.', time(2, 30, 10)],
  ] },
  { category: 'Static stretching', exercises: [
    ['Seated forward bend', 'Legs straight, reach for the toes.', time(2, 30, 10)],
    ['Butterfly stretch', 'Soles together, knees down.', time(2, 30, 10)],
  ] },
  { category: 'Dynamic stretching', exercises: [
    ['Leg swings', 'Front and side swings, both legs.', reps(2, 10, 1.5, 15)],
    ['Walking lunge with twist', 'Rotate the upper body over the front leg.', reps(2, 8, 3, 15)],
  ] },
  { category: 'Tactics', exercises: [
    ['Counter-attack drill', 'Partner attacks, answer with a counter.', time(4, 60, 30)],
    ['Distance control', 'Keep the right distance, attack when the partner steps in.', time(3, 60, 30)],
  ] },
  { category: 'Fight situations', exercises: [
    ['Points fight', 'Short fight to points.', time(4, 60, 60)],
    ['Last 10 seconds', 'Losing by one point, 10 seconds left.', time(4, 10, 30)],
  ] },
]

db.on('populate', async (tx) => {
  const categoryIds = (await tx.table('categories').bulkAdd(
    STARTER.map((group, index) => ({ name: group.category, order: index })),
    { allKeys: true },
  )) as number[]

  const now = Date.now()
  const exercises = STARTER.flatMap((group, index) =>
    group.exercises.map(([name, description, timing]) => ({
      name,
      description,
      categoryId: categoryIds[index],
      isDefault: true,
      createdAt: now,
      ...timing,
    })),
  )
  await tx.table('exercises').bulkAdd(exercises)
})
