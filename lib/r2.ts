import { createAdminClient } from '@/lib/supabase-server'

const BUCKET_NAME = 'course-content'

/**
 * Generates a temporary signed URL for a file stored in Supabase Storage.
 * The URL expires after `expiresInSeconds` (default 1 hour) so it
 * can't be shared/reused indefinitely — only paying, logged-in
 * users should ever receive one (enforced in /api/video-url and /api/pdf-url).
 */
export async function getSignedVideoUrl(
  objectKey: string,
  expiresInSeconds = 3600
) {
  const supabase = createAdminClient()

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(objectKey, expiresInSeconds)

  if (error || !data) {
    throw new Error(error?.message || 'Could not generate signed URL')
  }

  return data.signedUrl
}
