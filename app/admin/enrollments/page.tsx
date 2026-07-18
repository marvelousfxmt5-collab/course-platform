import { createAdminClient } from '@/lib/supabase-server'

export default async function AdminEnrollmentsPage() {
  const admin = createAdminClient()

  const { data: purchases } = await admin
    .from('purchases')
    .select('id, status, amount, currency, created_at, user_id, products ( name )')
    .eq('status', 'success')
    .order('created_at', { ascending: false })

  // Look up emails for each user_id via Supabase auth admin API
  const userIds = [...new Set((purchases || []).map((p) => p.user_id))]
  const emailMap: Record<string, string> = {}

  for (const userId of userIds) {
    const { data } = await admin.auth.admin.getUserById(userId)
    if (data?.user?.email) {
      emailMap[userId] = data.user.email
    }
  }

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold uppercase tracking-wide">
        Enrollments
      </h1>

      <p className="mb-6 text-sm text-[var(--muted)]">
        {purchases?.length || 0} successful purchase{purchases?.length === 1 ? '' : 's'}
      </p>

      <div className="border border-[var(--line)]">
        {(!purchases || purchases.length === 0) && (
          <div className="px-6 py-8 text-center text-sm text-[var(--muted)]">
            No enrollments yet.
          </div>
        )}

        {purchases?.map((purchase, i) => (
          <div
            key={purchase.id}
            className={`flex flex-wrap items-center justify-between gap-2 px-6 py-4 ${
              i !== 0 ? 'border-t border-[var(--line)]' : ''
            }`}
          >
            <div>
              <div className="text-sm font-medium">
                {emailMap[purchase.user_id] || 'Unknown user'}
              </div>
              <div className="mt-0.5 text-xs text-[var(--muted)]">
                {(purchase.products as any)?.name || 'Unknown product'}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-sm font-semibold text-[var(--ochre)]">
                {purchase.currency === 'NGN'
                  ? `₦${(purchase.amount / 100).toLocaleString()}`
                  : `$${(purchase.amount / 100).toLocaleString()}`}
              </div>
              <div className="mt-0.5 text-xs text-[var(--muted)]">
                {new Date(purchase.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
        }
