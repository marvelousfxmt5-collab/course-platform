import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import PricingCard from '@/components/PricingCard'

const MODULE_TITLES = [
  'Introduction',
  'Getting Started',
  'Core Concepts',
  'Deep Dive',
  'Practical Example',
  'Advanced Topics',
  'Case Study',
  'Common Mistakes',
  'Putting It Together',
  'Conclusion & Next Steps',
]

export default async function LandingPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const courseName = process.env.NEXT_PUBLIC_COURSE_NAME || 'Course Name Here'
  const description =
    process.env.NEXT_PUBLIC_COURSE_DESCRIPTION ||
    'A short, compelling description of what students get.'

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 md:px-12">
        <span className="text-sm font-semibold tracking-wide uppercase text-[var(--muted)]">
          {courseName}
        </span>
        {user ? (
          <Link
            href="/dashboard"
            className="focus-ring rounded-full border border-[var(--ink)] px-4 py-1.5 text-sm font-medium hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
          >
            Go to dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="focus-ring rounded-full border border-[var(--ink)] px-4 py-1.5 text-sm font-medium hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
          >
            Log in
          </Link>
        )}
      </nav>

      {/* Hero */}
      <section className="px-6 pt-10 pb-16 md:px-12 md:pt-16 md:pb-24">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[var(--accent)]">
            10 lessons · ~35 min each · Watch anytime
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight">
            {courseName}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-[var(--muted)] leading-relaxed">
            {description}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="#pricing"
              className="focus-ring rounded-full bg-[var(--accent)] px-7 py-3.5 text-base font-semibold text-white hover:bg-[var(--accent-dark)] transition-colors"
            >
              Get instant access
            </Link>
            <span className="text-sm text-[var(--muted)]">
              One payment. Yours for good.
            </span>
          </div>
        </div>
      </section>

      {/* Course spine — signature element: the 10 modules laid out
          along a single horizontal progress line */}
      <section className="border-y border-black/10 bg-black/[0.02] px-6 py-14 md:px-12">
        <h2 className="mb-10 text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">
          What's inside
        </h2>
        <div className="relative">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-4 hidden h-px bg-[var(--ink)]/15 md:block"
          />
          <ol className="grid gap-x-6 gap-y-8 md:grid-cols-5">
            {MODULE_TITLES.map((title, i) => (
              <li key={title} className="relative">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ink)] text-xs font-semibold text-[var(--paper)]">
                  {i + 1}
                </div>
                <p className="text-sm font-medium leading-snug">{title}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">~35 min</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-md">
          <h2 className="mb-2 text-center text-2xl font-bold">
            One price. Full access.
          </h2>
          <p className="mb-10 text-center text-[var(--muted)]">
            No subscriptions, no recurring charges.
          </p>
          <PricingCard isLoggedIn={!!user} />
        </div>
      </section>

      <footer className="border-t border-black/10 px-6 py-8 text-center text-xs text-[var(--muted)] md:px-12">
        © {new Date().getFullYear()} {courseName}
      </footer>
    </main>
  )
                }
