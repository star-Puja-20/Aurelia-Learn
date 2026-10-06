'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StudentAvatar } from '@/components/ui/avatar'
import { AVATAR_EMOJIS, AVATAR_COLORS, LEVELS_ORDERED } from '@/lib/constants'
import type { LearningLevel } from '@/lib/types'

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  level: z.enum(['letter', 'word', 'sentence', 'story', 'conversation']),
  pin: z.string().regex(/^\d{6}$/, 'Choose a 6 digit learner PIN'),
})
type FormData = z.infer<typeof schema>

export default function NewStudentPage() {
  const router = useRouter()
  const [selectedEmoji, setSelectedEmoji] = useState(AVATAR_EMOJIS[0])
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0])
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { level: 'letter', pin: '' },
  })

  const fullName = watch('fullName') || ''
  const level = watch('level')

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          level: data.level,
          avatarEmoji: selectedEmoji,
          avatarColor: selectedColor,
          pin: data.pin,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Unable to add student')
      toast.success(`${data.fullName} has been added to the session list.`)
      router.push('/teacher/students')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to add student.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-navy-800 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="font-display text-3xl text-navy-800 mb-6">Add a New Student</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar preview */}
        <Card>
          <CardHeader><CardTitle>Choose Avatar</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Preview */}
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <StudentAvatar emoji={selectedEmoji} color={selectedColor} name={fullName} size="xl" />
              </motion.div>
              <div>
                <p className="font-semibold text-navy-800">{fullName}</p>
                <p className="text-sm text-gray-500 capitalize">{level} level</p>
              </div>
            </div>

            {/* Emoji grid */}
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Character</p>
              <div className="flex flex-wrap gap-2">
                {AVATAR_EMOJIS.map(emoji => (
                  <motion.button
                    key={emoji}
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      selectedEmoji === emoji
                        ? 'ring-2 ring-sky-500 ring-offset-1 bg-sky-50'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Colour grid */}
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Colour</p>
              <div className="flex flex-wrap gap-2">
                {AVATAR_COLORS.map(color => (
                  <motion.button
                    key={color}
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedColor(color)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === color && <Check className="h-4 w-4 text-white drop-shadow" />}
                  </motion.button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student details */}
        <Card>
          <CardHeader><CardTitle>Student Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Full name"
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Starting level</label>
              <Select value={level} onValueChange={v => setValue('level', v as LearningLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS_ORDERED.map(l => (
                    <SelectItem key={l} value={l} className="capitalize">{l.charAt(0).toUpperCase() + l.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Level can only be changed by you as their teacher</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Session access</label>
              <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                Students sign in with their name and this PIN at <strong>/student/login</strong>. Share the PIN privately with the student or their caregiver.
              </div>
            </div>

            <Input
              label="Learner PIN"
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              maxLength={6}
              error={errors.pin?.message}
              hint="Choose 6 numbers. The PIN is stored as a secure hash."
              {...register('pin')}
            />
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? 'Adding student…' : 'Add Student'}
        </Button>
      </form>
    </div>
  )
}
