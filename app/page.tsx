import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f8f5] px-5 py-12 text-[#26384c] sm:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#e5f3e9] text-3xl">✨</div>
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#579476]">AURELIA LEARN</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">A little learning goes a long way.</h1>
          <p className="mx-auto mt-4 max-w-xl text-[#7c8b85]">Choose your way into Aurelia Learn.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <PortalCard href="/student/login" icon="🌱" title="I’m a student" detail="Jump into your own English adventures." color="bg-[#eaf6ef]" />
          <PortalCard href="/auth/login" icon="🍎" title="Teacher sign in" detail="Manage your class and learner progress." color="bg-[#edf6ff]" />
          <PortalCard href="/auth/admin" icon="✨" title="Administrator sign in" detail="Open the Aurelia Learn admin portal." color="bg-[#f2edff]" />
        </div>
      </div>
    </main>
  )
}

function PortalCard({ href, icon, title, detail, color }: { href: string; icon: string; title: string; detail: string; color: string }) {
  return (
    <Link href={href} className="group rounded-[1.8rem] border border-[#e9eeea] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <span className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${color}`}>{icon}</span>
      <h2 className="text-xl font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#87948e]">{detail}</p>
      <span className="mt-6 inline-block text-sm font-extrabold text-[#438a68] transition group-hover:translate-x-1">Continue →</span>
    </Link>
  )
}
