'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { CarFront, Bell, Search, ChevronDown, Car, Inbox, User, Wallet } from 'lucide-react'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: CarFront },
  { href: '/my-rides', label: 'My Rides', icon: Car },
  { href: '/rides', label: 'Find Ride', icon: Search },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()

  const isActive = (label: string, href: string) => {
    if (href === '/dashboard' && label === 'Dashboard') return pathname === '/dashboard'
    if (href === '/my-rides' && label === 'My Rides') return pathname === '/my-rides'
    if (href === '/rides' && label === 'Find Ride') return pathname === '/rides'
    if (href === '/inbox' && label === 'Inbox') return pathname === '/inbox'
    if (href === '/wallet' && label === 'Wallet') return pathname === '/wallet'
    return false
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6f6]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2 text-slate-900">
              <CarFront className="h-5 w-5 text-brand-500" />
              <span className="text-[18px] font-semibold leading-none">CampusPool</span>
            </div>

            <nav className="hidden items-center gap-6 lg:flex">
              {NAV.map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className={clsx(
                    'pb-2 text-sm font-medium text-slate-700 transition-colors hover:text-slate-900',
                    isActive(label, href) && 'border-b-2 border-brand-500 text-brand-600'
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden h-9 w-[260px] items-center gap-2 rounded-full bg-slate-100 px-4 lg:flex">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Search...</span>
            </div>

            <button type="button" className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100">
              <Bell className="h-4 w-4" />
            </button>

            <Link href="/profile" className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 hover:bg-slate-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                {user?.name?.slice(0, 1).toUpperCase() ?? 'U'}
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </Link>
          </div>
        </div>
      </header>

      <nav className="flex border-b border-slate-200 bg-white px-4 py-2 text-xs lg:hidden">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={`${href}-${label}`}
            href={href}
            className={clsx(
              'flex flex-1 flex-col items-center gap-1 rounded px-2 py-1',
              isActive(label, href) ? 'text-brand-600' : 'text-slate-500'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 lg:px-6">
        {children}
      </main>
    </div>
  )
}
