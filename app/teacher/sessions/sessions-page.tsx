'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Play, Plus, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LevelBadge } from '@/components/ui/badge'
import { StudentAvatar } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LEVELS_ORDERED } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { DBSession, DBStudent, LearningLevel } from '@/lib/types'

const STATUS_ICON = {
  completed: <CheckCircle className="h-4 w-4 text-mint-600" />,
  active:    <Play className="h-4 w-4 text-gold-600" />,
  planned:   <Clock className="h-4 w-4 text-sky-500" />,
  cancelled: <XCircle className="h-4 w-4 text-gray-400" />,
}

export default function SessionsPage() {
  const router = useRouter()
  const [newOpen, setNewOpen] = useState(false)
  const [selStudent, setSelStudent] = useState('')
  const [selLevel, setSelLevel] = useState<LearningLevel>('letter')
  const [creating, setCreating] = useState(false)
  const [students, setStudents] = useState<DBStudent[]>([])
  const [sessions, setSessions] = useState<DBSession[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/students').then(response => response.ok ? response.json() : { students: [] }),
      fetch('/api/sessions').then(response => response.ok ? response.json() : { sessions: [] }),
    ]).then(([studentData, sessionData]) => {
      setStudents(studentData.students ?? [])
      setSessions(sessionData.sessions ?? [])
    }).finally(() => setLoaded(true))
  }, [])

  async function handleCreate() {
    if (!selStudent) { toast.error('Choose a student first'); return }
    setCreating(true)
    setNewOpen(false)
    router.push(`/teacher/ai-centre?studentId=${selStudent}&level=${selLevel}`)
    setCreating(false)
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-navy-800">Sessions</h1>
          <p className="text-gray-500 text-sm mt-1">{sessions.length} sessions stored</p>
        </div>
        <Button onClick={() => setNewOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New Session
        </Button>
      </div>

      <div className="space-y-3">
        {!loaded ? <p className="text-center py-16 text-gray-400">Loading session history…</p> : sessions.map((session, i) => {
          const student = students.find(s => s.id === session.student_id)
          if (!student) return null
          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={`/teacher/students/${student.id}?tab=ai-plan`}>
                <Card className="hover:shadow-md transition-all group cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <StudentAvatar emoji={student.avatar_emoji} color={student.avatar_color} name={student.full_name} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy-800 text-sm">{student.full_name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <LevelBadge level={session.level} />
                        <span className="text-xs text-gray-400">{formatDate(session.created_at, 'long')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {STATUS_ICON[session.status]}
                      <span className="text-xs text-gray-500 capitalize">{session.status}</span>
                      {session.quality_rating && (
                        <span className="text-xs text-gold-500 font-bold">{'★'.repeat(session.quality_rating)}</span>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )
        })}
        {loaded && sessions.length === 0 && (
          <Card><CardContent className="py-16 text-center text-gray-400">
            <p className="font-display text-xl mb-2">No session history yet</p>
            <p className="text-sm">Launch a session and accept teacher-reviewed AI feedback to save it here.</p>
          </CardContent></Card>
        )}
      </div>

      {/* New session dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a New Session</DialogTitle>
            <DialogDescription>Choose a student and level. An AI plan will be generated automatically.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Student</label>
              <Select value={selStudent} onValueChange={setSelStudent}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {students.filter(s => s.is_active).map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.avatar_emoji} {s.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Level</label>
              <Select value={selLevel} onValueChange={v => setSelLevel(v as LearningLevel)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEVELS_ORDERED.map(l => (
                    <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} disabled={creating} className="w-full">
              {creating ? 'Creating…' : 'Create Session & Generate AI Plan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
