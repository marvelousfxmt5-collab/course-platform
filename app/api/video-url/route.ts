import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { getSignedVideoUrl } from '@/lib/r2'

// This endpoint is the actual paywall. It looks up which product a video
// belongs to (via its module), then checks whether the logged-in user has
// access to that specific product (accounting for Combo-style grants).

export async function POST(request: Request) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { videoId } = await request.json().catch(() => ({}))
  if (!videoId) {
    return NextResponse.json({ error: 'videoId is required' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: video, error: videoError } = await admin
    .from('videos')
    .select('r2_object_key, module_id, modules ( product_id )')
    .eq('id', videoId)
    .single()

  if (videoError || !video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  const productId = (video as any).modules?.product_id
  if (!productId) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  const { data: hasAccess } = await admin.rpc('has_product_access', {
    check_user_id: user.id,
    check_product_id: productId,
  })

  if (!hasAccess) {
    return NextResponse.json({ error: 'Payment required' }, { status: 403 })
  }

  const signedUrl = await getSignedVideoUrl(video.r2_object_key)

  return NextResponse.json({ url: signedUrl })
}
