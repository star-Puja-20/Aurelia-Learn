'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, BarChart3, Lightbulb, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

type ExerciseSummary = { type: string; label: string; correct: number; total: number; accuracy: number }
type Attempt = {
  id: string
  game_id: string
  learning_level: string
  correct_answers: number
  total_questions: number
  created_at: string
}
type StudentReportData = {
  student: { id: string; name: string; level: string }
  attempts: Attempt[]
  exerciseSummary: ExerciseSummary[]
  rounds: { index: number; date: string; accuracy: number; gameId: string; level: string }[]
  recommendation: string
  totalRounds: number
}

export default function StudentReport({ studentId, onReviewReady }: {
  studentId: string
  onReviewReady: (review: string) => void
}) {
  const [report, setReport] = useState<StudentReportData | null>(null)
  const [chartUrl, setChartUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [chartError, setChartError] = useState('')

  useEffect(() => {
    let active = true
    let currentChartUrl = ''
    setLoading(true)
    setError('')
    setChartError('')
    setChartUrl('')

    fetch(`/api/teacher/student-report?studentId=${encodeURIComponent(studentId)}`)
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error ?? 'Unable to load the learning review.')
        return result as StudentReportData
      })
      .then(async (data) => {
        if (!active) return
        setReport(data)
        const categorySummary = data.exerciseSummary.map(({ label, accuracy, total }) => ({ label, accuracy, total }))
        const review = `${data.recommendation}\nRecent accuracy by exercise: ${data.exerciseSummary.map((item) => `${item.label} ${item.accuracy}% (${item.total} questions)`).join('; ') || 'No written-exercise results yet.'}`
        onReviewReady(review)

        try {
          const chartResponse = await fetch('/api/student_chart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rounds: data.rounds, categories: categorySummary }),
          })
          if (!chartResponse.ok) throw new Error('The Python chart service is not available.')
          currentChartUrl = URL.createObjectURL(await chartResponse.blob())
          if (active) setChartUrl(currentChartUrl)
          else URL.revokeObjectURL(currentChartUrl)
        } catch (chartRequestError) {
          if (active) setChartError(chartRequestError instanceof Error ? chartRequestError.message : 'Unable to create the student chart.')
        }
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load the learning review.')
      })
      .finally(() => { if (active) setLoading(false) })

    return () => {
      active = false
      if (currentChartUrl) URL.revokeObjectURL(currentChartUrl)
    }
  }, [studentId, onReviewReady])

  if (loading) return <Card><CardContent className="flex items-center gap-2 py-8 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading recent practice and chart…</CardContent></Card>
  if (error) return <Card><CardContent className="flex items-center gap-2 py-6 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</CardContent></Card>
  if (!report) return null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-sky-600" />Practice report</CardTitle></CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-gray-500">{report.totalRounds} recent rounds recorded · charts are generated with Python, pandas, and Matplotlib.</p>
          {chartUrl ? <img src={chartUrl} alt="Student accuracy trend and accuracy by exercise type" className="w-full rounded-xl border border-gray-100" /> : chartError ? <p role="status" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{chartError} Start the local Python chart service to view charts during development.</p> : <p className="py-8 text-center text-sm text-gray-400">Preparing charts…</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500" />Review and next session idea</CardTitle></CardHeader>
        <CardContent>
          <p className="mb-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">{report.recommendation}</p>
          {report.exerciseSummary.length ? <div className="grid gap-2 sm:grid-cols-2">{report.exerciseSummary.map((item) => <div key={item.type} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"><span className="text-sm font-semibold text-gray-700">{item.label}</span><span className="text-sm font-extrabold text-navy-800">{item.accuracy}% <span className="font-medium text-gray-400">({item.correct}/{item.total})</span></span></div>)}</div> : <p className="text-sm text-gray-500">Written practice results will appear after the student completes Word Workshop.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent rounds</CardTitle></CardHeader>
        <CardContent>
          {report.attempts.length ? <div className="divide-y divide-gray-100">{report.attempts.slice(0, 8).map((attempt) => <div key={attempt.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"><div><p className="text-sm font-semibold capitalize text-navy-800">{attempt.game_id.replace(/_/g, ' ')} · {attempt.learning_level}</p><p className="text-xs text-gray-400">{formatDate(attempt.created_at, 'long')}</p></div><span className="text-sm font-bold text-gray-600">{attempt.correct_answers}/{attempt.total_questions} correct ({Math.round((attempt.correct_answers / attempt.total_questions) * 100)}%)</span></div>)}</div> : <p className="text-sm text-gray-500">No saved exercise rounds yet.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
