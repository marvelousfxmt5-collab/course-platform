'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<'checking' | 'success' | 'pending' | 'error'>(
    'checking'
  )
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference') || searchParams.get('trxref')

  useEffect(() => {
    let attempts = 0
    const supabase = createClient()

    async function checkStatus() {
      attempts += 1

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setStatus('error')
        return
      }

      const { data } = await supabase
        .from('purchases')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'success')
        .maybeSingle()

      if (data) {
        setStatus('success')
        return
      }

      if (attempts < 8) {
        setTimeout(checkStatus, 1500)
      } else {
        setStatus('pending')
      }
    }

    checkStatus()
  }, [reference])

  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <div className="max-w-sm">
        {status === 'checking' && (
          <div>
            <h1 className="text-xl font-semibold">Confirming your payment</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              This usually takes just a few seconds.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <h1 className="text-2xl font-bold text-[var(--accent)]">You're in</h1>
            <p className="mt-2 text-[var(--muted)]">
              Your payment was confirmed. Your course is ready.
            </p>
            <Link
              href="/dashboard"
              className="focus-ring mt-6 inline-block rounded-full bg-[var(--accent)] px-6 py-3 font-semibold text-white"
            >
              Go to course
            </Link>
          </div>
        )}

        {status === 'pending' && (
          <div>
            <h1 className="text-xl font-semibold">Still confirming</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Your payment may still be processing. Refresh this page in a minute,
              or check your dashboard, it will unlock automatically once confirmed.
            </p>
            <Link
              href="/dashboard"
              className="focus-ring mt-6 inline-block rounded-full border border-[var(--ink)] px-6 py-3 font-semibold"
            >
              Check dashboard
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <h1 className="text-xl font-semibold">Please log in</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              We could not verify who you are. Log in to check your payment status.
            </p>
            <Link
              href="/login"
              className="focus-ring mt-6 inline-block rounded-full bg-[var(--accent)] px-6 py-3 font-semibold text-white"
            >
              Log in
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}            <Link
              href="/login"
              className="focus-ring mt-6 inline-block rounded-full bg-[var(--accent)] px-6 py-3 font-semibold text-white"
            >
              Log in
            </Link>
          </>
        )}
      </div>
    </main>
  )
}              className="focus-ring mt-6 inline-block rounded-full bg-[var(--accent)] px-6 py-3 font-semibold text-white"
            >
              Log in
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
