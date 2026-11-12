'use client'
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { LevelBadge } from '@/components/ui/badge'
import { StudentAvatar } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { useTeacherData } from '@/lib/use-teacher-data'
import { buildStudentCards, levelProgress } from '@/lib/progress'
import { progressColor, formatDate } from '@/lib/utils'
import { LEVEL_CONFIG, LEVELS_ORDERED } from '@/lib/constants'

export default function ProgressPage() {
  const { students: rows, sessions, results, loaded, error } = useTeacherData()
  const students = useMemo(() => buildStudentCards(rows, sessions, results).filter(s => s.isActive), [rows, sessions, results])

  // Count students per level
  const byLevel = LEVELS_ORDERED.map(l => ({
    level: l,
    count: students.filter(s => s.currentLevel === l).length,
    config: LEVEL_CONFIG[l],
  }))

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <h1 className="font-display text-3xl text-navy-800 mb-2">Class Progress</h1>
      <p className="text-gray-500 text-sm mb-8">{students.length} active students</p>

      {/* Level distribution */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        {byLevel.map(({ level, count, config }) => (
          <Card key={level} className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl mb-1">{config.icon}</div>
              <p className="font-display text-2xl text-navy-800">{count}</p>
              <p className="text-xs text-gray-500 capitalize">{level}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loaded && <p className="text-center py-10 text-gray-400">Loading progress…</p>}
      {loaded && error && <p className="text-center py-10 text-coral-600">Could not load progress. Please refresh.</p>}
      {loaded && !error && students.length === 0 && (
        <Card><CardContent className="py-12 text-center text-gray-400">
          <p className="font-display text-lg mb-1">No active students yet</p>
          <p className="text-sm">Progress appears here once you add students and complete activities.</p>
        </CardContent></Card>
      )}

      {/* Student progress rows */}
      <div className="space-y-3">
        {students.map((student, i) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <StudentAvatar emoji={student.avatarEmoji} color={student.avatarColor} name={student.fullName} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-navy-800 text-sm">{student.fullName}</p>
                    <LevelBadge level={student.currentLevel} />
                  </div>
                  <Progress
                    value={student.progressPercent}
                    indicatorColor={progressColor(student.progressPercent)}
                    className="h-2"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    {(() => { const lp = levelProgress(results.filter(r => r.student_id === student.id), student.currentLevel); return `${lp.completedSets} of ${lp.totalSets} activities passed at this level` })()}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 min-w-[60px]">
                  <p className="font-bold text-lg" style={{ color: progressColor(student.progressPercent) }}>
                    {student.progressPercent}%
                  </p>
                  <p className="text-xs text-gray-400">
                    {student.lastSessionDate ? formatDate(student.lastSessionDate, 'relative') : 'No sessions'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
