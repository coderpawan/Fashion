import { ArrowRight, CalendarDays, Star } from 'lucide-react'
import { getStoragePublicUrl } from '../lib/supabase'
import type { Look } from '../lib/types'

export function LookCard({ look, onSelect }: { look: Look; onSelect?: (look: Look) => void }) {
  const imageUrl = look.main_image_path ? getStoragePublicUrl(look.main_image_path) : '/placeholder-fashion.svg'

  return (
    <article className="overflow-hidden rounded-[28px] border border-[#f0e3df] bg-white shadow-[0_16px_40px_rgba(62,38,32,0.04)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(62,38,32,0.08)]">
      <button type="button" onClick={() => onSelect?.(look)} className="block w-full text-left">
        <div className="relative">
          <img src={imageUrl} alt={look.title} className="h-80 w-full object-cover" loading="lazy" />
          {look.is_featured && (
            <span className="absolute left-4 top-4 rounded-full bg-[#f2d9e2] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5c2f3d]">
              Featured
            </span>
          )}
        </div>
      </button>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-[#8f6d68]">
          <span>{look.brand || look.category?.name || 'Fashion'}</span>
          {look.price ? <span>₹{look.price}</span> : null}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-[#2f2625]">{look.title}</h3>
          <div className="mt-2 flex items-center gap-2 text-xs text-[#7d635d]">
            <CalendarDays size={12} />
            {look.published_at ? new Date(look.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'New arrival'}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-[#a95b76]">
            <Star size={14} fill="currentColor" />
            <span className="text-xs">Fresh pick</span>
          </div>
          <button type="button" onClick={() => onSelect?.(look)} className="inline-flex items-center gap-2 rounded-full bg-[#2a1d1e] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#422a2c]">
            View details <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}
