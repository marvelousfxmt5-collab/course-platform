import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'

async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data: isAdmin } = await admin.rpc('is_admin', { check_user_id: user.id })
  return isAdmin ? admin : null
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))

  const { error } = await admin.from('modules').insert({
    product_id: body.product_id,
    title: body.title,
    order_index: body.order_index || 0,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
