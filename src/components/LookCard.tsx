import { ArrowRight, CalendarDays, Sparkles, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getLookHighlightState, getNextIstMidnightMs } from '../lib/dateHighlight'
import { getStoragePublicUrl } from '../lib/supabase'
import type { Look } from '../lib/types'

const highlightStyles = {
  today: {
    card: 'relative overflow-hidden rounded-[28px] border border-transparent bg-white shadow-[0_22px_60px_rgba(123,80,88,0.18)]',
    glow: 'absolute inset-0 rounded-[28px] bg-[linear-gradient(135deg,rgba(214,164,160,0.9),rgba(248,221,194,0.85),rgba(239,182,206,0.9),rgba(126,95,113,0.8))] opacity-100',
    header: 'mx-3 mt-3 rounded-full border border-[#f4dfe2] bg-[linear-gradient(135deg,#fff5f2_0%,#f3d8d7_30%,#f8ead8_58%,#f4d8e5_100%)] px-3 py-2 text-center shadow-[0_12px_24px_rgba(155,108,122,0.14)]',
    label: 'inline-flex items-center justify-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#4a2d35] sm:text-[10px]',
  },
  yesterday: {
    card: 'relative overflow-hidden rounded-[28px] border border-transparent bg-white shadow-[0_18px_50px_rgba(118,103,113,0.12)]',
    glow: 'absolute inset-0 rounded-[28px] bg-[linear-gradient(135deg,rgba(245,231,216,0.9),rgba(230,214,236,0.9),rgba(234,203,209,0.7),rgba(184,160,169,0.55))] opacity-100',
    header: 'mx-3 mt-3 rounded-full border border-[#f0e6ee] bg-[linear-gradient(135deg,#fffaf7_0%,#f6efeb_28%,#f3eaf0_60%,#efe9e2_100%)] px-3 py-2 text-center shadow-[0_10px_24px_rgba(119,100,112,0.12)]',
    label: 'inline-flex items-center justify-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#4b3e4a] sm:text-[10px]',
  },
} as const

export function LookCard({ look, onSelect }: { look: Look; onSelect?: (look: Look) => void }) {
  const [now, setNow] = useState(() => new Date())
  const imageUrl = look.main_image_path ? getStoragePublicUrl(look.main_image_path) : '/placeholder-fashion.svg'
  const highlight = getLookHighlightState(look, now)
  const hasHighlight = highlight !== 'none'
  const highlightConfig = hasHighlight ? highlightStyles[highlight] : null

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setNow(new Date())
    }, getNextIstMidnightMs(now))

    return () => window.clearTimeout(timeoutId)
  }, [now])

  return (
    <article className={hasHighlight ? highlightConfig!.card : 'overflow-hidden rounded-[28px] border border-[#f0e3df] bg-white shadow-[0_16px_40px_rgba(62,38,32,0.04)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(62,38,32,0.08)]'}>
      {hasHighlight && (
        <>
          <div className={`${highlightConfig!.glow} pointer-events-none`} />
          <div className="relative z-10 flex justify-center px-3 pt-3">
            <div className={highlightConfig!.header}>
              <span className={highlightConfig!.label}>
                <Sparkles size={11} className="shrink-0" />
                {highlight === 'today' ? "TODAY'S WEAR" : "YESTERDAY'S WEAR"}
                <Sparkles size={11} className="shrink-0" />
              </span>
            </div>
          </div>
        </>
      )}

      <button type="button" onClick={() => onSelect?.(look)} className={`relative z-10 block w-full text-left ${hasHighlight ? 'pt-0' : ''}`}>
        <div className="relative">
          <img src={imageUrl} alt={look.title} className="h-80 w-full object-cover" loading="lazy" />
          {look.is_featured && (
            <span className="absolute left-4 top-4 rounded-full bg-[#f2d9e2] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5c2f3d]">
              Featured
            </span>
          )}
        </div>
      </button>

      <div className="relative z-10 space-y-4 p-5">
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
