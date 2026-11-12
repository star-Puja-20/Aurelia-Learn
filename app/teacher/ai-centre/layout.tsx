import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Learning Centre',
  description: 'Run listening and speaking exercises with AI-assisted feedback.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
