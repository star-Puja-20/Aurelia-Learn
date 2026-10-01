'use client'

import { useEffect, useState } from 'react'
import { Shield, ShieldCheck, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type TeacherAccount = {
  id: string
  username: string
  full_name: string
  role: 'teacher' | 'administrator'
  created_at: string
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<TeacherAccount[]>([])
  const [currentUserId, setCurrentUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState('')

  useEffect(() => {
    fetch('/api/admin/teachers')
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error ?? 'Unable to load teacher accounts')
        setTeachers(data.teachers ?? [])
        setCurrentUserId(data.currentUserId ?? '')
      })
      .catch(error => toast.error(error instanceof Error ? error.message : 'Unable to load teacher accounts'))
      .finally(() => setLoading(false))
  }, [])

  async function changeRole(teacher: TeacherAccount) {
    const role = teacher.role === 'administrator' ? 'teacher' : 'administrator'
    setUpdatingId(teacher.id)
    try {
      const response = await fetch('/api/admin/teachers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: teacher.id, role }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Unable to update account access')
      setTeachers(current => current.map(item => item.id === teacher.id ? { ...item, role } : item))
      toast.success(`${teacher.full_name || teacher.username} is now ${role === 'administrator' ? 'an administrator' : 'a teacher'}.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update account access')
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl text-navy-800">Teachers &amp; access</h1>
        <p className="mt-1 text-sm text-gray-500">{teachers.length} account{teachers.length === 1 ? '' : 's'}</p>
      </header>

      {loading ? (
        <p className="py-12 text-center text-sm text-gray-500">Loading accounts…</p>
      ) : teachers.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">No teacher accounts found.</p>
      ) : (
        <div className="space-y-3">
          {teachers.map(teacher => {
            const isCurrentUser = teacher.id === currentUserId
            const isAdmin = teacher.role === 'administrator'
            return (
              <Card key={teacher.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isAdmin ? 'bg-gold-100 text-gold-700' : 'bg-sky-100 text-sky-700'}`}>
                      {isAdmin ? <ShieldCheck className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy-800">{teacher.full_name || teacher.username}</p>
                      <p className="text-sm text-gray-500">@{teacher.username}{isCurrentUser ? ' · You' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${isAdmin ? 'border-gold-200 bg-gold-50 text-gold-700' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                      {isAdmin ? 'Administrator' : 'Teacher'}
                    </span>
                    <Button
                      variant={isAdmin ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => changeRole(teacher)}
                      disabled={updatingId === teacher.id || (isCurrentUser && isAdmin)}
                      aria-label={`${isAdmin ? 'Remove administrator access from' : 'Make'} ${teacher.full_name || teacher.username}`}
                      title={isCurrentUser && isAdmin ? 'You cannot remove your own administrator access' : undefined}
                    >
                      {isAdmin ? <><Shield className="h-4 w-4" /> Revoke</> : <><ShieldCheck className="h-4 w-4" /> Make admin</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
