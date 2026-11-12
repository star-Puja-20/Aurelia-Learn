import Link from 'next/link'
import { Star } from 'lucide-react'
import { CONTACT_EMAIL, LEGAL_LAST_UPDATED } from '@/lib/legal'

export function LegalDoc({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-100">
      <header className="border-b border-sky-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-display text-xl text-navy-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500">
              <Star className="h-4 w-4 fill-white text-white" aria-hidden="true" />
            </span>
            Aurelia Learn
          </Link>
          <Link href="/auth/login" className="text-sm font-semibold text-sky-600 hover:underline">Sign in</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl text-navy-800">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">Last updated {LEGAL_LAST_UPDATED}</p>
        <article className="mt-8 space-y-8 text-[15px] leading-relaxed text-gray-700">{children}</article>
        <p className="mt-10 text-sm text-gray-600">
          Questions about this page?{' '}
          {CONTACT_EMAIL
            ? <a className="font-semibold text-sky-600 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            : 'Contact the school or organisation that gave you access to Aurelia Learn.'}
        </p>
      </main>
      <footer className="border-t border-sky-100 bg-white">
        <nav aria-label="Legal" className="mx-auto flex max-w-3xl flex-wrap gap-x-6 gap-y-2 px-4 py-5 text-sm text-gray-600">
          <Link href="/legal/privacy" className="hover:underline">Privacy Policy</Link>
          <Link href="/legal/terms" className="hover:underline">Terms &amp; Conditions</Link>
          <Link href="/legal/cookies" className="hover:underline">Cookie Policy</Link>
        </nav>
      </footer>
    </div>
  )
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 font-display text-xl text-navy-800">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
