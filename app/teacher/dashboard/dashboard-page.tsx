'use client'
import React, { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, BookOpen, TrendingUp, Clock, UserPlus, BarChart3, Play, ChevronRight, Brain } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LevelBadge } from '@/components/ui/badge'
import { StudentAvatar } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { useTeacherData } from '@/lib/use-teacher-data'
import { buildDashboardStats, buildStudentCards } from '@/lib/progress'
import { formatDate, progressColor } from '@/lib/utils'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const STAT_CARDS = [
  { label: 'Total Students',     icon: Users,      colorClass: 'text-sky-500',  bg: 'bg-sky-50',  key: 'totalStudents'    as const },
  { label: 'Sessions This Week', icon: BookOpen,   colorClass: 'text-mint-600', bg: 'bg-mint-50', key: 'sessionsThisWeek' as const },
  { label: 'Active Now',         icon: Clock,      colorClass: 'text-gold-600', bg: 'bg-gold-50', key: 'activeSessions'   as const },
  { label: 'Avg. Progress',      icon: TrendingUp, colorClass: 'text-navy-700', bg: 'bg-navy-50', key: 'avgProgress'      as const },
]

const ACTION_CARDS = [
  {
    title: 'Add a Child',
    description: 'Enrol a new student and set their starting level',
    emoji: '🌟',
    href: '/teacher/students/new',
    from: 'from-sky-400',
    to: 'to-sky-600',
  },
  {
    title: 'View Progress',
    description: 'See how each student is growing across all levels',
    emoji: '📈',
    href: '/teacher/progress',
    from: 'from-mint-400',
    to: 'to-mint-600',
  },
  {
    title: 'Start Session',
    description: 'Begin a lesson with an AI-generated plan',
    emoji: '🚀',
    href: '/teacher/sessions',
    from: 'from-coral-400',
    to: 'to-coral-600',
  },
]

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const fadeUp  = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

export default function DashboardPage() {
  const { students, sessions, results, loaded, error } = useTeacherData()
  const allCards = useMemo(() => buildStudentCards(students, sessions, results), [students, sessions, results])
  const stats = useMemo(() => buildDashboardStats(students, sessions, allCards), [students, sessions, allCards])
  const studentCards = allCards.filter(s => s.isActive).slice(0, 5)
  const recentSessions = [...sessions]
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.ended_at ?? b.created_at).getTime() - new Date(a.ended_at ?? a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl text-navy-800">{getGreeting()}! 👋</h1>
        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your students today.</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={stagger} initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(s => {
          const Icon = s.icon
          const value = stats[s.key]
          return (
            <motion.div key={s.key} variants={fadeUp}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`h-5 w-5 ${s.colorClass}`} />
                  </div>
                  <p className="font-display text-3xl text-navy-800">
                    {s.key === 'avgProgress' ? `${value}%` : value}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Action cards — visual heart */}
      <motion.div variants={stagger} initial="hidden" animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {ACTION_CARDS.map(card => (
          <motion.div key={card.title} variants={fadeUp}>
            <Link href={card.href} className="block group">
              <motion.div whileHover={{ y: -5, scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.from} ${card.to} p-6 shadow-md text-white cursor-pointer transition-shadow hover:shadow-xl`}>
                <div className="absolute -right-3 -top-3 text-7xl opacity-20 select-none rotate-12">{card.emoji}</div>
                <div className="relative z-10">
                  <div className="text-3xl mb-3">{card.emoji}</div>
                  <h3 className="font-display text-xl mb-1">{card.title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{card.description}</p>
                  <div className="flex items-center gap-1 mt-4 text-sm font-semibold text-white/90 group-hover:text-white">
                    Get started <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* AI Centre promo */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="mb-8">
        <Link href="/teacher/ai-centre">
          <div className="bg-gradient-to-r from-navy-800 to-navy-700 rounded-2xl p-5 flex items-center justify-between hover:from-navy-700 hover:to-navy-600 transition-colors group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-400/20 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-sky-300" />
              </div>
              <div>
                <p className="font-display text-white text-lg">AI Learning Centre</p>
                <p className="text-white/60 text-sm">Run listening &amp; speaking exercises with AI scoring</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </Link>
      </motion.div>

      {/* Students + sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>My Students</CardTitle>
                <Link href="/teacher/students">
                  <Button variant="ghost" size="sm" className="text-sky-500 gap-1">View all <ChevronRight className="h-3 w-3" /></Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!loaded && <p className="px-6 py-8 text-center text-sm text-gray-400">Loading…</p>}
              {loaded && error && <p className="px-6 py-8 text-center text-sm text-coral-600">Could not load your students. Please refresh.</p>}
              {loaded && !error && studentCards.length === 0 && (
                <div className="px-6 py-8 text-center text-sm text-gray-400">
                  <p className="font-display text-lg text-gray-500 mb-1">No students yet</p>
                  <Link href="/teacher/students/new" className="font-semibold text-sky-500 hover:underline">Add your first student</Link>
                </div>
              )}
              {studentCards.map(s => (
                <Link key={s.id} href={`/teacher/students/${s.id}`} className="block">
                  <div className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <StudentAvatar emoji={s.avatarEmoji} color={s.avatarColor} name={s.fullName} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy-800 text-sm truncate">{s.fullName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <LevelBadge level={s.currentLevel} />
                        <span className="text-xs text-gray-400">{s.lastSessionDate ? formatDate(s.lastSessionDate, 'relative') : 'No sessions'}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold" style={{ color: progressColor(s.progressPercent) }}>{s.progressPercent}%</p>
                      <Progress value={s.progressPercent} className="w-16 mt-1 h-1.5" indicatorColor={progressColor(s.progressPercent)} />
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Sessions</CardTitle>
                <Link href="/teacher/sessions">
                  <Button variant="ghost" size="sm" className="text-sky-500 gap-1">View all <ChevronRight className="h-3 w-3" /></Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loaded && !error && recentSessions.length === 0 && (
                <p className="px-6 py-8 text-center text-sm text-gray-400">No completed sessions yet</p>
              )}
              {recentSessions.map(session => {
                const student = students.find(s => s.id === session.student_id)
                if (!student) return null
                return (
                  <Link key={session.id} href={`/teacher/students/${student.id}`} className="block">
                    <div className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                      <StudentAvatar emoji={student.avatar_emoji} color={student.avatar_color} name={student.full_name} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy-800 text-sm truncate">{student.full_name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <LevelBadge level={session.level} />
                          <span className="text-xs text-gray-400">{formatDate(session.ended_at ?? '', 'relative')}</span>
                        </div>
                      </div>
                      {session.quality_rating && (
                        <span className="text-sm text-gold-500 flex-shrink-0">{'★'.repeat(session.quality_rating)}</span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
