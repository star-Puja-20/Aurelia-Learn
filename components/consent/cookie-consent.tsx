'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'

const STORAGE_KEY = 'al_cookie_consent'
const RESET_EVENT = 'al-cookie-consent-reset'
// Set NEXT_PUBLIC_ANALYTICS_DOMAIN (your site domain, as registered with Plausible) to turn analytics on.
const ANALYTICS_DOMAIN = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN

type Choice = 'accepted' | 'declined' | 'acknowledged'

function readChoice(): Choice | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'accepted' || value === 'declined' || value === 'acknowledged' ? value : null
  } catch {
    return null
  }
}

function writeChoice(choice: Choice) {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice)
  } catch {
    /* storage unavailable: the banner will simply show again next visit */
  }
}

export function CookieConsent() {
  const [ready, setReady] = useState(false)
  const [choice, setChoice] = useState<Choice | null>(null)

  useEffect(() => {
    setChoice(readChoice())
    setReady(true)
    const onReset = () => {
      try { window.localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
      setChoice(null)
    }
    window.addEventListener(RESET_EVENT, onReset)
    return () => window.removeEventListener(RESET_EVENT, onReset)
  }, [])

  function choose(next: Choice) {
    writeChoice(next)
    setChoice(next)
  }

  return (
    <>
      {ANALYTICS_DOMAIN && choice === 'accepted' && (
        <Script
          src="https://plausible.io/js/script.exclusions.js"
          data-domain={ANALYTICS_DOMAIN}
          data-exclude="/teacher/*,/admin/*,/student/*"
          strategy="afterInteractive"
          defer
        />
      )}

      {ready && choice === null && (
        <div
          role="region"
          aria-label="Cookie notice"
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-sky-100 bg-white p-4 shadow-xl sm:p-5"
        >
          <p className="text-sm text-gray-700">
            {ANALYTICS_DOMAIN
              ? 'We use essential cookies to keep you signed in. With your permission we also use privacy-friendly analytics on public pages to improve the site.'
              : 'We only use essential cookies, which keep you signed in. We do not use advertising or tracking cookies.'}{' '}
            <Link href="/legal/cookies" className="font-semibold text-sky-600 underline">Cookie Policy</Link>
          </p>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            {ANALYTICS_DOMAIN ? (
              <>
                <button type="button" onClick={() => choose('declined')} className="rounded-xl border-2 border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Decline analytics
                </button>
                <button type="button" onClick={() => choose('accepted')} className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600">
                  Accept analytics
                </button>
              </>
            ) : (
              <button type="button" onClick={() => choose('acknowledged')} className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600">
                Got it
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(RESET_EVENT))}
      className="rounded-xl border-2 border-sky-400 px-4 py-2 text-sm font-semibold text-sky-600 hover:bg-sky-50"
    >
      Reopen cookie choices
    </button>
  )
}
