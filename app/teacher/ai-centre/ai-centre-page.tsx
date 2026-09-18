'use client'
import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Brain, ChevronRight, RotateCcw, CheckCircle, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LevelBadge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AI_SCOPE } from '@/lib/ai-scope'
import { toast } from 'sonner'
import type { DBStudent, LearningLevel } from '@/lib/types'

// Exercise content by level
const EXERCISES: Record<LearningLevel, Array<{ prompt: string; type: 'listen' | 'speak'; expected?: string }>> = {
  letter: [
    { prompt: 'What letter makes the sound /k/?', type: 'speak', expected: 'C or K' },
    { prompt: 'Say the alphabet from A to E', type: 'speak', expected: 'A B C D E' },
    { prompt: 'Listen and repeat: B is for Ball 🎈', type: 'speak', expected: 'B is for Ball' },
  ],
  word: [
    { prompt: 'Say the word for this picture: 🍎', type: 'speak', expected: 'apple' },
    { prompt: 'Say all the colour words you know', type: 'speak', expected: 'red blue green yellow' },
    { prompt: 'What is the opposite of big?', type: 'speak', expected: 'small or little' },
  ],
  sentence: [
    { prompt: 'Make a sentence with the word "happy"', type: 'speak', expected: 'I am happy' },
    { prompt: 'Describe what you can see outside', type: 'speak', expected: 'I can see' },
    { prompt: 'Say: "She likes to eat apples every day."', type: 'speak', expected: 'She likes to eat apples every day' },
  ],
  story: [
    { prompt: 'Retell "The Little Star" story in 3 sentences', type: 'speak', expected: 'Stella the star hid behind a cloud but came out and shone brightly' },
    { prompt: 'What is the moral of "The Friendly Dragon"?', type: 'speak', expected: 'Everyone has something special to offer' },
    { prompt: 'Make up a short story about a dog', type: 'speak', expected: 'Once upon a time there was a dog' },
  ],
  conversation: [
    { prompt: 'Introduce yourself in English — name, age, and favourite thing', type: 'speak', expected: 'My name is I am years old I like' },
    { prompt: 'Ask me what my favourite food is and respond to my answer', type: 'speak', expected: 'What is your favourite food' },
    { prompt: 'Describe your perfect holiday in 4-5 sentences', type: 'speak', expected: 'I would go to the beach' },
  ],
}

type ResultStatus = 'correct' | 'partially_correct' | 'wrong'
type ExerciseResult = { score: number; status: ResultStatus; feedback: string; transcript: string; expected?: string }

