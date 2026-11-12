import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create your account',
  description: 'Create an Aurelia Learn teacher account to start guiding children through English learning.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
