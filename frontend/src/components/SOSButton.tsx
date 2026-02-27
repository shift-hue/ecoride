'use client'

import { useState } from 'react'
import { Phone, MapPin, X, AlertTriangle, ShieldCheck, MessageSquare } from 'lucide-react'

const EMERGENCY_CONTACTS = [
  { label: 'Campus Security',  number: '100',      icon: ShieldCheck,   color: 'text-brand-600' },
  { label: 'Police',           number: '100',      icon: Phone,         color: 'text-blue-600'  },
  { label: 'Ambulance',        number: '108',      icon: AlertTriangle, color: 'text-red-600'   },
  { label: 'Women Helpline',   number: '1091',     icon: ShieldCheck,   color: 'text-purple-600'},
]

export default function SOSButton() {
  const [open, setOpen] = useState(false)
  const [locationShared, setLocationShared] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  function shareLocation() {
    setLocationError(null)
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by your browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        // Open Google Maps with current coordinates so user can share/screenshot
        window.open(`https://maps.google.com/?q=${latitude},${longitude}`, '_blank')
        setLocationShared(true)
      },
      () => setLocationError('Unable to get location. Please allow location access.'),
    )
  }

  return (
    <>
      {/* ── SOS Trigger Button ─────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="SOS Emergency"
        className="sos-btn fixed bottom-[88px] right-5 z-[60] lg:bottom-6"
        style={{
          /* dark solid glass pill — high contrast, always visible */
          background: 'rgba(30, 6, 6, 0.82)',
          backdropFilter: 'blur(18px) saturate(160%)',
          WebkitBackdropFilter: 'blur(18px) saturate(160%)',
          border: '1px solid rgba(239,68,68,0.55)',
          boxShadow:
            '0 4px 28px 0 rgba(239,68,68,0.45), 0 2px 8px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,90,90,0.18)',
          borderRadius: '9999px',
          height: '48px',
          minWidth: '96px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '0 20px',
          cursor: 'pointer',
        }}
      >
        <span
          className="relative flex h-2 w-2 shrink-0"
          aria-hidden="true"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: 'rgba(255,255,255,0.92)',
            textShadow: '0 1px 4px rgba(0,0,0,0.25)',
          }}
        >
          SOS
        </span>
      </button>

      {/* ── Emergency Modal ────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-5 space-y-4"
            style={{
              background: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(24px) saturate(160%)',
              WebkitBackdropFilter: 'blur(24px) saturate(160%)',
              border: '1px solid rgba(255,255,255,0.50)',
              boxShadow: '0 8px 40px 0 rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.60)',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-[17px] font-bold text-slate-900 leading-tight">Emergency Help</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Tap a number to call instantly</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            {/* Emergency Contacts */}
            <div className="space-y-2">
              {EMERGENCY_CONTACTS.map(({ label, number, icon: Icon, color }) => (
                <a
                  key={label}
                  href={`tel:${number}`}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 transition active:scale-[0.97]"
                  style={{
                    background: 'rgba(255,255,255,0.70)',
                    border: '1px solid rgba(255,255,255,0.50)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.80)',
                  }}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-slate-800">{label}</p>
                    <p className={`text-xs font-medium ${color}`}>{number}</p>
                  </div>
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: 'rgba(239,68,68,0.12)',
                      border: '1px solid rgba(239,68,68,0.25)',
                    }}
                  >
                    <Phone className="h-3.5 w-3.5 text-red-500" />
                  </div>
                </a>
              ))}
            </div>

            {/* Share Location */}
            <button
              type="button"
              onClick={shareLocation}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[14px] font-semibold transition active:scale-[0.97]"
              style={{
                background: locationShared
                  ? 'rgba(52,211,153,0.20)'
                  : 'rgba(255,255,255,0.65)',
                border: locationShared
                  ? '1px solid rgba(52,211,153,0.45)'
                  : '1px solid rgba(255,255,255,0.50)',
                color: locationShared ? '#047857' : '#334155',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.80)',
              }}
            >
              <MapPin className={`h-4 w-4 ${locationShared ? 'text-emerald-600' : 'text-slate-500'}`} />
              {locationShared ? 'Location Opened in Maps' : 'Share My Location'}
            </button>

            {locationError && (
              <p className="text-center text-xs text-red-500">{locationError}</p>
            )}

            {/* SMS helper */}
            <a
              href="sms:100"
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[14px] font-semibold transition active:scale-[0.97]"
              style={{
                background: 'rgba(255,255,255,0.65)',
                border: '1px solid rgba(255,255,255,0.50)',
                color: '#334155',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.80)',
              }}
            >
              <MessageSquare className="h-4 w-4 text-slate-500" />
              Send Emergency SMS
            </a>

            <p className="text-center text-[11px] text-slate-400 leading-relaxed">
              Stay calm. Stay on the line with the operator.<br />
              Your safety is our priority.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
