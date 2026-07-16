import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import ProductSheet from '@/components/ProductSheet'

export default async function LandingPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: products } = await supabase
    .from('products')
    .select(`
      id, slug, name, description, price_ngn, price_usd, order_index,
      modules ( id, title, order_index, videos ( id ) )
    `)
    .order('order_index', { ascending: true })

  return (
    <main className="min-h-screen bg-[var(--charcoal)] text-[var(--paper)]">
      <nav className="flex items-center justify-between border-b border-[var(--line)] px-6 py-7 md:px-12">
        <div className="font-display text-lg font-bold uppercase tracking-widest">
          Bizzyaski <span className="text-[var(--oxblood-bright)]">Academy</span>
        </div>
        {user ? (
          <Link
            href="/dashboard"
            className="focus-ring border border-[var(--paper)] px-5 py-2 text-xs font-medium uppercase tracking-widest hover:bg-[var(--paper)] hover:text-[var(--charcoal)] transition-colors"
          >
            My Courses
          </Link>
        ) : (
          <Link
            href="/login"
            className="focus-ring border border-[var(--paper)] px-5 py-2 text-xs font-medium uppercase tracking-widest hover:bg-[var(--paper)] hover:text-[var(--charcoal)] transition-colors"
          >
            Log In
          </Link>
        )}
      </nav>

      <section className="max-w-3xl px-6 pb-16 pt-20 md:px-12 md:pb-20 md:pt-24">
        <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ochre)]">
          Professional Certification Training
        </span>
        <h1 className="font-display text-5xl font-bold uppercase leading-[0.98] tracking-wide md:text-7xl">
          Learn the craft.
          <br />
          Build the trade.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
          Masterclass video training in tattooing, piercing, and laser removal —
          built by working artists, for the next generation of the trade.
        </p>
      </section>

      <section className="px-6 pb-24 md:px-12">
        <div className="mb-8 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          The Catalog
          <span className="h-px flex-1 bg-[var(--line)]" />
        </div>

        <div className="grid grid-cols-1 gap-px border border-[var(--line)] bg-[var(--line)] md:grid-cols-2">
          {products?.map((product, i) => (
            <ProductSheet
              key={product.id}
              product={product}
              index={i + 1}
              isLoggedIn={!!user}
            />
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--line)] px-6 py-8 text-center text-xs text-[var(--muted)] md:px-12">
        © {new Date().getFullYear()} Bizzyaski Academy
      </footer>
    </main>
  )
}
