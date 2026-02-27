'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/components/AppShell'
import ProtectedRoute from '@/components/ProtectedRoute'
import { subscriptionApi, SubscriptionDto, CreateSubscriptionRequest } from '@/lib/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Settings, Plus, Users } from 'lucide-react'
import clsx from 'clsx'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const schema = z.object({
  pickupZone:    z.string().min(1, 'Required'),
  departureTime: z.string().regex(/^\d{2}:\d{2}$/, 'HH:mm format required'),
  dayOfWeek:     z.coerce.number().min(0).max(6),
})

type FormData = z.infer<typeof schema>

export default function SubscriptionPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <SubscriptionContent />
      </AppShell>
    </ProtectedRoute>
  )
}

function SubscriptionContent() {
  const [pools, setPools] = useState<SubscriptionDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { dayOfWeek: 1 },
  })

  function loadMyPools() {
    setLoading(true)
    subscriptionApi.myPools()
      .then(setPools)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadMyPools() }, [])

  async function onCreatePool(data: FormData) {
    setFormError(null)
    try {
      const body: CreateSubscriptionRequest = {
        pickupZone:    data.pickupZone,
        departureTime: data.departureTime,
        dayOfWeek:     data.dayOfWeek,
      }
      await subscriptionApi.create(body)
      reset()
      setShowForm(false)
      loadMyPools()
    } catch (e: unknown) {
      setFormError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create pool'
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-[36px] font-semibold leading-tight text-slate-900">
          <Settings className="h-7 w-7 text-brand-500" /> Subscription Pools
        </h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-900 text-sm px-5 py-2.5 font-semibold transition"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'New Pool'}
        </button>
      </div>

      <p className="text-sm text-slate-500">
        Recurring ride pools automatically pair you with the same group every week — zero planning after setup.
      </p>

      {/* Create pool form */}
      {showForm && (
        <div className="rounded-2xl border border-white/40 p-6 space-y-4 shadow-sm" style={{background:'rgba(255,255,255,0.72)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)'}}>
          <h2 className="font-semibold text-slate-800">Create a new recurring pool</h2>
          <form onSubmit={handleSubmit(onCreatePool)} className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Pickup Zone</label>
              <input
                {...register('pickupZone')}
                placeholder="e.g. A"
                className="w-full rounded-xl border border-white/40 bg-white/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.pickupZone && <p className="text-red-500 text-xs mt-1">{errors.pickupZone.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Time (HH:mm)</label>
              <input
                {...register('departureTime')}
                placeholder="08:30"
                maxLength={5}
                className="w-full rounded-xl border border-white/40 bg-white/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.departureTime && <p className="text-red-500 text-xs mt-1">{errors.departureTime.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Day of Week</label>
              <select
                {...register('dayOfWeek')}
                className="w-full rounded-xl border border-white/40 bg-white/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {DAYS.map((d, i) => (
                  <option key={d} value={i}>{d}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-900 px-6 py-2.5 text-sm font-semibold transition disabled:opacity-60"
              >
                {isSubmitting ? 'Creating…' : 'Create Pool'}
              </button>
            </div>
          </form>

          {formError && (
            <div className="bg-red-50 text-red-700 rounded-lg px-3 py-2 text-sm">{formError}</div>
          )}
        </div>
      )}

      {/* Pool list */}
      {loading ? (
        <div className="text-center text-slate-400 text-sm py-8">Loading your pools…</div>
      ) : pools.length === 0 ? (
        <div className="rounded-2xl border border-white/40 p-8 text-center text-slate-500 text-sm" style={{background:'rgba(255,255,255,0.72)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)'}}>
          No subscription pools yet. Create one above!
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {pools.map((pool) => (
            <PoolCard key={pool.id} pool={pool} onReload={loadMyPools} />
          ))}
        </div>
      )}
    </div>
  )
}

function PoolCard({ pool, onReload }: { pool: SubscriptionDto; onReload: () => void }) {
  const [joining, setJoining] = useState(false)

  async function handleJoin() {
    setJoining(true)
    try {
      await subscriptionApi.join(pool.id)
      onReload()
    } catch (e: unknown) {
      alert((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Join failed')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/40 p-5 space-y-3 shadow-sm" style={{background:'rgba(255,255,255,0.72)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)'}}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-800">Zone {pool.pickupZone}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {pool.dayName ?? DAYS[pool.dayOfWeek]} · {pool.departureTime}
          </p>
        </div>
        <div className={clsx('flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full bg-brand-50 text-brand-700')}>
          <Users className="w-3.5 h-3.5" />
          {pool.memberCount} member{pool.memberCount !== 1 ? 's' : ''}
        </div>
      </div>
      <button
        onClick={handleJoin}
        disabled={joining}
        className="w-full border border-brand-500 text-brand-600 hover:bg-brand-50 text-sm py-2 rounded-xl font-semibold transition disabled:opacity-60"
      >
        {joining ? 'Joining…' : 'Join Pool'}
      </button>
    </div>
  )
}
