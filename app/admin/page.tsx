import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase-server'

export default async function AdminHomePage() {
  const admin = createAdminClient()

  const { count: productCount } = await admin
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { count: purchaseCount } = await admin
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'success')

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold uppercase tracking-wide">
        Dashboard
      </h1>

      <div className="mb-10 grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] md:grid-cols-4">
        <div className="bg-[var(--charcoal)] p-6">
          <div className="font-display text-3xl font-bold text-[var(--ochre)]">
            {productCount ?? '—'}
          </div>
          <div className="mt-1 text-xs uppercase tracking-widest text-[var(--muted)]">
            Products
          </div>
        </div>
        <div className="bg-[var(--charcoal)] p-6">
          <div className="font-display text-3xl font-bold text-[var(--ochre)]">
            {purchaseCount ?? '—'}
          </div>
          <div className="mt-1 text-xs uppercase tracking-widest text-[var(--muted)]">
            Successful purchases
          </div>
        </div>
      </div>

      <div className="grid gap-px border border-[var(--line)] bg-[var(--line)] md:grid-cols-2">
        <Link
          href="/admin/products"
          className="focus-ring block bg-[var(--charcoal)] p-8 hover:bg-white/5 transition-colors"
        >
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
            Manage Products
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Edit pricing, masterclasses, videos, and bonus PDFs.
          </p>
        </Link>
        <Link
          href="/admin/enrollments"
          className="focus-ring block bg-[var(--charcoal)] p-8 hover:bg-white/5 transition-colors"
        >
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
            View Enrollments
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            See who's purchased what.
          </p>
        </Link>
      </div>
    </div>
  )
}
