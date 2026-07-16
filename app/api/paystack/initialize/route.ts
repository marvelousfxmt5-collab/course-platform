import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'

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
  const productSlug: string | undefined = body.productSlug

  if (!productSlug) {
    return NextResponse.json({ error: 'productSlug is required' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: product, error: productError } = await admin
    .from('products')
    .select('id, price_ngn, price_usd, is_active')
    .eq('slug', productSlug)
    .single()

  if (productError || !product || !product.is_active) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const amount =
    currency === 'NGN' ? product.price_ngn * 100 : product.price_usd * 100

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid price configuration' }, { status: 500 })
  }

  const { data: existing } = await admin
    .from('purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', product.id)
    .eq('status', 'success')
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'You already own this course' }, { status: 400 })
  }

  const reference = `${productSlug}_${user.id.slice(0, 8)}_${Date.now()}`

  const { error: insertError } = await admin.from('purchases').insert({
    user_id: user.id,
    product_id: product.id,
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
      metadata: { user_id: user.id, product_slug: productSlug },
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
