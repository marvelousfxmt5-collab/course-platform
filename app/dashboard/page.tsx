import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import SignOutButton from '@/components/SignOutButton'
import ProductLibrary from '@/components/ProductLibrary'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const admin = createAdminClient()

  // Get every active product, then filter down to ones this user can access
  // (has_product_access already accounts for Combo-style grants)
  const { data: allProducts } = await admin
    .from('products')
    .select('id, slug, name, order_index')
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  const accessibleProducts = []
  for (const product of allProducts || []) {
    const { data: hasAccess } = await admin.rpc('has_product_access', {
      check_user_id: user.id,
      check_product_id: product.id,
    })
    if (hasAccess) accessibleProducts.push(product)
  }

  if (accessibleProducts.length === 0) {
    redirect('/#catalog')
  }

  // Fetch full module/video/pdf structure for each accessible product
  const productIds = accessibleProducts.map((p) => p.id)

  const { data: modules } = await admin
    .from('modules')
    .select('id, product_id, title, order_index, videos ( id, title, order_index, duration_minutes )')
    .in('product_id', productIds)
    .order('order_index', { ascending: true })

  const { data: bonusPdfs } = await admin
    .from('bonus_pdfs')
    .select('id, product_id, title, order_index')
    .in('product_id', productIds)
    .order('order_index', { ascending: true })

  const library = accessibleProducts.map((product) => ({
    ...product,
    modules: (modules || [])
      .filter((m) => m.product_id === product.id)
      .map((m) => ({
        ...m,
        videos: (m.videos || []).sort((a, b) => a.order_index - b.order_index),
      })),
    bonusPdfs: (bonusPdfs || []).filter((p) => p.product_id === product.id),
  }))

  return (
    <main className="min-h-screen bg-[var(--charcoal)] text-[var(--paper)] px-6 py-10 md:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
            Your Training
          </h1>
          <SignOutButton />
        </div>

        <ProductLibrary library={library} />
      </div>
    </main>
  )
}
