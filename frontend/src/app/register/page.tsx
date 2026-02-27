'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { CarFront, User, Mail, Lock, Building2, CalendarRange, Eye, ArrowRight } from 'lucide-react'

const schema = z.object({
  name:         z.string().min(2, 'Name too short'),
  email:        z.string().email('Invalid email'),
  password:     z.string().min(8, 'Minimum 8 characters'),
  department:   z.string().optional(),
  year:         z.coerce.number().min(1).max(6).optional(),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError(null)
    try {
      await registerUser(data)
      router.push('/dashboard')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Registration failed'
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
              Sign In
            </button>
          </nav>
        </div>
      </header>

      <main className="grid min-h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-2">
        <section className="flex flex-col justify-center bg-gray-50 px-6 py-8 sm:px-10 lg:px-16">
          <div className="w-full max-w-xl">
            <h1 className="text-5xl font-bold tracking-tight text-slate-900">Create Account</h1>
            <p className="mt-2 text-2xl text-slate-500">
              Join the community, <span className="font-semibold text-brand-500">Commute Smarter.</span>
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                  <div className="flex h-14 items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm">
                    <User className="h-4 w-4 text-slate-400" />
                    <input
                      {...register('name')}
                      placeholder="Your full name"
                      className="ml-3 w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">College Email</label>
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
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                <div className="flex h-14 items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Department</label>
                  <div className="flex h-14 items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <input
                      {...register('department')}
                      placeholder="e.g. CSE"
                      className="ml-3 w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Year</label>
                  <div className="flex h-14 items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm">
                    <CalendarRange className="h-4 w-4 text-slate-400" />
                    <input
                      {...register('year')}
                      type="number"
                      min={1}
                      max={6}
                      placeholder="1-6"
                      className="ml-3 w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-lg font-semibold text-white shadow-md transition hover:bg-brand-600 disabled:opacity-60"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
                <ArrowRight className="h-5 w-5" />
              </button>

              <p className="text-center text-base text-slate-500">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-brand-500 hover:underline">
                  Sign in
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
                ● VERIFIED CAMPUS ACCESS
              </span>
              <h2 className="mt-6 max-w-md text-6xl font-bold leading-tight text-white">
                Build Safer Rides From Day One.
              </h2>
              <p className="mt-6 max-w-lg text-2xl leading-relaxed text-slate-300">
                Create your student profile and connect with trusted campus commuters through intelligent matching.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
