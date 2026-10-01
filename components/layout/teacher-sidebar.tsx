'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, BookOpen, Brain, BarChart3,
  LogOut, Menu, X, Star, ChevronLeft, ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { label: 'Dashboard',   href: '/teacher/dashboard', icon: LayoutDashboard },
  { label: 'My Students', href: '/teacher/students',  icon: Users },
  { label: 'Sessions',    href: '/teacher/sessions',  icon: BookOpen },
  { label: 'AI Centre',   href: '/teacher/ai-centre', icon: Brain },
  { label: 'Progress',    href: '/teacher/progress',  icon: BarChart3 },
]

function NavItem({ item, collapsed }: { item: typeof NAV_ITEMS[0]; collapsed: boolean }) {
  const pathname = usePathname()
  const isActive = pathname.startsWith(item.href)
  const Icon = item.icon
  return (
    <Link href={item.href} className="block">
      <motion.div whileHover={{ x: collapsed ? 0 : 2 }} whileTap={{ scale: 0.97 }}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-semibold',
          collapsed ? 'justify-center' : '',
          isActive ? 'bg-sky-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-navy-800'
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.18 }}
              className="overflow-hidden whitespace-nowrap">
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  )
}

export function TeacherSidebar({ teacherName = 'Teacher', isAdministrator = false }: { teacherName?: string; isAdministrator?: boolean }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    await createClient().auth.signOut()
    document.cookie = 'demo_session=; max-age=0; path=/'
    document.cookie = 'demo_role=; max-age=0; path=/'
    router.push('/auth/login')
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Logo */}
      <div className={cn('flex items-center gap-2 px-4 py-5 border-b border-gray-100', collapsed && 'justify-center px-3')}>
        <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Star className="h-5 w-5 text-white fill-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="font-display text-navy-800 text-lg whitespace-nowrap overflow-hidden">
              Aurelia Learn
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Teacher chip */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 border-b border-gray-50">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Signed in as</p>
            <p className="text-sm font-semibold text-navy-800 truncate">{teacherName}</p>
            <p className="text-xs text-gray-400">Teacher</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map(item => <NavItem key={item.href} item={item} collapsed={collapsed} />)}
        {isAdministrator && (
          <Link href="/admin/dashboard" className="block">
            <div className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-semibold',
              collapsed ? 'justify-center' : '',
              pathname.startsWith('/admin') ? 'bg-sky-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-navy-800'
            )} title={collapsed ? 'Admin dashboard' : undefined}>
              <ShieldCheck className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>Admin dashboard</span>}
            </div>
          </Link>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <button onClick={() => setCollapsed(c => !c)}
          className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors text-sm font-semibold',
            collapsed && 'justify-center')}>
          <ChevronLeft className={cn('h-4 w-4 flex-shrink-0 transition-transform duration-200', collapsed && 'rotate-180')} />
          {!collapsed && <span>Collapse</span>}
        </button>
        <button onClick={handleLogout}
          className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-coral-50 hover:text-coral-600 transition-colors text-sm font-semibold',
            collapsed && 'justify-center')}>
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside animate={{ width: collapsed ? 64 : 240 }} transition={{ duration: 0.22, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col h-screen bg-white border-r border-gray-100 flex-shrink-0 overflow-hidden">
        <SidebarContent />
      </motion.aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
            <Star className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="font-display text-navy-800 text-base">Aurelia Learn</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-white shadow-2xl">
              <button onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
