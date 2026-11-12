import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Student profile',
  description: 'A student’s overview, session notes, AI plan and progress.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
