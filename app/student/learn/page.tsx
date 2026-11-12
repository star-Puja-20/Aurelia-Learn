'use client'
import React, { Suspense, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, Home, Lock } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { LEVEL_CONFIG, LEVELS_ORDERED } from '@/lib/constants'
import { EXERCISE_SETS, LEARN_TITLES, SKILLS, SKILL_LABELS, learnSetId, setById, type ResultSkill } from '@/lib/exercises'
import { starsForScore } from '@/lib/answer-check'
import { bestScoreBySet, PASS_SCORE } from '@/lib/progress'
import { isUuid } from '@/lib/input-validation'
import type { DBExerciseResult, DBStudent, LearningLevel } from '@/lib/types'
import { CompleteScreen } from '@/components/learn/shared'
import { DialogueExercise, LetterExercise, SentenceExercise, StoryExercise, WordExercise } from '@/components/learn/learn-activities'
import { ExerciseRunner } from '@/components/learn/exercise-runner'

type View = 'levels' | 'sets' | 'run' | 'complete'
interface ActiveSet { id: string; skill: ResultSkill }

const LEARN_COMPONENTS: Record<LearningLevel, React.ComponentType<{ onDone: (stars: number) => void }>> = {
  letter: LetterExercise,
  word: WordExercise,
  sentence: SentenceExercise,
  story: StoryExercise,
  conversation: DialogueExercise,
}

function starsLabel(score: number | undefined) {
  if (score === undefined) return ''
  return '★'.repeat(starsForScore(score)) + (score >= PASS_SCORE ? '' : ' (try again)')
}

