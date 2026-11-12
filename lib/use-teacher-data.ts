'use client'

import { useCallback, useEffect, useState } from 'react'
import type { DBExerciseResult, DBSession, DBStudent } from './types'

async function load<T>(url: string, key: string): Promise<T[]> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Unable to load ${key}`)
  const data = await response.json()
  return (data[key] ?? []) as T[]
}

// Loads the signed-in teacher's own students, sessions and exercise results from the API.
export function useTeacherData() {
  const [students, setStudents] = useState<DBStudent[]>([])
  const [sessions, setSessions] = useState<DBSession[]>([])
  const [results, setResults] = useState<DBExerciseResult[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const [studentRows, sessionRows, resultRows] = await Promise.all([
        load<DBStudent>('/api/students', 'students'),
        load<DBSession>('/api/sessions', 'sessions'),
        load<DBExerciseResult>('/api/exercise-results', 'results'),
      ])
      setStudents(studentRows)
      setSessions(sessionRows)
      setResults(resultRows)
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { students, sessions, results, loaded, error, refresh }
}
