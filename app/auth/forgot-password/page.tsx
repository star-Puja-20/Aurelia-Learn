'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('')
  const [requested, setRequested] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!username.trim()) return
    setRequested(true)
    toast.success('Password reset request recorded.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cream-100 to-mint-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-500 rounded-2xl shadow-lg mb-4">
            <Star className="h-8 w-8 text-white fill-white" />
          </div>
          <h1 className="font-display text-2xl text-navy-800">Reset your password</h1>
        </div>
        <Card>
          <CardContent className="p-8">
            {requested ? (
              <div className="text-center py-4 space-y-4">
                <p className="font-semibold text-navy-800">Request received</p>
                <p className="text-gray-500 text-sm">An administrator must reset this username account because no email or phone recovery method is configured.</p>
                <a href="/auth/login" className="block text-sky-500 font-semibold text-sm hover:underline">Back to sign in</a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Username" value={username} onChange={event => setUsername(event.target.value)} required />
                <Button type="submit" className="w-full">Request administrator reset</Button>
                <p className="text-center text-sm text-gray-500">
                  <a href="/auth/login" className="text-sky-500 font-semibold hover:underline">Back to sign in</a>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
