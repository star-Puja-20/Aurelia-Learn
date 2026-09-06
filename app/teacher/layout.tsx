import { cookies } from 'next/headers'
import { TeacherSidebar } from '@/components/layout/teacher-sidebar'
import { MOCK_TEACHER } from '@/lib/mock-data'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const demoSession = cookieStore.get('demo_session')?.value

  // In demo mode, pass mock teacher name
  const teacherName = demoSession ? MOCK_TEACHER.full_name : 'Teacher'

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <TeacherSidebar teacherName={teacherName} />
      <main className="flex-1 overflow-y-auto lg:pt-0 pt-14">
        {children}
      </main>
    </div>
  )
}
