'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSent(true)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--charcoal)] px-6 text-[var(--paper)]">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 font-display text-2xl font-bold uppercase tracking-wide">
          Reset Password
        </h1>
        <p className="mb-8 text-sm text-[var(--muted)]">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {sent ? (
          <div className="border border-[var(--line)] p-6 text-sm">
            <p className="text-[var(--ochre)]">Check your email</p>
            <p className="mt-2 text-[var(--muted)]">
              We've sent a password reset link to <strong className="text-[var(--paper)]">{email}</strong>.
              Click the link in that email to set a new password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="focus-ring w-full bg-[var(--oxblood)] py-3 font-display font-semibold uppercase tracking-widest text-[var(--paper)] hover:bg-[var(--oxblood-bright)] transition-colors disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          <Link href="/login" className="font-medium text-[var(--paper)] underline">
            Back to log in
          </Link>
        </p>
      </div>
    </main>
  )
              }
