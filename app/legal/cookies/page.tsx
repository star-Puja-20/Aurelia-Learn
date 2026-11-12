import type { Metadata } from 'next'
import { LegalDoc, LegalSection } from '@/components/legal/legal-doc'
import { CookieSettingsButton } from '@/components/consent/cookie-consent'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Which cookies and similar storage Aurelia Learn uses, and how to change your choice.',
  alternates: { canonical: '/legal/cookies' },
}

export default function CookiePolicyPage() {
  return (
    <LegalDoc title="Cookie Policy">
      <LegalSection title="Essential cookies (always on)">
        <p>When you sign in, our authentication provider stores sign-in cookies (names start with <code>sb-</code>) so you stay signed in and the server knows which account a request belongs to. The site cannot work without them, so they do not need consent.</p>
        <p>We also store your cookie choice in your browser’s local storage (<code>al_cookie_consent</code>) so we do not ask again on every visit.</p>
      </LegalSection>
      <LegalSection title="Optional analytics (only if you accept)">
        <p>If analytics is turned on for this site and you accept, a privacy-friendly analytics script measures visits to public pages such as the home and sign-in pages. It does not run inside teacher, admin or student areas, does not use advertising cookies and is not used to track individual children.</p>
      </LegalSection>
      <LegalSection title="No advertising cookies">
        <p>Aurelia Learn does not use advertising or cross-site tracking cookies.</p>
      </LegalSection>
      <LegalSection title="Change your choice">
        <p>You can review your choice at any time.</p>
        <CookieSettingsButton />
      </LegalSection>
    </LegalDoc>
  )
}
