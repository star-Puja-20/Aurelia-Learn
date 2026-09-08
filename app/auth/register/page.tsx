'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'At least 8 characters'),
  confirm: z.string(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please agree before creating your account' }) }),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

type Form = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) })

  async function onSubmit(data: Form) {
    setLoading(true)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || supabaseUrl.startsWith('your_') || !supabaseKey || supabaseKey.startsWith('your_')) {
        toast.error('Add your Supabase URL and anon key to .env.local before signing up.')
        return
      }

      const supabase = createClient()
      const { data: signupData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            privacy_consent: true,
            privacy_consent_at: new Date().toISOString(),
            privacy_policy_version: '2026-09-03',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      if (signupData.session) {
        toast.success('Account created successfully!')
        router.push('/teacher/dashboard')
      } else {
        router.push(`/auth/verify-email?contact=${encodeURIComponent(data.email)}`)
      }
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
              <Input label="Full name" placeholder="Ms. Sarah Johnson" error={errors.fullName?.message} {...register('fullName')} />
              <Input label="Email address" type="email" placeholder="you@school.com" error={errors.email?.message} {...register('email')} />
              <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
              <Input label="Confirm password" type="password" placeholder="••••••••" error={errors.confirm?.message} {...register('confirm')} />
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
