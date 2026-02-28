'use client'

import { useEffect, useState, useCallback } from 'react'
import AppShell from '@/components/AppShell'
import ProtectedRoute from '@/components/ProtectedRoute'
import { carbonApi } from '@/lib/api'
import { ArrowLeft, CheckCircle2, X, Ticket, Coins, ShoppingBag, Film, Utensils, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

// ── Constants ────────────────────────────────────────────────────────────────
const POINTS_PER_RUPEE = 0.5   // 1 point = ₹2  →  ₹1 costs 0.5 pts
const MIN_RUPEES = 100

type BrandId = 'amazon' | 'flipkart' | 'myntra' | 'ajio' | 'zomato' | 'bookmyshow'

interface Brand {
  id: BrandId
  name: string
  tagline: string
  color: string          // gradient tail
  bg: string             // card bg
  emoji: string
  icon: React.ComponentType<{ className?: string }>
  category: string
}

const BRANDS: Brand[] = [
  { id: 'amazon',     name: 'Amazon',        tagline: 'Shop everything online',         color: '#FF9900', bg: 'from-[#FF9900]/20 to-[#FF9900]/5',  emoji: '📦', icon: ShoppingCart, category: 'Shopping'   },
  { id: 'flipkart',   name: 'Flipkart',      tagline: 'Big Billion savings',            color: '#2874F0', bg: 'from-[#2874F0]/20 to-[#2874F0]/5',  emoji: '🛒', icon: ShoppingBag,  category: 'Shopping'   },
  { id: 'myntra',     name: 'Myntra',        tagline: 'Fashion & lifestyle deals',      color: '#FF3E6C', bg: 'from-[#FF3E6C]/20 to-[#FF3E6C]/5',  emoji: '👗', icon: ShoppingBag,  category: 'Fashion'    },
  { id: 'ajio',       name: 'Ajio',          tagline: 'Brands at best price',           color: '#800080', bg: 'from-purple-500/20 to-purple-500/5', emoji: '✨', icon: ShoppingBag,  category: 'Fashion'    },
  { id: 'zomato',     name: 'Zomato',        tagline: 'Order food & dining',            color: '#E23744', bg: 'from-[#E23744]/20 to-[#E23744]/5',  emoji: '🍔', icon: Utensils,     category: 'Food'       },
  { id: 'bookmyshow', name: 'BookMyShow',    tagline: 'Movies, events & experiences',   color: '#E8173F', bg: 'from-rose-500/20 to-rose-500/5',    emoji: '🎬', icon: Film,         category: 'Entertainment'},
]

const DENOMINATIONS = [100, 250, 500]

// ── localStorage helpers ─────────────────────────────────────────────────────
const LS_KEY = 'ecoride_vouchers'

interface VoucherRecord {
  id: string
  brand: BrandId
  brandName: string
  amount: number         // ₹ value
  pointsSpent: number
  cardNumber: string
  pin: string
  purchasedAt: string
}

interface LocalStore {
  spentPoints: number
  vouchers: VoucherRecord[]
}

function loadStore(): LocalStore {
  if (typeof window === 'undefined') return { spentPoints: 0, vouchers: [] }
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) ?? '{}') as Partial<LocalStore>
    return { spentPoints: raw.spentPoints ?? 0, vouchers: raw.vouchers ?? [] }
  } catch { return { spentPoints: 0, vouchers: [] } }
}

function saveStore(s: LocalStore) {
  localStorage.setItem(LS_KEY, JSON.stringify(s))
}

function generateCardNumber() {
  return Array.from({ length: 4 }, () =>
    Math.floor(1000 + Math.random() * 9000).toString()
  ).join(' - ')
}

function generatePin() {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// ── Page shell ───────────────────────────────────────────────────────────────
export default function RedeemPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <RedeemContent />
      </AppShell>
    </ProtectedRoute>
  )
}

