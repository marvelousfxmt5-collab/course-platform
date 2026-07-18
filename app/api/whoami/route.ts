import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ isAdmin: false }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: isAdmin } = await admin.rpc('is_admin', {
    check_user_id: user.id,
  })

  return NextResponse.json({ isAdmin: !!isAdmin })
}
