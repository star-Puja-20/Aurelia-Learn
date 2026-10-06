'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, AudioLines, Check, ChevronRight, Flame, Gamepad2,
  Gift, Home, LockKeyhole, Mic, MoonStar, Sparkles, Trophy, Volume2, X, Zap,
} from 'lucide-react'

type GameId = 'alphabet' | 'phonics' | 'vocabulary' | 'spelling' | 'sentences' | 'stories' | 'listening' | 'quiz'
type GameMode = 'pick' | 'spell' | 'sentence' | 'flash'
type Question = {
  prompt: string
  emoji: string
  choices: string[]
  answer: string
  mode?: GameMode
  audio?: string
  story?: string
}
type Game = {
  id: GameId
  title: string
  subtitle: string
  icon: string
  category: string
  color: string
  iconColor: string
  questions: Question[]
}
type LearnerProgress = { completed_levels: number; streak_days: number; last_played_on: string | null }
type GamePerformance = { attempts: number; accuracy: number; bestAccuracy: number }
type Learner = { id: string; full_name: string; current_level: string; avatar_emoji: string; avatar_color: string }
type SavedResult = { profile: LearnerProgress; gameProgress: GamePerformance }
type Tab = 'home' | 'games' | 'rewards'

const defaultProgress: LearnerProgress = { completed_levels: 0, streak_days: 0, last_played_on: null }

const worlds = [
  { name: 'Letter Lagoon', subtitle: 'Letters', icon: '🔤', tint: '#e7f5ff', accent: '#48a9e5', game: 'alphabet' as GameId },
  { name: 'Phonics Forest', subtitle: 'Phonics', icon: '🌳', tint: '#e8f8ee', accent: '#35a878', game: 'phonics' as GameId },
  { name: 'Word Meadow', subtitle: 'Words', icon: '🌼', tint: '#fff5dc', accent: '#e8a82e', game: 'vocabulary' as GameId },
  { name: 'Sentence City', subtitle: 'Sentences', icon: '🏙️', tint: '#f0ebff', accent: '#9473e8', game: 'sentences' as GameId },
  { name: 'Grammar Galaxy', subtitle: 'Grammar', icon: '🪐', tint: '#e8f6f6', accent: '#38a8a1', game: 'quiz' as GameId },
  { name: 'Storybook Shore', subtitle: 'Stories', icon: '📖', tint: '#fff0ed', accent: '#eb806a', game: 'stories' as GameId },
  { name: 'Conversation Cove', subtitle: 'Conversations', icon: '💬', tint: '#edf3ff', accent: '#6488e4', game: 'listening' as GameId },
  { name: 'Master Mountain', subtitle: 'Master challenges', icon: '🏔️', tint: '#f4efff', accent: '#8262cb', game: 'quiz' as GameId },
]

const games: Game[] = [
  {
    id: 'alphabet', title: 'Alphabet Adventure', subtitle: 'Match letters & race through the ABCs',
    icon: '🔤', category: 'Letters', color: '#edf7ff', iconColor: '#419ed6',
    questions: [
      { prompt: 'Which little letter matches BIG B?', emoji: 'Bb', choices: ['d', 'b', 'p'], answer: 'b' },
      { prompt: 'What comes after C in the alphabet?', emoji: '🐱', choices: ['B', 'D', 'E'], answer: 'D' },
      { prompt: 'Which letter starts the word sun?', emoji: '☀️', choices: ['S', 'M', 'T'], answer: 'S' },
    ],
  },
  {
    id: 'phonics', title: 'Phonics Challenge', subtitle: 'Listen close and find the sound',
    icon: '🎧', category: 'Sounds', color: '#eaf8f0', iconColor: '#39a778',
    questions: [
      { prompt: 'Listen! Which letter says “mmm”?', emoji: '🔊', audio: 'Mmm', choices: ['M', 'S', 'T'], answer: 'M' },
      { prompt: 'What sound starts “fish”?', emoji: '🐟', audio: 'Fish. F-f-fish.', choices: ['F', 'V', 'P'], answer: 'F' },
      { prompt: 'Which word ends with the “t” sound?', emoji: '👂', audio: 'Listen for the last sound: cat.', choices: ['Cat', 'Cow', 'Cup'], answer: 'Cat' },
    ],
  },
  {
    id: 'vocabulary', title: 'Word Safari', subtitle: 'Find the picture that matches',
    icon: '🦁', category: 'Words', color: '#fff6e2', iconColor: '#dfa52c',
    questions: [
      { prompt: 'Which word names this picture?', emoji: '🐢', audio: 'Turtle', choices: ['turtle', 'rabbit', 'tiger'], answer: 'turtle' },
      { prompt: 'Find the red fruit!', emoji: '🍎', choices: ['apple', 'bread', 'milk'], answer: 'apple' },
      { prompt: 'Which one belongs in the animal group?', emoji: '🐾', choices: ['chair', 'lion', 'pencil'], answer: 'lion' },
    ],
  },
  {
    id: 'spelling', title: 'Spelling Stacker', subtitle: 'Tap the letter tiles to spell it',
    icon: '🧩', category: 'Spelling', color: '#f2eeff', iconColor: '#8b6bd6',
    questions: [
      { prompt: 'Build the word SUN', emoji: '☀️', mode: 'spell', choices: ['N', 'S', 'U'], answer: 'SUN' },
      { prompt: 'Build the word CAT', emoji: '🐱', mode: 'spell', choices: ['A', 'T', 'C'], answer: 'CAT' },
      { prompt: 'Build the word FROG', emoji: '🐸', mode: 'spell', choices: ['O', 'F', 'G', 'R'], answer: 'FROG' },
    ],
  },
  {
    id: 'sentences', title: 'Sentence Builder', subtitle: 'Put the words in the right order',
    icon: '💬', category: 'Sentences', color: '#fff0ed', iconColor: '#e7806c',
    questions: [
      { prompt: 'Make a sentence!', emoji: '🐶', mode: 'sentence', choices: ['runs', 'The', 'dog'], answer: 'The dog runs' },
      { prompt: 'Build the sentence!', emoji: '🏊', mode: 'sentence', choices: ['can', 'I', 'swim'], answer: 'I can swim' },
      { prompt: 'Put the words in order!', emoji: '🍎', mode: 'sentence', choices: ['like', 'apples', 'I'], answer: 'I like apples' },
    ],
  },
  {
    id: 'stories', title: 'Reading Adventure', subtitle: 'Read a little story, answer a question',
    icon: '📚', category: 'Stories', color: '#fff0ed', iconColor: '#df7963',
    questions: [
      {
        prompt: 'What did Pip breathe?',
        emoji: '🐉',
        story: 'Pip was a little green dragon. The animals thought he breathed fire, but Pip blew tiny bubbles instead!',
        choices: ['Bubbles', 'Snowflakes', 'Leaves'],
        answer: 'Bubbles',
      },
    ],
  },
  {
    id: 'listening', title: 'Listening Lagoon', subtitle: 'Hear a word, spot the picture',
    icon: '🎵', category: 'Listening', color: '#eaf5ff', iconColor: '#538fce',
    questions: [
      { prompt: 'Tap the speaker, then find what you hear!', emoji: '🔈', audio: 'A yellow duck', choices: ['🐥 duck', '🐱 cat', '🐸 frog'], answer: '🐥 duck' },
      { prompt: 'Listen carefully. Which one is a star?', emoji: '✨', audio: 'Star', choices: ['🌙 moon', '⭐ star', '☁️ cloud'], answer: '⭐ star' },
      { prompt: 'What did you hear?', emoji: '🎧', audio: 'A red ball', choices: ['🔵 blue ball', '🔴 red ball', '🟢 green ball'], answer: '🔴 red ball' },
    ],
  },
  {
    id: 'quiz', title: 'Quiz Arena', subtitle: 'A quick-fire round of English fun',
    icon: '⚡', category: 'Quick quiz', color: '#fff5df', iconColor: '#dfa52c',
    questions: [
      { prompt: 'Pick the action word!', emoji: '🏃', choices: ['jump', 'blue', 'table'], answer: 'jump' },
      { prompt: 'Choose the missing word: “She ___ happy.”', emoji: '😊', choices: ['is', 'are', 'am'], answer: 'is' },
      { prompt: 'Which word rhymes with “cat”?', emoji: '🐈', choices: ['hat', 'dog', 'sun'], answer: 'hat' },
    ],
  },
]

