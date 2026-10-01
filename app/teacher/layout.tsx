import { cookies } from 'next/headers'
import { TeacherSidebar } from '@/components/layout/teacher-sidebar'
import { LaunchSessionButton } from '@/components/layout/launch-session-button'
import { MOCK_TEACHER } from '@/lib/mock-data'
import { getAuthenticatedAdmin } from '@/lib/server-auth'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const demoSession = cookieStore.get('demo_session')?.value
  const admin = process.env.NEXT_PUBLIC_SUPABASE_URL ? await getAuthenticatedAdmin() : null
  const isAdministrator = !!admin || (
    process.env.NODE_ENV !== 'production' && cookieStore.get('demo_role')?.value === 'administrator'
  )

  // In demo mode, pass mock teacher name
  const teacherName = demoSession ? MOCK_TEACHER.full_name : 'Teacher'

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <TeacherSidebar teacherName={teacherName} isAdministrator={isAdministrator} />
      <main className="flex-1 overflow-y-auto lg:pt-0 pt-14">
        <div className="flex justify-end px-6 py-3 lg:px-8 bg-white border-b border-gray-100">
          <LaunchSessionButton />
        </div>
        {children}
      </main>
    </div>
  )
}
