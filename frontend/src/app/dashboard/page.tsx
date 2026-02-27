'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { carbonApi, trustApi, WalletDto, TrustProfileDto } from '@/lib/api'
import AppShell from '@/components/AppShell'
import ProtectedRoute from '@/components/ProtectedRoute'
import type { CSSProperties } from 'react'
import {
  Leaf,
  ShieldCheck,
  CarFront,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Check,
  Clock3,
  Wallet,
  Sparkles,
  BellDot,
  ArrowRight,
} from 'lucide-react'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <DashboardContent />
      </AppShell>
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  const [wallet, setWallet] = useState<WalletDto | null>(null)
  const [trust, setTrust] = useState<TrustProfileDto | null>(null)

  useEffect(() => {
    if (!user) return
    Promise.all([
      carbonApi.wallet(),
      trustApi.getProfile(user.id),
    ])
      .then(([w, t]) => {
        setWallet(w)
        setTrust(t)
      })
      .catch(console.error)
  }, [user])

  if (!user) return null

  const carbonKg = wallet ? Math.max(1, Math.round(wallet.totalCarbonSavedGrams / 1000)) : user.carbonCredits
  const trustScore = trust?.trustScore ?? user.trustScore
  const ridesCompleted = trust?.ridesCompleted ?? user.ridesCompleted

  const recentActivity = [
    {
      icon: Check,
      color: 'bg-emerald-100 text-emerald-600',
      title: 'Ride Completed',
      desc: 'Passenger: Michael B. · To Library',
      meta: '+50 Points · 1.2kg CO2',
      time: '2h ago',
    },
    {
      icon: Clock3,
      color: 'bg-blue-100 text-blue-600',
      title: 'Ride Scheduled',
      desc: 'Driver: Emily R. · To Downtown',
      meta: 'Tomorrow at 9:00 AM',
      time: 'Yesterday',
    },
    {
      icon: Wallet,
      color: 'bg-amber-100 text-amber-600',
      title: 'Wallet Top-up',
      desc: 'Via Credit Card ending 4242',
      meta: '+$25.00',
      time: '2d ago',
    },
    {
      icon: Sparkles,
      color: 'bg-violet-100 text-violet-600',
      title: 'New Badge Earned',
      desc: '"Super Commuter" Badge Unlocked',
      meta: '',
      time: '3d ago',
    },
    {
      icon: BellDot,
      color: 'bg-slate-100 text-slate-600',
      title: 'Search Alert',
      desc: 'New rides available for "Engineering Block"',
      meta: '',
      time: '4d ago',
    },
  ]

  const glassCard: CSSProperties = {
    background: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[34px] font-semibold leading-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-[16px] text-brand-600">Welcome back, {user.name}! Your sustainable journey continues.</p>
      </div>

      <section className="relative overflow-hidden rounded-2xl bg-emerald-950/85 p-6 shadow-md backdrop-blur-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-brand-500/25 px-4 py-1 text-xs font-semibold tracking-wide text-brand-200">
              ✨ AI SUGGESTION
            </span>
            <h2 className="mt-4 text-[34px] font-semibold leading-tight text-white">Match found: North Campus Commute</h2>
            <p className="mt-2 max-w-3xl text-[16px] text-emerald-100">
              Based on your Mon/Wed schedule at 8:30 AM, riding with Sarah K. saves 2.5 kg of CO2 and gets you preferred parking.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-emerald-900 bg-emerald-200 text-xs font-semibold text-emerald-900">SK</div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-emerald-900 bg-slate-700 text-xs font-semibold text-white">+2</div>
            </div>
            <button type="button" className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-500 px-6 text-sm font-semibold text-slate-900 hover:bg-brand-400">
              View Match
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr_1fr_1.45fr]">
        <StatCard icon={Leaf} label="Carbon Saved" value={`${carbonKg}`} unit="kg" delta="+12%" iconTone="green" glassStyle={glassCard} />
        <StatCard icon={ShieldCheck} label="Trust Score" value={trustScore.toString()} unit="/100" delta="+1" iconTone="blue" glassStyle={glassCard} />
        <StatCard icon={CarFront} label="Rides Completed" value={`${ridesCompleted}`} unit="" delta="+3" iconTone="amber" glassStyle={glassCard} />

        <section className="rounded-2xl border border-white/40 shadow-sm xl:row-span-3" style={glassCard}>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h3 className="text-[24px] font-semibold leading-tight text-slate-900">Recent Activity</h3>
            <button type="button" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View All</button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivity.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="flex items-start gap-3 px-4 py-3">
                  <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${item.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[14px] font-semibold text-slate-800">{item.title}</p>
                      <span className="whitespace-nowrap text-xs text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-[12px] text-slate-500">{item.desc}</p>
                    {item.meta && <p className="text-xs font-semibold text-brand-600">{item.meta}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <ActionCard href="/rides" icon={Search} title="Find a Ride" description="Search for drivers heading your way." glassStyle={glassCard} />
        <ActionCard href="/offer-ride" icon={SlidersHorizontal} title="Offer a Ride" description="Share your empty seats and earn points." glassStyle={glassCard} />

      </section>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  delta,
  iconTone,
  glassStyle,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  unit: string
  delta: string
  iconTone: 'green' | 'blue' | 'amber'
  glassStyle?: React.CSSProperties
}) {
  const iconClass = {
    green: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
  }[iconTone]

  return (
    <section className="rounded-2xl border border-white/40 p-4 shadow-sm" style={glassStyle}>
      <div className="flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-600">{delta}</span>
      </div>
      <p className="mt-4 text-[14px] font-medium text-slate-600">{label}</p>
      <p className="mt-1 text-[28px] font-semibold leading-none text-slate-900">
        {value}
        <span className="ml-1 text-[22px] font-medium text-slate-500">{unit}</span>
      </p>
    </section>
  )
}

function ActionCard({
  href,
  icon: Icon,
  title,
  description,
  glassStyle,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  glassStyle?: React.CSSProperties
}) {
  return (
    <Link href={href} className="flex rounded-2xl border border-white/40 p-5 text-left shadow-sm transition hover:border-brand-300 hover:shadow-md" style={glassStyle}>
      <div className="flex w-full items-start justify-between">
        <div>
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-slate-700">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-[22px] font-semibold leading-none text-slate-900">{title}</h3>
          <p className="mt-2 text-[16px] text-brand-600">{description}</p>
        </div>
        <ChevronRight className="mt-2 h-5 w-5 text-slate-300" />
      </div>
    </Link>
  )
}
