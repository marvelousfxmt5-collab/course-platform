export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import PaymentSuccessContent from './PaymentSuccessContent'

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
