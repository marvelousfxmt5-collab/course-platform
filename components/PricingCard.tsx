'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PricingCard({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const priceNGN = process.env.NEXT_PUBLIC_COURSE_PRICE_NGN || '25000'
  const priceUSD = process.env.NEXT_PUBLIC_COURSE_PRICE_USD || '20'

  async function handlePurchase() {
    setError(null)

    if (!isLoggedIn) {
      router.push('/signup')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      window.location.href = data.authorization_url
    } catch {
      setError('Could not reach the payment server. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
      <div className="mb-6 flex justify-center gap-2">
        <button
          onClick={() => setCurrency('NGN')}
          className={`focus-ring rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            currency === 'NGN'
              ? 'bg-[var(--ink)] text-white'
              : 'bg-black/5 text-[var(--muted)]'
          }`}
        >
          NGN
        </button>
        <button
          onClick={() => setCurrency('USD')}
          className={`focus-ring rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            currency === 'USD'
              ? 'bg-[var(--ink)] text-white'
              : 'bg-black/5 text-[var(--muted)]'
          }`}
        >
          USD
        </button>
      </div>

      <p className="text-center text-4xl font-bold tracking-tight">
        {currency === 'NGN' ? `₦${Number(priceNGN).toLocaleString()}` : `$${priceUSD}`}
      </p>
      <p className="mt-1 text-center text-sm text-[var(--muted)]">
        one-time payment
      </p>

      <button
        onClick={handlePurchase}
        disabled={loading}
        className="focus-ring mt-8 w-full rounded-full bg-[var(--accent)] py-3.5 text-base font-semibold text-white hover:bg-[var(--accent-dark)] transition-colors disabled:opacity-60"
      >
        {loading ? 'Redirecting…' : isLoggedIn ? 'Pay now' : 'Create account to continue'}
      </button>

      {error && (
        <p className="mt-4 text-center text-sm text-red-600">{error}</p>
      )}

      <p className="mt-4 text-center text-xs text-[var(--muted)]">
        Paid securely via Paystack.
      </p>
    </div>
  )
}
