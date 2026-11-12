import Link from 'next/link'
import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cream-100 to-mint-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-500 rounded-2xl shadow-lg mb-4">
            <Star className="h-8 w-8 text-white fill-white" aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl text-navy-800">Reset your password</h1>
        </div>
        <Card>
          <CardContent className="space-y-4 p-8 text-sm text-gray-600">
            <p>
              Aurelia Learn accounts use a username instead of an email address, so passwords cannot be reset by email.
            </p>
            <p>
              Please ask your administrator to reset your password. Give them your username so they can find your account.
            </p>
            <Link href="/auth/login" className="block text-center font-semibold text-sky-600 hover:underline">
              Back to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
