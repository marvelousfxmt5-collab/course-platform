import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase-server'

export default async function AdminProductsPage() {
  const admin = createAdminClient()

  const { data: products } = await admin
    .from('products')
    .select('id, slug, name, price_ngn, price_usd, is_active, order_index')
    .order('order_index', { ascending: true })

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold uppercase tracking-wide">
        Products
      </h1>

      <div className="border border-[var(--line)]">
        {products?.map((product, i) => (
          <Link
            key={product.id}
            href={`/admin/products/${product.slug}`}
            className={`focus-ring flex items-center justify-between px-6 py-5 hover:bg-white/5 transition-colors ${
              i !== 0 ? 'border-t border-[var(--line)]' : ''
            }`}
          >
            <div>
              <div className="font-display text-base font-semibold uppercase tracking-wide">
                {product.name}
              </div>
              <div className="mt-1 text-xs text-[var(--muted)]">
                {product.is_active ? (
                  <span className="text-[var(--ochre)]">Active</span>
                ) : (
                  <span>Inactive</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-lg font-semibold text-[var(--ochre)]">
                ₦{product.price_ngn.toLocaleString()}
              </div>
              <div className="text-xs text-[var(--muted)]">
                ${product.price_usd}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
