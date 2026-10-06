'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, LockKeyhole, Sparkles } from 'lucide-react'

export default function StudentLoginPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, pin }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Unable to sign in.')
      router.replace('/student/learn')
      router.refresh()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to sign in. Ask your teacher for help.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5] px-4 py-8 text-[#26384c]">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-[2rem] border border-[#e9eeea] bg-white p-6 shadow-xl sm:p-9">
        <Link href="/" className="mb-8 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#8d9a94]"><ArrowLeft size={15} /> Back to Aurelia</Link>
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f5ec] text-3xl">🌱</div>
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#579476]"><Sparkles size={13} /> YOUR OWN LEARNING ADVENTURE</p>
        <h1 className="text-3xl font-black tracking-tight">Welcome back!</h1>
        <p className="mt-2 text-sm leading-6 text-[#8a9690]">Type your name just as your teacher wrote it and the special PIN they gave you.</p>
        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <label className="block text-sm font-extrabold text-[#435569]">Your name
            <input required minLength={2} maxLength={100} autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border-2 border-[#e9eeea] px-4 text-base font-bold outline-none transition focus:border-[#65ab88]" />
          </label>
          <label className="block text-sm font-extrabold text-[#435569]">Your learner PIN
            <span className="relative mt-2 block">
              <LockKeyhole size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa69f]" />
              <input required inputMode="numeric" pattern="[0-9]{4,6}" minLength={4} maxLength={6} autoComplete="one-time-code" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))} className="min-h-12 w-full rounded-xl border-2 border-[#e9eeea] pl-11 pr-4 text-lg font-black tracking-[.35em] outline-none transition focus:border-[#65ab88]" aria-describedby="pin-help" />
            </span>
          </label>
          <p id="pin-help" className="-mt-2 text-xs text-[#9aa69f]">Your PIN has 4–6 numbers. Ask your teacher if you need help.</p>
          {error && <p role="alert" className="rounded-xl bg-[#fff0ed] px-3 py-2.5 text-sm font-bold text-[#bd6555]">{error}</p>}
          <button disabled={loading} className="min-h-12 w-full rounded-xl bg-[#315c51] px-5 font-extrabold text-white transition hover:bg-[#274a41] disabled:opacity-60">{loading ? 'Finding your adventure…' : 'Let’s play! ✨'}</button>
        </form>
        <p className="mt-5 text-center text-xs font-semibold text-[#a1aaa5]">Teacher? <Link href="/auth/login" className="text-[#438a68] hover:underline">Sign in to your class</Link></p>
      </motion.section>
    </main>
  )
}
