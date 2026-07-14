'use client'

import { useState } from 'react'

type Video = {
  id: string
  title: string
  description: string | null
  order_index: number
  duration_minutes: number | null
}

export default function VideoPlayer({ videos }: { videos: Video[] }) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function playVideo(video: Video) {
    setActiveVideo(video)
    setVideoUrl(null)
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/video-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Could not load this video.')
        setLoading(false)
        return
      }

      setVideoUrl(data.url)
      setLoading(false)
    } catch {
      setError('Could not reach the server. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-[280px_1fr]">
      <ol className="space-y-1">
        {videos.map((video) => (
          <li key={video.id}>
            <button
              onClick={() => playVideo(video)}
              className={`focus-ring w-full rounded-lg px-4 py-3 text-left text-sm transition-colors ${
                activeVideo?.id === video.id
                  ? 'bg-[var(--ink)] text-white'
                  : 'hover:bg-black/5'
              }`}
            >
              <span className="mr-2 font-semibold">{video.order_index}.</span>
              {video.title}
              {video.duration_minutes && (
                <span className="ml-1 text-xs opacity-70">
                  · {video.duration_minutes}m
                </span>
              )}
            </button>
          </li>
        ))}
      </ol>

      <div>
        {!activeVideo && (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-black/15 text-sm text-[var(--muted)]">
            Select a lesson to begin
          </div>
        )}

        {activeVideo && (
          <div>
            <h2 className="mb-1 text-lg font-semibold">{activeVideo.title}</h2>
            {activeVideo.description && (
              <p className="mb-4 text-sm text-[var(--muted)]">
                {activeVideo.description}
              </p>
            )}

            {loading && (
              <div className="flex h-64 items-center justify-center rounded-xl bg-black/5 text-sm text-[var(--muted)]">
                Loading video…
              </div>
            )}

            {error && (
              <div className="flex h-64 items-center justify-center rounded-xl bg-red-50 text-sm text-red-600">
                {error}
              </div>
            )}

            {videoUrl && !loading && (
              <video
                key={videoUrl}
                controls
                controlsList="nodownload"
                className="w-full rounded-xl bg-black"
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser doesn't support video playback.
              </video>
            )}
          </div>
        )}
      </div>
    </div>
  )
      }
