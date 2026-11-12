import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Administrator overview of teachers, students and sessions.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
