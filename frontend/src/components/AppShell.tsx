'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { CarFront, Bell, Search, Car, Inbox, Wallet } from 'lucide-react'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import LiquidEther from '@/components/LiquidEther'
import SOSButton from '@/components/SOSButton'

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
    <div className="relative min-h-screen flex flex-col bg-transparent">
      {/* Shared LiquidEther background — all app pages */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <LiquidEther
          colors={['#3a7d44', '#52b788', '#95d5b2', '#74c69d', '#2d6a4f', '#b7e4c7']}
          bgColor="#EBF4DD"
          mouseForce={18}
          cursorSize={100}
          resolution={0.35}
          autoDemo
          autoSpeed={0.35}
          autoIntensity={1.8}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>
      {/* Floating pill glass navbar — inspired by ref design */}
      <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <div
          className="pointer-events-auto flex h-[52px] w-full max-w-[860px] items-center gap-0 rounded-full px-3"
          style={{
            background: 'rgba(18, 20, 22, 0.68)',
            backdropFilter: 'blur(22px) saturate(160%)',
            WebkitBackdropFilter: 'blur(22px) saturate(160%)',
            border: '1px solid rgba(255,255,255,0.13)',
            boxShadow: '0 2px 32px 0 rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* Logo */}
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2 pl-2 pr-4 text-white">
            <CarFront className="h-[18px] w-[18px] text-brand-400" />
            <span className="text-[15px] font-semibold leading-none tracking-tight">CampusPool</span>
          </Link>

          {/* Divider */}
          <div className="hidden h-5 w-px shrink-0 bg-white/20 lg:block" />

          {/* Desktop nav links */}
          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {NAV.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className={clsx(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150',
                  isActive(label, href)
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white/90'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2 pr-1">
            <button type="button" className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white">
              <Bell className="h-[15px] w-[15px]" />
            </button>

            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-slate-900 shadow-sm transition hover:bg-white/90"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                {user?.name?.slice(0, 1).toUpperCase() ?? 'U'}
              </div>
              <span className="hidden sm:inline">{user?.name?.split(' ')[0] ?? 'Profile'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-4 left-4 right-4 z-50 flex rounded-full py-2 text-xs lg:hidden"
        style={{
          background: 'rgba(18, 20, 22, 0.78)',
          backdropFilter: 'blur(22px) saturate(160%)',
          WebkitBackdropFilter: 'blur(22px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.30)',
        }}
      >
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={`${href}-${label}`}
            href={href}
            className={clsx(
              'flex flex-1 flex-col items-center gap-1 rounded-full px-2 py-1 transition',
              isActive(label, href) ? 'text-white' : 'text-white/45 hover:text-white/75'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pt-[80px] pb-24 lg:px-6 lg:pb-6">
        {children}
      </main>

      {/* SOS Emergency button — global, every page */}
      <SOSButton />
    </div>
  )
}
