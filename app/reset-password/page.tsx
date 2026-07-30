'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--charcoal)] px-6 text-[var(--paper)]">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 font-display text-2xl font-bold uppercase tracking-wide">
          Set New Password
        </h1>

        {success ? (
          <div className="border border-[var(--line)] p-6 text-sm">
            <p className="text-[var(--ochre)]">Password updated</p>
            <p className="mt-2 text-[var(--muted)]">
              Redirecting you to log in…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium">
                New Password
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
            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="focus-ring w-full border border-[var(--line)] bg-transparent px-4 py-2.5 text-[var(--paper)]"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="focus-ring w-full bg-[var(--oxblood)] py-3 font-display font-semibold uppercase tracking-widest text-[var(--paper)] hover:bg-[var(--oxblood-bright)] transition-colors disabled:opacity-60"
            >
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
