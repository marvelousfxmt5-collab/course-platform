import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import VideoPlayer from '@/components/VideoPlayer'
import SignOutButton from '@/components/SignOutButton'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const admin = createAdminClient()

  const { data: hasPurchased } = await admin.rpc('has_active_purchase', {
    check_user_id: user.id,
  })

  if (!hasPurchased) {
    redirect('/#pricing')
  }

  const { data: videos } = await admin
    .from('videos')
    .select('id, title, description, order_index, duration_minutes')
    .order('order_index', { ascending: true })

  return (
    <main className="min-h-screen px-6 py-10 md:px-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your course</h1>
          <SignOutButton />
        </div>

        <VideoPlayer videos={videos || []} />
      </div>
    </main>
  )
}
