import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { LayoutDashboard, Users, Settings, FileText, BarChart3, Star, LogOut } from 'lucide-react'
import { getAuthenticatedAdmin } from '@/lib/server-auth'

const NAV = [
  { label: 'Dashboard',  href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Teachers',   href: '/admin/teachers',  icon: Users },
  { label: 'Analytics',  href: '/admin/analytics', icon: BarChart3 },
  { label: 'Audit Logs', href: '/admin/audit-logs',icon: FileText },
  { label: 'Settings',   href: '/admin/settings',  icon: Settings },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const admin = await getAuthenticatedAdmin()
  const demoAdmin = process.env.NODE_ENV !== 'production' &&
    cookieStore.get('demo_session')?.value === 'admin_demo' &&
    cookieStore.get('demo_role')?.value === 'administrator'
  if (!admin && !demoAdmin) {
    redirect('/auth/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="hidden lg:flex flex-col w-56 bg-navy-800 h-screen flex-shrink-0">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 bg-sky-400 rounded-lg flex items-center justify-center">
            <Star className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="font-display text-white text-lg">Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white text-sm font-semibold transition-colors">
                <Icon className="h-4 w-4" /> {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <form action="/auth/signout">
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white w-full text-sm font-semibold transition-colors">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
