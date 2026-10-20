import { ArrowRight, ChevronLeft, ChevronRight, Search, Sparkles, X, ZoomIn } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { LookCard } from '../components/LookCard'
import { getCategories, getPublishedLooks, getSiteSettings } from '../lib/data'
import { getStoragePublicUrl } from '../lib/supabase'
import type { Category, Look, SiteSettings } from '../lib/types'

const defaultSettings: SiteSettings = {
  id: 'default',
  site_name: 'Fashion with Ankita',
  homepage_headline: 'Daily fashion finds curated for you',
  homepage_introduction: 'Discover elevated styles, statement silhouettes and the newest dress edits in one scroll.',
  affiliate_disclosure: 'Some links may be affiliate links. We may earn a commission.',
  ai_disclaimer: 'Some visuals may be AI-generated fashion references.',
  updated_at: new Date().toISOString(),
  about_page_content: '',
  footer_content: '',
}

export function PublicHomePage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [categories, setCategories] = useState<Category[]>([])
  const [looks, setLooks] = useState<Look[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [selectedLook, setSelectedLook] = useState<Look | null>(null)
  const [activeMediaIndex, setActiveMediaIndex] = useState(0)
  const [zoomedItem, setZoomedItem] = useState<{ id: string; kind: 'image' | 'video'; path: string; alt: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      try {
        const [siteSettings, nextCategories, result] = await Promise.all([
          getSiteSettings(),
          getCategories(),
          getPublishedLooks({ limit: 30 }),
        ])

        if (siteSettings) setSettings(siteSettings)
        setCategories(nextCategories)
        setLooks(result.data)
      } catch {
        setLooks([])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filteredLooks = useMemo(() => {
    return looks.filter((look) => {
      const matchesCategory = selectedCategory === 'all' || look.category_id === selectedCategory
      const matchesSearch = !search || [look.title, look.brand, look.short_description, (look.category?.name ?? '')].join(' ').toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [looks, search, selectedCategory])

  const selectedGallery = selectedLook?.media?.filter((item) => item.media_type === 'image') ?? []
  const selectedVideo = selectedLook?.media?.find((item) => item.media_type === 'video') ?? (selectedLook?.video_path ? { id: 'video-main', storage_path: selectedLook.video_path, media_type: 'video', alt_text: `${selectedLook.title} video` } : null)

  const mainImageItem = selectedLook?.main_image_path
    ? [{
        id: 'main-image',
        storage_path: selectedLook.main_image_path,
        media_type: 'image' as const,
        alt_text: selectedLook.title,
      }]
    : []

  const galleryImages = selectedGallery.length
    ? selectedGallery
    : []

  const previewItems = [
    ...mainImageItem.map((image) => ({ id: image.id, kind: 'image' as const, path: image.storage_path, alt: image.alt_text || selectedLook?.title || 'Main image' })),
    ...galleryImages.filter((image) => image.storage_path !== selectedLook?.main_image_path).map((image) => ({
      id: image.id,
      kind: 'image' as const,
      path: image.storage_path,
      alt: image.alt_text || selectedLook?.title || 'Gallery image',
    })),
    ...(selectedVideo ? [{ id: selectedVideo.id, kind: 'video' as const, path: selectedVideo.storage_path, alt: selectedVideo.alt_text || 'Product video' }] : []),
  ]

  const activeAffiliateLink = selectedLook?.shopping_links?.find((link) => link.is_active) ?? null
  const activeMedia = previewItems[activeMediaIndex] ?? previewItems[0] ?? null

  useEffect(() => {
    if (selectedLook) {
      setActiveMediaIndex(0)
      setZoomedItem(null)
    }
  }, [selectedLook])

  const goToSlide = (direction: number) => {
    if (!previewItems.length) return
    setActiveMediaIndex((current) => {
      const nextIndex = (current + direction + previewItems.length) % previewItems.length
      return nextIndex
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 md:px-8">
      <section className="rounded-[32px] bg-[radial-gradient(circle_at_top,_#fff7f8,_#f4e7ee_30%,_#f7efe9_100%)] p-6 shadow-[0_24px_50px_rgba(72,40,38,0.06)] md:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f0dddf] bg-[#fff0f5] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#a95b76]">
              <Sparkles size={12} /> New season edit
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#2d221f] md:text-6xl">
              {settings.homepage_headline}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#5e4d49]">
              {settings.homepage_introduction}
            </p>
          </div>

          <div className="rounded-[24px] border border-[#eaded9] bg-white/70 px-4 py-3 text-sm text-[#5e4d49] shadow-sm">
            <div className="font-medium text-[#2d221f]">{settings.site_name}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#a95b76]">Curated dress drops</div>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-[28px] border border-[#f0e3df] bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setSelectedCategory('all')} className={`rounded-full px-4 py-2 text-sm font-medium ${selectedCategory === 'all' ? 'bg-[#2a1d1e] text-white' : 'border border-[#eaded9] bg-[#fffaf7] text-[#2d221f]'}`}>
              All
            </button>
            {categories.map((category) => (
              <button key={category.id} type="button" onClick={() => setSelectedCategory(category.id)} className={`rounded-full px-4 py-2 text-sm font-medium ${selectedCategory === category.id ? 'bg-[#2a1d1e] text-white' : 'border border-[#eaded9] bg-[#fffaf7] text-[#2d221f]'}`}>
                {category.name}
              </button>
            ))}
          </div>

          <div className="w-full max-w-md">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by dress name or brand"
              className="w-full rounded-full border border-[#eaded9] bg-[#fffaf7] px-4 py-2.5 text-sm text-[#2d221f] outline-none ring-0 placeholder:text-[#9f8780] focus:border-[#d6a3b5]"
            />
          </div>
        </div>
      </section>

      <section className="mt-10">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-[420px] animate-pulse rounded-[28px] bg-[#f3e8ea]" />
            ))}
          </div>
        ) : filteredLooks.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredLooks.map((look) => (
              <LookCard key={look.id} look={look} onSelect={setSelectedLook} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-[#eaded9] bg-white px-6 py-12 text-center text-[#5e4d49]">
            No dresses match your current search.
          </div>
        )}
      </section>

      {selectedLook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d221f]/70 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[30px] bg-white p-4 shadow-[0_30px_80px_rgba(26,18,16,0.28)] md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm uppercase tracking-[0.2em] text-[#a95b76]">Dress details</div>
              <button type="button" onClick={() => setSelectedLook(null)} className="rounded-full border border-[#eaded9] p-2 text-[#2d221f]" aria-label="Close modal">
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="relative overflow-hidden rounded-[26px] border border-[#f0e3df] bg-[#fffaf7] p-2">
                  {previewItems.length > 1 && (
                    <>
                      <button type="button" onClick={() => goToSlide(-1)} className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/50 bg-black/25 p-2 text-white backdrop-blur-sm transition hover:bg-black/40" aria-label="Previous media">
                        <ChevronLeft size={20} />
                      </button>
                      <button type="button" onClick={() => goToSlide(1)} className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/50 bg-black/25 p-2 text-white backdrop-blur-sm transition hover:bg-black/40" aria-label="Next media">
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  {activeMedia?.kind === 'video' ? (
                    <div className="relative overflow-hidden rounded-[20px] bg-[#2a1d1e]">
                      <video key={activeMedia.id} controls className="h-[480px] w-full rounded-[20px] object-cover" src={getStoragePublicUrl(activeMedia.path)} />
                    </div>
                  ) : (
                    <div className="relative">
                      <img src={getStoragePublicUrl(activeMedia?.path ?? selectedLook.main_image_path ?? '/placeholder-fashion.svg')} alt={selectedLook.title} className="h-[480px] w-full rounded-[20px] object-cover" />
                      <button type="button" onClick={() => setZoomedItem(activeMedia)} className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/60 bg-black/25 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm" aria-label="Zoom image">
                        <ZoomIn size={14} /> Zoom
                      </button>
                    </div>
                  )}
                </div>

                {previewItems.length > 1 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {previewItems.map((item, index) => (
                      <button key={item.id} type="button" onClick={() => setActiveMediaIndex(index)} className={`relative overflow-hidden rounded-[18px] border p-1 text-left transition ${activeMediaIndex === index ? 'border-[#a95b76] ring-2 ring-[#f7dfe8]' : 'border-[#f0e3df] bg-[#fffaf7]'}`}>
                        {item.kind === 'video' ? (
                          <div className="relative h-24 overflow-hidden rounded-[12px] bg-[#2a1d1e]">
                            <video src={getStoragePublicUrl(item.path)} className="h-full w-full object-cover opacity-80" muted playsInline />
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold uppercase tracking-[0.18em] text-white">Video</span>
                          </div>
                        ) : (
                          <img src={getStoragePublicUrl(item.path)} alt={item.alt} className="h-24 w-full rounded-[12px] object-cover" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-5 py-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#fff0f5] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#a95b76]">
                    {selectedLook.category?.name || 'Dress'}
                  </span>
                  {selectedLook.price ? <span className="text-2xl font-semibold text-[#2d221f]">₹{selectedLook.price}</span> : null}
                </div>

                <div>
                  <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#2d221f]">{selectedLook.title}</h2>
                  <p className="mt-2 text-sm text-[#7d635d]">{selectedLook.brand || 'Premium label'}</p>
                </div>

                <div className="rounded-2xl bg-[#fffaf7] p-4 text-sm text-[#5e4d49]">
                  {selectedLook.published_at ? new Date(selectedLook.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently added'}
                </div>

                <p className="text-[#5e4d49]">{selectedLook.short_description || selectedLook.description || 'A curated statement dress for elevated everyday styling.'}</p>

                {activeAffiliateLink ? (
                  <a href={activeAffiliateLink.affiliate_url} target="_blank" rel="noreferrer noopener sponsored" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2a1d1e] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#4a2e30]">
                    {activeAffiliateLink.button_label || 'Shop now'} <ArrowRight size={16} />
                  </a>
                ) : (
                  <button type="button" className="cursor-not-allowed rounded-full border border-[#eaded9] bg-[#fffaf7] px-5 py-3 text-sm font-medium text-[#7d635d]">
                    No affiliate link available
                  </button>
                )}

                {(selectedLook.material || selectedLook.color || selectedLook.fit || selectedLook.occasion) && (
                  <div className="rounded-[22px] border border-[#f0e3df] bg-[#fffaf7] p-4 text-sm text-[#5e4d49]">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {selectedLook.material && <div><span className="block text-[10px] uppercase tracking-[0.18em] text-[#a95b76]">Material</span><span>{selectedLook.material}</span></div>}
                      {selectedLook.color && <div><span className="block text-[10px] uppercase tracking-[0.18em] text-[#a95b76]">Color</span><span>{selectedLook.color}</span></div>}
                      {selectedLook.fit && <div><span className="block text-[10px] uppercase tracking-[0.18em] text-[#a95b76]">Fit</span><span>{selectedLook.fit}</span></div>}
                      {selectedLook.occasion && <div><span className="block text-[10px] uppercase tracking-[0.18em] text-[#a95b76]">Occasion</span><span>{selectedLook.occasion}</span></div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {zoomedItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#130f10]/85 p-4" onClick={() => setZoomedItem(null)}>
          <div className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-[#1f1718] p-2" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setZoomedItem(null)} className="absolute right-4 top-4 z-10 rounded-full border border-white/30 bg-black/25 p-2 text-white backdrop-blur-sm" aria-label="Close zoom view">
              <X size={18} />
            </button>
            {zoomedItem.kind === 'video' ? (
              <video controls className="max-h-[85vh] w-full rounded-[18px] object-contain" src={getStoragePublicUrl(zoomedItem.path)} />
            ) : (
              <img src={getStoragePublicUrl(zoomedItem.path)} alt={zoomedItem.alt} className="max-h-[85vh] w-full rounded-[18px] object-contain" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