const practiceQuestionSets: Partial<Record<GameId, { support: Question[]; challenge: Question[] }>> = {
  alphabet: {
    support: [
      { prompt: 'Find little a!', emoji: 'Aa', choices: ['a', 'd', 'm'], answer: 'a' },
      { prompt: 'Which letter comes after A?', emoji: '🔤', choices: ['B', 'D', 'Z'], answer: 'B' },
      { prompt: 'Find the first letter in “dog”.', emoji: '🐶', choices: ['D', 'O', 'G'], answer: 'D' },
    ],
    challenge: [
      { prompt: 'Which lowercase letter matches BIG Q?', emoji: 'Qq', choices: ['g', 'p', 'q'], answer: 'q' },
      { prompt: 'Which letter comes before T?', emoji: '🔤', choices: ['S', 'R', 'U'], answer: 'S' },
      { prompt: 'Put these in ABC order: R, P, Q. What comes first?', emoji: '🔠', choices: ['R', 'P', 'Q'], answer: 'P' },
    ],
  },
  phonics: {
    support: [
      { prompt: 'Listen. Which letter says “sss”?', emoji: '🔊', audio: 'Sss', choices: ['S', 'B', 'M'], answer: 'S' },
      { prompt: 'What sound starts “moon”?', emoji: '🌙', audio: 'Moon', choices: ['M', 'N', 'T'], answer: 'M' },
      { prompt: 'Which word starts with “b”?', emoji: '🎈', audio: 'Ball', choices: ['ball', 'sun', 'cat'], answer: 'ball' },
    ],
    challenge: [
      { prompt: 'Which word starts with the same sound as “phone”?', emoji: '🔊', audio: 'Phone', choices: ['fish', 'van', 'cat'], answer: 'fish' },
      { prompt: 'Which word ends with the same sound as “duck”?', emoji: '🦆', audio: 'Duck', choices: ['rock', 'dog', 'dish'], answer: 'rock' },
      { prompt: 'Which letter makes the last sound in “lamp”?', emoji: '💡', audio: 'Lamp', choices: ['L', 'M', 'P'], answer: 'P' },
    ],
  },
  vocabulary: {
    support: [
      { prompt: 'Which word names this animal?', emoji: '🐱', choices: ['cat', 'sun', 'bed'], answer: 'cat' },
      { prompt: 'Find something you can eat!', emoji: '🍞', choices: ['bread', 'shoe', 'bird'], answer: 'bread' },
      { prompt: 'Which word means the colour of grass?', emoji: '🌿', choices: ['green', 'happy', 'fish'], answer: 'green' },
    ],
    challenge: [
      { prompt: 'A baby dog is called a…', emoji: '🐶', choices: ['puppy', 'kitten', 'calf'], answer: 'puppy' },
      { prompt: 'Which word means “very big”?', emoji: '🐘', choices: ['tiny', 'enormous', 'quiet'], answer: 'enormous' },
      { prompt: 'Which word belongs with “spoon” and “fork”?', emoji: '🍽️', choices: ['plate', 'cloud', 'pillow'], answer: 'plate' },
    ],
  },
  spelling: {
    support: [
      { prompt: 'Spell the word SUN', emoji: '☀️', mode: 'spell', choices: ['S', 'N', 'U'], answer: 'SUN' },
      { prompt: 'Spell the word MAP', emoji: '🗺️', mode: 'spell', choices: ['A', 'M', 'P'], answer: 'MAP' },
      { prompt: 'Spell the word BED', emoji: '🛏️', mode: 'spell', choices: ['D', 'B', 'E'], answer: 'BED' },
    ],
    challenge: [
      { prompt: 'Spell the word PLANT', emoji: '🌱', mode: 'spell', choices: ['T', 'L', 'A', 'P', 'N'], answer: 'PLANT' },
      { prompt: 'Spell the word BRIGHT', emoji: '✨', mode: 'spell', choices: ['H', 'B', 'T', 'G', 'I', 'R'], answer: 'BRIGHT' },
      { prompt: 'Spell the word FRIEND', emoji: '🫶', mode: 'spell', choices: ['R', 'D', 'F', 'E', 'N', 'I'], answer: 'FRIEND' },
    ],
  },
  sentences: {
    support: [
      { prompt: 'Build a little sentence!', emoji: '🐱', mode: 'sentence', choices: ['run', 'I'], answer: 'I run' },
      { prompt: 'Make the sentence!', emoji: '🐶', mode: 'sentence', choices: ['The', 'dog'], answer: 'The dog' },
      { prompt: 'Put the words in order!', emoji: '😊', mode: 'sentence', choices: ['am', 'I', 'happy'], answer: 'I am happy' },
    ],
    challenge: [
      { prompt: 'Build the sentence!', emoji: '🐈', mode: 'sentence', choices: ['small', 'The', 'sleeps', 'cat'], answer: 'The small cat sleeps' },
      { prompt: 'Put the words in order!', emoji: '🏫', mode: 'sentence', choices: ['every', 'walk', 'to', 'I', 'school', 'day'], answer: 'I walk to school every day' },
      { prompt: 'Make a question!', emoji: '📚', mode: 'sentence', choices: ['you', 'Do', 'read', '?'], answer: 'Do you read ?' },
    ],
  },
  stories: {
    support: [
      { prompt: 'What colour was Pip?', emoji: '🐉', story: 'Pip was a small green dragon. He blew bubbles and made his friends laugh.', choices: ['Green', 'Blue', 'Red'], answer: 'Green' },
      { prompt: 'What did Pip blow?', emoji: '🫧', story: 'Pip was a small green dragon. He blew bubbles and made his friends laugh.', choices: ['Bubbles', 'Leaves', 'Snow'], answer: 'Bubbles' },
    ],
    challenge: [
      { prompt: 'Why did the animals stop being afraid of Pip?', emoji: '🐉', story: 'The animals were scared of Pip until they saw he blew bubbles instead of fire. Later, Pip helped them stay warm.', choices: ['He was very small', 'He blew bubbles and helped them', 'He ran away'], answer: 'He blew bubbles and helped them' },
      { prompt: 'What can we learn about Pip from the story?', emoji: '✨', story: 'The animals were scared of Pip until they saw he blew bubbles instead of fire. Later, Pip helped them stay warm.', choices: ['He was kind and helpful', 'He did not like animals', 'He was afraid of bubbles'], answer: 'He was kind and helpful' },
    ],
  },
  listening: {
    support: [
      { prompt: 'Listen, then find what you hear!', emoji: '🔈', audio: 'A cat', choices: ['🐱 cat', '🐶 dog', '🐟 fish'], answer: '🐱 cat' },
      { prompt: 'What colour did you hear?', emoji: '🎧', audio: 'Blue', choices: ['🔵 blue', '🔴 red', '🟡 yellow'], answer: '🔵 blue' },
    ],
    challenge: [
      { prompt: 'Listen closely. Which picture matches?', emoji: '🎧', audio: 'A small green frog', choices: ['🐸 small green frog', '🐸 big red frog', '🐢 green turtle'], answer: '🐸 small green frog' },
      { prompt: 'What did you hear?', emoji: '🔊', audio: 'Three yellow stars', choices: ['⭐ three yellow stars', '⭐ two blue stars', '🌙 three yellow moons'], answer: '⭐ three yellow stars' },
    ],
  },
  quiz: {
    support: [
      { prompt: 'Choose the missing word: “I ___ a book.”', emoji: '📖', choices: ['read', 'blue', 'table'], answer: 'read' },
      { prompt: 'Which word names a thing?', emoji: '🪑', choices: ['chair', 'run', 'quickly'], answer: 'chair' },
      { prompt: 'Pick the describing word!', emoji: '☀️', choices: ['bright', 'jump', 'pencil'], answer: 'bright' },
    ],
    challenge: [
      { prompt: 'Choose the correct word: “The birds ___ singing.”', emoji: '🐦', choices: ['are', 'is', 'am'], answer: 'are' },
      { prompt: 'Which word means the opposite of “careful”?', emoji: '🧠', choices: ['careless', 'kind', 'helpful'], answer: 'careless' },
      { prompt: 'Which sentence uses a question mark?', emoji: '❓', choices: ['Where is my hat?', 'I found my hat.', 'My hat is red.'], answer: 'Where is my hat?' },
    ],
  },
}

