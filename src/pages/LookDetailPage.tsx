import { CalendarDays, ShoppingBag, Tag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getLookBySlug } from '../lib/data'
import { getStoragePublicUrl } from '../lib/supabase'
import type { Look } from '../lib/types'

export function LookDetailPage() {
  const { slug } = useParams()
  const [look, setLook] = useState<Look | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    void (async () => {
      try {
        const nextLook = await getLookBySlug(slug)
        setLook(nextLook)
      } catch {
        setLook(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [slug])

  if (loading) {
    return <div className="mx-auto max-w-5xl p-8 text-[#5e4d49]">Loading look…</div>
  }

  if (!look) {
    return <div className="mx-auto max-w-5xl p-8 text-[#5e4d49]">This look is not available right now.</div>
  }

  const gallery = look.media?.filter((item) => item.media_type === 'image') ?? []
  const mainImage = look.main_image_path ? getStoragePublicUrl(look.main_image_path) : gallery[0] ? getStoragePublicUrl(gallery[0].storage_path) : '/placeholder-fashion.svg'

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-[#7d635d]">
        <Link to="/" className="hover:text-[#a95b76]">Home</Link>
        <span>/</span>
        <Link to="/looks" className="hover:text-[#a95b76]">Looks</Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <div className="overflow-hidden rounded-[30px] border border-[#f0e3df] bg-white p-3 shadow-[0_18px_36px_rgba(78,49,45,0.05)]">
            <img src={mainImage} alt={look.title} className="h-[560px] w-full rounded-[22px] object-cover" />
          </div>

          {gallery.length > 1 && (
            <div className="mt-5 grid grid-cols-3 gap-3">
              {gallery.map((image) => (
                <button key={image.id} type="button" className="overflow-hidden rounded-[18px] border border-[#f0e3df] bg-white p-1">
                  <img src={getStoragePublicUrl(image.storage_path)} alt={image.alt_text || look.title} className="h-28 w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {look.video_path && (
            <div className="mt-8 rounded-[28px] border border-[#f0e3df] bg-white p-4">
              <h3 className="mb-4 text-2xl font-semibold text-[#2d221f]">Video</h3>
              <video controls className="w-full rounded-[20px]" src={getStoragePublicUrl(look.video_path)} />
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <div className="rounded-[28px] border border-[#f0e3df] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#a95b76]">
              <Tag size={12} /> {look.category?.name ?? 'Fashion'}
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-[#2d221f]">{look.title}</h1>

            <div className="mt-4 flex items-center gap-3 text-sm text-[#5e4d49]">
              <CalendarDays size={16} />
              {new Date(look.published_at ?? look.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>

            {look.price ? (
              <div className="mt-6 flex items-center gap-3">
                <span className="text-3xl font-semibold text-[#2d221f]">₹{look.price}</span>
                {look.original_price ? <span className="text-lg text-[#7d635d] line-through">₹{look.original_price}</span> : null}
              </div>
            ) : null}

            <p className="mt-4 text-[#5e4d49]">{look.short_description}</p>

            {look.shopping_links && look.shopping_links.length > 0 && (
              <div className="mt-6 space-y-3">
                {look.shopping_links.filter((link) => link.is_active).sort((a, b) => a.display_order - b.display_order).map((link) => (
                  <a key={link.id} href={link.affiliate_url} target="_blank" rel="noreferrer noopener sponsored" className="block rounded-full bg-[#2a1d1e] px-4 py-3 text-center text-sm font-medium text-white hover:bg-[#4b2f31]">
                    {link.button_label}
                  </a>
                ))}
              </div>
            )}

            <div className="mt-6 rounded-2xl bg-[#fff5f8] p-4 text-sm text-[#5b4645]">
              As an Amazon Associate I earn from qualifying purchases. Some links may be affiliate links and may result in a commission at no extra cost to you.
            </div>
          </div>

          <div className="rounded-[28px] border border-[#f0e3df] bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-[#2d221f]">Product details</h3>
            <dl className="mt-4 space-y-3 text-sm text-[#5e4d49]">
              {look.material && <div className="flex justify-between gap-4 border-b border-[#f4ece9] pb-2"><dt>Material</dt><dd>{look.material}</dd></div>}
              {look.color && <div className="flex justify-between gap-4 border-b border-[#f4ece9] pb-2"><dt>Color</dt><dd>{look.color}</dd></div>}
              {look.fit && <div className="flex justify-between gap-4 border-b border-[#f4ece9] pb-2"><dt>Fit</dt><dd>{look.fit}</dd></div>}
              {look.occasion && <div className="flex justify-between gap-4 border-b border-[#f4ece9] pb-2"><dt>Occasion</dt><dd>{look.occasion}</dd></div>}
              {look.length && <div className="flex justify-between gap-4 border-b border-[#f4ece9] pb-2"><dt>Length</dt><dd>{look.length}</dd></div>}
              {look.pattern && <div className="flex justify-between gap-4 border-b border-[#f4ece9] pb-2"><dt>Pattern</dt><dd>{look.pattern}</dd></div>}
            </dl>
          </div>
        </aside>
      </div>

      <section className="mt-12 rounded-[28px] border border-[#f0e3df] bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-semibold text-[#2d221f]">Overview</h3>
        <div className="mt-4 prose max-w-none text-[#514541]">
          <p>{look.description}</p>
        </div>
        {look.styling_tips && (
          <div className="mt-8"><h4 className="text-lg font-semibold text-[#2d221f]">Styling tips</h4><p className="mt-2 text-[#514541]">{look.styling_tips}</p></div>
        )}
        {look.care_instructions && (
          <div className="mt-8"><h4 className="text-lg font-semibold text-[#2d221f]">Care instructions</h4><p className="mt-2 text-[#514541]">{look.care_instructions}</p></div>
        )}
      </section>

      <section className="mt-10 flex flex-wrap gap-5 rounded-[28px] border border-[#f0e3df] bg-[#fffaf7] p-6">
        <div className="flex items-center gap-2 text-[#5e4d49]">
          <ShoppingBag size={18} />
          Product disclosure
        </div>
        <p className="text-sm text-[#5e4d49]">This page contains affiliate links. We may earn a commission from qualifying purchases through the retailers linked on this page.</p>
      </section>
    </div>
  )
}
