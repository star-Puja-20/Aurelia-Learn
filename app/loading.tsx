export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-100 border-t-sky-500" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}
