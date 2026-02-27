'use client'

import { useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/AppShell'
import ProtectedRoute from '@/components/ProtectedRoute'
import { carbonApi, WalletDto } from '@/lib/api'
import { format, parse } from 'date-fns'
import {
  Award,
  Wallet,
  RefreshCcw,
  CarFront,
  CarTaxiFront,
  Users,
  Search,
} from 'lucide-react'

export default function WalletPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <WalletContent />
      </AppShell>
    </ProtectedRoute>
  )
}

function WalletContent() {
  const [wallet, setWallet] = useState<WalletDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    carbonApi.wallet()
      .then(setWallet)
      .catch((e: unknown) => {
        const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
          ?? 'Unable to load wallet data'
        setError(msg)
      })
      .finally(() => setLoading(false))
  }, [])

  const tx = wallet?.recentTransactions ?? []

  const totalKg = wallet ? Math.max(0, Math.round(wallet.totalCarbonSavedGrams / 1000)) : 0
  const totalCredits = wallet?.totalCredits ?? 0
  const weeklyEarned = tx.slice(0, 3).reduce((sum, entry) => sum + entry.creditsEarned, 0)

  const chartBars = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const grouped = new Map<string, number>()

    tx.forEach((entry) => {
      const d = parse(entry.createdAt, 'yyyy-MM-dd HH:mm', new Date())
      const month = format(d, 'MMM')
      grouped.set(month, (grouped.get(month) ?? 0) + entry.carbonSavedGrams)
    })

    const values = months.map((month) => grouped.get(month) ?? 0)
    const max = Math.max(...values, 1)

    return months.map((month, idx) => ({
      month,
      grams: values[idx],
      pct: Math.max(20, Math.round((values[idx] / max) * 100)),
      active: month === 'Jun',
    }))
  }, [tx])

  const ridesList = tx.slice(0, 3).map((entry, idx) => {
    const titles = ['Ride to Engineering Campus', 'EV Ride from Downtown', 'Carpool to Sports Complex']
    const meta = ['Shared with 3 others', 'Shared with 2 others', 'Shared with 4 others']
    return {
      ...entry,
      title: titles[idx] ?? 'Campus Eco Ride',
      meta: meta[idx] ?? 'Shared with campus riders',
      icon: idx === 0 ? CarFront : idx === 1 ? CarTaxiFront : Users,
      iconClass: idx === 0 ? 'bg-blue-100 text-blue-600' : idx === 1 ? 'bg-violet-100 text-violet-600' : 'bg-amber-100 text-amber-600',
    }
  })

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[36px] font-semibold leading-tight text-slate-900">Carbon Wallet</h1>
          <p className="mt-1 text-[14px] text-slate-600">Track your environmental impact and earnings in real-time.</p>
        </div>
        <div className="inline-flex h-10 items-center gap-2 rounded-full border border-white/40 bg-white/60 px-4 text-sm font-semibold text-slate-700">
          <Award className="h-4 w-4 text-amber-500" /> Gold Member
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-white/40 p-5 text-sm text-slate-600" style={{background:'rgba(255,255,255,0.72)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)'}}>Loading wallet...</div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && wallet && (
        <>
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.7fr_0.8fr]">
        <div className="grid grid-cols-1 rounded-2xl border border-white/40 p-5 shadow-sm md:grid-cols-[1fr_0.9fr]" style={{background:'rgba(255,255,255,0.72)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)'}}>
              <div>
                <p className="text-[11px] font-semibold tracking-wide text-slate-500">TOTAL IMPACT</p>
                <p className="mt-1 text-[48px] font-semibold leading-none text-slate-900">{totalKg}<span className="ml-1 text-[28px] font-medium text-slate-500">kg CO₂</span></p>
                <p className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">↗ +12% this month</p>

                <p className="mt-6 text-[14px] text-slate-600">Equivalent to planting:</p>
                <p className="mt-2 inline-flex items-center gap-2 text-[34px] font-semibold text-slate-900">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-base text-emerald-700">🌲🌲🌲</span>
                  {Math.max(1, Math.round(totalKg / 12))} Trees
                </p>
              </div>

              <div className="mt-4 md:mt-0 md:pl-4">
                <div className="relative h-[230px] overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_60%_40%,#c8f5cb_0%,#7ec87e_55%,#4a9e5c_100%)] p-3">
                  {/* decorative blobs */}
                  <div className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 rounded-full bg-white/15" />
                  <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10" />

                  {/* illustration area */}
                  <div className="flex items-center justify-between px-1 pt-1">
                    {/* tree + sun SVG */}
                    <svg viewBox="0 0 80 70" className="h-[68px] w-[80px] shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* sun */}
                      <circle cx="62" cy="14" r="8" fill="#FFE66D" opacity="0.9"/>
                      <line x1="62" y1="3" x2="62" y2="0" stroke="#FFE66D" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="62" y1="25" x2="62" y2="28" stroke="#FFE66D" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="51.5" y1="3.5" x2="49.4" y2="1.4" stroke="#FFE66D" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="72.5" y1="24.5" x2="74.6" y2="26.6" stroke="#FFE66D" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="73" y1="14" x2="76" y2="14" stroke="#FFE66D" strokeWidth="2" strokeLinecap="round"/>
                      {/* big tree */}
                      <ellipse cx="28" cy="32" rx="18" ry="20" fill="#2d8a4e" opacity="0.95"/>
                      <ellipse cx="22" cy="38" rx="12" ry="14" fill="#3ca05e"/>
                      <ellipse cx="34" cy="36" rx="13" ry="15" fill="#3ca05e"/>
                      <rect x="25" y="50" width="6" height="14" rx="2" fill="#7a4f2d"/>
                      {/* small tree */}
                      <ellipse cx="12" cy="46" rx="8" ry="10" fill="#2d8a4e" opacity="0.85"/>
                      <rect x="10" y="54" width="4" height="8" rx="1.5" fill="#7a4f2d"/>
                      {/* ground */}
                      <ellipse cx="28" cy="65" rx="20" ry="4" fill="#2d6a32" opacity="0.45"/>
                    </svg>

                    {/* reward pill */}
                    <div className="flex flex-col items-end gap-1">
                      <span className="rounded-full bg-white/30 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white backdrop-blur-sm">🏆 FREE REWARD</span>
                      <span className="text-right text-[11px] font-semibold leading-tight text-white/90">Save 150 kg CO₂<br/>unlock eco badge</span>
                    </div>
                  </div>

                  {/* motivational text */}
                  <p className="mt-1 px-1 text-[12px] font-semibold text-white drop-shadow">
                    🌱 Every ride counts — keep going!
                  </p>

                  {/* progress */}
                  <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/30 p-3 backdrop-blur-[1px]">
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      <span>Next Goal</span>
                      <span>{totalKg} / 150 kg</span>
                    </div>
                    <div className="mt-2 h-2.5 rounded-full bg-white/40">
                      <div className="h-2.5 rounded-full bg-white transition-all duration-700" style={{ width: `${Math.min(100, Math.round((totalKg / 150) * 100))}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-600 p-5 text-white shadow-sm">
              <div className="flex items-start justify-between">
                <p className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">Eco Credits</p>
                <Wallet className="h-5 w-5" />
              </div>
              <p className="mt-6 text-sm text-emerald-100">Available Balance</p>
              <p className="mt-1 text-[40px] font-semibold leading-none">₹{(totalCredits / 10).toFixed(2)}</p>
              <p className="mt-2 text-sm text-emerald-100">↑ ₹{(weeklyEarned / 10).toFixed(2)} earned this week</p>

              <div className="mt-7 flex items-center gap-2">
                <button type="button" className="h-10 flex-1 rounded-lg bg-white text-sm font-semibold text-slate-800 hover:bg-slate-100">
                  Redeem
                </button>
                <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 hover:bg-white/30">
                  <RefreshCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/40 p-5 shadow-sm" style={{background:'rgba(255,255,255,0.72)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)'}}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[22px] font-semibold text-slate-900">Impact Visualization</h2>
                <p className="text-xs text-slate-500">CO₂ savings over the last 6 months</p>
              </div>
              <button type="button" className="rounded-md border border-white/40 bg-white/50 px-3 py-1 text-xs font-medium text-slate-600">Last 6 Months</button>
            </div>

            <div className="mt-5 grid grid-cols-6 items-end gap-3 rounded-xl border-t border-slate-100 pt-4">
              {chartBars.map((bar) => (
                <div key={bar.month} className="flex flex-col items-center gap-2">
                  <div className="relative flex h-52 w-full items-end">
                    <div
                      className={bar.active ? 'w-full rounded-md bg-brand-500' : 'w-full rounded-md bg-brand-400/30 border border-brand-400/40'}
                      style={{ height: `${bar.pct}%` }}
                    />
                    {bar.active && (
                      <span className="absolute -top-6 right-1/2 translate-x-1/2 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-white">
                        {Math.round(bar.grams / 1000)}kg
                      </span>
                    )}
                  </div>
                  <span className={bar.active ? 'text-xs font-semibold text-brand-600' : 'text-xs text-slate-500'}>{bar.month}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-[24px] font-semibold text-slate-900">Recent Eco-Rides</h2>
            <div className="overflow-hidden rounded-2xl border border-white/40 shadow-sm" style={{background:'rgba(255,255,255,0.72)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)'}}>
              {ridesList.length === 0 ? (
                <div className="p-5 text-sm text-slate-500">No wallet transactions yet.</div>
              ) : (
                ridesList.map((ride, idx) => {
                  const Icon = ride.icon
                  return (
                    <article key={ride.rideId + idx} className="grid items-center border-b border-slate-100 px-5 py-4 last:border-b-0 md:grid-cols-[2fr_0.6fr_0.5fr]">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${ride.iconClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[15px] font-semibold text-slate-900">{ride.title}</p>
                          <p className="text-xs text-slate-500">{ride.createdAt} • {ride.meta}</p>
                        </div>
                      </div>
                      <div className="mt-2 md:mt-0 md:text-right">
                        <p className="text-[10px] font-semibold tracking-wide text-slate-400">SAVED</p>
                        <p className="text-[18px] font-semibold text-brand-600">{(ride.carbonSavedGrams / 1000).toFixed(1)} kg CO₂</p>
                      </div>
                      <div className="mt-2 md:mt-0 md:text-right">
                        <p className="text-[10px] font-semibold tracking-wide text-slate-400">EARNED</p>
                        <p className="text-[18px] font-semibold text-slate-900">+₹{(ride.creditsEarned / 10).toFixed(2)}</p>
                      </div>
                    </article>
                  )
                })
              )}
            </div>

            <div className="text-center">
              <button type="button" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View all transactions</button>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
