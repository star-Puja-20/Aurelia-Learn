import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Progress',
  description: 'See how your students are progressing through the five levels.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
