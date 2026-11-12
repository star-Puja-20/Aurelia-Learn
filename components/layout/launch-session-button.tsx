'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, Loader2, Play } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { DBStudent } from '@/lib/types'

export function LaunchSessionButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [students, setStudents] = useState<DBStudent[]>([])
  const [studentId, setStudentId] = useState('')
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (!open) return
    fetch('/api/students')
      .then(response => response.ok ? response.json() : { students: [] })
      .then(result => setStudents(result.students ?? []))
      .catch(() => setStudents([]))
  }, [open])

  // Creates an active session for the chosen student and opens the learning screen for them.
  async function launch() {
    const student = students.find(item => item.id === studentId)
    if (!student) return
    setStarting(true)
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          level: student.current_level,
          status: 'active',
          startedAt: new Date().toISOString(),
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Unable to start the session')
      setOpen(false)
      router.push(`/student/learn?studentId=${student.id}&sessionId=${result.session.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to start the session')
    } finally {
      setStarting(false)
    }
  }

  function planWithAI() {
    if (!studentId) return
    setOpen(false)
    router.push(`/teacher/ai-centre?studentId=${studentId}`)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Play className="h-4 w-4 fill-current" /> Launch Session
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Launch a session</DialogTitle>
            <DialogDescription>Choose the student who will work in this session.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {students.length === 0 ? (
              <p className="text-sm text-gray-500">Add a student before launching a session.</p>
            ) : (
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger><SelectValue placeholder="Choose a student" /></SelectTrigger>
                <SelectContent>
                  {students.filter(student => student.is_active).map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.avatar_emoji} {student.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button onClick={launch} disabled={!studentId || students.length === 0 || starting} className="w-full gap-2">
              {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />} Start learning session
            </Button>
            <Button variant="outline" onClick={planWithAI} disabled={!studentId || students.length === 0} className="w-full gap-2">
              <Brain className="h-4 w-4" /> Plan with the AI Centre
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
