import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import SignOutButton from '@/components/SignOutButton'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const admin = createAdminClient()
  const { data: isAdmin } = await admin.rpc('is_admin', {
    check_user_id: user.id,
  })

  if (!isAdmin) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[var(--charcoal)] text-[var(--paper)]">
      <nav className="flex items-center justify-between border-b border-[var(--line)] px-6 py-5 md:px-12">
        <div className="flex items-center gap-8">
          <Link href="/admin" className="font-display text-base font-bold uppercase tracking-widest">
            Admin
          </Link>
          <div className="hidden gap-6 text-xs font-semibold uppercase tracking-widest text-[var(--muted)] md:flex">
            <Link href="/admin/products" className="hover:text-[var(--paper)] transition-colors">
              Products
            </Link>
            <Link href="/admin/enrollments" className="hover:text-[var(--paper)] transition-colors">
              Enrollments
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="focus-ring border border-[var(--paper)] px-4 py-1.5 text-xs font-medium uppercase tracking-widest hover:bg-[var(--paper)] hover:text-[var(--charcoal)] transition-colors"
          >
            View Site
          </Link>
          <SignOutButton />
        </div>
      </nav>

      <div className="flex gap-6 border-b border-[var(--line)] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--muted)] md:hidden">
        <Link href="/admin/products" className="hover:text-[var(--paper)] transition-colors">
          Products
        </Link>
        <Link href="/admin/enrollments" className="hover:text-[var(--paper)] transition-colors">
          Enrollments
        </Link>
      </div>

      <main className="px-6 py-10 md:px-12">{children}</main>
    </div>
  )
}
