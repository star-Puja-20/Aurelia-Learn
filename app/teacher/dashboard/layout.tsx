import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your Aurelia Learn teaching hub: add a child, view progress and start a session.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
