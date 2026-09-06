'use client'
import { Button } from '@/components/ui/button'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="text-8xl mb-6">⚡</div>
      <h1 className="font-display text-3xl text-navy-800 mb-2">Something went wrong</h1>
      <p className="text-gray-500 mb-8 max-w-sm text-sm">{error.message || 'An unexpected error occurred.'}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
