import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Add a student',
  description: 'Add a new student and choose their starting level.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
