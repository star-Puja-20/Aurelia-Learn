'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Volume2, Check, RotateCcw } from 'lucide-react'
import type { ChoiceItem, ExerciseItem, ExerciseSet, OrderItem, TypeItem } from '@/lib/exercises'
import { isTypedAnswerCorrect, shuffleParts } from '@/lib/answer-check'
import { ProgressDots, speak } from './shared'

interface RunnerProps {
  set: ExerciseSet
  onDone: (result: { correct: number; total: number }) => void
}

function Prompt({ item, itemKey }: { item: ExerciseItem; itemKey: string }) {
  // Listening items play automatically once, and can be replayed with the button.
  useEffect(() => {
    if (item.say) {
      const timer = setTimeout(() => speak(item.say as string), 350)
      return () => clearTimeout(timer)
    }
  }, [itemKey, item.say])

  return (
    <div className="w-full space-y-3 text-center">
      {item.display && <div className="font-display text-7xl text-white drop-shadow leading-none">{item.display}</div>}
      <div className="bg-white/20 rounded-2xl px-5 py-4 border border-white/30">
        <p className="font-display text-xl text-white">{item.prompt}</p>
        {item.passage && !item.hearOnly && (
          <p className="mt-3 text-white/90 text-base leading-relaxed whitespace-pre-line text-left bg-white/10 rounded-xl p-3">{item.passage}</p>
        )}
      </div>
      {item.say && (
        <button type="button" onClick={() => speak(item.say as string)} aria-label="Play the audio again"
          className="mx-auto flex items-center gap-2 bg-white text-sky-600 px-6 py-3 rounded-full font-display text-lg shadow-md hover:bg-sky-50 active:scale-95 transition-all">
          <Volume2 className="h-5 w-5" /> {item.hearOnly ? 'Listen' : 'Listen again'}
        </button>
      )}
    </div>
  )
}