// ── Main content ─────────────────────────────────────────────────────────────
function RedeemContent() {
  const [apiCredits, setApiCredits] = useState(0)
  const [loadingApi, setLoadingApi] = useState(true)
  const [store, setStore] = useState<LocalStore>({ spentPoints: 0, vouchers: [] })

  // confirm modal state
  const [confirmItem, setConfirmItem] = useState<{ brand: Brand; amount: number } | null>(null)
  // success modal state
  const [successVoucher, setSuccessVoucher] = useState<VoucherRecord | null>(null)

  // active tab: buy | history
  const [tab, setTab] = useState<'buy' | 'history'>('buy')

  useEffect(() => {
    carbonApi.wallet()
      .then(w => setApiCredits(w.totalCredits))
      .catch(() => {})
      .finally(() => setLoadingApi(false))
    setStore(loadStore())
  }, [])

  // 1 display-point = totalCredits / 10 (same as wallet page)
  const totalPoints = Math.floor(apiCredits / 10)
  const availablePoints = Math.max(0, totalPoints - store.spentPoints)
  const availableRupees = availablePoints * 2  // 1 pt = ₹2

  const canAfford = useCallback((amount: number) => availableRupees >= amount, [availableRupees])
  const pointCost = (amount: number) => Math.round(amount * POINTS_PER_RUPEE)

  function handleBuyClick(brand: Brand, amount: number) {
    if (!canAfford(amount)) return
    setConfirmItem({ brand, amount })
  }

  function handleConfirmPurchase() {
    if (!confirmItem) return
    const { brand, amount } = confirmItem
    const pts = pointCost(amount)
    const voucher: VoucherRecord = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      brand: brand.id,
      brandName: brand.name,
      amount,
      pointsSpent: pts,
      cardNumber: generateCardNumber(),
      pin: generatePin(),
      purchasedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    }
    const updated: LocalStore = {
      spentPoints: store.spentPoints + pts,
      vouchers: [voucher, ...store.vouchers],
    }
    saveStore(updated)
    setStore(updated)
    setConfirmItem(null)
    setSuccessVoucher(voucher)
  }

  const glassCard: React.CSSProperties = {
    background: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/wallet" className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/40 bg-white/50 hover:bg-white/70 transition">
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-[34px] font-semibold leading-tight text-slate-900">Redeem Vouchers</h1>
          <p className="text-sm text-slate-500">Turn your eco-credits into real-world rewards</p>
        </div>
        {/* Points balance pill */}
        <div className="rounded-2xl border border-white/40 px-5 py-3 text-center shadow-sm" style={glassCard}>
          <p className="text-[10px] font-semibold tracking-widest text-slate-400">AVAILABLE</p>
          {loadingApi ? (
            <p className="mt-0.5 text-[24px] font-semibold text-slate-400">—</p>
          ) : (
            <p className="mt-0.5 text-[28px] font-semibold leading-none text-slate-900">
              {availablePoints} <span className="text-[14px] font-medium text-slate-500">pts</span>
            </p>
          )}
          <p className="mt-0.5 text-[12px] font-semibold text-brand-600">≈ ₹{availableRupees}</p>
          <p className="mt-1 text-[10px] text-slate-400">1 pt = ₹2</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/40 bg-white/40 p-1 w-fit" style={{backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)'}}>
        {(['buy', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-lg px-6 py-2 text-sm font-semibold transition ${
              tab === t ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {t === 'buy' ? '🎁 Buy Vouchers' : '🧾 My Vouchers'}
          </button>
        ))}
      </div>

      {tab === 'buy' && (
        <>
          {/* Info row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-50/60 px-4 py-2 text-[13px] font-semibold text-brand-700">
              <Coins className="h-4 w-4" />
              1 point = ₹2
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/40 bg-white/50 px-4 py-2 text-[13px] font-medium text-slate-600">
              <Ticket className="h-4 w-4 text-amber-500" />
              Min. voucher: ₹{MIN_RUPEES} ({pointCost(MIN_RUPEES)} pts)
            </div>
          </div>

          {/* Brand grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {BRANDS.map(brand => {
              const Icon = brand.icon
              return (
                <div key={brand.id}
                  className={`rounded-2xl border border-white/40 bg-gradient-to-br ${brand.bg} p-5 shadow-sm`}
                  style={{backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)'}}
                >
                  {/* Brand header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 shadow-sm text-xl">
                      {brand.emoji}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-[16px]">{brand.name}</p>
                      <p className="text-[11px] text-slate-500">{brand.tagline}</p>
                    </div>
                    <span className="ml-auto rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                      {brand.category}
                    </span>
                  </div>

                  {/* Denomination buttons */}
                  <div className="space-y-2">
                    {DENOMINATIONS.map(amount => {
                      const pts = pointCost(amount)
                      const affordable = canAfford(amount)
                      return (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => handleBuyClick(brand, amount)}
                          disabled={!affordable}
                          className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${
                            affordable
                              ? 'bg-white/80 hover:bg-white text-slate-900 shadow-sm hover:shadow'
                              : 'bg-white/30 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <span>₹{amount} Voucher</span>
                          <span className={`flex items-center gap-1 text-xs font-bold ${affordable ? 'text-brand-600' : 'text-slate-400'}`}>
                            <Coins className="h-3 w-3" />
                            {pts} pts
                            {!affordable && <span className="ml-1 text-[10px] text-red-400">Insufficient</span>}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {tab === 'history' && (
        <div className="space-y-3">
          {store.vouchers.length === 0 ? (
            <div className="rounded-2xl border border-white/40 p-10 text-center" style={glassCard}>
              <Ticket className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <p className="font-semibold text-slate-600">No vouchers yet</p>
              <p className="text-sm text-slate-400 mt-1">Buy your first voucher from the Buy tab!</p>
            </div>
          ) : (
            store.vouchers.map(v => {
              const brand = BRANDS.find(b => b.id === v.brand)
              return (
                <div key={v.id}
                  className={`rounded-2xl border border-white/40 p-5 shadow-sm bg-gradient-to-br ${brand?.bg ?? 'from-slate-50 to-white'}`}
                  style={{backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)'}}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-xl shadow-sm">
                        {brand?.emoji ?? '🎁'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{v.brandName} — ₹{v.amount}</p>
                        <p className="text-xs text-slate-500">{v.purchasedAt} · {v.pointsSpent} pts spent</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Active
                    </span>
                  </div>

                  {/* Card details */}
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-white/70 px-4 py-3">
                      <p className="text-[10px] font-semibold tracking-widest text-slate-400">CARD NUMBER</p>
                      <p className="mt-1 font-mono text-[18px] font-bold tracking-wider text-slate-900">{v.cardNumber}</p>
                    </div>
                    <div className="rounded-xl bg-white/70 px-4 py-3">
                      <p className="text-[10px] font-semibold tracking-widest text-slate-400">SECURITY PIN</p>
                      <p className="mt-1 font-mono text-[18px] font-bold tracking-wider text-slate-900">{v.pin}</p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── Confirm modal ──────────────────────────────────────────────────── */}
      {confirmItem && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setConfirmItem(null) }}
        >
          <div className="w-full max-w-sm rounded-3xl border border-white/50 p-6 shadow-2xl space-y-4"
            style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-slate-900">Confirm Redemption</h3>
              <button type="button" onClick={() => setConfirmItem(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            <div className={`flex items-center gap-3 rounded-2xl bg-gradient-to-br ${confirmItem.brand.bg} border border-white/50 px-4 py-3`}>
              <span className="text-2xl">{confirmItem.brand.emoji}</span>
              <div>
                <p className="font-bold text-slate-900">{confirmItem.brand.name}</p>
                <p className="text-sm text-slate-600">Gift Voucher — ₹{confirmItem.amount}</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Voucher value</span><span className="font-semibold text-slate-900">₹{confirmItem.amount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Points to deduct</span>
                <span className="font-semibold text-red-500">−{pointCost(confirmItem.amount)} pts</span>
              </div>
              <div className="border-t border-slate-200 pt-1.5 flex justify-between font-semibold">
                <span className="text-slate-700">Points after</span>
                <span className="text-brand-600">{availablePoints - pointCost(confirmItem.amount)} pts</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setConfirmItem(null)}
                className="flex-1 h-11 rounded-xl border border-white/40 bg-white/50 text-sm font-semibold text-slate-700 hover:bg-white/80 transition">
                Cancel
              </button>
              <button type="button" onClick={handleConfirmPurchase}
                className="flex-1 h-11 rounded-xl bg-brand-500 hover:bg-brand-400 text-sm font-semibold text-slate-900 transition">
                Confirm & Redeem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success / Voucher modal ────────────────────────────────────────── */}
      {successVoucher && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        >
          <div className="w-full max-w-sm rounded-3xl border border-white/50 p-6 shadow-2xl space-y-5"
            style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
          >
            {/* Success top */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-[20px] font-bold text-slate-900">Voucher Redeemed!</h3>
              <p className="text-sm text-slate-500">{successVoucher.brandName} — ₹{successVoucher.amount}</p>
            </div>

            {/* Voucher card */}
            <div className={`rounded-2xl bg-gradient-to-br ${BRANDS.find(b => b.id === successVoucher.brand)?.bg ?? ''} border border-white/50 overflow-hidden`}>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/30">
                <span className="text-2xl">{BRANDS.find(b => b.id === successVoucher.brand)?.emoji}</span>
                <p className="font-bold text-slate-900">{successVoucher.brandName} Gift Voucher</p>
                <span className="ml-auto text-lg font-bold text-slate-900">₹{successVoucher.amount}</span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-white/40">
                <div className="px-4 py-3">
                  <p className="text-[10px] font-semibold tracking-widest text-slate-400">CARD NUMBER</p>
                  <p className="mt-1 font-mono text-[15px] font-bold tracking-wider text-slate-900 break-all">{successVoucher.cardNumber}</p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[10px] font-semibold tracking-widest text-slate-400">SECURITY PIN</p>
                  <p className="mt-1 font-mono text-[24px] font-bold tracking-widest text-slate-900">{successVoucher.pin}</p>
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] text-slate-400 leading-relaxed">
              Screenshot or note your card number and PIN.<br/>
              This voucher is also saved in <strong>My Vouchers</strong>.
            </p>

            <div className="flex gap-3">
              <button type="button" onClick={() => { setSuccessVoucher(null); setTab('history') }}
                className="flex-1 h-11 rounded-xl border border-white/40 bg-white/50 text-sm font-semibold text-slate-700 hover:bg-white/80 transition">
                View History
              </button>
              <button type="button" onClick={() => setSuccessVoucher(null)}
                className="flex-1 h-11 rounded-xl bg-brand-500 hover:bg-brand-400 text-sm font-semibold text-slate-900 transition">
                Buy More
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
