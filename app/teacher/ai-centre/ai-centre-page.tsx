'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowUp, Bot, Brain, Mic, MicOff, MessageCircle, RotateCcw, Sparkles, UserRound } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LevelBadge } from '@/components/ui/badge'
import { AI_SCOPE } from '@/lib/ai-scope'
import { toast } from 'sonner'
import type { DBStudent } from '@/lib/types'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

const QUICK_PROMPTS = [
  'Plan a 30-minute lesson',
  'Give me a speaking activity',
  'How can I teach new vocabulary?',
]

function MessageRow({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  const avatar = (
    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${isUser ? 'bg-gray-100 text-gray-600' : 'bg-sky-100 text-sky-700'}`}>
      {isUser ? <UserRound className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
    </div>
  )

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && avatar}
      <div className={`max-w-[90%] whitespace-pre-wrap rounded-lg px-4 py-3 text-sm leading-6 ${isUser ? 'bg-sky-600 text-white' : 'bg-gray-50 text-gray-700'}`}>
        {message.content}
      </div>
      {isUser && avatar}
    </div>
  )
}

export default function AICentrePage() {
  const searchParams = useSearchParams()
  const [students, setStudents] = useState<DBStudent[]>([])
  const [selStudent, setSelStudent] = useState(searchParams.get('studentId') ?? '')
  const [studentsLoaded, setStudentsLoaded] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [micDialogOpen, setMicDialogOpen] = useState(false)
  const [micError, setMicError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    fetch('/api/students')
      .then(response => response.ok ? response.json() : { students: [] })
      .then(data => {
        const loadedStudents = data.students ?? []
        setStudents(loadedStudents)
        setSelStudent(current => current || loadedStudents[0]?.id || '')
      })
      .catch(() => setStudents([]))
      .finally(() => setStudentsLoaded(true))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, sending])

  const student = students.find(item => item.id === selStudent)

  function resetChat() {
    setMessages([])
    setDraft('')
  }

  async function startRecording() {
    let stream: MediaStream | undefined
    try {
      if (!window.isSecureContext) {
        throw new Error('Microphone access requires a secure HTTPS connection.')
      }
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        throw new Error('This browser does not support microphone recording.')
      }

      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      audioChunksRef.current = []
      recorder.ondataavailable = event => {
        if (event.data.size) audioChunksRef.current.push(event.data)
      }
      recorder.onstop = async () => {
        stream?.getTracks().forEach(track => track.stop())
        setRecording(false)
        setTranscribing(true)

        try {
          const audio = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' })
          const extension = audio.type.includes('mp4') ? 'mp4' : audio.type.includes('ogg') ? 'ogg' : 'webm'
          const form = new FormData()
          form.append('audio', audio, `recording.${extension}`)
          const response = await fetch('/api/ai/whisper', { method: 'POST', body: form })
          const data = await response.json()
          if (!response.ok) throw new Error(data.error ?? 'Transcription failed')
          if (data.text?.trim()) {
            setDraft(current => [current.trim(), data.text.trim()].filter(Boolean).join(' '))
          }
        } catch {
          toast.error('Could not transcribe the recording. Please try again.')
        } finally {
          setTranscribing(false)
        }
      }
      recorderRef.current = recorder
      recorder.start()
      setMicDialogOpen(false)
      setRecording(true)
    } catch (error) {
      stream?.getTracks().forEach(track => track.stop())
      const name = error instanceof DOMException ? error.name : ''
      const message = name === 'NotAllowedError' || name === 'SecurityError'
        ? 'Microphone access is blocked. Allow it in your browser or device settings, then try again.'
        : name === 'NotFoundError'
          ? 'No microphone was found. Connect or enable a microphone, then try again.'
          : error instanceof Error ? error.message : 'Could not access the microphone.'
      setMicError(message)
      setMicDialogOpen(true)
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = draft.trim()
    if (!message || !student || sending) return

    const history = messages.slice(-16)
    setMessages(current => [...current, { role: 'user', content: message }])
    setDraft('')
    setSending(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          studentName: student.full_name,
          level: student.current_level,
          history,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Could not get a reply')
      setMessages(current => [...current, { role: 'assistant', content: data.reply }])
    } catch {
      toast.error('Aurelia could not reply. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (!student && !studentsLoaded) {
    return <div className="p-6 lg:p-8 text-center text-gray-400">Loading students…</div>
  }

  if (!student) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-navy-800">Aurelia AI Assistant</h1>
            <p className="text-sm text-gray-500">Your teaching companion</p>
          </div>
        </div>
        <div className="max-w-2xl rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
          <h2 className="font-display text-xl text-navy-800">Add a student to get started</h2>
          <p className="mt-2 text-sm text-gray-500">Choose a student so Aurelia can tailor teaching ideas to their learning level.</p>
          <Link href="/teacher/students/new" className="mt-5 inline-flex">
            <Button className="gap-2"><UserRound className="h-4 w-4" /> Add Student</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-3.25rem)] flex-col p-4 lg:p-8">
      <header className="mb-5 flex shrink-0 flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-sky-600" />
            <h1 className="font-display text-2xl text-navy-800">Aurelia AI Assistant</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">A teaching companion for your next idea.</p>
        </div>
        <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
          {AI_SCOPE.label} · teacher-reviewed
        </span>
      </header>

      <div className="grid w-full flex-1 gap-4 xl:ml-auto xl:mr-8 xl:max-w-7xl xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4">
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <label htmlFor="assistant-student" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Student context
            </label>
            <Select value={selStudent} onValueChange={value => { setSelStudent(value); resetChat() }}>
              <SelectTrigger id="assistant-student"><SelectValue /></SelectTrigger>
              <SelectContent>
                {students.filter(item => item.is_active).map(item => (
                  <SelectItem key={item.id} value={item.id}>{item.avatar_emoji} {item.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-navy-800">{student.full_name}</span>
              <LevelBadge level={student.current_level} />
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy-800">
              <Sparkles className="h-4 w-4 text-gold-500" /> Try asking
            </div>
            <div className="flex flex-col gap-2">
              {QUICK_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setDraft(prompt)}
                  className="rounded-md border border-gray-200 px-3 py-2 text-left text-sm text-gray-600 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-navy-800"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </section>
        </aside>

        <section className="flex h-[min(72vh,760px)] min-h-[520px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm" aria-label="Chat with Aurelia">
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-navy-800">Aurelia</h2>
                <p className="text-xs text-gray-500">English teaching assistant</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" aria-label="Clear conversation" title="Clear conversation" onClick={resetChat}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6" role="log" aria-live="polite" aria-relevant="additions text">
            <div className="mx-auto flex max-w-3xl flex-col gap-5">
              <MessageRow message={{ role: 'assistant', content: `Hi! I'm here to help you plan activities and find fresh ways to support ${student.full_name}. What are you working on today?` }} />
              {messages.map((message, index) => (
                <MessageRow key={`${index}-${message.role}`} message={message} />
              ))}

              {sending && (
                <MessageRow message={{ role: 'assistant', content: 'Thinking…' }} />
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <form onSubmit={sendMessage} className="shrink-0 border-t border-gray-100 bg-white p-3 sm:px-5 sm:py-4">
            <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
              <MessageCircle className="mb-2 ml-1 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
              <textarea
                value={draft}
                onChange={event => setDraft(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    event.currentTarget.form?.requestSubmit()
                  }
                }}
                aria-label="Message Aurelia"
                placeholder={`Ask about teaching ${student.full_name}…`}
                rows={1}
                maxLength={2000}
                disabled={sending}
                className="max-h-32 min-h-10 flex-1 resize-y bg-transparent px-1 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-60"
              />
              <Button
                type="button"
                variant={recording ? 'coral' : 'ghost'}
                size="icon"
                aria-label={recording ? 'Stop recording' : 'Record voice message'}
                title={recording ? 'Stop recording' : 'Record voice message'}
                onClick={recording ? stopRecording : startRecording}
                disabled={sending || transcribing}
                className="h-9 w-9 shrink-0"
              >
                {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button type="submit" size="icon" aria-label="Send message" disabled={!draft.trim() || sending} className="h-9 w-9 shrink-0">
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-center text-[11px] text-gray-400">
              {recording ? 'Recording… tap the microphone to stop.' : transcribing ? 'Transcribing your recording…' : 'AI suggestions should be reviewed before use.'}
            </p>
          </form>
        </section>
      </div>

      <Dialog open={micDialogOpen} onOpenChange={setMicDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable microphone access</DialogTitle>
            <DialogDescription>{micError}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-gray-600">
            <p>On your phone, open this site&apos;s permissions from the browser menu or address bar, set Microphone to Allow, then return here.</p>
            <Button onClick={startRecording} className="w-full gap-2">
              <Mic className="h-4 w-4" /> Try microphone again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
