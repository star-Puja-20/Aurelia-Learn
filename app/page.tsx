import type { Metadata } from 'next'
import Link from 'next/link'
import { Brain, Mic, ShieldCheck, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: { absolute: 'Aurelia Learn — English learning for children' },
  description: 'Teachers guide children from letters to conversations with AI-assisted lesson plans, speaking practice and private progress tracking.',
  alternates: { canonical: '/' },
}

const LEVELS = [
  { name: 'Letter', emoji: '🔤' },
  { name: 'Word', emoji: '📚' },
  { name: 'Sentence', emoji: '✍️' },
  { name: 'Story', emoji: '📖' },
  { name: 'Conversation', emoji: '💬' },
]

const FEATURES = [
  { icon: Brain, title: 'Lesson plans you control', text: 'AI drafts the next session from your own observations. You edit every plan, and only you can change a child’s level.' },
  { icon: Mic, title: 'Speaking practice', text: 'Children say a word or sentence, and Aurelia listens, scores it and gives one encouraging sentence of feedback.' },
  { icon: ShieldCheck, title: 'Private by design', text: 'Each teacher sees only their own students. Children never sign in, and there are no ads.' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cream-100 to-mint-50">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-xl text-navy-800">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500">
            <Star className="h-5 w-5 fill-white text-white" aria-hidden="true" />
          </span>
          Aurelia Learn
        </Link>
        <Link href="/auth/login" className="text-sm font-semibold text-navy-800 hover:underline">Sign in</Link>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-4 pb-12 pt-8 text-center sm:px-6 sm:pt-14">
          <h1 className="font-display text-4xl leading-tight text-navy-800 sm:text-5xl">
            Help every child grow from letters to conversations
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            A friendly English learning space for teachers: guided sessions, AI-assisted lesson plans and gentle speaking practice, all in one place.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/auth/register" className="inline-flex h-12 items-center justify-center rounded-2xl bg-sky-500 px-8 text-base font-semibold text-white shadow-lg hover:bg-sky-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-200">
              Create a teacher account
            </Link>
            <Link href="/auth/login" className="inline-flex h-12 items-center justify-center rounded-2xl border-2 border-sky-400 bg-white px-8 text-base font-semibold text-sky-600 hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-200">
              Sign in
            </Link>
          </div>
        </section>

        <section aria-labelledby="levels" className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 id="levels" className="sr-only">Five learning levels</h2>
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {LEVELS.map((level, index) => (
              <li key={level.name} className="rounded-2xl border border-sky-100 bg-white p-4 text-center shadow-sm">
                <div className="text-3xl" aria-hidden="true">{level.emoji}</div>
                <div className="mt-1 text-xs font-semibold text-gray-400">Level {index + 1}</div>
                <div className="font-display text-navy-800">{level.name}</div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="features" className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <h2 id="features" className="mb-8 text-center font-display text-3xl text-navy-800">Built for the classroom</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl bg-white p-6 shadow-sm">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="font-display text-lg text-navy-800">{title}</h3>
                <p className="mt-1 text-sm text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-sky-100 bg-white">
        <nav aria-label="Legal" className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm text-gray-600 sm:px-6">
          <span>© {new Date().getFullYear()} Aurelia Learn</span>
          <span className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/legal/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/legal/terms" className="hover:underline">Terms &amp; Conditions</Link>
            <Link href="/legal/cookies" className="hover:underline">Cookie Policy</Link>
          </span>
        </nav>
      </footer>
    </div>
  )
}
