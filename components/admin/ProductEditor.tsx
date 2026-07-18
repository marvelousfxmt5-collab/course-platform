'use client'

import { useState } from 'react'
import Link from 'next/link'

type Video = {
  id: string
  title: string
  order_index: number
  r2_object_key: string
  duration_minutes: number | null
}
type Module = { id: string; title: string; order_index: number; videos: Video[] }
type BonusPdf = { id: string; title: string; order_index: number; r2_object_key: string }
type Product = {
  id: string
  slug: string
  name: string
  description: string | null
  price_ngn: number
  price_usd: number
  is_active: boolean
}

export default function ProductEditor({
  product,
  modules,
  bonusPdfs,
}: {
  product: Product
  modules: Module[]
  bonusPdfs: BonusPdf[]
}) {
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description || '')
  const [priceNgn, setPriceNgn] = useState(String(product.price_ngn))
  const [priceUsd, setPriceUsd] = useState(String(product.price_usd))
  const [isActive, setIsActive] = useState(product.is_active)
  const [savingProduct, setSavingProduct] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  const [newModuleTitle, setNewModuleTitle] = useState('')
  const [addingModule, setAddingModule] = useState(false)

  const [openModuleId, setOpenModuleId] = useState<string | null>(null)
  const [newVideo, setNewVideo] = useState({ title: '', r2_object_key: '', duration_minutes: '' })
  const [addingVideo, setAddingVideo] = useState(false)

  const [newPdf, setNewPdf] = useState({ title: '', r2_object_key: '' })
  const [addingPdf, setAddingPdf] = useState(false)

  async function saveProduct() {
    setSavingProduct(true)
    setSavedMsg('')
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        price_ngn: Number(priceNgn),
        price_usd: Number(priceUsd),
        is_active: isActive,
      }),
    })
    setSavingProduct(false)
    setSavedMsg(res.ok ? 'Saved' : 'Failed to save')
    setTimeout(() => setSavedMsg(''), 2000)
  }

  async function addModule() {
    if (!newModuleTitle.trim()) return
    setAddingModule(true)
    await fetch('/api/admin/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: product.id,
        title: newModuleTitle,
        order_index: modules.length + 1,
      }),
    })
    setAddingModule(false)
    setNewModuleTitle('')
    window.location.reload()
  }

  async function deleteModule(moduleId: string) {
    if (!confirm('Delete this masterclass and all its videos?')) return
    await fetch(`/api/admin/modules/${moduleId}`, { method: 'DELETE' })
    window.location.reload()
  }

  async function addVideo(moduleId: string) {
    if (!newVideo.title.trim() || !newVideo.r2_object_key.trim()) return
    setAddingVideo(true)
    const module = modules.find((m) => m.id === moduleId)
    await fetch('/api/admin/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        module_id: moduleId,
        title: newVideo.title,
        r2_object_key: newVideo.r2_object_key,
        duration_minutes: newVideo.duration_minutes ? Number(newVideo.duration_minutes) : null,
        order_index: (module?.videos.length || 0) + 1,
      }),
    })
    setAddingVideo(false)
    setNewVideo({ title: '', r2_object_key: '', duration_minutes: '' })
    window.location.reload()
  }

  async function deleteVideo(videoId: string) {
    if (!confirm('Delete this video?')) return
    await fetch(`/api/admin/videos/${videoId}`, { method: 'DELETE' })
    window.location.reload()
  }

  async function addPdf() {
    if (!newPdf.title.trim() || !newPdf.r2_object_key.trim()) return
    setAddingPdf(true)
    await fetch('/api/admin/bonus-pdfs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: product.id,
        title: newPdf.title,
        r2_object_key: newPdf.r2_object_key,
        order_index: bonusPdfs.length + 1,
      }),
    })
    setAddingPdf(false)
    setNewPdf({ title: '', r2_object_key: '' })
    window.location.reload()
  }

  async function deletePdf(pdfId: string) {
    if (!confirm('Delete this bonus PDF?')) return
    await fetch(`/api/admin/bonus-pdfs/${pdfId}`, { method: 'DELETE' })
    window.location.reload()
  }

  const inputClass =
    'w-full border border-[var(--line)] bg-transparent px-3 py-2 text-sm text-[var(--paper)] focus-ring'

  return (
    <div>
      <Link href="/admin/products" className="mb-6 inline-block text-xs uppercase tracking-widest text-[var(--muted)] hover:text-[var(--paper)]">
        ← All Products
      </Link>

      <div className="mb-10 border border-[var(--line)] p-6">
        <h1 className="mb-6 font-display text-xl font-bold uppercase tracking-wide">
          Edit Product
        </h1>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-[var(--muted)]">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              id="active"
            />
            <label htmlFor="active" className="text-xs uppercase tracking-widest text-[var(--muted)]">
              Active (visible on site)
            </label>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-widest text-[var(--muted)]">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-[var(--muted)]">Price (NGN)</label>
            <input value={priceNgn} onChange={(e) => setPriceNgn(e.target.value)} type="number" className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-[var(--muted)]">Price (USD)</label>
            <input value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)} type="number" className={inputClass} />
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={saveProduct}
            disabled={savingProduct}
            className="focus-ring bg-[var(--oxblood)] px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-[var(--paper)] hover:bg-[var(--oxblood-bright)] transition-colors disabled:opacity-60"
          >
            {savingProduct ? 'Saving…' : 'Save Changes'}
          </button>
          {savedMsg && <span className="text-xs text-[var(--ochre)]">{savedMsg}</span>}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide">
          Masterclasses
        </h2>

        <div className="space-y-3">
          {modules.map((module) => (
            <div key={module.id} className="border border-[var(--line)]">
              <div className="flex items-center justify-between px-5 py-4">
                <button
                  onClick={() => setOpenModuleId(openModuleId === module.id ? null : module.id)}
                  className="focus-ring text-left font-display text-sm font-semibold uppercase tracking-wide"
                >
                  {module.title} <span className="text-xs text-[var(--muted)]">({module.videos.length})</span>
                </button>
                <button
                  onClick={() => deleteModule(module.id)}
                  className="focus-ring text-xs uppercase tracking-widest text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>

              {openModuleId === module.id && (
                <div className="border-t border-[var(--line)] px-5 py-4">
                  <ul className="mb-4 space-y-2">
                    {module.videos.map((video) => (
                      <li key={video.id} className="flex items-center justify-between text-sm">
                        <span>
                          {video.title}{' '}
                          <span className="text-xs text-[var(--muted)]">
                            ({video.r2_object_key}
                            {video.duration_minutes ? ` · ${video.duration_minutes}m` : ''})
                          </span>
                        </span>
                        <button
                          onClick={() => deleteVideo(video.id)}
                          className="focus-ring text-xs uppercase tracking-widest text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="grid gap-2 border-t border-[var(--line)] pt-4 md:grid-cols-4">
                    <input
                      placeholder="Video title"
                      value={newVideo.title}
                      onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      placeholder="R2 file path (e.g. tattoo/linework/1.mp4)"
                      value={newVideo.r2_object_key}
                      onChange={(e) => setNewVideo({ ...newVideo, r2_object_key: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      placeholder="Minutes"
                      type="number"
                      value={newVideo.duration_minutes}
                      onChange={(e) => setNewVideo({ ...newVideo, duration_minutes: e.target.value })}
                      className={inputClass}
                    />
                    <button
                      onClick={() => addVideo(module.id)}
                      disabled={addingVideo}
                      className="focus-ring bg-[var(--oxblood)] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[var(--paper)] hover:bg-[var(--oxblood-bright)] transition-colors disabled:opacity-60"
                    >
                      {addingVideo ? 'Adding…' : 'Add Video'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            placeholder="New masterclass title"
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            className={inputClass}
          />
          <button
            onClick={addModule}
            disabled={addingModule}
            className="focus-ring whitespace-nowrap bg-[var(--oxblood)] px-5 py-2 text-xs font-semibold uppercase tracking-widest text-[var(--paper)] hover:bg-[var(--oxblood-bright)] transition-colors disabled:opacity-60"
          >
            {addingModule ? 'Adding…' : 'Add Masterclass'}
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide">
          Bonus PDFs
        </h2>

        <ul className="mb-4 space-y-2 border border-[var(--line)] p-5">
          {bonusPdfs.length === 0 && (
            <li className="text-sm text-[var(--muted)]">No bonus PDFs yet.</li>
          )}
          {bonusPdfs.map((pdf) => (
            <li key={pdf.id} className="flex items-center justify-between text-sm">
              <span>
                {pdf.title} <span className="text-xs text-[var(--muted)]">({pdf.r2_object_key})</span>
              </span>
              <button
                onClick={() => deletePdf(pdf.id)}
                className="focus-ring text-xs uppercase tracking-widest text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        <div className="grid gap-2 md:grid-cols-3">
          <input
            placeholder="PDF title"
            value={newPdf.title}
            onChange={(e) => setNewPdf({ ...newPdf, title: e.target.value })}
            className={inputClass}
          />
          <input
            placeholder="R2 file path (e.g. tattoo/bonuses/1.pdf)"
            value={newPdf.r2_object_key}
            onChange={(e) => setNewPdf({ ...newPdf, r2_object_key: e.target.value })}
            className={inputClass}
          />
          <button
            onClick={addPdf}
            disabled={addingPdf}
            className="focus-ring bg-[var(--oxblood)] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[var(--paper)] hover:bg-[var(--oxblood-bright)] transition-colors disabled:opacity-60"
          >
            {addingPdf ? 'Adding…' : 'Add PDF'}
          </button>
        </div>
      </div>
    </div>
  )
      }
