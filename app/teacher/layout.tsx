import type { Metadata } from 'next'
import { TeacherSidebar } from '@/components/layout/teacher-sidebar'
import { LaunchSessionButton } from '@/components/layout/launch-session-button'
import { getAuthenticatedAdmin, getAuthenticatedTeacherWorkspace } from '@/lib/server-auth'

export const metadata: Metadata = {
  title: { template: '%s | Aurelia Learn', default: 'Teacher workspace' },
  robots: { index: false, follow: false },
}

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  // The middleware already blocks signed-out visitors; this repeats the check on the server so a
  // middleware problem can never expose the workspace.
  const user = await getAuthenticatedTeacherWorkspace()
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream-100 p-6 text-center">
        <h1 className="font-display text-2xl text-navy-800">Your account is not set up yet</h1>
        <p className="max-w-sm text-sm text-gray-600">Please sign in again, or ask your administrator to finish setting up your account.</p>
        <form action="/auth/signout" method="post">
          <button className="rounded-xl bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600">Sign out</button>
        </form>
      </div>
    )
  }

  const admin = await getAuthenticatedAdmin()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <TeacherSidebar teacherName="Teacher" isAdministrator={!!admin} />
      <main className="flex-1 overflow-y-auto lg:pt-0 pt-14">
        <div className="flex justify-end px-6 py-3 lg:px-8 bg-white border-b border-gray-100">
          <LaunchSessionButton />
        </div>
        {children}
      </main>
    </div>
  )
}
