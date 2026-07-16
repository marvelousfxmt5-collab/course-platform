'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Video = { id: string }
type Module = { id: string; title: string; order_index: number; videos: Video[] }
type Product = {
  id: string
  slug: string
  name: string
  description: string | null
  price_ngn: number
  price_usd: number
  modules: Module[]
}

export default function ProductSheet({
  product,
  index,
  isLoggedIn,
}: {
  product: Product
  index: number
  isLoggedIn: boolean
}) {
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isFeatured = product.slug === 'combo'
  const sortedModules = [...(product.modules || [])].sort(
    (a, b) => a.order_index - b.order_index
  )
  const totalLessons = sortedModules.reduce((sum, m) => sum + (m.videos?.length || 0), 0)

  async function handleEnroll() {
    if (!isLoggedIn) {
      router.push(`/signup?product=${product.slug}`)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency, productSlug: product.slug }),
      })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      window.location.href = data.authorization_url
    } catch {
      alert('Could not reach the payment server. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div
      className={`flex flex-col bg-[var(--charcoal)] p-8 md:p-10 ${
        isFeatured ? 'bg-gradient-to-b from-[rgba(107,31,31,0.15)] to-transparent' : ''
      }`}
    >
      <div
        className={`mb-5 text-xs font-semibold tracking-widest ${
          isFeatured ? 'text-[var(--ochre)]' : 'text-[var(--oxblood-bright)]'
        }`}
      >
        Nº {String(index).padStart(2, '0')} — {product.name.split(' ')[0]}
        {isFeatured && ' · Save'}
      </div>

      <h3 className="font-display text-2xl font-semibold uppercase tracking-wide md:text-3xl">
        {product.name}
      </h3>
      <p className="mb-6 mt-1.5 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
        {product.description}
      </p>

      <div
        className="mb-5 h-px"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, var(--line) 0, var(--line) 6px, transparent 6px, transparent 12px)',
        }}
      />

      <ul className="mb-7 flex-1 space-y-0">
        {sortedModules.slice(0, 4).map((m) => (
          <li
            key={m.id}
            className="flex justify-between border-b border-white/[0.06] py-2.5 text-sm last:border-none"
          >
            <span>{m.title}</span>
            <span className="tabular-nums text-xs text-[var(--muted)]">
              {m.videos?.length || 0} lessons
            </span>
          </li>
        ))}
        {sortedModules.length > 4 && (
          <li className="flex justify-between border-b border-white/[0.06] py-2.5 text-sm last:border-none">
            <span>+ {sortedModules.length - 4} more masterclasses</span>
            <span className="tabular-nums text-xs text-[var(--muted)]">
              {totalLessons} total
            </span>
          </li>
        )}
      </ul>

      <div className="flex items-end justify-between border-t border-[var(--line)] pt-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1">
            <button
              onClick={() => setCurrency('NGN')}
              className={`focus-ring px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                currency === 'NGN' ? 'text-[var(--ochre)]' : 'text-[var(--muted)]'
              }`}
            >
              NGN
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`focus-ring px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                currency === 'USD' ? 'text-[var(--ochre)]' : 'text-[var(--muted)]'
              }`}
            >
              USD
            </button>
          </div>
          <div className="inline-block -rotate-2 border-2 border-[var(--ochre)] px-3.5 py-1.5 font-display text-xl font-bold text-[var(--ochre)]">
            {currency === 'NGN'
              ? `₦${(product.price_ngn / 1000).toFixed(0)}K`
              : `$${product.price_usd}`}
          </div>
        </div>
        <button
          onClick={handleEnroll}
          disabled={loading}
          className="focus-ring bg-[var(--oxblood)] px-6 py-3.5 font-display text-sm font-semibold uppercase tracking-widest text-[var(--paper)] hover:bg-[var(--oxblood-bright)] transition-colors disabled:opacity-60"
        >
          {loading ? 'Loading…' : 'Enroll'}
        </button>
      </div>
    </div>
  )
    }
