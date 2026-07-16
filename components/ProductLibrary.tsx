'use client'

import { useState } from 'react'

type Video = { id: string; title: string; order_index: number; duration_minutes: number | null }
type Module = { id: string; title: string; order_index: number; videos: Video[] }
type BonusPdf = { id: string; title: string; order_index: number }
type Product = {
  id: string
  slug: string
  name: string
  modules: Module[]
  bonusPdfs: BonusPdf[]
}

export default function ProductLibrary({ library }: { library: Product[] }) {
  const [activeProductId, setActiveProductId] = useState(library[0]?.id)
  const [openModuleId, setOpenModuleId] = useState<string | null>(
    library[0]?.modules[0]?.id || null
  )
  const [activeVideo, setActiveVideo] = useState<Video | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeProduct = library.find((p) => p.id === activeProductId) || library[0]

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

  async function downloadPdf(pdfId: string) {
    try {
      const res = await fetch('/api/pdf-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfId }),
      })
      const data = await res.json()
      if (res.ok && data.url) {
        window.open(data.url, '_blank')
      } else {
        alert(data.error || 'Could not open this file.')
      }
    } catch {
      alert('Could not reach the server. Please try again.')
    }
  }

  if (!activeProduct) return null

  return (
    <div>
      {/* Product tabs */}
      {library.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2 border-b border-[var(--line)] pb-4">
          {library.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                setActiveProductId(product.id)
                setOpenModuleId(product.modules[0]?.id || null)
                setActiveVideo(null)
                setVideoUrl(null)
              }}
              className={`focus-ring px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                activeProduct.id === product.id
                  ? 'bg-[var(--oxblood)] text-[var(--paper)]'
                  : 'text-[var(--muted)] hover:text-[var(--paper)]'
              }`}
            >
              {product.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-[320px_1fr]">
        {/* Module + video list */}
        <div className="space-y-1">
          {activeProduct.modules.map((module) => (
            <div key={module.id} className="border-b border-[var(--line)] pb-1">
              <button
                onClick={() =>
                  setOpenModuleId(openModuleId === module.id ? null : module.id)
                }
                className="focus-ring flex w-full items-center justify-between py-3 text-left"
              >
                <span className="font-display text-sm font-semibold uppercase tracking-wide">
                  {module.title}
                </span>
                <span className="text-xs text-[var(--muted)]">
                  {module.videos.length}
                </span>
              </button>

              {openModuleId === module.id && (
                <ul className="mb-2 space-y-0.5">
                  {module.videos.map((video) => (
                    <li key={video.id}>
                      <button
                        onClick={() => playVideo(video)}
                        className={`focus-ring w-full rounded-sm px-3 py-2 text-left text-sm transition-colors ${
                          activeVideo?.id === video.id
                            ? 'bg-[var(--oxblood)] text-[var(--paper)]'
                            : 'text-[var(--muted)] hover:bg-white/5 hover:text-[var(--paper)]'
                        }`}
                      >
                        {video.title}
                        {video.duration_minutes && (
                          <span className="ml-1.5 text-xs opacity-70">
                            · {video.duration_minutes}m
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {activeProduct.bonusPdfs.length > 0 && (
            <div className="pt-6">
              <div className="mb-3 font-display text-xs font-semibold uppercase tracking-widest text-[var(--ochre)]">
                Bonus Downloads
              </div>
              <ul className="space-y-1">
                {activeProduct.bonusPdfs.map((pdf) => (
                  <li key={pdf.id}>
                    <button
                      onClick={() => downloadPdf(pdf.id)}
                      className="focus-ring w-full rounded-sm px-3 py-2 text-left text-sm text-[var(--muted)] hover:bg-white/5 hover:text-[var(--paper)] transition-colors"
                    >
                      {pdf.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Video player */}
        <div>
          {!activeVideo && (
            <div className="flex h-72 items-center justify-center border border-dashed border-[var(--line)] text-sm text-[var(--muted)]">
              Select a lesson to begin
            </div>
          )}

          {activeVideo && (
            <div>
              <h2 className="mb-4 font-display text-lg font-semibold uppercase tracking-wide">
                {activeVideo.title}
              </h2>

              {loading && (
                <div className="flex h-72 items-center justify-center bg-white/5 text-sm text-[var(--muted)]">
                  Loading video…
                </div>
              )}

              {error && (
                <div className="flex h-72 items-center justify-center bg-red-950/30 text-sm text-red-300">
                  {error}
                </div>
              )}

              {videoUrl && !loading && (
                <video
                  key={videoUrl}
                  controls
                  controlsList="nodownload"
                  className="w-full bg-black"
                >
                  <source src={videoUrl} type="video/mp4" />
                  Your browser doesn't support video playback.
                </video>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
          }