function ChoiceQuestion({ item, onAnswer }: { item: ChoiceItem; onAnswer: (correct: boolean) => void }) {
  const [chosen, setChosen] = useState<string | null>(null)
  function pick(option: string) {
    if (chosen) return
    setChosen(option)
    onAnswer(option === item.answer)
  }
  const emojiOptions = item.options.every(option => option.length <= 4)
  return (
    <div className={`grid gap-3 w-full ${emojiOptions ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {item.options.map(option => {
        let style = 'bg-white text-navy-800 hover:bg-sky-50'
        if (chosen) {
          if (option === item.answer) style = 'bg-mint-400 text-white'
          else if (option === chosen) style = 'bg-coral-400 text-white'
          else style = 'bg-white/40 text-white/70'
        }
        return (
          <motion.button key={option} type="button" whileTap={{ scale: 0.96 }} onClick={() => pick(option)} disabled={!!chosen}
            className={`${style} py-3 px-4 rounded-2xl shadow-md transition-colors ${emojiOptions ? 'text-3xl font-display' : 'text-left font-semibold'}`}>
            {option}
          </motion.button>
        )
      })}
    </div>
  )
}

function TypeQuestion({ item, onAnswer }: { item: TypeItem; onAnswer: (correct: boolean) => void }) {
  const [value, setValue] = useState('')
  const [checked, setChecked] = useState<boolean | null>(null)
  function check() {
    if (checked !== null || !value.trim()) return
    const ok = isTypedAnswerCorrect(value, item.answers, item.caseSensitive)
    setChecked(ok)
    onAnswer(ok)
  }
  return (
    <div className="w-full space-y-3">
      {item.hint && <p className="text-center text-4xl" aria-hidden="true">{item.hint}</p>}
      <input
        value={value}
        onChange={event => setValue(event.target.value)}
        onKeyDown={event => { if (event.key === 'Enter') check() }}
        disabled={checked !== null}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        maxLength={80}
        aria-label="Your answer"
        placeholder="Type your answer"
        className="w-full h-14 rounded-2xl border-4 border-white/60 bg-white px-4 text-center font-display text-2xl text-navy-800 focus:outline-none focus:border-gold-400 disabled:opacity-80"
      />
      {checked === null ? (
        <button type="button" onClick={check} disabled={!value.trim()}
          className="w-full flex items-center justify-center gap-2 bg-white text-sky-600 py-3 rounded-2xl font-display text-xl shadow-md disabled:opacity-40 active:scale-95 transition-all">
          <Check className="h-5 w-5" /> Check
        </button>
      ) : (
        <p role="status" className={`text-center font-display text-lg ${checked ? 'text-mint-200' : 'text-coral-100'}`}>
          {checked ? 'Great!' : <>Not quite. Answer: <strong>{item.answers[0]}</strong></>}
        </p>
      )}
    </div>
  )
}

function OrderQuestion({ item, onAnswer }: { item: OrderItem; onAnswer: (correct: boolean) => void }) {
  const [bank, setBank] = useState(() => shuffleParts(item.parts))
  const [placed, setPlaced] = useState<{ text: string; index: number }[]>([])
  const [checked, setChecked] = useState<boolean | null>(null)

  function place(tile: { text: string; index: number }) {
    if (checked !== null) return
    setBank(current => current.filter(t => t.index !== tile.index))
    setPlaced(current => [...current, tile])
  }
  function remove(tile: { text: string; index: number }) {
    if (checked !== null) return
    setPlaced(current => current.filter(t => t.index !== tile.index))
    setBank(current => [...current, tile])
  }
  function reset() {
    if (checked !== null) return
    setPlaced([])
    setBank(shuffleParts(item.parts))
  }
  function check() {
    const ok = placed.length === item.parts.length && placed.every((tile, position) => tile.text === item.parts[position])
    setChecked(ok)
    onAnswer(ok)
  }
  const long = item.parts.some(part => part.length > 14)

  return (
    <div className="w-full space-y-3">
      <div aria-label="Your answer" className="min-h-[3.5rem] rounded-2xl bg-white/90 p-2 flex flex-wrap gap-2 items-center justify-center">
        {placed.length === 0 && <span className="text-gray-400 text-sm">Tap the pieces in order</span>}
        {placed.map(tile => (
          <button key={tile.index} type="button" onClick={() => remove(tile)}
            className={`rounded-xl bg-sky-100 px-3 py-2 font-semibold text-navy-800 ${long ? 'text-sm' : 'text-lg'}`}>{tile.text}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 justify-center min-h-[3rem]">
        {bank.map(tile => (
          <motion.button key={tile.index} type="button" whileTap={{ scale: 0.94 }} onClick={() => place(tile)}
            className={`rounded-xl bg-white px-3 py-2 font-semibold text-navy-800 shadow-md ${long ? 'text-sm' : 'text-lg'}`}>{tile.text}</motion.button>
        ))}
      </div>
      {checked === null ? (
        <div className="flex gap-2">
          <button type="button" onClick={reset} aria-label="Start again"
            className="flex items-center justify-center bg-white/20 text-white px-4 rounded-2xl border border-white/30"><RotateCcw className="h-5 w-5" /></button>
          <button type="button" onClick={check} disabled={placed.length !== item.parts.length}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-sky-600 py-3 rounded-2xl font-display text-xl shadow-md disabled:opacity-40 active:scale-95 transition-all">
            <Check className="h-5 w-5" /> Check
          </button>
        </div>
      ) : (
        <p role="status" className={`text-center font-display text-lg ${checked ? 'text-mint-200' : 'text-coral-100'}`}>
          {checked ? 'Great!' : <>Not quite. Correct order: <strong>{item.parts.join(' ')}</strong></>}
        </p>
      )}
    </div>
  )
}

export function ExerciseRunner({ set, onDone }: RunnerProps) {
  const [index, setIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [answered, setAnswered] = useState(false)
  const item = set.items[index]
  const key = useMemo(() => `${set.id}-${index}`, [set.id, index])

  function handleAnswer(isCorrect: boolean) {
    setAnswered(true)
    if (isCorrect) setCorrect(count => count + 1)
  }

  function next() {
    if (index < set.items.length - 1) {
      setIndex(i => i + 1)
      setAnswered(false)
    } else {
      onDone({ correct, total: set.items.length })
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <Prompt item={item} itemKey={key} />
      <div key={key} className="w-full">
        {item.kind === 'choice' && <ChoiceQuestion item={item} onAnswer={handleAnswer} />}
        {item.kind === 'type' && <TypeQuestion item={item} onAnswer={handleAnswer} />}
        {item.kind === 'order' && <OrderQuestion item={item} onAnswer={handleAnswer} />}
      </div>
      <ProgressDots total={set.items.length} current={index} color="#FFD54F" />
      {answered && (
        <motion.button type="button" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onClick={next}
          className="flex items-center gap-2 bg-white text-gold-600 px-8 py-3.5 rounded-2xl font-display text-xl shadow-md active:scale-95 transition-all">
          {index < set.items.length - 1 ? 'Next' : 'See results'} <ChevronRight className="h-5 w-5" />
        </motion.button>
      )}
    </div>
  )
}
