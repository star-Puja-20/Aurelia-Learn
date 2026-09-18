export const dynamic = 'force-dynamic'
import { Card, CardContent } from '@/components/ui/card'
import { MOCK_TEACHER } from '@/lib/mock-data'
import { MOCK_STUDENTS, MOCK_SESSIONS } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'
import { Users, BookOpen, UserRound } from 'lucide-react'

// In demo mode we have one mock teacher — real app queries profiles table
const TEACHERS = [MOCK_TEACHER]

export default function AdminTeachersPage() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-navy-800">Teachers</h1>
        <p className="text-gray-500 text-sm mt-1">{TEACHERS.length} registered teacher{TEACHERS.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="space-y-4">
        {TEACHERS.map(teacher => {
          const teacherStudents = MOCK_STUDENTS.filter(s => s.teacher_id === teacher.id)
          const teacherSessions = MOCK_SESSIONS.filter(s => s.teacher_id === teacher.id && s.status === 'completed')
          const lastSession = teacherSessions.sort((a, b) =>
            new Date(b.ended_at ?? 0).getTime() - new Date(a.ended_at ?? 0).getTime())[0]
          return (
            <Card key={teacher.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-2xl flex-shrink-0">
                    👩‍🏫
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="font-semibold text-navy-800">{teacher.full_name}</h3>
                        <div className="flex items-center gap-1 text-gray-400 text-sm mt-0.5">
                          <UserRound className="h-3 w-3" />
                          <span>{teacher.username}</span>
                        </div>
                      </div>
                      <span className="text-xs bg-mint-100 text-mint-600 px-2 py-1 rounded-full font-semibold capitalize">
                        Active
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-sky-500 mb-1">
                          <Users className="h-4 w-4" />
                        </div>
                        <p className="font-display text-xl text-navy-800">{teacherStudents.length}</p>
                        <p className="text-xs text-gray-500">Students</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-mint-500 mb-1">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <p className="font-display text-xl text-navy-800">{teacherSessions.length}</p>
                        <p className="text-xs text-gray-500">Sessions</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="font-display text-sm text-navy-800 leading-tight">
                          {lastSession ? formatDate(lastSession.ended_at ?? '', 'relative') : 'No sessions'}
                        </p>
                        <p className="text-xs text-gray-500">Last session</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
