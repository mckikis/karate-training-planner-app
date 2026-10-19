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
  startTime?: string // HH:MM, e.g. "17:00"
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
  { category: 'Rozcvička', exercises: [
    ['Rozklus a atletická abeceda', 'Rozklus, atletická abeceda - nízky, stredný, vysoký skipping, bočný cval, bojový postoj, predkopávanie, zakopávanie.', time(1, 180, 0)],
    ['Zvieratá', 'Žaba, kačka, pavúk, opica, gorila, preskoky do strán.', time(2, 30, 15)],
    ['Akrobácia', 'Kotúľ vpred, vzad, pády na zem', time(4, 30, 15)],
    ['Rozudieranie', '', time(4, 30, 15)],
    ['Rozkopanie', '', time(4, 30, 15)],
  ] },

  { category: 'Dynamický strečing', exercises: [
    ['Leg swings', 'Rovné a bočné výkopy nôh o stenu.', reps(2, 10, 1.5, 15)],
    ['Hamstringové príťahy', '', reps(2, 10, 1.5, 15)],
    ['Výpad s pretočením do bočného výpadu', '', reps(2, 8, 3, 15)],
    ['Pozdrav slnku', 'Preručkujem do pozície psa, prejdem do striešky, nohami prídem k rukám.', reps(2, 8, 3, 15)],
    ['Nohy kopy rozcvička', '', reps(2, 8, 3, 15)],
  ] },

  { category: 'Údery - karate', exercises: [
    ['Kizami zuki', 'Úder prednou rukou.', reps(3, 10, 1.5, 30)],
    ['Gyaku zuki', 'Úder zadnou rukou na hlavu/brucho.', reps(3, 10, 1.5, 30)],
    ['Kizami+gyaku zuki', 'Klasické Kizami+gyaku.', reps(3, 8, 2.5, 30)],
    ['1,2 na prednej nohe', 'Kizami+gyaku na prednej nohe, japonský štýl.', reps(3, 8, 2.5, 30)],
    ['Hodené gyaku', 'Stiahnutie prednej ruky, následný úder s prekrokom zadnej nohy.', reps(3, 8, 2.5, 30)],
    ['Prekročené gyaku', 'Hodené gyaku zuki+gyaku zuki z opačného garde.', reps(3, 8, 2.5, 30)],
    ['Kizami - úhyb + kontra', '', reps(3, 10, 1.5, 30)],
    ['Hodené - úhyb + kontra', '', reps(3, 10, 1.5, 30)],
    ['Úder - diai', '', reps(3, 10, 1.5, 30)],
    ['Diai + druhá vlna', '', reps(3, 10, 1.5, 30)],
    ['Cukačka + úhyb + úder ', '', reps(3, 10, 1.5, 30)],
    ['Doprava + nástup', 'Hodené, kizami, giaku..', reps(3, 10, 1.5, 30)],
    ['Doľava + nástup', 'Prekročené, kizami..', reps(3, 10, 1.5, 30)],
  ] },

  { category: 'Kopy - karate', exercises: [
    ['Mawashi geri', '', reps(3, 10, 2.5, 30)],
    ['Mawashi + ushiro ura', 'Alebo ushiro mawashi.', reps(3, 10, 2.5, 30)],
    ['Ura mawashi geri', '', reps(3, 8, 3, 30)],
    ['Yoko geri + ura', '', reps(3, 10, 2, 30)],
    ['Kopy na lapy', '', reps(3, 10, 2, 30)],
    ['Mawashi - úhyb + kontra', 'Čudan alebo džodan', reps(3, 10, 1.5, 30)],
    ['Mawashi spam - úhyb + kontra', '', reps(3, 10, 1.5, 30)],
    ['Kopy z klinča', '', reps(3, 10, 1.5, 30)],
    ['Kop diai', '', reps(3, 10, 1.5, 30)],
    ['Doprava + kop', '', reps(3, 10, 1.5, 30)],
    ['Doľava + kop', '', reps(3, 10, 1.5, 30)],
  ] },


  { category: 'Kombinácie - karate', exercises: [
    ['Kizami + ura', '', reps(3, 10, 2.5, 30)],
    ['Mawashi čudan + úder', '', reps(3, 10, 2.5, 30)],
    ['Hodené + podkýnačka', '', reps(3, 8, 3, 30)],
  ] },

  { category: 'Podkýnačky - karate', exercises: [
    ['Kizami + ura + podkýnačka', '', reps(3, 10, 2.5, 30)],
    ['Mawashi chytím + podkýnačka', '', reps(3, 10, 2.5, 30)],
    ['Hodené + podkýnačka', '', reps(3, 8, 3, 30)],
    ['Kizami + úhyb + podkýnačka', 'Súper robí kizami, druhý na uhne, v klinči spraví ashi barai.', reps(3, 10, 2.5, 30)],
  ] },

  { category: 'Reakcia', exercises: [
    ['Chytanie loptičiek', 'Sparingpartner pustí loptičku z jednej, druhej alebo oboch rúk naraz -> chytenie loptičiek.', time(4, 20, 30)],
    ['Nástupy na znamenie', 'Sparingpartner ukáže rukou na časť tela, musí udrieť alebo kopnúť na danú časť.', reps(3, 10, 2, 30)],
    ['Chytanie rúk', '', reps(3, 10, 2, 30)],
  ] },

  { category: 'Pohyb a obrana', exercises: [
    ['Tlak ruky vpred', 'Jeden tlačí do druhého s vystretými rukami, druhý sa hýbe, medzitým údery/uhýbačky.', time(4, 30, 15)],
    ['Vzdialenosť', 'Jeden udáva vzialenosť pohybom, druhý ho nasleduje.', time(4, 30, 15)],
    ['Bloky na mieste', 'Jeden útočí, druhý blokuje nástupy na mieste.', time(4, 30, 15)],
  ] },

  { category: 'Zápasové situácie', exercises: [
    ['Zápas', '', time(4, 45, 30)],
    ['Diaisti a útočníci', '', time(4, 60, 60)],
    ['Útočníci a obrancovia', '', time(4, 60, 60)],
    ['15 sekúnd do konca', '', time(8, 15, 10)],
    ['Hansoku chui', '', time(4, 15, 30)],
    ['Úder + diai noha', 'Druhý medzitým zatlačí.', time(4, 15, 30)],
  ] },

  { category: 'Taktika', exercises: [
    ['Natlačenie z rohu', 'Natlačím sa na súpera, nástup.', time(4, 45, 30)],
    ['Pohyb v rohoch', 'Pohyb z rohu do rohu, medzitým nástup.', time(4, 45, 30)],
    ['Vylákanie nástupu', 'Vylákam súpera aby zaútočil, reagujem na jeho úder.', time(4, 45, 30)],
  ] },

  { category: 'Hry', exercises: [
    ['Mrázik', 'Chytení hráči stoja v shiko-dachi, môžu byť vyslobodení podlezením nôh.', time(1, 240, 0)],
    ['Gargamel a šmolkovia', 'Gargamel chytá hráčov kužeľkou, víla môže vyslobodiť chytených šmolkov krúžkom tak, že ho musia preliezť.', time(1, 240, 0)],
    ['Chytanie nôh', 'Hráči chcú chytiť druhým hráčom nohu, tí musia spraviť 3 angličáky a tak môžu pokračovať v hre.', time(1, 240, 0)],
    ['Kužeľky', 'Hráči rozedelení do tímov alebo jednotlivo, musia pozbierať čo najviac kuželiek (po jednej).', time(1, 240, 0)],
    ['Paličky', 'Hráči stoja do kruhu pri paličkách, na povel musia chytiť paličku vedľa seba.', time(1, 240, 0)],
    ['Sumo push', 'Vytlačiť hráča von z kruhu.', time(3, 30, 30)],
    ['Preskakovanie kamaráta', 'Jeden hráč leží na čiare, druhý ho preskočí a ľahne si na najbližiu čiaru, opakujeme.', time(1, 120, 30)],
  ] },

  { category: 'Plyometria', exercises: [
    ['Výskoky na bedňu', '', reps(4, 8, 3, 60)],
    ['Korčuľovanie', 'Plynulé skoky do strán', reps(3, 10, 2, 45)],
    ['Skoky do diaľky', '', reps(3, 10, 2, 45)],
    ['Preskakovanie prekážok', '', reps(3, 10, 2, 45)],
    ['Frekvenčný rebrík', '', reps(3, 10, 2, 45)],
    ['Séza + skoky do diaľky', 'Plynulé skoky do strán', reps(3, 10, 2, 45)],
    ['Zoskok z bedne', 'Zoskok do stabilnej polohy + skoky do diaľky.', reps(4, 8, 3, 60)],
  ] },

  { category: 'Mobilita', exercises: [
    ['Hip circles', 'Big circles in both directions.', time(2, 30, 10)],
    ['Ankle mobility', 'Knee over the toes, heel on the floor.', time(2, 30, 10)],
  ] },

  { category: 'Silové - vrch', exercises: [
    ['Kliky', '', reps(3, 10, 2, 45)],
    ['TRX príťahy', '', time(3, 30, 30)],
    ['Tricepsové dipy', '', time(3, 30, 30)],
  ] },

  { category: 'Silové - nohy', exercises: [
    ['Drepy', '', reps(3, 15, 2, 45)],
    ['Sisi drepy', '', reps(3, 15, 2, 45)],
    ['Shiko-dachi repy', '', reps(3, 15, 2, 45)],
    ['Výpady', '', reps(3, 10, 2.5, 45)],
    ['Copenhagen plank', '', reps(3, 10, 2, 45)],
  ] },

  { category: 'Core', exercises: [
    ['Plank', '', reps(3, 10, 2, 45)],
    ['Bočný plank', '', reps(3, 10, 2, 45)],
    ['Horolezec', '', reps(3, 15, 2, 45)],
    ['Russian twist', 'Premiestňujem závažie z jednej strany na druhú, nohy sú nad zemou.', reps(3, 10, 2, 45)],
    ['Medveď', 'Na 4, kolená sú nad zemou, prehadzujem loptičku z jednej do druhej ruky.', time(3, 30, 30)],
  ] },

  { category: 'Statický strečing', exercises: [
    ['Špagát', '', time(2, 30, 10)],
    ['Prekážkový sed', '', time(2, 30, 10)],
    ['Shiko-dachi', '', time(2, 30, 10)],
    ['Shiko-dachi na zemi', '', time(2, 30, 10)],
    ['Motýlik', '', time(2, 30, 10)],
    ['Pigeon', '', time(2, 30, 10)],
    ['Predklon v sede', '', time(2, 30, 10)],
    ['Ježiško', '', time(2, 30, 10)],
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
