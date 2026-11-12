export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="space-y-6 p-6 lg:p-8">
      <div className="h-8 w-56 animate-pulse rounded-xl bg-gray-200" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map(i => <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-200" />)}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-gray-200" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}
