import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { getSignedVideoUrl } from '@/lib/r2'

// This endpoint is the actual paywall. Even if someone finds a video's
// R2 object key, they can't get a working URL without being logged in
// AND having a successful purchase on record.

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

  const { data: hasPurchased } = await admin.rpc('has_active_purchase', {
    check_user_id: user.id,
  })

  if (!hasPurchased) {
    return NextResponse.json({ error: 'Payment required' }, { status: 403 })
  }

  const { data: video, error } = await admin
    .from('videos')
    .select('r2_object_key')
    .eq('id', videoId)
    .single()

  if (error || !video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  const signedUrl = await getSignedVideoUrl(video.r2_object_key)

  return NextResponse.json({ url: signedUrl })
}
