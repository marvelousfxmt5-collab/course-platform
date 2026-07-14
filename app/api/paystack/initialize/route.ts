import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-server'

// Paystack works in the smallest currency unit (kobo for NGN, cents for USD)
const PRICES = {
  NGN: Number(process.env.NEXT_PUBLIC_COURSE_PRICE_NGN) * 100,
  USD: Number(process.env.NEXT_PUBLIC_COURSE_PRICE_USD) * 100,
}

export async function POST(request: Request) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const currency: 'NGN' | 'USD' = body.currency === 'USD' ? 'USD' : 'NGN'
  const amount = PRICES[currency]

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid price configuration' }, { status: 500 })
  }

  // Prevent double purchase
  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'success')
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'You already own this course' }, { status: 400 })
  }

  const reference = `course_${user.id.slice(0, 8)}_${Date.now()}`

  // Record a pending purchase before redirecting to Paystack
  const { error: insertError } = await admin.from('purchases').insert({
    user_id: user.id,
    status: 'pending',
    amount,
    currency,
    paystack_reference: reference,
  })

  if (insertError) {
    return NextResponse.json({ error: 'Could not create purchase record' }, { status: 500 })
  }

  const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: user.email,
      amount,
      currency,
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`,
      metadata: { user_id: user.id },
    }),
  })

  const paystackData = await paystackRes.json()

  if (!paystackRes.ok || !paystackData.status) {
    return NextResponse.json(
      { error: paystackData.message || 'Paystack initialization failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    authorization_url: paystackData.data.authorization_url,
  })
    }
