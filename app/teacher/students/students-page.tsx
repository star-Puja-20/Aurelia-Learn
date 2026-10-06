'use client'
import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Search, UserPlus, Filter, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LevelBadge } from '@/components/ui/badge'
import { StudentAvatar } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, progressColor } from '@/lib/utils'
import { LEVELS_ORDERED } from '@/lib/constants'
import type { DBStudent } from '@/lib/types'

type StudentListItem = DBStudent & { has_pin: boolean }

export default function StudentsPage() {
  const [savedStudents, setSavedStudents] = useState<StudentListItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [showInactive, setShowInactive] = useState(false)
  const [pinStudentId, setPinStudentId] = useState<string | null>(null)
  const [newPin, setNewPin] = useState('')
  const [savingPin, setSavingPin] = useState(false)

  useEffect(() => {
    fetch('/api/students')
      .then(response => response.ok ? response.json() : { students: [] })
      .then(result => setSavedStudents(result.students ?? []))
      .catch(() => setSavedStudents([]))
      .finally(() => setLoaded(true))
  }, [])

  async function savePin(studentId: string) {
    if (!/^\d{6}$/.test(newPin)) {
      toast.error('Choose a PIN with 6 numbers.')
      return
    }
    setSavingPin(true)
    try {
      const response = await fetch('/api/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, pin: newPin }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Unable to update the learner PIN.')
      setSavedStudents((students) => students.map((student) => student.id === studentId ? { ...student, has_pin: true } : student))
      setPinStudentId(null)
      setNewPin('')
      toast.success('Learner PIN updated. Share it privately with the student.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update the learner PIN.')
    } finally {
      setSavingPin(false)
    }
  }

  const allStudents = useMemo(() => {
    const savedCards = savedStudents.map(student => ({
      id: student.id,
      fullName: student.full_name,
      avatarEmoji: student.avatar_emoji,
      avatarColor: student.avatar_color,
      currentLevel: student.current_level,
      has_pin: student.has_pin,
      lastSessionDate: null,
      progressPercent: 0,
      isActive: student.is_active,
    }))
    return savedCards
  }, [savedStudents])

  const filtered = useMemo(() => {
    return allStudents.filter(s => {
      if (!showInactive && !s.isActive) return false
      if (levelFilter !== 'all' && s.currentLevel !== levelFilter) return false
      if (search && !s.fullName.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [allStudents, search, levelFilter, showInactive])

  const active = allStudents.filter(s => s.isActive).length
  const inactive = allStudents.filter(s => !s.isActive).length

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-navy-800">My Students</h1>
          <p className="text-gray-500 text-sm mt-1">
            {active} active · {inactive} inactive
          </p>
        </div>
        <Link href="/teacher/students/new">
          <Button size="lg" className="gap-2">
            <UserPlus className="h-4 w-4" /> Add Student
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-10 rounded-xl border-2 border-gray-200 bg-white text-sm focus:outline-none focus:border-sky-400 transition-colors"
          />
        </div>

        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 text-gray-400 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            {LEVELS_ORDERED.map(level => (
              <SelectItem key={level} value={level} className="capitalize">{level}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          onClick={() => setShowInactive(s => !s)}
          className={`px-4 h-10 rounded-xl border-2 text-sm font-semibold transition-colors ${
            showInactive ? 'border-navy-200 bg-navy-50 text-navy-800' : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          {showInactive ? 'Hide inactive' : 'Show inactive'}
        </button>
      </div>

      {/* Student list */}
      {!loaded ? (
        <div className="text-center py-16 text-gray-400">Loading students…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="font-display text-xl mb-2">No students found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="space-y-3"
        >
          {filtered.map(student => (
            <motion.div
              key={student.id}
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
            >
              <div>
                <Card className={`hover:shadow-md transition-all group cursor-pointer ${!student.isActive ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <StudentAvatar
                        emoji={student.avatarEmoji}
                        color={student.avatarColor}
                        name={student.fullName}
                        size="lg"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/teacher/students/${student.id}`} className="font-semibold text-navy-800 hover:text-sky-600">{student.fullName}</Link>
                          {!student.isActive && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <LevelBadge level={student.currentLevel} />
                          <span className="text-xs text-gray-400">
                            Last session: {student.lastSessionDate ? formatDate(student.lastSessionDate, 'relative') : 'Never'}
                          </span>
                        </div>
                      </div>

                      <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0 min-w-[80px]">
                        <span className="font-bold text-sm" style={{ color: progressColor(student.progressPercent) }}>
                          {student.progressPercent}%
                        </span>
                        <Progress
                          value={student.progressPercent}
                          className="w-20"
                          indicatorColor={progressColor(student.progressPercent)}
                        />
                        <span className="text-xs text-gray-400">progress</span>
                      </div>

                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
                      <span className={`text-xs font-semibold ${student.has_pin ? 'text-mint-600' : 'text-coral-600'}`}>
                        {student.has_pin ? 'Student sign-in is ready' : 'Set a learner PIN to enable sign-in'}
                      </span>
                      <button type="button" onClick={() => { setPinStudentId(pinStudentId === student.id ? null : student.id); setNewPin('') }} className="text-xs font-bold text-sky-600 hover:underline">
                        {student.has_pin ? 'Change PIN' : 'Set PIN'}
                      </button>
                    </div>
                    {pinStudentId === student.id && (
                      <div role="group" aria-label={`Set PIN for ${student.fullName}`} className="mt-3 flex flex-wrap items-end gap-2">
                        <label className="min-w-40 flex-1 text-xs font-bold text-gray-600">New 6 digit PIN
                          <input type="password" inputMode="numeric" autoComplete="new-password" maxLength={6} value={newPin} onChange={(event) => setNewPin(event.target.value.replace(/\D/g, '').slice(0, 6))} className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm tracking-[.3em] outline-none focus:border-sky-400" />
                        </label>
                        <button type="button" disabled={savingPin} onClick={() => void savePin(student.id)} className="h-10 rounded-lg bg-sky-500 px-4 text-xs font-bold text-white disabled:opacity-50">{savingPin ? 'Saving…' : 'Save PIN'}</button>
                        <button type="button" onClick={() => { setPinStudentId(null); setNewPin('') }} className="h-10 rounded-lg px-3 text-xs font-bold text-gray-500">Cancel</button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
