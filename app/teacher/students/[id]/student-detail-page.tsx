'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit3, Plus, Star, Brain, Save, Loader2, TrendingUp, Check } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LevelBadge } from '@/components/ui/badge'
import { StudentAvatar } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MOCK_STUDENTS, MOCK_SESSIONS, MOCK_NOTES, MOCK_PROGRESS } from '@/lib/mock-data'
import { formatDate, progressColor } from '@/lib/utils'
import { LEVEL_CONFIG, LEVELS_ORDERED } from '@/lib/constants'
import { AVATAR_EMOJIS, AVATAR_COLORS } from '@/lib/constants'
import { toast } from 'sonner'
import type { DBSession, DBStudent, LearningLevel } from '@/lib/types'

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const mockStudent = MOCK_STUDENTS.find(s => s.id === studentId)
  const [savedStudent, setSavedStudent] = useState<DBStudent | undefined>(undefined)
  const [savedSessions, setSavedSessions] = useState<DBSession[]>([])
  useEffect(() => {
    if (!mockStudent) {
      fetch('/api/students')
        .then(response => response.ok ? response.json() : { students: [] })
        .then(result => setSavedStudent(result.students?.find((item: DBStudent) => item.id === studentId)))
        .catch(() => setSavedStudent(undefined))
    }
  }, [mockStudent, studentId])
  useEffect(() => {
    fetch(`/api/sessions?studentId=${studentId}`)
      .then(response => response.ok ? response.json() : { sessions: [] })
      .then(result => setSavedSessions(result.sessions ?? []))
      .catch(() => setSavedSessions([]))
  }, [studentId])
  const student = mockStudent ?? savedStudent
  const sessions = savedSessions
  const notes = MOCK_NOTES.filter(n => n.student_id === studentId)
  const progress = MOCK_PROGRESS.filter(p => p.student_id === studentId)

  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [localNotes, setLocalNotes] = useState(notes)

  const [aiPlan, setAiPlan] = useState(sessions.find(s => s.ai_plan)?.ai_plan ?? '')
  const [aiLoading, setAiLoading] = useState(false)
  const [editingPlan, setEditingPlan] = useState(false)
  const [planDraft, setPlanDraft] = useState('')

  const [levelDialogOpen, setLevelDialogOpen] = useState(false)
  const [newLevel, setNewLevel] = useState<LearningLevel>(student?.current_level ?? 'letter')

  const [ratingDialog, setRatingDialog] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [hoverRating, setHoverRating] = useState(0)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editLevel, setEditLevel] = useState<LearningLevel>('letter')
  const [editEmoji, setEditEmoji] = useState('⭐')
  const [editColor, setEditColor] = useState('#4FC3F7')
  const [editActive, setEditActive] = useState(true)
  const [savingStudent, setSavingStudent] = useState(false)

  if (!student) {
    return (
      <div className="p-8 text-center">
        <p className="font-display text-xl text-gray-500">Student not found</p>
        <Button onClick={() => router.back()} className="mt-4" variant="outline">Go back</Button>
      </div>
    )
  }

  const completedSessions = sessions.filter(s => s.status === 'completed')
  const completedProgress = progress.filter(p => p.status === 'completed')
  const avgScore = completedProgress.length > 0
    ? Math.round(completedProgress.reduce((sum, p) => sum + (p.score ?? 0), 0) / completedProgress.length)
    : 0
  const progressPercent = progress.length > 0
    ? Math.round((completedProgress.length / progress.length) * 100)
    : 0

  async function generateAIPlan() {
    if (!student) return
    if (localNotes.length === 0) {
      toast.error('Add a teacher observation before generating an AI plan.')
      return
    }
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.full_name,
          level: student.current_level,
          notes: localNotes.map(n => n.content),
          sessionHistory: sessions.map(s => `${s.level} session on ${formatDate(s.created_at)}`),
        }),
      })
      const data = await res.json()
      setAiPlan(data.plan ?? '')
      toast.success('AI plan generated!')
    } catch {
      toast.error('Could not generate plan')
    } finally {
      setAiLoading(false)
    }
  }

  function saveNote() {
    if (!noteText.trim()) return
    const newNote = {
      id: `note_local_${Date.now()}`,
      session_id: null as unknown as string,
      teacher_id: 'teacher_1',
      student_id: studentId,
      content: noteText,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setLocalNotes(n => [newNote, ...n])
    toast.success('Note saved!')
    setNoteText('')
    setNoteDialogOpen(false)
  }

  function savePlanEdit() {
    setAiPlan(planDraft)
    setEditingPlan(false)
    toast.success('Plan saved!')
  }

  function applyLevelChange() {
    toast.success(`Level change to "${newLevel}" saved! (Requires Supabase to persist)`)
    setLevelDialogOpen(false)
  }

  function openEditDialog() {
    setEditName(student!.full_name)
    setEditLevel(student!.current_level)
    setEditEmoji(student!.avatar_emoji)
    setEditColor(student!.avatar_color)
    setEditActive(student!.is_active)
    setEditDialogOpen(true)
  }

  async function saveStudentEdit() {
    if (editName.trim().length < 2) {
      toast.error('Student name must be at least 2 characters.')
      return
    }
    setSavingStudent(true)
    try {
      const response = await fetch('/api/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          fullName: editName,
          level: editLevel,
          avatarEmoji: editEmoji,
          avatarColor: editColor,
          isActive: editActive,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Unable to update student')
      setSavedStudent(result.student)
      setEditDialogOpen(false)
      toast.success('Student details updated.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update student')
    } finally {
      setSavingStudent(false)
    }
  }

  function rateSession(sessionId: string, rating: number) {
    toast.success(`Session rated ${rating}/5 ⭐`)
    setRatingDialog(false)
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-navy-800 mb-6 transition-colors text-sm">
        <ArrowLeft className="h-4 w-4" /> All students
      </button>

      {/* Student header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-5 mb-8">
        <StudentAvatar emoji={student.avatar_emoji} color={student.avatar_color} name={student.full_name} size="xl" />
        <div className="flex-1">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display text-3xl text-navy-800">{student.full_name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <LevelBadge level={student.current_level} />
                {!student.is_active && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setLevelDialogOpen(true)} className="gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" /> Change level
              </Button>
              <Button variant="outline" size="sm" onClick={openEditDialog} className="gap-1.5">
                <Edit3 className="h-3.5 w-3.5" /> Edit
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Sessions', value: completedSessions.length },
              { label: 'Avg. score', value: `${avgScore}%` },
              { label: 'Progress', value: `${progressPercent}%` },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
                <p className="font-display text-2xl text-navy-800">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notes">Notes ({localNotes.length})</TabsTrigger>
          <TabsTrigger value="ai-plan">AI Plan</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>Session History</CardTitle></CardHeader>
            <CardContent className="p-0">
              {sessions.length === 0 ? (
                <p className="px-6 py-8 text-center text-gray-400 text-sm">No sessions yet</p>
              ) : (
                [...sessions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map(session => (
                    <div key={session.id} className="flex items-center gap-4 px-6 py-3 border-b border-gray-50 last:border-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        session.status === 'completed' ? 'bg-mint-500' :
                        session.status === 'active'    ? 'bg-gold-500' :
                        session.status === 'planned'   ? 'bg-sky-400' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-navy-800">
                          {LEVEL_CONFIG[session.level].icon} {LEVEL_CONFIG[session.level].label} session
                        </p>
                        <p className="text-xs text-gray-400">{formatDate(session.created_at, 'long')}</p>
                      </div>
                      <span className="text-xs capitalize text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{session.status}</span>
                      {session.quality_rating ? (
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < session.quality_rating! ? 'text-gold-500 fill-gold-500' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      ) : session.status === 'completed' && (
                        <button onClick={() => { setSelectedSessionId(session.id); setRatingDialog(true) }}
                          className="text-xs text-sky-500 font-semibold hover:underline">Rate</button>
                      )}
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Notes ── */}
        <TabsContent value="notes">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setNoteDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Add Note
            </Button>
          </div>
          <div className="space-y-3">
            {localNotes.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-gray-400">
                <p className="font-display text-lg mb-1">No notes yet</p>
                <p className="text-sm">Add your first session note above</p>
              </CardContent></Card>
            ) : (
              localNotes.map(note => (
                <Card key={note.id}>
                  <CardContent className="p-5">
                    <span className="text-xs font-semibold text-gray-400">{formatDate(note.created_at, 'long')}</span>
                    <p className="text-sm text-gray-700 leading-relaxed mt-1.5">{note.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* ── AI Plan ── */}
        <TabsContent value="ai-plan">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle>AI Session Plan</CardTitle>
                <div className="flex gap-2">
                  {aiPlan && !editingPlan && (
                    <Button size="sm" variant="outline" onClick={() => { setPlanDraft(aiPlan); setEditingPlan(true) }}>
                      Edit plan
                    </Button>
                  )}
                  {editingPlan && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setEditingPlan(false)}>Cancel</Button>
                      <Button size="sm" onClick={savePlanEdit} className="gap-1.5">
                        <Save className="h-3.5 w-3.5" /> Save
                      </Button>
                    </>
                  )}
                  {!editingPlan && (
                    <Button size="sm" onClick={generateAIPlan} disabled={aiLoading || localNotes.length === 0} className="gap-1.5">
                      {aiLoading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</> : <><Brain className="h-3.5 w-3.5" /> {aiPlan ? 'Regenerate' : 'Generate plan'}</>}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingPlan ? (
                <textarea value={planDraft} onChange={e => setPlanDraft(e.target.value)}
                  className="w-full h-80 rounded-xl border-2 border-sky-300 p-4 text-sm font-sans leading-relaxed focus:outline-none focus:border-sky-400 transition-colors resize-none" />
              ) : aiPlan ? (
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed bg-gray-50 rounded-xl p-4">{aiPlan}</pre>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <Brain className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                  <p className="font-display text-lg mb-1">No plan yet</p>
                  <p className="text-sm">Save a teacher observation first, then generate a plan using it and the session history.</p>
                </div>
              )}
            </CardContent>
          </Card>

        </TabsContent>

        {/* ── Progress ── */}
        <TabsContent value="progress">
          <div className="space-y-3">
            {progress.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-gray-400">
                <p className="font-display text-lg mb-1">No progress recorded yet</p>
                <p className="text-sm">Progress appears here after learning activities</p>
              </CardContent></Card>
            ) : progress.map(p => (
              <Card key={p.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-800 capitalize">{p.content_id.replace(/_/g, ' ')}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
                        p.status === 'completed'   ? 'bg-mint-100 text-mint-600' :
                        p.status === 'struggling'  ? 'bg-coral-100 text-coral-600' :
                        p.status === 'in_progress' ? 'bg-gold-100 text-gold-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>{p.status.replace('_', ' ')}</span>
                      <span className="text-xs text-gray-400">{p.attempts} attempt{p.attempts !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  {p.score !== null && (
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-lg" style={{ color: progressColor(p.score) }}>{p.score}%</p>
                      <Progress value={p.score} className="w-16 mt-1" indicatorColor={progressColor(p.score)} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add note dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit student</DialogTitle>
            <DialogDescription>Update this student&apos;s profile details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700" htmlFor="student-name">Full name</label>
              <input id="student-name" value={editName} onChange={event => setEditName(event.target.value)} className="w-full h-10 rounded-xl border-2 border-gray-200 px-3 text-sm focus:outline-none focus:border-sky-400" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Learning level</label>
              <Select value={editLevel} onValueChange={value => setEditLevel(value as LearningLevel)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LEVELS_ORDERED.map(levelOption => <SelectItem key={levelOption} value={levelOption} className="capitalize">{levelOption}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Avatar</p>
              <div className="flex flex-wrap gap-2">
                {AVATAR_EMOJIS.map(emoji => (
                  <button key={emoji} type="button" onClick={() => setEditEmoji(emoji)} className={`w-9 h-9 rounded-lg text-lg ${editEmoji === emoji ? 'ring-2 ring-sky-500 bg-sky-50' : 'hover:bg-gray-100'}`}>{emoji}</button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {AVATAR_COLORS.map(color => (
                  <button key={color} type="button" onClick={() => setEditColor(color)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: color }} aria-label={`Choose avatar colour ${color}`}>
                    {editColor === color && <Check className="h-4 w-4 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input type="checkbox" checked={editActive} onChange={event => setEditActive(event.target.checked)} className="h-4 w-4 accent-sky-500" />
              Active student
            </label>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveStudentEdit} disabled={savingStudent}>{savingStudent ? 'Saving…' : 'Save changes'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Session Note</DialogTitle>
            <DialogDescription>Private to you. AI uses all notes to generate personalised plans.</DialogDescription>
          </DialogHeader>
          <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
            className="w-full h-36 rounded-xl border-2 border-gray-200 p-3 text-sm resize-none focus:outline-none focus:border-sky-400 transition-colors mt-1" />
          <div className="flex gap-3 justify-end mt-1">
            <Button variant="ghost" onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveNote} disabled={!noteText.trim()}>Save note</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Level change dialog */}
      <Dialog open={levelDialogOpen} onOpenChange={setLevelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change {student.full_name}&apos;s Level</DialogTitle>
            <DialogDescription>Only you as their teacher can change their level.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Select value={newLevel} onValueChange={v => setNewLevel(v as LearningLevel)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEVELS_ORDERED.map(l => (
                  <SelectItem key={l} value={l}>
                    {LEVEL_CONFIG[l].icon} {LEVEL_CONFIG[l].label} — {LEVEL_CONFIG[l].description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setLevelDialogOpen(false)}>Cancel</Button>
              <Button onClick={applyLevelChange}>Confirm change</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session rating dialog */}
      <Dialog open={ratingDialog} onOpenChange={setRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate this session</DialogTitle>
            <DialogDescription>How well did the session go overall?</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-3 py-4">
            {[1, 2, 3, 4, 5].map(r => (
              <button key={r}
                onMouseEnter={() => setHoverRating(r)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => { if (selectedSessionId) rateSession(selectedSessionId, r) }}
                className="transition-transform hover:scale-125">
                <Star className={`h-9 w-9 transition-colors ${r <= (hoverRating || 0) ? 'text-gold-400 fill-gold-400' : 'text-gray-200 fill-gray-100'}`} />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
