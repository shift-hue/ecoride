'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { CarFront, Mail, Lock, Eye, ArrowRight } from 'lucide-react'
import UnicornScene from 'unicornstudio-react/next'

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
    <div className="relative min-h-screen overflow-hidden">
      {/* UnicornStudio full-viewport background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <UnicornScene
          projectId="mK4EeInvftEOrIW9uCuB"
          sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.5/dist/unicornStudio.umd.js"
          width="100%"
          height="100%"
        />
      </div>

      {/* Navbar */}
      <header className="relative z-10 h-14 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-2 text-white">
            <CarFront className="h-5 w-5 text-brand-400" />
            <span className="text-lg font-semibold">CampusPool</span>
          </div>
          <nav className="flex items-center gap-8 text-sm text-white/80">
            <Link href="#" className="hover:text-white">About</Link>
            <Link href="#" className="hover:text-white">Contact</Link>
            <Link href="/register" className="rounded-lg border border-white/30 bg-white/10 px-5 py-2 font-semibold text-white backdrop-blur-sm hover:bg-white/20">
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Centered glass form */}
      <main className="relative z-10 flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-lg rounded-3xl border border-white/20 p-10 shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.10)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-white">Welcome Back</h1>
          <p className="mt-2 text-lg text-white/70">
            Ride Together, <span className="font-semibold text-brand-400">Save the Planet.</span>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/80">Email Address</label>
              <div className="flex h-14 items-center rounded-xl border border-white/20 bg-white/10 px-4 backdrop-blur-sm">
                <Mail className="h-4 w-4 text-white/50" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="student@university.edu"
                  className="ml-3 w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email.message}</p>}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-semibold text-white/80">Password</label>
                <button type="button" className="text-xs text-white/50 hover:text-white/80">
                  Forgot password?
                </button>
              </div>
              <div className="flex h-14 items-center rounded-xl border border-white/20 bg-white/10 px-4 backdrop-blur-sm">
                <Lock className="h-4 w-4 text-white/50" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="ml-3 w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="text-white/50 hover:text-white/80"
                  aria-label="Toggle password visibility"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-300">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="rounded-lg border border-red-400/30 bg-red-500/20 px-3 py-2 text-sm text-red-200">{error}</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-base font-semibold text-white shadow-lg transition hover:bg-brand-600 disabled:opacity-60"
            >
              {isSubmitting ? 'Logging in...' : 'Login to Dashboard'}
              <ArrowRight className="h-5 w-5" />
            </button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-transparent px-3 text-xs tracking-widest text-white/40">OR CONTINUE WITH</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="h-12 rounded-xl border border-white/20 bg-white/10 font-semibold text-white backdrop-blur-sm hover:bg-white/20">
                Google
              </button>
              <button type="button" className="h-12 rounded-xl border border-white/20 bg-white/10 font-semibold text-white backdrop-blur-sm hover:bg-white/20">
                Apple
              </button>
            </div>

            <p className="text-center text-sm text-white/60">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-semibold text-brand-400 hover:underline">
                Sign up for free
              </Link>
            </p>
          </form>

          <div className="mt-8 flex gap-6 text-xs text-white/30">
            <Link href="#" className="hover:text-white/50">Privacy Policy</Link>
            <Link href="#" className="hover:text-white/50">Terms of Service</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
