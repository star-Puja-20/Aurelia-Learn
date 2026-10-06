'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Clock3, Sparkles, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { LevelBadge } from '@/components/ui/badge'
import { StudentAvatar } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { formatDate, progressColor } from '@/lib/utils'
import { LEVEL_CONFIG, LEVELS_ORDERED } from '@/lib/constants'
import type { LearningLevel } from '@/lib/types'

type StudentProgress = {
  id: string
  full_name: string
  current_level: LearningLevel
  avatar_emoji: string
  avatar_color: string
  accuracy: number | null
  gameCount: number
  minutesSpent: number
  weakArea: string | null
  suggestion: string
  lastPlayedAt: string | null
  profile: {
    completed_levels: number
    streak_days: number
  }
}

export default function ProgressPage() {
  const [students, setStudents] = useState<StudentProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetch('/api/teacher/game-progress')
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error ?? 'Unable to load student progress.')
        return result as { students: StudentProgress[] }
      })
      .then((result) => { if (active) setStudents(result.students) })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load student progress.')
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [])

  const totalCompleted = students.reduce((sum, student) => sum + student.profile.completed_levels, 0)
  const scoreCount = students.filter((student) => student.accuracy !== null)
  const averageAccuracy = scoreCount.length
    ? Math.round(scoreCount.reduce((sum, student) => sum + (student.accuracy ?? 0), 0) / scoreCount.length)
    : 0
  const totalMinutes = students.reduce((sum, student) => sum + student.minutesSpent, 0)
  const byLevel = useMemo(() => LEVELS_ORDERED.map((level) => ({
    level,
    count: students.filter((student) => student.current_level === level).length,
    config: LEVEL_CONFIG[level],
  })), [students])

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      <h1 className="mb-2 font-display text-3xl text-navy-800">Learning progress</h1>
      <p className="mb-7 text-sm text-gray-500">Each learner&apos;s games, growth, and suggested next steps · {students.length} active students</p>

      {error && <div role="alert" className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

      <div className="mb-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { title: 'Levels completed', value: totalCompleted, caption: 'Across the class', icon: BookOpen, color: 'text-sky-600', background: 'bg-sky-50' },
          { title: 'Average accuracy', value: `${averageAccuracy}%`, caption: `${students.reduce((sum, student) => sum + student.gameCount, 0)} game rounds`, icon: Target, color: 'text-mint-600', background: 'bg-mint-50' },
          { title: 'Time in teacher sessions', value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`, caption: 'Recorded session time', icon: Clock3, color: 'text-gold-600', background: 'bg-gold-50' },
          { title: 'Practice games', value: students.reduce((sum, student) => sum + student.gameCount, 0), caption: 'Rounds played across the class', icon: Sparkles, color: 'text-violet-600', background: 'bg-violet-50' },
        ].map(({ title, value, caption, icon: Icon, color, background }) => (
          <Card key={title}>
            <CardContent className="p-4 sm:p-5">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${background}`}><Icon className={`h-5 w-5 ${color}`} /></div>
              <p className="font-display text-2xl text-navy-800">{value}</p>
              <p className="mt-0.5 text-xs font-bold text-gray-600">{title}</p>
              <p className="mt-1 text-[11px] leading-4 text-gray-400">{caption}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {byLevel.map(({ level, count, config }) => (
          <Card key={level} className="text-center">
            <CardContent className="p-4">
              <div className="mb-1 text-2xl">{config.icon}</div>
              <p className="font-display text-2xl text-navy-800">{count}</p>
              <p className="text-xs capitalize text-gray-500">{level}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-2"><Sparkles className="h-4 w-4 text-gold-500" /><h2 className="font-display text-xl text-navy-800">Student progress &amp; next steps</h2></div>

      {loading ? <div className="py-12 text-center text-sm text-gray-400">Loading each learner&apos;s progress…</div> :
        !students.length && !error ? <Card><CardContent className="p-6 text-sm leading-6 text-gray-500">Add a student to your class, give them a learner PIN, and they can sign in at the student portal. Their game progress will appear here.</CardContent></Card> :
          <div className="space-y-3">
            {students.map((student, index) => {
              const percent = Math.min(100, Math.round((student.profile.completed_levels / 24) * 100))
              return (
                <motion.div key={student.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                  <Card>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <StudentAvatar emoji={student.avatar_emoji} color={student.avatar_color} name={student.full_name} />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-navy-800">{student.full_name}</p><LevelBadge level={student.current_level} /></div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span>{student.profile.completed_levels} levels completed</span>
                            <span>Accuracy: {student.accuracy === null ? 'Play a game to measure' : `${student.accuracy}%`}</span>
                            <span>{student.profile.streak_days} day learning streak</span>
                            <span>{student.lastPlayedAt ? `Last played ${formatDate(student.lastPlayedAt, 'relative')}` : 'Not played yet'}</span>
                          </div>
                          <Progress value={percent} indicatorColor={progressColor(percent)} className="mt-3 h-2" />
                        </div>
                        <div className="hidden text-right sm:block"><p className="text-lg font-bold" style={{ color: progressColor(percent) }}>{percent}%</p><p className="text-xs text-gray-400">game map</p></div>
                      </div>
                      <div className="ml-[3.25rem] mt-4 flex flex-col gap-2 rounded-xl bg-[#f7faf8] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div><p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400">{student.weakArea ? `Practice focus · ${student.weakArea}` : 'Suggested next step'}</p><p className="mt-1 text-xs font-semibold text-gray-600">{student.suggestion}</p></div>
                        <span className="shrink-0 text-xs text-gray-400">Teacher-session time: {student.minutesSpent} min</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>}
    </div>
  )
}
