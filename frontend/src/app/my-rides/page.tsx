'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import AppShell from '@/components/AppShell'
import ProtectedRoute from '@/components/ProtectedRoute'
import { MyRideDto, rideApi } from '@/lib/api'
import { PlusCircle, CarFront, MessageSquareText, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

type TabKey = 'upcoming' | 'completed' | 'cancelled'

export default function MyRidesPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <MyRidesContent />
      </AppShell>
    </ProtectedRoute>
  )
}

function MyRidesContent() {
  const router = useRouter()
  const [rides, setRides] = useState<MyRideDto[]>([])
  const [tab, setTab] = useState<TabKey>('upcoming')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    rideApi.my()
      .then(setRides)
      .catch((e: unknown) => {
        const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
          ?? 'Unable to load your rides'
        setError(msg)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (tab === 'completed') return rides.filter((ride) => ride.rideStatus === 'COMPLETED')
    if (tab === 'cancelled') return rides.filter((ride) => ride.rideStatus === 'CANCELLED')
    return rides.filter((ride) => ride.rideStatus === 'OPEN' || ride.rideStatus === 'FULL')
  }, [rides, tab])

  async function handleCancel(ride: MyRideDto) {
    if (ride.role !== 'DRIVER') return
    try {
      await rideApi.cancel(ride.rideId)
      setRides((prev) => prev.map((item) => (
        item.rideId === ride.rideId ? { ...item, rideStatus: 'CANCELLED' } : item
      )))
    } catch {
      alert('Unable to cancel ride')
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[40px] font-semibold leading-tight text-slate-900">My Rides</h1>
          <p className="mt-1 text-[15px] text-slate-500">Manage your upcoming commutes and travel history.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/rides')}
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-500 px-6 text-sm font-semibold text-slate-900 hover:bg-brand-400"
        >
          <PlusCircle className="h-4 w-4" />
          Request New Ride
        </button>
      </div>

      <div className="border-b border-white/30">
        <div className="flex gap-8">
          <TabButton active={tab === 'upcoming'} onClick={() => setTab('upcoming')}>Upcoming</TabButton>
          <TabButton active={tab === 'completed'} onClick={() => setTab('completed')}>Completed</TabButton>
          <TabButton active={tab === 'cancelled'} onClick={() => setTab('cancelled')}>Cancelled</TabButton>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-white/40 p-6 text-sm text-slate-600" style={{background:'rgba(255,255,255,0.72)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)'}}>Loading your rides...</div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && (
        <section className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/40 p-6 text-sm text-slate-600" style={{background:'rgba(255,255,255,0.72)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)'}}>
              No rides found in this tab.
            </div>
          ) : (
            filtered.map((ride) => (
              <RideCard key={`${ride.rideId}-${ride.role}`} ride={ride} onCancel={handleCancel} />
            ))
          )}
        </section>
      )}

      <div className="pt-5 text-center text-sm text-slate-500">
        <button type="button" className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-800">
          View all past rides
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'border-b-2 pb-3 text-[15px] font-semibold transition-colors',
        active ? 'border-brand-500 text-slate-900' : 'border-transparent text-slate-600 hover:text-slate-800'
      )}
    >
      {children}
    </button>
  )
}

function RideCard({ ride, onCancel }: { ride: MyRideDto; onCancel: (ride: MyRideDto) => void }) {
  const router = useRouter()
  const date = new Date(ride.departureTime)
  const month = format(date, 'MMM').toUpperCase()
  const day = format(date, 'dd')
  const time = format(date, 'hh:mm a')

  const statusTone =
    ride.rideStatus === 'COMPLETED'
      ? 'bg-emerald-100 text-emerald-700'
      : ride.rideStatus === 'CANCELLED'
        ? 'bg-rose-100 text-rose-700'
        : ride.participantStatus === 'REQUESTED'
          ? 'bg-blue-100 text-blue-700'
          : 'bg-emerald-100 text-emerald-700'

  const statusLabel =
    ride.rideStatus === 'COMPLETED'
      ? 'Completed'
      : ride.rideStatus === 'CANCELLED'
        ? 'Cancelled'
        : ride.participantStatus === 'REQUESTED'
          ? 'Pending'
          : 'Confirmed'

  const routeTitle = ride.role === 'DRIVER'
    ? `${ride.pickupZone} → ${ride.destination || 'Campus'}`
    : `${ride.pickupZone} → ${ride.destination || 'Campus'}`

  const vehicleLine = ride.role === 'DRIVER'
    ? 'Toyota Prius (Green) • EcoRide Fleet'
    : 'Electric SUV • Pending Assignment'

  const supportsCancel = ride.role === 'DRIVER' && (ride.rideStatus === 'OPEN' || ride.rideStatus === 'FULL')

  return (
    <article className="grid rounded-2xl border border-white/40 p-4 shadow-sm xl:grid-cols-[0.55fr_3fr]" style={{background:'rgba(255,255,255,0.72)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)'}}>
      <div className="flex items-center justify-center xl:justify-start">
          <div className="w-[108px] rounded-xl border border-white/40 bg-white/60 px-2 py-3 text-center">
          <p className="text-[12px] font-semibold tracking-wide text-slate-500">{month}</p>
          <p className="text-[34px] font-semibold leading-none text-slate-900">{day}</p>
          <p className="mt-1 text-[18px] text-slate-600">{time}</p>
        </div>
      </div>

      <div className="mt-4 xl:mt-0">
          <div className="flex items-start justify-between border-b border-white/30 pb-3">
          <div>
            <h3 className="text-[28px] font-semibold leading-tight text-slate-900">{routeTitle}</h3>
            <p className="mt-1 inline-flex items-center gap-1 text-[15px] text-slate-500">
              <CarFront className="h-4 w-4" />
              {vehicleLine}
            </p>
          </div>
          <span className={clsx('inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold', statusTone)}>
            • {statusLabel}
          </span>
        </div>

        <div className="flex flex-col gap-4 pt-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
              {ride.driverName?.slice(0, 1).toUpperCase() ?? 'D'}
            </div>
            <div>
              <p className="text-[20px] font-medium text-slate-900">Driven by {ride.driverName}</p>
              <p className="text-[12px] text-slate-500">⭐ 4.9 Rating • {ride.availableSeats} seats available</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button"
              onClick={() => router.push(`/inbox?peer=${ride.driverId}`)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-white/40 px-4 text-sm font-medium text-slate-700 hover:bg-white/60 border border-white/40">
              <MessageSquareText className="h-4 w-4" />
              Contact
            </button>
            {supportsCancel ? (
              <button
                type="button"
                onClick={() => onCancel(ride)}
                className="inline-flex h-10 items-center rounded-lg border border-rose-200 bg-white px-4 text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                className="inline-flex h-10 items-center rounded-lg border border-white/40 bg-white/40 px-4 text-sm font-medium text-slate-600"
              >
                {ride.participantStatus === 'REQUESTED' ? 'Modify Request' : 'Details'}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
