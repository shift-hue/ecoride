'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { CarFront, Mail, Lock, Eye, ArrowRight } from 'lucide-react'

const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Required'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError(null)
    try {
      await login(data.email, data.password)
      router.push('/dashboard')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Login failed'
      setError(msg)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="h-14 border-b border-gray-200 bg-white">
        <div className="flex h-full items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-2 text-slate-900">
            <CarFront className="h-5 w-5 text-brand-500" />
            <span className="text-lg font-semibold">CampusPool</span>
          </div>
          <nav className="flex items-center gap-8 text-sm text-slate-700">
            <Link href="#" className="hover:text-slate-900">About</Link>
            <Link href="#" className="hover:text-slate-900">Contact</Link>
            <button type="button" className="rounded-lg bg-slate-100 px-5 py-2 font-semibold text-slate-900">
              Sign Up
            </button>
          </nav>
        </div>
      </header>

      <main className="grid min-h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-2">
        <section className="flex flex-col justify-center bg-gray-50 px-6 py-8 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">
            <h1 className="text-5xl font-bold tracking-tight text-slate-900">Welcome Back</h1>
            <p className="mt-2 text-3xl text-slate-500">
              Ride Together, <span className="font-semibold text-brand-500">Save the Planet.</span>
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
                <div className="flex h-14 items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="student@university.edu"
                    className="ml-3 w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-semibold text-slate-700">Password</label>
                  <button type="button" className="text-xs text-slate-500 hover:text-slate-700">
                    Forgot password?
                  </button>
                </div>
                <div className="flex h-14 items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="ml-3 w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label="Toggle password visibility"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-lg font-semibold text-white shadow-md transition hover:bg-brand-600 disabled:opacity-60"
              >
                {isSubmitting ? 'Logging in...' : 'Login to Dashboard'}
                <ArrowRight className="h-5 w-5" />
              </button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-gray-50 px-3 text-xs tracking-widest text-slate-400">OR CONTINUE WITH</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" className="h-12 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50">
                  Google
                </button>
                <button type="button" className="h-12 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50">
                  Apple
                </button>
              </div>

              <p className="text-center text-base text-slate-500">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-semibold text-brand-500 hover:underline">
                  Sign up for free
                </Link>
              </p>
            </form>

            <div className="mt-12 flex gap-8 text-sm text-slate-400">
              <Link href="#" className="hover:text-slate-500">Privacy Policy</Link>
              <Link href="#" className="hover:text-slate-500">Terms of Service</Link>
            </div>
          </div>
        </section>

        <section className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-950 to-black" />
          <div className="relative flex h-full items-end px-12 pb-16">
            <div>
              <span className="inline-flex items-center rounded-full border border-brand-400/40 bg-brand-500/20 px-4 py-1 text-xs font-semibold tracking-wide text-brand-300">
                ● LIVE CAMPUS NETWORK
              </span>
              <h2 className="mt-6 max-w-md text-6xl font-bold leading-tight text-white">
                The Future of Campus Commuting is Here.
              </h2>
              <p className="mt-6 max-w-lg text-2xl leading-relaxed text-slate-300">
                Join over 5,000 students and staff reducing their carbon footprint daily with our AI-optimized carpooling routes.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
