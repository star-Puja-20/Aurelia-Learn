import type { Metadata } from 'next'
import { LegalDoc, LegalSection } from '@/components/legal/legal-doc'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Aurelia Learn collects, uses and protects teacher and student information, including children’s data.',
  alternates: { canonical: '/legal/privacy' },
}

export default function PrivacyPage() {
  return (
    <LegalDoc title="Privacy Policy">
      <LegalSection title="1. Who we are">
        <p>Aurelia Learn is an English learning platform used by teachers to run lessons for children. Teachers create an account, add their own students and run learning sessions. Children do not create accounts and never sign in.</p>
      </LegalSection>

      <LegalSection title="2. What we collect">
        <p><strong>Teacher accounts:</strong> your full name, username, a hashed password (we never see or store your password in readable form), the date you accepted this policy, and the policy version you accepted.</p>
        <p><strong>Student records you create:</strong> the name you enter, an avatar, the learning level, session records, your private session notes, AI-drafted lesson plans and any edits you make, and progress results.</p>
        <p><strong>Speaking exercises:</strong> when a session uses the microphone, a short audio clip is sent for transcription. We do not keep the recording; we keep only the text result and score if you save the session.</p>
        <p><strong>Technical data:</strong> sign-in cookies, IP address and request logs kept by our hosting providers for security and reliability.</p>
        <p>We recommend entering a first name or nickname for each student instead of a full legal name.</p>
      </LegalSection>

      <LegalSection title="3. Children’s information">
        <p>Information about children is entered only by their teacher. Teachers must have the right to do so, for example parental or guardian consent or authority from their school, and must follow the child-privacy laws that apply to them. We use children’s information only to provide the teaching features described here. We do not sell it, use it for advertising or build advertising profiles.</p>
      </LegalSection>

      <LegalSection title="4. How we use information">
        <p>To run your account, show each teacher only their own students, generate lesson plans and feedback you request, keep the service secure, and fix problems. If you accept optional analytics cookies, we also measure which public pages are visited, in aggregate (see the Cookie Policy). Analytics are never run inside teacher, admin or student areas.</p>
      </LegalSection>

      <LegalSection title="5. Who processes data for us">
        <p><strong>Supabase</strong> hosts the database and sign-in system. <strong>Vercel</strong> hosts the website. <strong>Google (Gemini)</strong> receives the student name, level, your observations and recent session topics when you ask for a lesson plan, chat reply or speaking score. <strong>Groq</strong> receives short audio clips for transcription. If enabled, <strong>Plausible</strong> receives aggregate page-view data from public pages only. These providers process data on our instructions and under their own terms.</p>
      </LegalSection>

      <LegalSection title="6. Who can see your data">
        <p>Each teacher can see only the students and notes they created. Session notes are private to the teacher who wrote them. Administrators of the service can see account details and student and session records for support and safety, but not teachers’ private notes.</p>
      </LegalSection>

      <LegalSection title="7. How long we keep it">
        <p>We keep records while your account is active. Teachers can mark a student inactive in the app. To have a student’s records, or your whole account, permanently deleted, contact us using the details below and we will act on the request within a reasonable time and no later than the period required by the law that applies to you.</p>
      </LegalSection>

      <LegalSection title="8. Security">
        <p>Data is transmitted over HTTPS, access is restricted by account and by row-level rules in the database, and AI provider keys are kept on the server and never sent to browsers. No system is perfectly secure; if we learn of a breach affecting you we will notify you as the law requires.</p>
      </LegalSection>

      <LegalSection title="9. Your rights">
        <p>Depending on where you live, you may have the right to access, correct, export or delete your information, to object to or restrict some processing, and to withdraw consent. Parents and guardians can ask the teacher or us to see or delete their child’s record. Contact us using the details below.</p>
      </LegalSection>

      <LegalSection title="10. Changes">
        <p>If we change this policy in a way that matters, we will update the date above and, where required, ask you to accept the new version.</p>
      </LegalSection>
    </LegalDoc>
  )
}
