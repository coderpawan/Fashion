import { Funnel } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LookCard } from '../components/LookCard'
import { getCategories, getPublishedLooks } from '../lib/data'
import type { Category, Look } from '../lib/types'

export function LooksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [looks, setLooks] = useState<Look[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 12

  const filters = useMemo(() => ({
    search: searchParams.get('search') ?? '',
    category: searchParams.get('category') ?? '',
    retailer: searchParams.get('retailer') ?? '',
    sort: (searchParams.get('sort') as 'newest' | 'oldest' | 'price_asc' | 'price_desc') ?? 'newest',
  }), [searchParams])

  useEffect(() => {
    void (async () => {
      try {
        const [nextCategories, result] = await Promise.all([
          getCategories(),
          getPublishedLooks({
            limit,
            offset: (page - 1) * limit,
            categoryId: filters.category || undefined,
            search: filters.search || undefined,
            retailer: filters.retailer || undefined,
            sort: filters.sort,
          }),
        ])
        setCategories(nextCategories)
        setLooks(result.data)
        setTotal(result.count)
      } catch {
        setLooks([])
      } finally {
        setLoading(false)
      }
    })()
  }, [filters, page])

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
    setPage(1)
  }

  const clearFilters = () => {
    setSearchParams({})
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#a95b76]">Discover</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#2d221f]">Latest looks</h1>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#f0e3df] bg-white p-4 shadow-sm md:p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-[#554640]">Search</label>
            <input
              value={filters.search}
              onChange={(event) => updateParam('search', event.target.value)}
              placeholder="Search a dress or look"
              className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3 outline-none ring-0 focus:border-[#d6a3b5]"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-[#554640]">Category</label>
            <select value={filters.category} onChange={(event) => updateParam('category', event.target.value)} className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3">
              <option value="">All</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm text-[#554640]">Retailer</label>
            <input value={filters.retailer} onChange={(event) => updateParam('retailer', event.target.value)} placeholder="Amazon, Myntra..." className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#5e4d49]">
            <Funnel size={16} />
            {total} looks
          </div>
          <div className="flex items-center gap-3">
            <select value={filters.sort} onChange={(event) => updateParam('sort', event.target.value)} className="rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-3 py-2">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price_asc">Price low to high</option>
              <option value="price_desc">Price high to low</option>
            </select>
            <button type="button" onClick={clearFilters} className="rounded-full border border-[#eaded9] px-4 py-2 text-sm text-[#2d221f]">Clear all</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-[28px] bg-[#f3e8ea]" />
          ))}
        </div>
      ) : looks.length ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {looks.map((look) => (
            <LookCard key={look.id} look={look} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[28px] border border-dashed border-[#eaded9] bg-white px-6 py-12 text-center text-[#5e4d49]">
          No looks match your current search.
        </div>
      )}

      {total > limit && (
        <div className="mt-8 flex justify-center gap-3">
          <button type="button" onClick={() => setPage((value) => Math.max(value - 1, 1))} disabled={page === 1} className="rounded-full border border-[#eaded9] px-4 py-2 text-sm disabled:opacity-40">
            Prev
          </button>
          <span className="inline-flex items-center rounded-full bg-[#fff0f5] px-4 py-2 text-sm text-[#a95b76]">Page {page}</span>
          <button type="button" onClick={() => setPage((value) => value + 1)} disabled={page * limit >= total} className="rounded-full border border-[#eaded9] px-4 py-2 text-sm disabled:opacity-40">
            Next
          </button>
        </div>
      )}
    </div>
  )
}
