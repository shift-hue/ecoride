'use client'

import { useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/AppShell'
import ProtectedRoute from '@/components/ProtectedRoute'
import { rideApi, matchApi, MatchResultDto } from '@/lib/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import {
  MapPin,
  Flag,
  Clock3,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  CarFront,
  UserRound,
  Music2,
  Leaf,
  ArrowRight,
  Sparkles,
  Circle,
  X,
} from 'lucide-react'
import clsx from 'clsx'

const searchSchema = z.object({
  pickupZone: z.string().min(1, 'Required'),
  destination: z.string().optional(),
  time: z.string().min(1, 'Required'),
})

type SearchForm = z.infer<typeof searchSchema>

export default function RidesPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <RidesContent />
      </AppShell>
    </ProtectedRoute>
  )
}

function RidesContent() {
  const [matches, setMatches] = useState<MatchResultDto[]>([])
  const [searchDone, setSearchDone] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const searchForm = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      pickupZone: '',
      destination: '',
      time: '',
    },
  })

  async function onSearch(data: SearchForm) {
    setSearchError(null)
    setSearchDone(true)
    try {
      // Build a datetime anchored to today at the typed time.
      // If the time has already passed today, use tomorrow so future rides always show.
      const [hours, minutes] = data.time.split(':').map(Number)
      const now = new Date()
      const requestedDate = new Date()
      requestedDate.setHours(hours, minutes, 0, 0)
      // If the requested time is more than 2 hours in the past, shift to tomorrow
      if (requestedDate.getTime() < now.getTime() - 2 * 60 * 60 * 1000) {
        requestedDate.setDate(requestedDate.getDate() + 1)
      }

      const results = await matchApi.find(data.pickupZone, data.destination ?? '', requestedDate.toISOString())
      setMatches(results)
    } catch (e: unknown) {
      setSearchError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Unable to fetch rides from backend'
      )
      setMatches([])
    }
  }

  async function handleJoin(rideId: string) {
    try {
      await rideApi.join(rideId)
      alert('Ride request sent successfully')
    } catch (e: unknown) {
      alert((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Join failed')
    }
  }

  useEffect(() => {
    // Don't auto-search on mount — wait for user to type and submit
  }, [])

  const watchDestination = searchForm.watch('destination')

  const cards = useMemo(() => {
    return matches.map((match, index) => {
      const imagePool = ['👩', '👨‍🏫', '👨']
      const names = [match.driverName, `Prof. ${match.driverName}`, `${match.driverName}`]
      const eta = ['08:15 AM', '08:20 AM', '08:00 AM'][index % 3]
      const pickupTime = format(new Date(match.departureTime), 'hh:mm a')
      const seatsLabel = `${match.availableSeats} seat${match.availableSeats !== 1 ? 's' : ''} left`
      const price = (3 + (match.matchScore % 4) * 0.5 + index * 0.5).toFixed(2)
      const compatibility = Math.max(60, Math.min(98, match.matchScore))
      const tags = [
        index % 2 === 0 ? 'Tesla Model 3' : 'Toyota Prius',
        seatsLabel,
        index % 2 === 0 ? 'Pet Friendly' : 'Quiet Ride',
      ]

      return {
        id: match.rideId,
        name: names[index % names.length],
        avatar: imagePool[index % imagePool.length],
        rating: (4.7 + (index % 3) * 0.15).toFixed(1),
        rides: 40 + index * 42,
        compatibility,
        eta,
        pickup: match.pickupZone,
        drop: match.destination || watchDestination || '—',
        pickupTime,
        tags,
        price,
      }
    })
  }, [matches, watchDestination])

  return (
    <div className="space-y-7">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[38px] font-semibold leading-tight text-slate-900">Find a Ride</h1>
          <p className="mt-1 text-[15px] text-brand-600">Connecting you with eco-friendly campus commuters.</p>
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-brand-100 px-4 py-2 text-xs font-semibold text-brand-700 md:inline-flex">
          <Sparkles className="h-3.5 w-3.5" />
          AI Powered Matching Active
        </div>
      </div>

      <section className="rounded-2xl border border-white/40 p-4 shadow-sm" style={{background:'rgba(255,255,255,0.72)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)'}}>
        <form onSubmit={searchForm.handleSubmit(onSearch)} className="grid grid-cols-1 gap-3 xl:grid-cols-[1.2fr_1.2fr_0.55fr_0.6fr]">
          {/* Pickup Zone */}
          <div>
            <label className="mb-2 flex items-center gap-1 text-[13px] font-semibold text-slate-700">
              <MapPin className="h-3.5 w-3.5 text-brand-500" /> Pickup Zone
            </label>
            <div className="relative">
              <input
                {...searchForm.register('pickupZone')}
                type="text"
                autoComplete="off"
                placeholder="Type pickup location…"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-8 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              {searchForm.watch('pickupZone') && (
                <button type="button" onClick={() => searchForm.setValue('pickupZone', '')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {searchForm.formState.errors.pickupZone && (
              <p className="mt-1 text-xs text-red-500">{searchForm.formState.errors.pickupZone.message}</p>
            )}
          </div>

          {/* Destination */}
          <div>
            <label className="mb-2 flex items-center gap-1 text-[13px] font-semibold text-slate-700">
              <Flag className="h-3.5 w-3.5 text-brand-500" /> Destination
            </label>
            <div className="relative">
              <input
                {...searchForm.register('destination')}
                type="text"
                autoComplete="off"
                placeholder="Type destination…"
                className="h-12 w-full rounded-xl border border-white/40 bg-white/50 pl-3 pr-8 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              {searchForm.watch('destination') && (
                <button type="button" onClick={() => searchForm.setValue('destination', '')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="mb-2 flex items-center gap-1 text-[13px] font-semibold text-slate-700">
              <Clock3 className="h-3.5 w-3.5 text-brand-500" /> Time
            </label>
            <input
              {...searchForm.register('time')}
              type="time"
              className="h-12 w-full rounded-xl border border-white/40 bg-white/50 px-3 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            {searchForm.formState.errors.time && (
              <p className="mt-1 text-xs text-red-500">{searchForm.formState.errors.time.message}</p>
            )}
          </div>

          {/* Search button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={searchForm.formState.isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#061a0b] px-4 text-sm font-semibold text-white transition hover:bg-[#08220f] disabled:opacity-60"
            >
              <Search className="h-4 w-4" />
              {searchForm.formState.isSubmitting ? 'Searching…' : 'Search'}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-[30px] font-semibold text-slate-900">{cards.length} Rides Available</h2>
          <div className="hidden items-center gap-2 md:flex">
            <button type="button" className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/40 bg-white/50 px-3 text-xs font-semibold text-slate-600">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
            </button>
            <button type="button" className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/40 bg-white/50 px-3 text-xs font-semibold text-brand-600">
              <ArrowUpDown className="h-3.5 w-3.5" /> Sort by Match
            </button>
          </div>
        </div>

        {searchError && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{searchError}</div>
        )}

        {!searchError && searchDone && cards.length === 0 && (
          <div className="rounded-2xl border border-white/40 px-5 py-6 text-sm text-slate-600" style={{background:'rgba(255,255,255,0.72)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)'}}>
            No rides found for <strong>{searchForm.getValues('pickupZone')}</strong> at the selected time. Try a different zone or time.
          </div>
        )}

        {!searchDone && (
          <div className="rounded-2xl border border-dashed border-white/40 px-5 py-10 text-center text-sm text-slate-500" style={{background:'rgba(255,255,255,0.40)',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)'}}>
            Enter a pickup zone and time above, then hit <strong>Search</strong>
          </div>
        )}

        <div className="space-y-3">
          {cards.map((ride) => (
            <article key={ride.id} className="grid rounded-2xl border border-white/40 p-4 shadow-sm xl:grid-cols-[1.1fr_2.2fr_0.9fr]" style={{background:'rgba(255,255,255,0.72)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)'}}>
              <div className="border-slate-100 pr-4 xl:border-r">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-lg">{ride.avatar}</div>
                  <div>
                    <p className="text-[24px] font-semibold text-slate-900">{ride.name}</p>
                    <p className="text-xs text-brand-600">⭐ {ride.rating} ({ride.rides} rides)</p>
                  </div>
                </div>
                <div className={clsx(
                  'mt-4 rounded-xl px-3 py-2 text-center',
                  ride.compatibility >= 90 ? 'bg-emerald-50/80' : 'bg-white/40 border border-white/30'
                )}>
                  <p className="text-[11px] font-semibold tracking-wide text-slate-500">COMPATIBILITY</p>
                  <p className={clsx('text-[36px] font-semibold leading-tight', ride.compatibility >= 90 ? 'text-brand-600' : 'text-slate-700')}>
                    {ride.compatibility}% Match
                  </p>
                </div>
              </div>

              <div className="mt-4 px-1 xl:mt-0 xl:px-5">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Circle className="mt-1 h-3.5 w-3.5 fill-brand-500 text-brand-500" />
                    <div>
                      <p className="text-[11px] font-semibold text-brand-600">{ride.eta}</p>
                      <p className="text-[25px] font-medium text-slate-900">{ride.pickup}</p>
                    </div>
                  </div>
                  <div className="ml-1.5 h-5 border-l border-dashed border-slate-300" />
                  <div className="flex items-start gap-2">
                    <Circle className="mt-1 h-3.5 w-3.5 fill-white text-slate-700" />
                    <div>
                      <p className="text-[11px] font-semibold text-brand-600">{ride.pickupTime}</p>
                      <p className="text-[25px] font-medium text-slate-900">{ride.drop}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Tag icon={CarFront} label={ride.tags[0]} />
                  <Tag icon={UserRound} label={ride.tags[1]} />
                  <Tag icon={indexTagIcon(ride.tags[2])} label={ride.tags[2]} />
                </div>
              </div>

              <div className="mt-4 flex flex-col items-end justify-between border-slate-100 pl-4 xl:mt-0 xl:border-l">
                <div className="text-right">
                  <p className="text-[41px] font-semibold leading-none text-slate-900">₹{ride.price}</p>
                  <p className="text-xs text-slate-400">per seat</p>
                </div>
                <button
                  onClick={() => handleJoin(ride.id)}
                  className={clsx(
                    'mt-4 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold',
                    ride.compatibility >= 90
                      ? 'bg-brand-500 text-slate-900 hover:bg-brand-400'
                      : 'border border-brand-500 bg-white/50 text-slate-900 hover:bg-brand-50'
                  )}
                >
                  Request to Join
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function Tag({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-white/50 px-2.5 py-1 text-xs text-brand-700 border border-white/30">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}

function indexTagIcon(label: string) {
  if (label.toLowerCase().includes('pet')) return Leaf
  if (label.toLowerCase().includes('quiet')) return Music2
  return Leaf
}
