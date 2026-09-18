'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'
import { normalizeUsername, USERNAME_PATTERN } from '@/lib/auth-validation'

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  username: z.string().trim().regex(USERNAME_PATTERN, 'Use 3-30 letters, numbers, underscores, or hyphens'),
  password: z.string().min(8, 'At least 8 characters'),
  confirm: z.string(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please agree before creating your account' }) }),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

type Form = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'error'>('idle')
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) })
  const username = watch('username') ?? ''

  useEffect(() => {
    const normalized = normalizeUsername(username)
    if (!USERNAME_PATTERN.test(normalized)) {
      setUsernameStatus('idle')
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setUsernameStatus('checking')
      try {
        const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(normalized)}`, { signal: controller.signal })
        if (!response.ok) throw new Error('check failed')
        const result = await response.json()
        setUsernameStatus(result.available ? 'available' : 'taken')
      } catch {
        if (!controller.signal.aborted) setUsernameStatus('error')
      }
    }, 350)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [username])

  async function onSubmit(data: Form) {
    if (usernameStatus === 'taken') {
      toast.error('That username is already taken.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: normalizeUsername(data.username), password: data.password, fullName: data.fullName, privacyConsent: data.consent }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Unable to create your account.')
      toast.success('Account created successfully. Please sign in.')
      router.push('/auth/login')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create your account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cream-100 to-mint-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md sm:max-w-lg">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-sky-500 rounded-2xl shadow-lg mb-4">
            <span className="text-2xl sm:text-3xl">⭐</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-navy-800">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Start teaching with Aurelia Learn</p>
        </div>
        <Card className="shadow-lg border-0">
          <CardContent className="p-5 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
              <Input label="Full name" error={errors.fullName?.message} {...register('fullName')} />
              <Input label="Username" hint={usernameStatus === 'available' ? 'Username is available.' : usernameStatus === 'taken' ? 'That username is already taken.' : usernameStatus === 'checking' ? 'Checking availability…' : 'Use 3-30 letters, numbers, underscores, or hyphens'} error={errors.username?.message} {...register('username')} />
              <div className="relative">
                <Input label="Password" type={showPassword ? 'text' : 'password'} error={errors.password?.message} {...register('password')} />
                <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-8 text-gray-400 hover:text-gray-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="relative">
                <Input label="Confirm password" type={showConfirm ? 'text' : 'password'} error={errors.confirm?.message} {...register('confirm')} />
                <button type="button" onClick={() => setShowConfirm(value => !value)} className="absolute right-3 top-8 text-gray-400 hover:text-gray-600" aria-label={showConfirm ? 'Hide confirmed password' : 'Show confirmed password'}>
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <label className="flex items-start gap-3 text-sm text-gray-600">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-sky-500" {...register('consent')} />
                <span>
                  I agree that Aurelia Learn may store my account details, teacher observations, and learning data to provide and improve the service.
                  <span className="block text-xs text-gray-400 mt-1">You can request access to or deletion of your data.</span>
                </span>
              </label>
              {errors.consent?.message && <p className="text-sm text-coral-600">{errors.consent.message}</p>}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{' '}
              <a href="/auth/login" className="text-sky-500 font-semibold hover:underline">Sign in</a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
