import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase-server'
import ProductEditor from '@/components/admin/ProductEditor'

export default async function AdminProductDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const admin = createAdminClient()

  const { data: product } = await admin
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!product) {
    notFound()
  }

  const { data: modules } = await admin
    .from('modules')
    .select('id, title, order_index, videos ( id, title, order_index, r2_object_key, duration_minutes )')
    .eq('product_id', product.id)
    .order('order_index', { ascending: true })

  const { data: bonusPdfs } = await admin
    .from('bonus_pdfs')
    .select('id, title, order_index, r2_object_key')
    .eq('product_id', product.id)
    .order('order_index', { ascending: true })

  const modulesSorted = (modules || []).map((m) => ({
    ...m,
    videos: (m.videos || []).sort((a, b) => a.order_index - b.order_index),
  }))

  return (
    <ProductEditor
      product={product}
      modules={modulesSorted}
      bonusPdfs={bonusPdfs || []}
    />
  )
}
