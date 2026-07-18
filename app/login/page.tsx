'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setLoading(false)
      setError(error.message)
      return
    }

    const res = await fetch('/api/whoami')
    const { isAdmin } = await res.json()

    setLoading(false)
    router.push(isAdmin ? '/admin' : '/dashboard')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--charcoal)] px-6 text-[var(--paper)]">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 font-display text-2xl font-bold uppercase tracking-wide">
          Log In
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-ring w-full border border-[var(--line)] bg-transparent px-4 py-2.5 text-[var(--paper)]"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring w-full border border-[var(--line)] bg-transparent px-4 py-2.5 text-[var(--paper)]"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="focus-ring w-full bg-[var(--oxblood)] py-3 font-display font-semibold uppercase tracking-widest text-[var(--paper)] hover:bg-[var(--oxblood-bright)] transition-colors disabled:opacity-60"
          >
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-[var(--paper)] underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
