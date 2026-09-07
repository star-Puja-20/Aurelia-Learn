'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, KeyRound, Mail, MessageSquare, RefreshCw, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function VerifyEmailPage() {
  const router = useRouter()
  const [contact, setContact] = useState('')
  const [contactType, setContactType] = useState<'email' | 'phone'>('email')
  const [otp, setOtp] = useState('')
  const [resending, setResending] = useState(false)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const value = params.get('contact') ?? params.get('email')
    if (value) setContact(value)
    if (params.get('type') === 'phone') setContactType('phone')
  }, [])

  async function resendCode() {
    const normalizedContact = contact.trim()
    if (!normalizedContact) {
      toast.error(`Enter your ${contactType === 'phone' ? 'mobile number' : 'email address'} first.`)
      return
    }

    setResending(true)
    try {
      const { error } = contactType === 'phone'
        ? await createClient().auth.resend({ type: 'sms', phone: normalizedContact })
        : await createClient().auth.resend({
            type: 'signup',
            email: normalizedContact,
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
          })
      if (error) throw error
      toast.success(contactType === 'phone' ? 'A new verification code has been sent by SMS.' : 'A new verification email has been sent.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to resend the verification email.')
    } finally {
      setResending(false)
    }
  }

  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedContact = contact.trim()
    const normalizedOtp = otp.trim()

    if (!normalizedContact || normalizedOtp.length !== 6) {
      toast.error(`Enter your ${contactType === 'phone' ? 'mobile number' : 'email address'} and the 6-digit code.`)
      return
    }

    setVerifying(true)
    try {
      const { data: verificationData, error } = contactType === 'phone'
        ? await createClient().auth.verifyOtp({ phone: normalizedContact, token: normalizedOtp, type: 'sms' })
        : await createClient().auth.verifyOtp({ email: normalizedContact, token: normalizedOtp, type: 'signup' })
      if (error) throw error
      if (verificationData.user) {
        const { error: profileError } = await createClient().from('profiles').upsert({
          id: verificationData.user.id,
          email: verificationData.user.email ?? null,
          phone: verificationData.user.phone ?? null,
          full_name: verificationData.user.user_metadata?.full_name ?? '',
          role: 'teacher',
          privacy_consent: verificationData.user.user_metadata?.privacy_consent === true,
          privacy_consent_at: verificationData.user.user_metadata?.privacy_consent_at ?? null,
          privacy_policy_version: verificationData.user.user_metadata?.privacy_policy_version ?? null,
        })
        if (profileError) throw profileError
      }
      toast.success(`${contactType === 'phone' ? 'Mobile number' : 'Email'} verified successfully.`)
      router.push('/teacher/dashboard')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'That verification code is not valid.')
    } finally {
      setVerifying(false)
    }
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
          <h1 className="font-display text-3xl text-navy-800">Verify your {contactType === 'phone' ? 'mobile number' : 'email'}</h1>
          <p className="text-gray-500 text-sm mt-1">One quick step before you start teaching</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="p-5 sm:p-8 space-y-7">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                {contactType === 'phone' ? <MessageSquare className="h-7 w-7" /> : <Mail className="h-7 w-7" />}
              </div>
              <h2 className="font-display text-xl text-navy-800">Check your {contactType === 'phone' ? 'messages' : 'inbox'}</h2>
              <p className="text-sm text-gray-500 mt-2">
                We sent a verification {contactType === 'phone' ? 'code by SMS' : 'link and code'} to <strong className="text-gray-700">{contact || 'your contact'}</strong>.
              </p>
            </div>

            <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
              <p className="text-sm text-sky-900">
                {contactType === 'phone' ? 'Enter the 6-digit code from the SMS below.' : 'Open the link in the email, or enter the 6-digit code below as an alternative.'}
              </p>
            </div>

            <form onSubmit={verifyCode} className="space-y-4">
              <Input
                label={contactType === 'phone' ? 'Mobile number' : 'Email address'}
                type={contactType === 'phone' ? 'tel' : 'email'}
                value={contact}
                onChange={event => setContact(event.target.value)}
                placeholder={contactType === 'phone' ? '+919876543210' : 'teacher@school.com'}
                autoComplete={contactType === 'phone' ? 'tel' : 'email'}
                required
              />
              <Input
                label="Verification code"
                type="text"
                value={otp}
                onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className="tracking-[0.35em] text-center text-lg"
                required
              />
              <Button type="submit" className="w-full" size="lg" disabled={verifying}>
                <KeyRound className="h-4 w-4" />
                {verifying ? 'Verifying…' : 'Verify with code'}
              </Button>
            </form>

            <div className="border-t border-gray-100 pt-5 text-center">
              <p className="text-sm text-gray-500 mb-3">Didn’t receive the {contactType === 'phone' ? 'SMS' : 'email'}?</p>
              <Button type="button" variant="outline" onClick={resendCode} disabled={resending}>
                <RefreshCw className={`h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Sending…' : `Resend verification ${contactType === 'phone' ? 'code' : 'email'}`}
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
