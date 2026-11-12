export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { LEVEL_CONFIG, LEVELS_ORDERED } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import { LevelBadge } from '@/components/ui/badge'
import { StudentAvatar } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, TrendingUp, School } from 'lucide-react'
import type { LearningLevel, SessionStatus } from '@/lib/types'

interface RecentSession {
  id: string
  level: LearningLevel
  status: SessionStatus
  created_at: string
  students: { full_name: string; avatar_emoji: string; avatar_color: string } | null
}

export default async function AdminDashboard() {
  // The administrator read policies in the database allow these platform-wide counts.
  const supabase = await createClient()
  const [studentRows, totalSessionsResult, completedSessionsResult, recentResult] = await Promise.all([
    supabase.from('students').select('current_level, is_active').limit(10000),
    supabase.from('sessions').select('id', { count: 'exact', head: true }),
    supabase.from('sessions').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase
      .from('sessions')
      .select('id, level, status, created_at, students(full_name, avatar_emoji, avatar_color)')
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const students = studentRows.data ?? []
  const totalStudents = students.length
  const activeStudents = students.filter(s => s.is_active).length
  const totalSessions = totalSessionsResult.count ?? 0
  const completedSessions = completedSessionsResult.count ?? 0
  const recentSessions = (recentResult.data ?? []) as unknown as RecentSession[]
  const loadFailed = !!(studentRows.error || recentResult.error)

  const byLevel = LEVELS_ORDERED.map(l => ({
    ...LEVEL_CONFIG[l],
    count: students.filter(s => s.current_level === l).length,
  }))

  const stats = [
    { label: 'Total Students', value: totalStudents, icon: Users, color: '#4FC3F7', bg: '#E1F5FE' },
    { label: 'Active Students', value: activeStudents, icon: School, color: '#43A047', bg: '#F1F8E9' },
    { label: 'Total Sessions', value: totalSessions, icon: BookOpen, color: '#FFB300', bg: '#FFFDE7' },
    { label: 'Completed Sessions', value: completedSessions, icon: TrendingUp, color: '#1A237E', bg: '#E8EAF6' },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-navy-800">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform-wide overview — read-only access</p>
      </div>

      {loadFailed && (
        <p role="alert" className="mb-6 rounded-xl bg-coral-50 px-4 py-3 text-sm text-coral-600">Some figures could not be loaded. Please refresh.</p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: s.bg }}>
                  <Icon className="h-5 w-5" style={{ color: s.color }} />
                </div>
                <p className="font-display text-3xl text-navy-800">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Students by Level</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {byLevel.map(l => (
              <div key={l.key} className="flex items-center gap-3">
                <span className="text-xl w-7">{l.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold capitalize text-navy-800">{l.label}</span>
                    <span className="text-gray-500">{l.count} students</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${totalStudents ? (l.count / totalStudents) * 100 : 0}%`, backgroundColor: l.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Sessions</CardTitle></CardHeader>
          <CardContent className="p-0">
            {recentSessions.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-gray-400">No sessions yet</p>
            )}
            {recentSessions.map(session => (
              <div key={session.id} className="flex items-center gap-3 px-6 py-3 border-b border-gray-50 last:border-0">
                <StudentAvatar
                  emoji={session.students?.avatar_emoji ?? '⭐'}
                  color={session.students?.avatar_color ?? '#4FC3F7'}
                  name={session.students?.full_name ?? 'Student'}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy-800 truncate">{session.students?.full_name ?? 'Student'}</p>
                  <p className="text-xs text-gray-400">{formatDate(session.created_at, 'relative')}</p>
                </div>
                <LevelBadge level={session.level} />
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
                  session.status === 'completed' ? 'bg-mint-100 text-mint-600' :
                  session.status === 'planned' ? 'bg-sky-100 text-sky-600' :
                  'bg-gray-100 text-gray-500'
                }`}>{session.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