function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-GB'
  utterance.rate = 0.82
  window.speechSynthesis.speak(utterance)
}

function playChime(isCorrect: boolean) {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return
  const audio = new AudioContext()
  const oscillator = audio.createOscillator()
  const volume = audio.createGain()
  oscillator.connect(volume)
  volume.connect(audio.destination)
  oscillator.type = 'sine'
  oscillator.frequency.value = isCorrect ? 660 : 220
  volume.gain.setValueAtTime(0.08, audio.currentTime)
  volume.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.22)
  oscillator.start()
  oscillator.stop(audio.currentTime + 0.22)
  oscillator.onended = () => { void audio.close() }
}

function ProgressBar({ value, color = '#38aa83' }: { value: number; color?: string }) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-[#edf0f2]">
      <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.7 }} style={{ backgroundColor: color }} />
    </div>
  )
}

function GameOverlay({ game, soundOn, performance, learnerLevel, onClose, onComplete }: {
  game: Game
  soundOn: boolean
  performance?: GamePerformance
  learnerLevel: string
  onClose: () => void
  onComplete: (answers: boolean[]) => Promise<SavedResult>
}) {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [built, setBuilt] = useState<string[]>([])
  const [revealed, setRevealed] = useState(false)
  const [answerResults, setAnswerResults] = useState<boolean[]>([])
  const [seconds, setSeconds] = useState(25)
  const [timerExpired, setTimerExpired] = useState(false)
  const [complete, setComplete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [savedProgress, setSavedProgress] = useState<SavedResult | null>(null)
  const questionBand = performance ? performance.accuracy < 65 ? 'support' : performance.accuracy >= 85 ? 'challenge' : null : null
  const advancedPlacement = !performance && ['word', 'sentence', 'story', 'conversation'].includes(learnerLevel)
  const personalizedQuestions = questionBand
    ? practiceQuestionSets[game.id]?.[questionBand] ?? game.questions
    : advancedPlacement
      ? practiceQuestionSets[game.id]?.challenge ?? game.questions
      : game.questions
  const question = personalizedQuestions[questionIndex]
  const isQuiz = game.id === 'quiz'
  const isCorrect = selected === question.answer
  const assembled = built.join(question.mode === 'sentence' ? ' ' : '')

  useEffect(() => {
    if (!isQuiz || complete || timerExpired) return
    const timer = window.setInterval(() => setSeconds((remaining) => {
      if (remaining <= 1) {
        window.clearInterval(timer)
        setTimerExpired(true)
        return 0
      }
      return remaining - 1
    }), 1000)
    return () => window.clearInterval(timer)
  }, [complete, isQuiz, timerExpired])

  function submitAnswer(answer: string) {
    const correct = answer === question.answer
    setSelected(correct ? question.answer : '__wrong__')
    setAnswerResults((results) => [...results, correct])
    if (soundOn) playChime(correct)
  }

  async function nextQuestion() {
    if (questionIndex >= personalizedQuestions.length - 1) {
      setSaving(true)
      setSaveError('')
      try {
        const result = await onComplete(answerResults)
        setSavedProgress(result)
        setComplete(true)
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : 'Could not save your progress. Try again.')
      } finally {
        setSaving(false)
      }
      return
    }
    setQuestionIndex((index) => index + 1)
    setSelected(null)
    setBuilt([])
    setRevealed(false)
    setTimerExpired(false)
    setSeconds(25)
  }

  function checkTiles() {
    const correct = assembled.toLowerCase() === question.answer.toLowerCase()
    setAnswerResults((results) => [...results, correct])
    if (correct) {
      if (soundOn) playChime(true)
      setSelected(question.answer)
    } else {
      if (soundOn) playChime(false)
      setSelected('__wrong__')
    }
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-[#15253b]/55 p-3 backdrop-blur-sm sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.section role="dialog" aria-modal="true" aria-labelledby="game-title" initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl sm:p-8">
        <button type="button" aria-label="Close game" onClick={onClose} className="absolute right-4 top-4 rounded-full bg-[#f3f5f6] p-2.5 text-[#657386] transition hover:bg-[#e8edf0]"><X size={19} /></button>
        <div className="mb-7 flex items-center gap-3 pr-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ backgroundColor: game.color }}>{game.icon}</div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#96a0ab]">{game.category} · Quest {questionIndex + 1}/{personalizedQuestions.length}</p>
            <h2 id="game-title" className="truncate text-lg font-extrabold text-[#26384c]">{game.title}</h2>
          </div>
          {isQuiz && <div className="flex items-center gap-1.5 rounded-full bg-[#fff4dd] px-3 py-1.5 text-sm font-extrabold text-[#b87b0f]"><Zap size={15} /> {seconds}s</div>}
        </div>
        <ProgressBar value={((questionIndex + 1) / personalizedQuestions.length) * 100} color={game.iconColor} />

        <AnimatePresence mode="wait">
          {complete ? (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-12 text-center">
              <span className="mb-4 text-7xl">🎉</span>
              <h3 className="text-3xl font-black text-[#26384c]">Brilliant playing!</h3>
              <p className="mt-2 text-[#7e8994]">{savedProgress ? `${savedProgress.profile.completed_levels} levels completed. Your next adventure is waiting!` : 'Your next adventure is waiting.'}</p>
              <button onClick={onClose} className="mt-7 rounded-2xl bg-[#26384c] px-8 py-3.5 font-extrabold text-white transition hover:bg-[#344c65]">Back to my map</button>
            </motion.div>
          ) : (
            <motion.div key={`${game.id}-${questionIndex}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="pt-7">
              {performance && performance.accuracy < 65 && <p className="mb-3 rounded-xl bg-[#fff6e2] px-3 py-2 text-center text-xs font-bold text-[#9c762b]">Let’s practice this skill together — you’re getting stronger! 🌱</p>}
              {performance && performance.accuracy >= 90 && <p className="mb-3 rounded-xl bg-[#eef2ff] px-3 py-2 text-center text-xs font-bold text-[#7564b0]">You’re a star at this! Try a challenge round. ✨</p>}
              {timerExpired && <p role="status" className="mb-3 rounded-xl bg-[#fff6e2] px-3 py-2 text-center text-xs font-bold text-[#9c762b]">Time’s up! Take your time to finish this round — your progress won’t disappear.</p>}
              <div className="mb-5 rounded-[1.5rem] bg-[#f7f9fa] px-5 py-6 text-center">
                <div className="mb-3 text-6xl" aria-hidden="true">{question.emoji}</div>
                {question.story && <p className="mx-auto mb-5 max-w-sm text-left text-[15px] leading-7 text-[#536476]">{question.story}</p>}
                <p className="text-lg font-extrabold leading-snug text-[#26384c] sm:text-xl">{question.prompt}</p>
                {question.audio && (
                  <button onClick={() => { if (soundOn) speak(question.audio!) }} className="mx-auto mt-4 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-extrabold text-[#398cb8] shadow-sm transition hover:shadow">
                    <Volume2 size={17} /> Hear it
                  </button>
                )}
              </div>

              {question.mode === 'flash' ? (
                <button disabled={revealed} onClick={() => { setRevealed(true); setSelected(question.answer); setAnswerResults((results) => [...results, true]) }} className="mx-auto flex min-h-20 w-full max-w-sm items-center justify-center rounded-2xl border-2 border-dashed border-[#d7e4ed] bg-[#f8fbfd] p-5 text-xl font-black text-[#398cb8] disabled:cursor-default">
                  {revealed ? question.answer : 'Tap to flip the card ✨'}
                </button>
              ) : question.mode === 'spell' || question.mode === 'sentence' ? (
                <>
                  <div className="mb-4 flex min-h-14 flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d8e3e8] bg-[#fbfcfd] p-3">
                    {built.length ? built.map((letter, index) => <span key={`${letter}-${index}`} className="rounded-xl bg-white px-3 py-2 text-lg font-black text-[#34485d] shadow-sm">{letter}</span>) : <span className="text-sm font-bold text-[#a6afb8]">{question.mode === 'spell' ? 'Tap letters to spell the word' : 'Tap words to make a sentence'}</span>}
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {question.choices.map((choice, index) => (
                      <button key={`${choice}-${index}`} disabled={built.filter((item) => item === choice).length >= question.choices.filter((item) => item === choice).length || selected !== null} onClick={() => setBuilt((items) => [...items, choice])} className="min-h-12 rounded-xl border border-[#e7ebee] bg-white px-4 font-extrabold text-[#34485d] shadow-sm transition hover:-translate-y-0.5 hover:border-[#a9c9df] disabled:opacity-35">{choice}</button>
                    ))}
                  </div>
                  {selected !== null && <p role="status" className={`mt-3 text-center text-sm font-extrabold ${selected === question.answer ? 'text-[#32835e]' : 'text-[#c87853]'}`}>{selected === question.answer ? 'You got it! ⭐' : `Good try! The answer is ${question.answer}.`}</p>}
                  <div className="mt-5 flex justify-center gap-3">
                    <button disabled={selected !== null} onClick={() => { setBuilt([]); setSelected(null) }} className="rounded-xl px-4 py-3 font-bold text-[#758493] disabled:opacity-40">Clear</button>
                    {selected === null ? <button disabled={built.length === 0} onClick={checkTiles} className="rounded-xl bg-[#26384c] px-6 py-3 font-extrabold text-white disabled:opacity-40">Check it <Check className="ml-1 inline" size={17} /></button> : <button disabled={saving} onClick={() => void nextQuestion()} className="rounded-xl bg-[#26384c] px-6 py-3 font-extrabold text-white disabled:opacity-50">{saving ? 'Saving…' : saveError ? 'Try saving again' : questionIndex === personalizedQuestions.length - 1 ? 'Finish' : 'Next'} <ArrowRight className="ml-1 inline" size={17} /></button>}
                  </div>
                  {saveError && <p role="alert" className="mt-3 text-center text-sm font-bold text-[#bd6555]">{saveError}</p>}
                </>
              ) : (
                <div className={`grid ${game.id === 'listening' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'} gap-2.5`}>
                  {question.choices.map((choice) => (
                    <motion.button key={choice} whileTap={{ scale: 0.97 }} disabled={selected !== null || (question.mode === 'flash' && !revealed)} onClick={() => submitAnswer(choice)} className={`min-h-14 rounded-2xl border-2 px-4 py-3 font-extrabold transition ${selected === choice ? 'border-[#54b58b] bg-[#eaf8f0] text-[#318961]' : selected === '__wrong__' && choice === question.answer ? 'border-[#54b58b] bg-[#eaf8f0] text-[#318961]' : selected === '__wrong__' ? 'border-[#eceff1] bg-[#f8f9fa] text-[#a0a9b2]' : 'border-[#edf0f2] bg-white text-[#34485d] hover:border-[#b9ccda] hover:bg-[#f7fafb]'}`}>
                      {choice}
                    </motion.button>
                  ))}
                </div>
              )}

              {selected !== null && question.mode !== 'spell' && question.mode !== 'sentence' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-[#f3f8f5] p-3.5">
                  <p className="font-extrabold text-[#32835e]">{selected === '__wrong__' ? 'Good try! Look for the green answer.' : 'That’s right! ⭐'}</p>
                  <button disabled={saving} onClick={() => void nextQuestion()} className="shrink-0 rounded-xl bg-[#26384c] px-4 py-2.5 text-sm font-extrabold text-white disabled:opacity-50">{saving ? 'Saving…' : saveError ? 'Try again' : questionIndex === personalizedQuestions.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="ml-1 inline" size={16} /></button>
                </motion.div>
              )}
              {saveError && <p role="alert" className="mt-3 text-center text-sm font-bold text-[#bd6555]">{saveError}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </motion.div>
  )
}

export default function StudentLearnPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('home')
  const [progress, setProgress] = useState<LearnerProgress>(defaultProgress)
  const [learner, setLearner] = useState<Learner | null>(null)
  const [gameProgress, setGameProgress] = useState<Record<string, GamePerformance>>({})
  const [activeGame, setActiveGame] = useState<Game | null>(null)
  const [soundOn, setSoundOn] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const completedInWorld = progress.completed_levels % 3
  const startingWorldIndex = learner?.current_level === 'word' ? 2
    : learner?.current_level === 'sentence' ? 3
      : learner?.current_level === 'story' ? 5
        : learner?.current_level === 'conversation' ? 6
          : 0
  const unlockedWorldIndex = Math.min(startingWorldIndex + Math.floor(progress.completed_levels / 3), worlds.length - 1)
  const currentWorld = worlds[unlockedWorldIndex]
  const currentGame = games.find((game) => game.id === currentWorld.game) ?? games[0]
  const weakestPractice = Object.entries(gameProgress).filter(([, score]) => score.attempts > 0).sort(([, left], [, right]) => left.accuracy - right.accuracy)[0]
  const practiceGame = games.find((game) => game.id === weakestPractice?.[0])
  const badgeCount = Math.min(Math.floor(progress.completed_levels / 2), 8)
  const avatar = badgeCount >= 4 ? '🦊' : badgeCount >= 2 ? '🐼' : learner?.avatar_emoji ?? '🐻'

  useEffect(() => {
    let active = true
    fetch('/api/student/session')
      .then(async (response) => {
        const result = await response.json()
        if (response.status === 401) {
          router.replace('/student/login')
          return null
        }
        if (!response.ok) throw new Error(result.error ?? 'Unable to load your learning profile.')
        return result as { student: Learner; profile: LearnerProgress; gameProgress: Record<string, GamePerformance> }
      })
      .then((result) => {
        if (!active || !result) return
        setLearner(result.student)
        setProgress(result.profile)
        setGameProgress(result.gameProgress)
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Unable to load your learning profile.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [router])

  function openGame(game: Game) {
    setActiveGame(game)
  }

  async function finishGame(answers: boolean[]): Promise<SavedResult> {
    if (!activeGame) throw new Error('Choose a game before saving progress.')
    const response = await fetch('/api/student/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: activeGame.id, answers }),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error ?? 'Could not save your progress. Please try again.')
    const saved = result as SavedResult
    setProgress(saved.profile)
    setGameProgress((current) => ({ ...current, [activeGame.id]: saved.gameProgress }))
    return saved
  }

  function chooseTab(nextTab: Tab) {
    setActiveGame(null)
    setTab(nextTab)
  }

  function startLevel(worldIndex: number, level: number) {
    const relativeLevel = (worldIndex - startingWorldIndex) * 3 + level
    if (worldIndex >= startingWorldIndex && worldIndex <= unlockedWorldIndex && relativeLevel <= progress.completed_levels + 1) {
      const chosen = games.find((game) => game.id === worlds[worldIndex].game)
      if (chosen) openGame(chosen)
    }
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5] text-sm font-bold text-[#6f8278]">Loading your own adventure… ✨</main>
  }

  if (loadError) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5] p-5"><div role="alert" className="max-w-md rounded-2xl bg-white p-7 text-center shadow"><p className="font-bold text-[#bd6555]">{loadError}</p><button onClick={() => router.replace('/student/login')} className="mt-5 rounded-xl bg-[#315c51] px-5 py-3 font-bold text-white">Back to student sign in</button></div></main>
  }

  return (
    <div className="min-h-screen bg-[#f7f8f5] text-[#26384c]">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className="sticky top-0 hidden h-screen w-[238px] shrink-0 flex-col border-r border-[#e9edeb] bg-white px-5 py-7 lg:flex">
          <button onClick={() => chooseTab('home')} className="mb-10 flex items-center gap-3 text-left">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f5ef] text-2xl">✨</span>
            <span><span className="block text-lg font-black tracking-tight">aurelia</span><span className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#93a19d]">little learners</span></span>
          </button>
          <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#a3ada8]">Your playground</p>
          <nav className="space-y-1.5">
            {([
              ['home', Home, 'My learning map'],
              ['games', Gamepad2, 'Play a game'],
              ['rewards', Gift, 'My rewards'],
            ] as const).map(([id, Icon, label]) => (
              <button key={id} onClick={() => chooseTab(id)} className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-extrabold transition ${tab === id ? 'bg-[#eaf6ef] text-[#358962]' : 'text-[#7c8b85] hover:bg-[#f6f8f6]'}`}>
                <Icon size={18} /> {label}
              </button>
            ))}
          </nav>
          <div className="mt-auto rounded-[1.5rem] bg-[#fff5df] p-4">
            <div className="mb-2 flex items-center gap-2"><span className="text-xl">🧸</span><span className="text-sm font-black text-[#765f32]">You’ve got this!</span></div>
            <p className="text-xs leading-5 text-[#97835a]">Every little step makes your English stronger.</p>
            <div className="mt-4 flex gap-1 text-lg" aria-label="Three stars">⭐ ⭐ ⭐</div>
          </div>
          <button onClick={async () => { await fetch('/api/student/logout', { method: 'POST' }); router.replace('/student/login') }} className="mt-4 rounded-xl px-3 py-2 text-left text-xs font-bold text-[#9ba59f] hover:bg-[#f7f8f5]"><ArrowLeft className="mr-1 inline" size={14} /> Exit learning</button>
        </aside>

        <main className="min-w-0 flex-1 pb-24 lg:pb-8">
          <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#e9edeb] bg-[#f7f8f5]/95 px-4 backdrop-blur sm:px-7 lg:px-10">
            <div className="flex items-center gap-3 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5ef] text-xl">✨</span>
              <span className="font-black">aurelia</span>
            </div>
            <div className="hidden text-sm font-bold text-[#98a39d] lg:block">{tab === 'home' ? 'Your learning map' : tab === 'games' ? 'Choose your adventure' : 'Your treasure chest'}</div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={() => setSoundOn((value) => !value)} aria-label={soundOn ? 'Mute sounds' : 'Turn sounds on'} className="hidden h-10 w-10 items-center justify-center rounded-full bg-white text-[#7b8c85] shadow-sm sm:flex"><AudioLines size={17} /></button>
              <div className="flex items-center gap-1.5 rounded-full bg-[#fff1d4] px-3 py-2 text-sm font-black text-[#b17b17]"><Flame size={17} className="fill-[#f4ad3c] text-[#f4ad3c]" /> <span>{progress.streak_days}</span><span className="hidden sm:inline">day streak</span></div>
              <button onClick={() => chooseTab('rewards')} aria-label="Open avatar and rewards" className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#dff2e7] text-2xl shadow-sm">{avatar}</button>
            </div>
          </header>

          <div className="mx-auto max-w-[1190px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
            {tab === 'home' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <section className="relative mb-7 overflow-hidden rounded-[2rem] bg-[#315c51] px-6 py-7 text-white shadow-[0_18px_50px_-34px_rgba(41,79,68,.65)] sm:px-9 sm:py-9">
                  <div className="absolute -right-7 -top-16 h-64 w-64 rounded-full bg-[#ffffff]/[.06]" />
                  <div className="absolute bottom-[-100px] right-[20%] h-52 w-52 rounded-full bg-[#c5edb8]/[.08]" />
                  <div className="relative z-10 flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
                    <div className="max-w-xl">
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-extrabold text-[#d6efde]"><Sparkles size={14} /> YOUR NEXT ADVENTURE IS READY</div>
                      <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">Hey, {learner?.full_name.split(' ')[0] ?? 'little star'}!<br /><span className="text-[#d1efab]">Ready to play?</span></h1>
                      <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">A few fun minutes today help you grow new English skills.</p>
                      <button onClick={() => openGame(currentGame)} className="mt-6 inline-flex min-h-12 items-center gap-2.5 rounded-2xl bg-[#edc866] px-5 py-3 text-sm font-black text-[#4d482e] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#f4d77e]">Continue your journey <ChevronRight size={18} /></button>
                    </div>
                    <div className="relative mr-3 flex h-36 w-36 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[.08] text-7xl sm:h-44 sm:w-44 sm:text-8xl">
                      <motion.span animate={{ y: [0, -8, 0], rotate: [0, 3, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} aria-hidden="true">🦊</motion.span>
                      <span className="absolute right-1 top-5 text-2xl">✨</span><span className="absolute bottom-2 left-1 text-xl">⭐</span>
                    </div>
                  </div>
                </section>

                <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Levels cleared', value: progress.completed_levels, icon: '🏁', color: '#e9f5ed' },
                    { label: 'Badges', value: badgeCount, icon: '🏅', color: '#f2edff' },
                    { label: 'Next world', value: `${Math.max(0, 3 - completedInWorld)} to go`, icon: '🗺️', color: '#eaf3fa' },
                    { label: 'Practice games', value: Object.values(gameProgress).reduce((total, game) => total + game.attempts, 0), icon: '🎮', color: '#edf2fa' },
                  ].map((item) => <div key={item.label} className="rounded-[1.3rem] border border-[#edf0ed] bg-white p-4 sm:p-5"><span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: item.color }}>{item.icon}</span><p className="text-xl font-black text-[#33465a] sm:text-2xl">{item.value}</p><p className="mt-1 text-xs font-bold text-[#9aa49e]">{item.label}</p></div>)}
                </section>

                <section className="mb-8">
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div><p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#99a49d]">One little step at a time</p><h2 className="text-2xl font-black tracking-tight text-[#2d4154] sm:text-[27px]">Your world map</h2></div>
                    <span className="mb-1 hidden text-xs font-bold text-[#9aa49e] sm:block">8 magical worlds to explore</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {worlds.map((world, index) => {
                      const isPlacementSkip = index < startingWorldIndex
                      const isLocked = index > unlockedWorldIndex || isPlacementSkip
                      const completedHere = isPlacementSkip ? 0 : Math.max(0, Math.min(3, progress.completed_levels - (index - startingWorldIndex) * 3))
                      const percent = Math.round((completedHere / 3) * 100)
                      return (
                        <motion.article key={world.name} whileHover={!isLocked ? { y: -3 } : undefined} className={`relative overflow-hidden rounded-[1.55rem] border bg-white p-4 shadow-[0_5px_20px_-15px_rgba(34,60,50,.35)] sm:p-5 ${isLocked ? 'border-[#edf0ed] opacity-65' : 'border-[#e9eeea]'}`}>
                          <div className="mb-3 flex items-center justify-between">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ backgroundColor: world.tint }}>{world.icon}</span>
                            <span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#a2aca7]">WORLD {index + 1}</span>
                          </div>
                          <h3 className="text-base font-black text-[#34485c]">{world.name}</h3>
                          <p className="mt-0.5 text-xs font-bold text-[#9aa49e]">{isPlacementSkip ? 'Your teacher placed you past this world' : world.subtitle}</p>
                          <div className="mb-3 mt-4 flex items-center justify-between text-[11px] font-extrabold text-[#88958e]"><span>{isPlacementSkip ? 'Placement skip' : `${completedHere}/3 levels`}</span><span>{isPlacementSkip ? '—' : `${percent}%`}</span></div>
                          <ProgressBar value={percent} color={world.accent} />
                          <div className="mt-4 flex gap-2">
                            {[0, 1, 2].map((level) => {
                              const relativeLevel = (index - startingWorldIndex) * 3 + level
                              const canPlay = !isLocked && relativeLevel <= progress.completed_levels + 1
                              const isDone = !isPlacementSkip && relativeLevel <= progress.completed_levels
                              return <button key={level} disabled={!canPlay} onClick={() => startLevel(index, level + 1)} aria-label={`${world.name}, level ${level + 1}${isDone ? ', completed' : canPlay ? ', start' : ', locked'}`} className={`flex h-9 flex-1 items-center justify-center rounded-xl text-xs font-black transition ${isDone ? 'bg-[#e7f5eb] text-[#389067]' : canPlay ? 'text-white shadow-sm hover:brightness-105' : 'bg-[#f3f5f3] text-[#c1c9c4]'}`} style={canPlay && !isDone ? { backgroundColor: world.accent } : undefined}>{isDone ? <Check size={16} /> : isLocked || relativeLevel > progress.completed_levels ? <LockKeyhole size={13} /> : level + 1}</button>
                            })}
                          </div>
                        </motion.article>
                      )
                    })}
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#eef6ef] px-4 py-3 text-xs font-bold text-[#63816e]"><MoonStar size={16} className="shrink-0" /> Complete 3 levels to open your next magical world!</div>
                </section>

                <section>
                  <div className="mb-4 flex items-end justify-between gap-3"><div><p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#99a49d]">Pick up a new skill</p><h2 className="text-2xl font-black tracking-tight text-[#2d4154]">Quick-play games</h2></div><button onClick={() => chooseTab('games')} className="text-xs font-extrabold text-[#438a68]">See all games <ArrowRight className="ml-1 inline" size={14} /></button></div>
                  {practiceGame && <button onClick={() => openGame(practiceGame)} className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-[#f0e4c6] bg-[#fff9ea] p-4 text-left"><span className="text-2xl">🌱</span><span className="flex-1"><span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#a27b35]">Your personal practice pick</span><span className="mt-1 block text-sm font-black text-[#625238]">{practiceGame.title} · {weakestPractice?.[1].accuracy}% so far — let’s grow together!</span></span><ChevronRight size={18} className="text-[#a27b35]" /></button>}
                  <GameGrid games={games.slice(0, 4)} onPlay={openGame} />
                </section>
              </motion.div>
            )}

            {tab === 'games' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mb-7 rounded-[1.8rem] bg-[#edf6ef] p-6 sm:p-8"><div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">🎮</div><p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#7e9b87]">Choose what sounds fun</p><h1 className="text-3xl font-black tracking-tight text-[#304c40]">Let’s play a game!</h1><p className="mt-2 max-w-lg text-sm leading-6 text-[#718b79]">Every game helps your English grow. Pick a favorite and collect some stars.</p></div>
                <GameGrid games={games} onPlay={openGame} />
                <button disabled className="mt-5 flex w-full items-center justify-between rounded-[1.4rem] border border-dashed border-[#d9e2dd] bg-white p-5 text-left opacity-80 sm:p-6">
                  <span className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1edff] text-2xl">🎤</span><span><span className="block font-black text-[#435369]">Speaking practice</span><span className="mt-1 block text-xs font-semibold text-[#9aa49e]">Voice adventures are coming soon!</span></span></span><Mic className="text-[#a18bdc]" size={20} />
                </button>
              </motion.div>
            )}

            {tab === 'rewards' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <section className="mb-7 overflow-hidden rounded-[2rem] bg-[#f2edff] p-6 sm:p-9">
                  <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                    <div><p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#927cbf]">Your achievement garden</p><h1 className="text-3xl font-black text-[#443863]">Look how far you’ve come!</h1><p className="mt-2 text-sm text-[#83759e]">Badges bloom as you explore new learning worlds.</p><div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 font-black text-[#7963bc]"><Trophy size={17} /> {badgeCount} badges earned</div></div>
                    <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-8xl">🎁</motion.div>
                  </div>
                </section>
                <h2 className="mb-4 text-xl font-black text-[#34485c]">Your badges</h2>
                <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {['First steps', 'Word explorer', 'Story star', 'Super streak'].map((name, index) => {
                    const earnedBadge = index < badgeCount
                    return <div key={name} className={`rounded-[1.4rem] border p-5 text-center ${earnedBadge ? 'border-[#eee7d5] bg-white' : 'border-[#edf0ed] bg-white/60 opacity-60'}`}><div className="mb-2 text-4xl">{['🌱', '🧭', '📖', '🔥'][index]}</div><p className="text-sm font-black text-[#435369]">{name}</p><p className="mt-1 text-[11px] font-bold text-[#9ba49f]">{earnedBadge ? 'You earned it!' : 'Keep playing to unlock'}</p></div>
                  })}
                </div>
                <h2 className="mb-4 text-xl font-black text-[#34485c]">Your avatar collection</h2>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">{['🐻', '🦊', '🐼', '🐸', '🦁', '🐧'].map((item, index) => { const unlocked = index === 0 || badgeCount >= index; return <div key={item} className={`flex flex-col items-center rounded-[1.3rem] border p-4 ${unlocked ? 'border-[#e8eeea] bg-white' : 'border-[#edf0ed] bg-white/60 opacity-50'}`}><span className="text-4xl">{unlocked ? item : '🔒'}</span><span className="mt-2 text-[10px] font-extrabold text-[#98a39d]">{unlocked ? 'Unlocked' : 'Earn a badge'}</span></div> })}</div>
              </motion.div>
            )}

          </div>
        </main>
      </div>

      <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-[#e9edeb] bg-white px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 lg:hidden">
        {([
          ['home', Home, 'Map'],
          ['games', Gamepad2, 'Games'],
          ['rewards', Trophy, 'Rewards'],
        ] as const).map(([id, Icon, label]) => <button key={id} onClick={() => chooseTab(id)} className={`flex flex-col items-center gap-1 py-1.5 text-[10px] font-extrabold ${tab === id ? 'text-[#358962]' : 'text-[#9ba49f]'}`}><Icon size={19} />{label}</button>)}
      </nav>

      <AnimatePresence>{activeGame && <GameOverlay key={activeGame.id} game={activeGame} soundOn={soundOn} learnerLevel={learner?.current_level ?? 'letter'} performance={gameProgress[activeGame.id]} onClose={() => setActiveGame(null)} onComplete={finishGame} />}</AnimatePresence>
    </div>
  )
}

function GameGrid({ games: availableGames, onPlay }: { games: Game[]; onPlay: (game: Game) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {availableGames.map((game, index) => (
        <motion.button key={game.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.035 }} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} onClick={() => onPlay(game)} className="group flex min-h-[164px] flex-col items-start rounded-[1.5rem] border border-[#e9eeea] bg-white p-4 text-left shadow-[0_5px_20px_-15px_rgba(34,60,50,.35)] transition hover:shadow-md sm:p-5">
          <div className="mb-4 flex w-full items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition group-hover:scale-105" style={{ backgroundColor: game.color }}>{game.icon}</span><span className="rounded-full bg-[#f5f7f5] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[.12em] text-[#96a19a]">{game.category}</span></div>
          <span className="text-base font-black text-[#35495c]">{game.title}</span><span className="mt-1 text-xs leading-5 text-[#97a29b]">{game.subtitle}</span>
          <span className="mt-auto pt-4 text-xs font-extrabold" style={{ color: game.iconColor }}>Play now <ArrowRight className="ml-1 inline transition group-hover:translate-x-1" size={14} /></span>
        </motion.button>
      ))}
    </div>
  )
}
