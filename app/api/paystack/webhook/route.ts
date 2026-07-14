import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase-server'

// IMPORTANT: This webhook is the SOURCE OF TRUTH for whether someone paid.
// Never grant access based on the browser redirect alone — Paystack calls
// this endpoint directly, server-to-server, which can't be faked by a user.

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-paystack-signature')

  // Verify the request genuinely came from Paystack
  const expectedSignature = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(rawBody)
    .digest('hex')

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)
  const admin = createAdminClient()

  if (event.event === 'charge.success') {
    const { reference, status } = event.data

    const { error } = await admin
      .from('purchases')
      .update({
        status: status === 'success' ? 'success' : 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('paystack_reference', reference)

    if (error) {
      console.error('Failed to update purchase:', error)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }
  }

  // Always return 200 quickly so Paystack doesn't retry unnecessarily
  return NextResponse.json({ received: true })
}
