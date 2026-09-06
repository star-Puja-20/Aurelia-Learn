'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center p-6 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}>
        <div className="text-8xl mb-6">🔍</div>
      </motion.div>
      <h1 className="font-display text-4xl text-navy-800 mb-2">Page not found</h1>
      <p className="text-gray-500 mb-8 max-w-sm">We couldn&apos;t find what you were looking for. It might have moved or never existed.</p>
      <div className="flex gap-3 justify-center">
        <Link href="/teacher/dashboard"><Button>Go to Dashboard</Button></Link>
        <Link href="/auth/login"><Button variant="outline">Sign in</Button></Link>
      </div>
    </div>
  )
}
