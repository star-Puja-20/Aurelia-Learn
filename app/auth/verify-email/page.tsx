'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Mail, RefreshCw, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerificationFallback />}>
      <VerifyEmailContent />
    </Suspense>
  )
}

function VerificationFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cream-100 to-mint-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rounded-2xl border border-sky-100 bg-white/80 p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 h-14 w-14 animate-pulse rounded-full bg-sky-100" />
        <div className="h-7 w-36 animate-pulse rounded bg-slate-200 mx-auto" />
      </div>
    </div>
  )
}

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const verified = searchParams.get('verified') === '1'
  const email = searchParams.get('email') ?? ''
  const [contact, setContact] = useState(email)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const value = params.get('contact') ?? params.get('email')
    if (value) setContact(value)
  }, [])

  async function resendCode() {
    const normalizedContact = contact.trim()
    if (!normalizedContact) {
      toast.error('Enter your email address first.')
      return
    }

    setResending(true)
    try {
      const { error } = await createClient().auth.resend({
        type: 'signup',
        email: normalizedContact,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
      toast.success('A new verification email has been sent.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to resend the verification email.')
    } finally {
      setResending(false)
    }
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cream-100 to-mint-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6 sm:p-8 text-center space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="font-display text-3xl text-navy-800">Email verified</h1>
                <p className="mt-2 text-sm text-gray-500">
                  {email ? `Your email ${email} has been confirmed successfully.` : 'Your email has been confirmed successfully.'}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                You can now sign in to continue and access your account.
              </div>
              <Button onClick={() => router.push('/auth/login')} className="w-full" size="lg">
                Go to sign in
              </Button>
              <Button variant="outline" onClick={() => router.push('/')} className="w-full">
                Back to home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cream-100 to-mint-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-500 rounded-2xl shadow-lg mb-4">
            <Star className="h-8 w-8 text-white fill-white" />
          </div>
          <h1 className="font-display text-3xl text-navy-800">Verify your email</h1>
          <p className="text-gray-500 text-sm mt-1">One quick step before you start teaching</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="p-5 sm:p-8 space-y-7">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                <Mail className="h-7 w-7" />
              </div>
              <h2 className="font-display text-xl text-navy-800">Check your inbox</h2>
              <p className="text-sm text-gray-500 mt-2">
                We sent a verification link to <strong className="text-gray-700">{contact || 'your email address'}</strong>.
              </p>
            </div>

            <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
              <p className="text-sm text-sky-900">
                Open the link in the email to verify your account. You will then be asked to sign in.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Email address"
                type="email"
                value={contact}
                onChange={event => setContact(event.target.value)}
                placeholder="teacher@school.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="border-t border-gray-100 pt-5 text-center">
              <p className="text-sm text-gray-500 mb-3">Didn’t receive the email?</p>
              <Button type="button" variant="outline" onClick={resendCode} disabled={resending}>
                <RefreshCw className={`h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Sending…' : 'Resend verification email'}
              </Button>
            </div>

            <a href="/auth/login" className="flex items-center justify-center gap-2 text-sm text-sky-600 font-semibold hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </a>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
