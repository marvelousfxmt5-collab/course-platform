import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { getSignedVideoUrl } from '@/lib/r2'

// Same gating pattern as /api/video-url, but for bonus PDFs.
// Reuses getSignedVideoUrl since it just signs any R2 object key,
// not specifically video files.

export async function POST(request: Request) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { pdfId } = await request.json().catch(() => ({}))
  if (!pdfId) {
    return NextResponse.json({ error: 'pdfId is required' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: pdf, error: pdfError } = await admin
    .from('bonus_pdfs')
    .select('r2_object_key, product_id')
    .eq('id', pdfId)
    .single()

  if (pdfError || !pdf) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const { data: hasAccess } = await admin.rpc('has_product_access', {
    check_user_id: user.id,
    check_product_id: pdf.product_id,
  })

  if (!hasAccess) {
    return NextResponse.json({ error: 'Payment required' }, { status: 403 })
  }

  const signedUrl = await getSignedVideoUrl(pdf.r2_object_key, 300)

  return NextResponse.json({ url: signedUrl })
}