export default function AICentrePage() {
  const searchParams = useSearchParams()
  const [students, setStudents] = useState<DBStudent[]>([])
  const [selStudent, setSelStudent] = useState(searchParams.get('studentId') ?? '')
  const [studentsLoaded, setStudentsLoaded] = useState(false)
  const [exerciseIdx, setExerciseIdx] = useState(0)
  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<ExerciseResult | null>(null)
  const [feedbackDecision, setFeedbackDecision] = useState<'accepted' | 'rejected' | null>(null)
  const [sessionScores, setSessionScores] = useState<number[]>([])
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [plan, setPlan] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    fetch('/api/students')
      .then(response => response.ok ? response.json() : { students: [] })
      .then(data => {
        const loadedStudents = data.students ?? []
        setStudents(loadedStudents)
        if (!selStudent && loadedStudents[0]) setSelStudent(loadedStudents[0].id)
      })
      .catch(() => setStudents([]))
      .finally(() => setStudentsLoaded(true))
  }, [selStudent])

  const student = students.find(s => s.id === selStudent)

  if (!student && !studentsLoaded) {
    return <div className="p-6 lg:p-8 text-center text-gray-400">Loading students…</div>
  }

  if (!student) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="h-6 w-6 text-sky-500" />
            <h1 className="font-display text-3xl text-navy-800">AI Learning Centre</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-gray-500 text-sm">Listening &amp; speaking exercises powered by AI</p>
            <span className="text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded-full px-2 py-0.5">
              {AI_SCOPE.label} · teacher-reviewed
            </span>
          </div>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <h2 className="font-display text-2xl text-navy-800 mb-2">Add a student first</h2>
            <p className="text-gray-500 mb-6">Create a student profile before starting an AI learning session.</p>
            <Link href="/teacher/students/new">
              <Button className="gap-2"><UserPlus className="h-4 w-4" /> Add Student</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const level = student.current_level
  const exercises = EXERCISES[level]
  const exercise = exercises[exerciseIdx]
  const sessionDone = sessionScores.length === exercises.length

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = e => chunksRef.current.push(e.data)
      recorder.onstop = handleStopRecording
      recorder.start()
      mediaRecorderRef.current = recorder
      setRecording(true)
    } catch {
      toast.error('Microphone access needed for speaking exercises')
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop())
    setRecording(false)
    setProcessing(true)
  }

  async function handleStopRecording() {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    const form = new FormData()
    form.append('audio', blob, 'recording.webm')

    try {
      // Transcribe
      const transcribeRes = await fetch('/api/ai/whisper', { method: 'POST', body: form })
      const { text: transcript } = await transcribeRes.json()

      // Score
      const scoreRes = await fetch('/api/ai/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, expected: exercise.expected, level }),
      })
      const { score, status, feedback, expected } = await scoreRes.json()

      setResult({ score, status, feedback, transcript, expected })
      setFeedbackDecision(null)
    } catch {
      toast.error('Could not process recording')
    } finally {
      setProcessing(false)
    }
  }

  function nextExercise() {
    setResult(null)
    setFeedbackDecision(null)
    setExerciseIdx(i => Math.min(i + 1, exercises.length - 1))
  }

  function resetSession() {
    setExerciseIdx(0)
    setResult(null)
    setFeedbackDecision(null)
    setSessionScores([])
    setPlan('')
  }

  async function reviewFeedback(decision: 'accepted' | 'rejected') {
    if (!result || feedbackDecision) return
    setFeedbackDecision(decision)
    const updatedScores = [...sessionScores, result.score]
    setSessionScores(updatedScores)

    if (updatedScores.length === exercises.length) {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student!.id,
          level: student!.current_level,
          status: 'completed',
          startedAt: new Date().toISOString(),
          endedAt: new Date().toISOString(),
          teacherEdits: `Teacher ${decision} the AI feedback for the completed session.`,
        }),
      })
      if (!response.ok) toast.error('Feedback accepted, but the session history could not be saved.')
      else toast.success('Session saved to history.')
    }
  }

  async function generatePlan() {
    setGeneratingPlan(true)
    try {
      const res = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student!.full_name,
          level: student!.current_level,
          notes: ['Student completed AI Centre exercises'],
          sessionHistory: [],
        }),
      })
      const data = await res.json()
      setPlan(data.plan ?? '')
      // plan ready
    } catch {
      toast.error('Could not generate plan')
    } finally {
      setGeneratingPlan(false)
    }
  }

  const sessionStatus = sessionScores.length
    ? sessionScores.every(score => score >= 85)
      ? 'correct'
      : sessionScores.some(score => score < 50)
        ? 'needs_more_practice'
        : 'partially_correct'
    : null

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Brain className="h-6 w-6 text-sky-500" />
          <h1 className="font-display text-3xl text-navy-800">AI Learning Centre</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-gray-500 text-sm">Listening &amp; speaking exercises powered by AI</p>
          <span className="text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded-full px-2 py-0.5">
            {AI_SCOPE.label} · teacher-reviewed
          </span>
        </div>
      </div>

      {/* Student selector */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="w-56">
          <Select value={selStudent} onValueChange={v => { setSelStudent(v); resetSession() }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {students.filter(s => s.is_active).map(s => (
                <SelectItem key={s.id} value={s.id}>{s.avatar_emoji} {s.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <LevelBadge level={level} />
        <Button variant="outline" size="sm" onClick={resetSession} className="gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </Button>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Exercise {Math.min(exerciseIdx + 1, exercises.length)} of {exercises.length}</span>
          {sessionScores.length > 0 && <span>{sessionScores.length} reviewed</span>}
        </div>
        <Progress value={(sessionScores.length / exercises.length) * 100} indicatorColor="#4FC3F7" className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        {sessionDone ? (
          // Session complete card
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="text-center">
              <CardContent className="py-12">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="font-display text-2xl text-navy-800 mb-2">Session Complete!</h2>
                <p className="text-gray-500 mb-6">
                  {student.full_name}&apos;s session result: <strong className="text-navy-800">
                    {sessionStatus === 'correct' ? 'Correct' : sessionStatus === 'partially_correct' ? 'Partially correct' : 'Needs more practice'}
                  </strong> across {exercises.length} exercises.
                </p>
                {/* Insights card */}
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-6 text-left">
                  <p className="text-xs font-bold text-sky-600 uppercase tracking-wide mb-1">💡 AI Insight</p>
                  <p className="text-sm text-gray-700">
                    {sessionStatus === 'correct'
                      ? `${student.full_name} performed excellently. Consider whether they are ready to progress to the next level.`
                      : sessionStatus === 'partially_correct'
                      ? `${student.full_name} is making solid progress. Continue reinforcing this level for one more session.`
                      : `${student.full_name} may need extra support. Consider shorter exercises and more visual aids.`}
                  </p>
                </div>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button onClick={generatePlan} disabled={generatingPlan} className="gap-2">
                    <Brain className="h-4 w-4" />
                    {generatingPlan ? 'Generating…' : 'Generate Next Session Plan'}
                  </Button>
                  <Button variant="outline" onClick={resetSession}>Do it again</Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Plan panel */}
            <AnimatePresence>
              {plan && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <Card>
                    <CardHeader><CardTitle>Next Session Plan</CardTitle></CardHeader>
                    <CardContent>
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed bg-gray-50 rounded-xl p-4">
                        {plan}
                      </pre>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          // Active exercise
          <motion.div
            key={exerciseIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-gray-500 font-semibold">Speaking Exercise</CardTitle>
                  <span className="text-xs bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full font-semibold">
                    {exerciseIdx + 1}/{exercises.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Prompt */}
                <div className="bg-cream-100 border border-gold-200 rounded-2xl p-6 text-center">
                  <p className="text-navy-800 font-display text-xl leading-relaxed">{exercise.prompt}</p>
                </div>

                {/* Recording control */}
                {!result && (
                  <div className="flex flex-col items-center gap-4">
                    {processing ? (
                      <div className="flex flex-col items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          className="w-16 h-16 border-4 border-sky-200 border-t-sky-500 rounded-full"
                        />
                        <p className="text-sm text-gray-500">Processing your answer…</p>
                      </div>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.93 }}
                        onClick={recording ? stopRecording : startRecording}
                        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                          recording ? 'bg-coral-500 hover:bg-coral-600' : 'bg-sky-500 hover:bg-sky-600'
                        }`}
                      >
                        {recording
                          ? <><MicOff className="h-7 w-7 text-white" /></>
                          : <><Mic className="h-7 w-7 text-white" /></>
                        }
                      </motion.button>
                    )}
                    <p className="text-sm text-gray-500">
                      {recording ? '🔴 Recording… tap to stop' : 'Tap to start recording'}
                    </p>
                  </div>
                )}

                {/* Result */}
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <div className={`rounded-xl p-4 border ${
                        result.status === 'correct' ? 'bg-mint-50 border-mint-200' :
                        result.status === 'partially_correct' ? 'bg-gold-50 border-gold-200' :
                        'bg-coral-50 border-coral-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-gray-700">You said:</p>
                          <span className="font-bold text-lg capitalize" style={{ color: result.status === 'correct' ? '#43A047' : result.status === 'partially_correct' ? '#FFB300' : '#E64A19' }}>
                            {result.status === 'partially_correct' ? 'Partially correct' : result.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 italic">&quot;{result.transcript}&quot;</p>
                        <p className="text-sm font-semibold mt-2" style={{ color: result.status === 'correct' ? '#43A047' : result.status === 'partially_correct' ? '#FFB300' : '#E64A19' }}>
                          {result.feedback}
                        </p>
                      </div>

                      <p className="text-xs text-gray-500">
                        AI feedback is a suggestion. Review it before accepting it into this session&apos;s history.
                      </p>

                      {result.status === 'wrong' && result.expected && (
                        <div className="rounded-xl bg-coral-50 border border-coral-200 p-3 text-sm text-coral-800">
                          <strong>Expected answer:</strong> {result.expected}
                        </div>
                      )}

                      {!feedbackDecision && (
                        <div className="flex gap-3">
                          <Button onClick={() => reviewFeedback('accepted')} variant="outline" className="flex-1">
                            Accept feedback
                          </Button>
                          <Button onClick={() => reviewFeedback('rejected')} variant="outline" className="flex-1">
                            Reject feedback
                          </Button>
                        </div>
                      )}

                      {exerciseIdx < exercises.length - 1 ? (
                        <Button onClick={nextExercise} disabled={!feedbackDecision} className="w-full gap-2">
                          Next Exercise <ChevronRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button onClick={nextExercise} disabled={!feedbackDecision} className="w-full gap-2">
                          See Results <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
