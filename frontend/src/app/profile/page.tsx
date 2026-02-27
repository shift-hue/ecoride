'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import ProtectedRoute from '@/components/ProtectedRoute'
import { carbonApi, rideApi, trustApi, userApi, MyRideDto, TrustProfileDto, WalletDto, UpdateUserRequest } from '@/lib/api'
import type { UserProfile } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { format } from 'date-fns'
import {
  CarFront, Shield, TreePine, Star,
  CheckCircle2, Pencil, Phone, BadgeCheck,
  Users, MessageSquare, X, Save, Check,
  AlertCircle, Circle,
} from 'lucide-react'

const ALL_PREFS = ['Non-smoker', 'Music friendly', 'Pets ok', 'Quiet ride', 'AC preferred', 'No eating']

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <ProfileContent />
      </AppShell>
    </ProtectedRoute>
  )
}

function ProfileContent() {
  const { user, refreshUser } = useAuth()
  const [trust, setTrust] = useState<TrustProfileDto | null>(null)
  const [wallet, setWallet] = useState<WalletDto | null>(null)
  const [myRides, setMyRides] = useState<MyRideDto[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([
      trustApi.getProfile(user.id),
      carbonApi.wallet(),
      rideApi.my(),
    ])
      .then(([trustProfile, walletInfo, rides]) => {
        setTrust(trustProfile)
        setWallet(walletInfo)
        setMyRides(rides)
      })
      .finally(() => setLoading(false))
  }, [user])

  const nextRide = useMemo(() => {
    const now = new Date()
    return myRides
      .filter((ride) => (ride.rideStatus === 'OPEN' || ride.rideStatus === 'FULL') && new Date(ride.departureTime) >= now)
      .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())[0]
  }, [myRides])

  if (!user) return null

  const trustScore  = trust?.trustScore    ?? user.trustScore
  const ridesCount  = trust?.ridesCompleted ?? user.ridesCompleted
  const carbonSavedKg = wallet ? Math.max(0, Math.round(wallet.totalCarbonSavedGrams / 1000)) : user.carbonCredits
  const rating      = Math.min(5, Math.max(4.0, 3.8 + trustScore / 100))
  const connections = trust?.topConnections ?? []

  async function saveProfile(patch: Partial<UpdateUserRequest>) {
    await userApi.update({ name: user!.name, ...patch })
    await refreshUser()
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6">
      <p className="text-sm text-brand-600">Dashboard / <span className="text-slate-600">Profile</span></p>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[2fr_0.95fr]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-24 rounded-t-2xl bg-gradient-to-r from-emerald-100 via-emerald-50 to-emerald-100" />
            <div className="-mt-10 flex flex-wrap items-start justify-between gap-4 px-6 pb-6">
              <div className="flex items-start gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-slate-200 text-3xl font-semibold text-slate-700">
                  {user.name?.slice(0, 1).toUpperCase() ?? 'U'}
                </div>
                <div className="pt-7">
                  <h1 className="text-[34px] font-semibold leading-tight text-slate-900">{user.name}</h1>
                  <p className="text-[15px] text-brand-600">{user.department ?? 'Computer Science Dept.'} • Class of {user.year ? 2020 + user.year : 2025}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Gold Tier Trust</span>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Verified Campus Member</span>
                  </div>
                </div>
              </div>

              <button type="button" onClick={() => setEditOpen(true)} className="mt-7 inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Pencil className="h-4 w-4" /> Edit Profile
              </button>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <MetricCard icon={CarFront}  label="RIDES"        value={ridesCount.toString()} />
            <MetricCard icon={Shield}    label="TRUST SCORE"  value={trustScore.toString()} />
            <MetricCard icon={TreePine}  label="KG CO2 SAVED" value={carbonSavedKg.toString()} />
            <MetricCard icon={Star}      label="RATING"       value={rating.toFixed(1)} />
          </section>

          <VehicleSection user={user} onSave={saveProfile} />

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[18px] font-semibold text-slate-900">
                <Users className="h-4 w-4 text-brand-500" /> Frequent Carpoolers
              </h2>
              <span className="text-xs text-slate-400">Updated from your ride history</span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {connections.length > 0 ? connections.map((person) => (
                <div key={person.userId} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                      {person.name?.slice(0, 1).toUpperCase() ?? 'C'}
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-slate-900">{person.name}</p>
                      <p className="text-xs text-brand-600">{person.mutualRides} shared rides</p>
                    </div>
                  </div>
                  <Link href="/inbox" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-brand-50" title="Send message">
                    <MessageSquare className="h-4 w-4 text-brand-600" />
                  </Link>
                </div>
              )) : (
                <div className="col-span-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  Frequent carpooler data will appear after a few completed shared rides.
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <VerificationSection user={user} trustScore={trustScore} onSave={saveProfile} />

          <AboutSection user={user} onSave={saveProfile} />

          <section className="rounded-2xl border border-brand-200 bg-brand-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-slate-900">NEXT RIDE</h2>
              <span className="rounded bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600">TODAY</span>
            </div>
            {nextRide ? (
              <>
                <div className="mt-3 text-sm text-slate-700">
                  <p className="font-semibold">{format(new Date(nextRide.departureTime), 'hh:mm a')} • {nextRide.pickupZone}</p>
                  <p className="text-brand-600">{nextRide.role === 'DRIVER' ? 'Driver assigned' : 'Riding with campus group'}</p>
                </div>
                <button type="button" className="mt-4 h-10 w-full rounded-lg bg-brand-500 text-sm font-semibold text-slate-900 hover:bg-brand-400">
                  View Details
                </button>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-600">No upcoming rides yet.</p>
            )}
          </section>
        </aside>
      </div>

      {loading && (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">Loading profile details…</div>
      )}

      {editOpen && (
        <EditProfileModal
          user={user!}
          onClose={() => setEditOpen(false)}
          onSaved={async () => {
            await refreshUser()
            setEditOpen(false)
          }}
        />
      )}
    </div>
  )
}

// ── Edit Profile Modal ────────────────────────────────────────────────────────

function EditProfileModal({
  user,
  onClose,
  onSaved,
}: {
  user: UserProfile
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const [name, setName] = useState(user.name ?? '')
  const [department, setDepartment] = useState(user.department ?? '')
  const [year, setYear] = useState<string>(user.year ? String(user.year) : '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required.'); return }
    setSaving(true)
    setError(null)
    try {
      const body: UpdateUserRequest = {
        name: name.trim(),
        department: department.trim() || undefined,
        year: year ? Number(year) : undefined,
      }
      await userApi.update(body)
      await onSaved()
    } catch {
      setError('Failed to save changes. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-[18px] font-semibold text-slate-900">Edit Profile</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {/* Avatar preview */}
        <div className="flex justify-center pt-6 pb-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-3xl font-semibold text-slate-700">
            {name?.slice(0, 1).toUpperCase() || 'U'}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6 pt-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>

          {/* Department */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Computer Science"
              className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>

          {/* Year */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Year of Study</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              <option value="">Select year</option>
              {[1, 2, 3, 4, 5, 6].map((y) => (
                <option key={y} value={y}>Year {y}{y === 4 ? ' (Final Year)' : ''}</option>
              ))}
            </select>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Email <span className="text-slate-400">(not editable)</span></label>
            <input
              type="email"
              value={user.email}
              readOnly
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 h-11 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 text-sm font-semibold text-slate-900 hover:bg-brand-400 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50">
        <Icon className="h-5 w-5 text-brand-600" />
      </div>
      <p className="text-[34px] font-semibold leading-none text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] font-semibold tracking-wide text-brand-600">{label}</p>
    </div>
  )
}

function VerificationItem() { return null } // kept for reference - replaced below

// ── Vehicle Details Section ───────────────────────────────────────────────────

function VehicleSection({
  user, onSave,
}: { user: UserProfile; onSave: (p: Partial<UpdateUserRequest>) => Promise<void> }) {
  const [editing, setEditing] = useState(false)
  const [model, setModel]     = useState(user.vehicleModel ?? '')
  const [number, setNumber]   = useState(user.vehicleNumber ?? '')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [saved, setSaved]     = useState(false)

  useEffect(() => { setModel(user.vehicleModel ?? ''); setNumber(user.vehicleNumber ?? '') }, [user])

  async function handleSave() {
    setSaving(true); setError(null)
    try {
      await onSave({ vehicleModel: model.trim(), vehicleNumber: number.trim() })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
      setEditing(false)
    } catch { setError('Save failed. Please try again.') }
    finally { setSaving(false) }
  }

  function handleCancel() {
    setModel(user.vehicleModel ?? ''); setNumber(user.vehicleNumber ?? '')
    setEditing(false); setError(null)
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[18px] font-semibold text-slate-900">
          <CarFront className="h-4 w-4 text-brand-500" /> Vehicle Details
        </h2>
        {!editing && (
          <button type="button" onClick={() => setEditing(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50">
            <Pencil className="h-3.5 w-3.5" />
            {saved ? <><Check className="h-3.5 w-3.5 text-green-600" /> Saved!</> : 'Edit'}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Vehicle Model Name</label>
          {editing
            ? <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Tesla Model 3"
                className="h-12 w-full rounded-md border border-brand-400 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-200" />
            : <div className="flex h-12 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700">
                {user.vehicleModel || <span className="text-slate-400">Not set</span>}
              </div>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Vehicle Number</label>
          {editing
            ? <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="e.g. KA01AB1234"
                className="h-12 w-full rounded-md border border-brand-400 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-200" />
            : <div className="flex h-12 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700">
                {user.vehicleNumber || <span className="text-slate-400">Not set</span>}
              </div>}
        </div>
      </div>
      {editing && (
        <div className="mt-4 space-y-2">
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={handleCancel} disabled={saving}
              className="flex-1 h-9 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleSave} disabled={saving}
              className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 text-sm font-semibold text-slate-900 hover:bg-brand-400 disabled:opacity-60">
              <Save className="h-3.5 w-3.5" />{saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

// ── Verification Status Section ───────────────────────────────────────────────

function VerificationSection({
  user, trustScore, onSave,
}: { user: UserProfile; trustScore: number; onSave: (p: Partial<UpdateUserRequest>) => Promise<void> }) {
  const [editing, setEditing]          = useState(false)
  const [phone, setPhone]              = useState(user.phoneNumber ?? '')
  const [phoneVerified, setPhoneVerif] = useState(user.phoneVerified)
  const [licVerified, setLicVerif]     = useState(user.licenseVerified)
  const [saving, setSaving]            = useState(false)
  const [error, setError]              = useState<string | null>(null)
  const [saved, setSaved]              = useState(false)

  useEffect(() => {
    setPhone(user.phoneNumber ?? '')
    setPhoneVerif(user.phoneVerified)
    setLicVerif(user.licenseVerified)
  }, [user])

  async function handleSave() {
    setSaving(true); setError(null)
    try {
      await onSave({ phoneNumber: phone.trim(), phoneVerified, licenseVerified: licVerified })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
      setEditing(false)
    } catch { setError('Save failed.') }
    finally { setSaving(false) }
  }

  function handleCancel() {
    setPhone(user.phoneNumber ?? ''); setPhoneVerif(user.phoneVerified); setLicVerif(user.licenseVerified)
    setEditing(false); setError(null)
  }

  const trustPct = Math.min(98, Math.max(10, trustScore))

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[18px] font-semibold text-slate-900">Verification Status</h2>
        {!editing && (
          <button type="button" onClick={() => setEditing(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50">
            <Pencil className="h-3.5 w-3.5" />
            {saved ? <><Check className="h-3.5 w-3.5 text-green-600" /> Saved!</> : 'Edit'}
          </button>
        )}
      </div>
      <ul className="space-y-3">
        {/* Campus ID */}
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">Campus ID Verified</p>
            <p className="text-xs text-slate-500">Confirmed via university email ({user.email})</p>
          </div>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">Active</span>
        </li>
        {/* Phone */}
        <li className="flex items-start gap-2">
          {phoneVerified
            ? <Phone className="mt-0.5 h-4 w-4 text-brand-500 shrink-0" />
            : <AlertCircle className="mt-0.5 h-4 w-4 text-amber-400 shrink-0" />}
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">Phone Number</p>
            {editing ? (
              <div className="mt-1 space-y-1">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210"
                  className="h-9 w-full rounded-md border border-brand-400 bg-white px-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-200" />
                <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                  <input type="checkbox" checked={phoneVerified} onChange={(e) => setPhoneVerif(e.target.checked)} className="rounded accent-brand-500" />
                  Mark as verified
                </label>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                {user.phoneNumber
                  ? <>{user.phoneNumber}{phoneVerified && <span className="ml-1 text-green-600 font-medium">• Verified</span>}</>
                  : <span className="text-amber-600">Not added — click Edit to add</span>}
              </p>
            )}
          </div>
          {!editing && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              phoneVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>{phoneVerified ? 'Verified' : 'Pending'}</span>
          )}
        </li>
        {/* License */}
        <li className="flex items-start gap-2">
          {licVerified
            ? <BadgeCheck className="mt-0.5 h-4 w-4 text-brand-500 shrink-0" />
            : <Circle className="mt-0.5 h-4 w-4 text-slate-300 shrink-0" />}
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">Driver License</p>
            {editing ? (
              <label className="mt-1 flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                <input type="checkbox" checked={licVerified} onChange={(e) => setLicVerif(e.target.checked)} className="rounded accent-brand-500" />
                I have a valid driver license
              </label>
            ) : (
              <p className="text-xs text-slate-500">{licVerified ? 'Valid until 2026' : 'Not added yet'}</p>
            )}
          </div>
          {!editing && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              licVerified ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
            }`}>{licVerified ? 'Active' : 'None'}</span>
          )}
        </li>
      </ul>
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>Trust Level</span>
          <span className="text-brand-600">{trustPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200">
          <div className="h-2 rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${trustPct}%` }} />
        </div>
        <p className="mt-1 text-[11px] text-slate-500">High trust score unlocks priority parking features.</p>
      </div>
      {editing && (
        <div className="mt-4 space-y-2">
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={handleCancel} disabled={saving}
              className="flex-1 h-9 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleSave} disabled={saving}
              className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 text-sm font-semibold text-slate-900 hover:bg-brand-400 disabled:opacity-60">
              <Save className="h-3.5 w-3.5" />{saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

// ── About Section ─────────────────────────────────────────────────────────────

function AboutSection({
  user, onSave,
}: { user: UserProfile; onSave: (p: Partial<UpdateUserRequest>) => Promise<void> }) {
  const currentPrefs = (user.preferences ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const [editing, setEditing] = useState(false)
  const [bio, setBio]         = useState(user.bio ?? '')
  const [prefs, setPrefs]     = useState<string[]>(currentPrefs)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [saved, setSaved]     = useState(false)

  useEffect(() => {
    setBio(user.bio ?? '')
    setPrefs((user.preferences ?? '').split(',').map((s) => s.trim()).filter(Boolean))
  }, [user])

  function togglePref(p: string) {
    setPrefs((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])
  }

  async function handleSave() {
    setSaving(true); setError(null)
    try {
      await onSave({ bio: bio.trim(), preferences: prefs.join(',') })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
      setEditing(false)
    } catch { setError('Save failed.') }
    finally { setSaving(false) }
  }

  function handleCancel() {
    setBio(user.bio ?? ''); setPrefs(currentPrefs)
    setEditing(false); setError(null)
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[18px] font-semibold text-slate-900">About {user.name.split(' ')[0]}</h2>
        {!editing && (
          <button type="button" onClick={() => setEditing(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50">
            <Pencil className="h-3.5 w-3.5" />
            {saved ? <><Check className="h-3.5 w-3.5 text-green-600" /> Saved!</> : 'Edit'}
          </button>
        )}
      </div>
      {editing ? (
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={500}
          placeholder="Tell your carpoolers a little about yourself…"
          className="w-full rounded-lg border border-brand-400 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-200 resize-none" />
      ) : (
        <p className="text-sm leading-6 text-slate-600">
          {user.bio || <span className="italic text-slate-400">No bio yet — click Edit to add one.</span>}
        </p>
      )}
      <div className="mt-3">
        {editing && <p className="mb-2 text-xs font-semibold text-slate-500">Ride preferences (tap to toggle)</p>}
        <div className="flex flex-wrap gap-2">
          {(editing ? ALL_PREFS : (prefs.length ? prefs : []))
            .map((p) => (
              <button key={p} type="button" disabled={!editing} onClick={() => editing && togglePref(p)}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  editing
                    ? prefs.includes(p)
                      ? 'bg-brand-500 text-slate-900 ring-1 ring-brand-600'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    : 'bg-slate-100 text-brand-600 cursor-default'
                }`}>
                {editing && prefs.includes(p) && <span className="mr-1">✓</span>}{p}
              </button>
            ))}
          {!editing && prefs.length === 0 && (
            <span className="text-xs italic text-slate-400">No preferences set yet.</span>
          )}
        </div>
      </div>
      {editing && (
        <div className="mt-4 space-y-2">
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
          <p className="text-right text-[10px] text-slate-400">{bio.length}/500</p>
          <div className="flex gap-2">
            <button type="button" onClick={handleCancel} disabled={saving}
              className="flex-1 h-9 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleSave} disabled={saving}
              className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 text-sm font-semibold text-slate-900 hover:bg-brand-400 disabled:opacity-60">
              <Save className="h-3.5 w-3.5" />{saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
