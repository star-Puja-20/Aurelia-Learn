'use client'
import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Home, RotateCcw } from 'lucide-react'

export function speak(text: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.82
    u.lang = 'en-GB'
    window.speechSynthesis.speak(u)
  }
}

// ── Shared progress dots ─────────────────────────────────────
export function ProgressDots({ total, current, color = '#4FC3F7' }: { total: number; current: number; color?: string }) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="h-2 rounded-full transition-all duration-300"
          style={{ width: i <= current ? 24 : 8, backgroundColor: i <= current ? color : '#e5e7eb' }} />
      ))}
    </div>
  )
}

// ── Complete screen ──────────────────────────────────────────
export function CompleteScreen({ stars, onHome, onRetry }: { stars: number; onHome: () => void; onRetry: () => void }) {
  useEffect(() => { speak('Amazing work! You are a star!') }, [])
  return (
    <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-5 text-center">
      <motion.div animate={{ rotate: [0, -10, 10, -5, 5, 0] }} transition={{ duration: 0.8, delay: 0.3 }}
        className="text-8xl">🎉</motion.div>
      <h2 className="font-display text-4xl text-white drop-shadow">Amazing work!</h2>
      <div className="flex gap-3">
        {[1, 2, 3].map(i => (
          <motion.div key={i} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3 + i * 0.15, type: 'spring', damping: 10 }}>
            <Star className={`h-12 w-12 drop-shadow-lg ${i <= stars ? 'text-gold-400 fill-gold-400' : 'text-white/30 fill-white/20'}`} />
          </motion.div>
        ))}
      </div>
      <p className="text-sky-100 text-lg">You earned <strong>{stars}</strong> {stars === 1 ? 'star' : 'stars'}!</p>
      <div className="flex gap-3 flex-wrap justify-center mt-2">
        <button onClick={onRetry}
          className="flex items-center gap-2 bg-white/20 text-white border border-white/30 px-6 py-3 rounded-2xl font-display text-lg hover:bg-white/30 active:scale-95 transition-all">
          <RotateCcw className="h-4 w-4" /> Again
        </button>
        <button onClick={onHome}
          className="flex items-center gap-2 bg-white text-sky-600 px-6 py-3 rounded-2xl font-display text-lg shadow-md hover:bg-sky-50 active:scale-95 transition-all">
          <Home className="h-4 w-4" /> Home
        </button>
      </div>
    </motion.div>
  )
}