function LearnContent() {
  const router = useRouter()
  const params = useSearchParams()
  const rawStudentId = params.get('studentId')
  const rawSessionId = params.get('sessionId')
  const studentId = isUuid(rawStudentId) ? rawStudentId : null
  const sessionId = isUuid(rawSessionId) ? rawSessionId : null

  const [student, setStudent] = useState<DBStudent | null>(null)
  const [results, setResults] = useState<DBExerciseResult[]>([])
  const [view, setView] = useState<View>('levels')
  const [level, setLevel] = useState<LearningLevel>('letter')
  const [active, setActive] = useState<ActiveSet | null>(null)
  const [stars, setStars] = useState(0)

  useEffect(() => {
    if (!studentId) return
    fetch('/api/students')
      .then(response => response.ok ? response.json() : { students: [] })
      .then(data => {
        const found = (data.students ?? []).find((item: DBStudent) => item.id === studentId) ?? null
        setStudent(found)
        if (found) setLevel(found.current_level)
      })
      .catch(() => setStudent(null))
    fetch(`/api/exercise-results?studentId=${studentId}`)
      .then(response => response.ok ? response.json() : { results: [] })
      .then(data => setResults(data.results ?? []))
      .catch(() => setResults([]))
  }, [studentId])

  const unlockedIndex = student ? LEVELS_ORDERED.indexOf(student.current_level) : LEVELS_ORDERED.length - 1
  const best = bestScoreBySet(results)

  async function saveResult(set: ActiveSet, correct: number, total: number, score: number) {
    if (!studentId) return
    try {
      const response = await fetch('/api/exercise-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, sessionId, level, skill: set.skill, exerciseId: set.id, score, correct, total }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error()
      setResults(current => [data.result, ...current])
    } catch {
      toast.error('This result could not be saved.')
    }
  }

  function finishSet(correct: number, total: number) {
    if (!active) return
    const score = Math.round((correct / total) * 100)
    setStars(starsForScore(score))
    void saveResult(active, correct, total, score)
    setView('complete')
  }

  async function exitSession() {
    if (sessionId) {
      try {
        await fetch('/api/sessions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, status: 'completed', endedAt: new Date().toISOString() }),
        })
      } catch { /* the session is treated as finished after a few hours anyway */ }
    }
    router.push(studentId ? `/teacher/students/${studentId}` : '/teacher/dashboard')
  }

  function open(set: ActiveSet) {
    setActive(set)
    setView('run')
  }

  const LearnComponent = LEARN_COMPONENTS[level]
  const exerciseSet = active && active.skill !== 'learn' ? setById(active.id) : undefined

  function topBarAction() {
    if (view === 'levels') return void exitSession()
    if (view === 'sets') return setView('levels')
    setView('sets')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-500 to-sky-700 flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 shrink-0">
        <button onClick={topBarAction}
          className="text-white/80 hover:text-white flex items-center gap-1 text-sm font-semibold transition-colors">
          {view === 'levels' ? <><Home className="h-4 w-4" /> Exit</> : <><ChevronLeft className="h-4 w-4" /> {view === 'sets' ? 'Levels' : 'Menu'}</>}
        </button>
        <div className="flex items-center gap-1.5 text-white font-display text-lg">
          <Star className="h-5 w-5 fill-gold-400 text-gold-400" /> Aurelia Learn
        </div>
        <div className="w-16" />
      </div>

      {!studentId && (
        <p className="mx-5 mb-1 rounded-xl bg-white/15 px-3 py-2 text-center text-xs text-white">
          Practice mode: results are not saved. Launch a session from a student to record progress.
        </p>
      )}

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {view === 'levels' && (
              <motion.div key="levels" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center gap-5">
                <div className="text-center">
                  <div className="text-5xl mb-2">⭐</div>
                  <h1 className="font-display text-3xl text-white drop-shadow">
                    {student ? `Hi ${student.full_name.split(' ')[0]}!` : 'What shall we learn?'}
                  </h1>
                  <p className="text-sky-100 text-sm mt-1 font-semibold">Choose a level</p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full">
                  {LEVELS_ORDERED.map((key, index) => {
                    const locked = index > unlockedIndex
                    const config = LEVEL_CONFIG[key]
                    return (
                      <motion.button key={key} type="button" whileTap={{ scale: locked ? 1 : 0.95 }} disabled={locked}
                        onClick={() => { setLevel(key); setView('sets') }}
                        aria-label={locked ? `${config.label} (locked)` : config.label}
                        className={`p-5 rounded-2xl shadow-lg text-center ${locked ? 'bg-white/20 text-white/60' : 'bg-white text-navy-800'} ${index === 4 ? 'col-span-2' : ''}`}>
                        <div className="text-4xl mb-1">{locked ? <Lock className="h-9 w-9 mx-auto" /> : config.icon}</div>
                        <p className="font-display text-lg">{config.label}</p>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {view === 'sets' && (
              <motion.div key="sets" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                className="space-y-4">
                <h2 className="font-display text-2xl text-white drop-shadow text-center">{LEVEL_CONFIG[level].icon} {LEVEL_CONFIG[level].label}</h2>
                <button type="button" onClick={() => open({ id: learnSetId(level), skill: 'learn' })}
                  className="w-full flex items-center justify-between gap-3 bg-white rounded-2xl px-4 py-3 shadow-md text-left">
                  <span className="font-display text-navy-800">{LEARN_TITLES[level].emoji} {LEARN_TITLES[level].title}</span>
                  <span className="text-xs font-semibold text-gold-600">{starsLabel(best.get(learnSetId(level)))}</span>
                </button>
                {SKILLS.map(skill => (
                  <div key={skill}>
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-white/80">{SKILL_LABELS[skill].emoji} {SKILL_LABELS[skill].label}</p>
                    <div className="space-y-2">
                      {EXERCISE_SETS.filter(s => s.level === level && s.skill === skill).map(s => (
                        <button key={s.id} type="button" onClick={() => open({ id: s.id, skill })}
                          className="w-full flex items-center justify-between gap-3 bg-white/95 rounded-2xl px-4 py-3 shadow-md text-left hover:bg-white">
                          <span className="font-semibold text-navy-800 text-sm">{s.emoji} {s.title}</span>
                          <span className="text-xs font-semibold text-gold-600">{starsLabel(best.get(s.id))}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {view === 'run' && active && (
              <motion.div key={`run-${active.id}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                className="flex flex-col items-center">
                <h2 className="font-display text-xl text-white drop-shadow text-center mb-4">
                  {active.skill === 'learn' ? `${LEARN_TITLES[level].emoji} ${LEARN_TITLES[level].title}` : `${exerciseSet?.emoji} ${exerciseSet?.title}`}
                </h2>
                {active.skill === 'learn'
                  ? <LearnComponent onDone={starCount => finishSet(starCount, 3)} />
                  : exerciseSet && <ExerciseRunner set={exerciseSet} onDone={({ correct, total }) => finishSet(correct, total)} />}
              </motion.div>
            )}

            {view === 'complete' && (
              <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CompleteScreen stars={stars} onHome={() => setView('sets')} onRetry={() => setView('run')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default function StudentLearnPage() {
  return (
    <Suspense fallback={null}>
      <LearnContent />
    </Suspense>
  )
}
