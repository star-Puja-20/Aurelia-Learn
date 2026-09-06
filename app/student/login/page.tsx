'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function StudentLoginPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/student/learn')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-600 flex flex-col items-center justify-center p-6 text-white">
      <div className="text-center">
        <div className="w-20 h-20 bg-white/20 rounded-3xl mx-auto mb-4 flex items-center justify-center text-3xl">
          ⭐
        </div>
        <h1 className="text-3xl font-display">Opening session…</h1>
        <p className="mt-2 text-sky-100">You are being redirected to your learning session.</p>
      </div>
    </div>
  )
}
