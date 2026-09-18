'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Star, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { normalizeUsername, USERNAME_PATTERN } from '@/lib/auth-validation'

const loginSchema = z.object({
  identifier: z.string().trim().regex(USERNAME_PATTERN, 'Use 3-30 letters, numbers, underscores, or hyphens'),
  password: z.string().min(1, 'Enter your password'),
})
type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })
  async function onSubmit(data: LoginForm) {
    setIsLoading(true)
    try {
      const username = normalizeUsername(data.identifier)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!supabaseUrl || supabaseUrl.startsWith('your_') || !supabaseKey || supabaseKey.startsWith('your_')) {
        toast.error('Configure Supabase to sign in.')
        return
      }

      const supabase = createClient()
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: `${username}@accounts.aurelialearn.internal`,
        password: data.password,
      })

      if (error) throw error

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: signInData.user.id,
        username,
        full_name: signInData.user.user_metadata?.full_name ?? '',
        role: 'teacher',
        privacy_consent: signInData.user.user_metadata?.privacy_consent === true,
        privacy_consent_at: signInData.user.user_metadata?.privacy_consent_at ?? null,
        privacy_policy_version: signInData.user.user_metadata?.privacy_policy_version ?? null,
      })
      if (profileError) throw profileError

      toast.success('Welcome back!')
      router.push('/teacher/dashboard')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign in.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cream-100 to-mint-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Decorative stars */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {['top-16 left-12', 'top-24 right-20', 'bottom-32 left-16', 'bottom-20 right-24'].map((pos, i) => (
          <motion.div
            key={i}
            className={`absolute ${pos} text-gold-400 opacity-40`}
            animate={{ y: [0, -10, 0], rotate: [0, 15, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
          >
            <Star className="h-6 w-6 fill-current" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md sm:max-w-lg"
      >
        {/* Logo card */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-sky-500 rounded-2xl shadow-lg mb-4"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Star className="h-8 w-8 text-white fill-white" />
          </motion.div>
          <h1 className="font-display text-3xl text-navy-800">Aurelia Learn</h1>
          <p className="text-gray-500 text-sm mt-1">Teacher & Administrator Portal</p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-2xl shadow-md p-5 sm:p-8">
          <h2 className="font-display text-xl text-navy-800 mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
            <Input
              label="Username"
              type="text"
              error={errors.identifier?.message}
              {...register('identifier')}
            />
            <div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <a href="/auth/forgot-password" className="text-xs text-sky-500 hover:text-sky-600 font-semibold">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Signing in…
                </span>
              ) : 'Sign in'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            New to Aurelia Learn?{' '}
            <a href="/auth/register" className="text-sky-500 font-semibold hover:underline">Create an account</a>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Student sessions open directly from their assigned learning links.
        </p>
      </motion.div>
    </div>
  )
}
