import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

/**
 * Generates a temporary signed URL for a video stored in R2.
 * The URL expires after `expiresInSeconds` (default 1 hour) so it
 * can't be shared/reused indefinitely — only paying, logged-in
 * users should ever receive one (enforced in /api/video-url).
 */
export async function getSignedVideoUrl(
  objectKey: string,
  expiresInSeconds = 3600
) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: objectKey,
  })

  return getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds })
}
