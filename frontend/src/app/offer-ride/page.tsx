'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AppShell from '@/components/AppShell'
import ProtectedRoute from '@/components/ProtectedRoute'
import { rideApi, CreateRideRequest } from '@/lib/api'
import {
  ArrowLeft,
  Circle,
  MapPin,
  Clock3,
  PlusCircle,
  LocateFixed,
  Flag,
  CalendarDays,
  IndianRupee,
} from 'lucide-react'
import clsx from 'clsx'

const schema = z.object({
  pickupZone: z.string().min(2, 'Pickup zone is required'),
  destination: z.string().min(2, 'Destination is required'),
  departureTime: z.string().min(1, 'Departure time is required'),
  availableSeats: z.coerce.number().min(1).max(4),
  pricePerSeat: z.coerce.number().min(1, 'Must be at least ₹1').max(10000, 'Too high'),
  isSubscription: z.boolean(),
  monthlyCost: z.coerce.number().min(0).max(100000).optional(),
})

type OfferForm = z.infer<typeof schema>

export default function OfferRidePage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <OfferRideContent />
      </AppShell>
    </ProtectedRoute>
  )
}

function OfferRideContent() {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<OfferForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      pickupZone: '',
      destination: '',
      departureTime: '',
      availableSeats: 2,
      pricePerSeat: undefined,
      isSubscription: false,
      monthlyCost: undefined,
    },
  })

  async function onSubmit(data: OfferForm) {
    setSubmitError(null)
    try {
      const dt = new Date(data.departureTime)
      if (Number.isNaN(dt.getTime())) {
        setSubmitError('Please provide a valid departure date/time')
        return
      }

      const body: CreateRideRequest = {
        pickupZone: data.pickupZone,
        destination: data.destination,
        departureTime: dt.toISOString(),
        availableSeats: data.availableSeats,
        isSubscription: data.isSubscription,
        pricePerSeat: data.pricePerSeat,
      }

      await rideApi.create(body)
      router.push('/my-rides')
    } catch (e: unknown) {
      setSubmitError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Unable to post ride'
      )
    }
  }

  const seats = [1, 2, 3, 4]
  const selectedSeat = form.watch('availableSeats')
  const enabledPool = form.watch('isSubscription')
  const monthlyCost = form.watch('monthlyCost')
  const pricePerSeat = form.watch('pricePerSeat')

  return (
    <div className="mx-auto w-full max-w-[980px] space-y-4">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-[44px] font-semibold leading-tight text-slate-900">Offer a Ride</h1>
        <p className="mt-1 text-[16px] text-slate-500">Share your commute, save money, and reduce your carbon footprint.</p>
      </div>

      <section className="rounded-2xl border border-white/40 shadow-sm" style={{background:'rgba(255,255,255,0.72)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)'}}>
        <div className="rounded-t-2xl border-b border-slate-100 bg-[radial-gradient(#eaf2ea_1px,transparent_1px)] bg-[size:12px_12px] px-8 py-7">
          <div className="mx-auto flex w-full max-w-md items-center justify-center gap-7">
            <div className="text-center">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <Circle className="h-4 w-4 fill-brand-500 text-brand-500" />
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500">Start</p>
            </div>
            <div className="h-[2px] w-24 bg-brand-300" />
            <div className="text-center">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white">
                <MapPin className="h-4 w-4" />
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500">End</p>
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 md:p-8">
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-[28px] font-semibold text-slate-900">
              <LocateFixed className="h-4 w-4 text-brand-500" /> Route Details
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Pickup Zone" error={form.formState.errors.pickupZone?.message}>
                <div className="relative">
                  <input
                    {...form.register('pickupZone')}
                    placeholder="e.g. North Campus Library"
                    className="h-12 w-full rounded-xl border border-white/40 bg-white/50 pl-10 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                  <LocateFixed className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </Field>

              <Field label="Destination" error={form.formState.errors.destination?.message}>
                <div className="relative">
                  <input
                    {...form.register('destination')}
                    placeholder="e.g. Downtown Station"
                    className="h-12 w-full rounded-xl border border-white/40 bg-white/50 pl-10 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                  <Flag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </Field>
            </div>
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-5">
            <h2 className="flex items-center gap-2 text-[28px] font-semibold text-slate-900">
              <Clock3 className="h-4 w-4 text-brand-500" /> Schedule & Capacity
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.25fr_1fr]">
              <Field label="Departure Time" error={form.formState.errors.departureTime?.message}>
                <div className="relative">
                  <input
                    {...form.register('departureTime')}
                    type="datetime-local"
                    className="h-12 w-full rounded-xl border border-white/40 bg-white/50 pl-10 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
                <p className="mt-1 text-xs text-slate-500">We recommend leaving 10 mins early for traffic.</p>
              </Field>

              <Field label="Available Seats">
                <div className="grid grid-cols-4 gap-2">
                  {seats.map((seat) => (
                    <button
                      key={seat}
                      type="button"
                      onClick={() => form.setValue('availableSeats', seat)}
                      className={clsx(
                        'h-12 rounded-xl border text-sm font-semibold transition',
                        selectedSeat === seat
                          ? 'border-brand-500 bg-brand-100 text-brand-700'
                          : 'border-white/40 bg-white/50 text-slate-700 hover:bg-white/70'
                      )}
                    >
                      {seat === 4 ? '4+' : seat}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            {/* Daily price */}
            <Field label="Daily Price per Seat" error={form.formState.errors.pricePerSeat?.message}>
              <div className="relative max-w-xs">
                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  {...form.register('pricePerSeat')}
                  type="number"
                  min={1}
                  step={1}
                  placeholder="e.g. 50"
                  className="h-12 w-full rounded-xl border border-white/40 bg-white/50 pl-9 pr-3 text-sm font-semibold text-slate-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">Amount each rider pays you per day for this ride.</p>
              {pricePerSeat != null && pricePerSeat > 0 && (
                <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/50 border border-white/30 px-3 py-1 text-xs font-semibold text-slate-700">
                  ₹{Number(pricePerSeat).toLocaleString('en-IN')} per seat / day
                </p>
              )}
            </Field>
          </section>

          <section className="rounded-xl border border-brand-200 bg-brand-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                  <RefreshIcon />
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-slate-900">Create Subscription Pool</p>
                  <p className="text-sm text-slate-600">Make this a recurring ride for the semester (Mon-Fri)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => form.setValue('isSubscription', !enabledPool)}
                className={clsx(
                  'relative h-7 w-12 rounded-full transition',
                  enabledPool ? 'bg-brand-500' : 'bg-slate-300'
                )}
                aria-label="Toggle subscription"
              >
                <span
                  className={clsx(
                    'absolute top-0.5 h-6 w-6 rounded-full bg-white transition',
                    enabledPool ? 'right-0.5' : 'left-0.5'
                  )}
                />
              </button>
            </div>

            {enabledPool && (
              <div className="mt-4 border-t border-brand-200 pt-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Monthly Subscription Cost per Rider
                </label>
                <div className="relative max-w-xs">
                  <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    {...form.register('monthlyCost')}
                    type="number"
                    min={0}
                    step={50}
                    placeholder="e.g. 1500"
                    className="h-12 w-full rounded-xl border border-brand-300 bg-white pl-9 pr-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  This is the amount each rider will pay per month to join your subscription pool.
                </p>
                {monthlyCost != null && monthlyCost > 0 && (
                  <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                    ₹{monthlyCost.toLocaleString('en-IN')}/month per rider
                  </p>
                )}
              </div>
            )}
          </section>

          {submitError && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/dashboard" className="inline-flex h-11 items-center rounded-xl border border-white/40 bg-white/50 px-7 text-sm font-semibold text-slate-700 hover:bg-white/70">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-500 px-7 text-sm font-semibold text-slate-900 hover:bg-brand-400 disabled:opacity-60"
            >
              <PlusCircle className="h-4 w-4" />
              {form.formState.isSubmitting ? 'Posting...' : 'Post Ride'}
            </button>
          </div>
        </form>
      </section>

      <p className="text-center text-xs text-slate-400">
        By posting a ride, you agree to our Community Guidelines and Safety Standards.
      </p>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <polyline points="21 3 21 9 15 9" />
    </svg>
  )
}
