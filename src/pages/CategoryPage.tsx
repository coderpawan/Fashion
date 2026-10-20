import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { LookCard } from '../components/LookCard'
import { getCategories, getPublishedLooks } from '../lib/data'
import type { Category, Look } from '../lib/types'

export function CategoryPage() {
  const { categorySlug } = useParams()
  const [looks, setLooks] = useState<Look[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      try {
        const categories = await getCategories()
        const selected = categories.find((item) => item.slug === categorySlug) ?? null
        setCategory(selected)

        if (selected) {
          const result = await getPublishedLooks({ categoryId: selected.id, limit: 18 })
          setLooks(result.data)
        } else {
          setLooks([])
        }
      } catch {
        setLooks([])
      } finally {
        setLoading(false)
      }
    })()
  }, [categorySlug])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[#a95b76]">Shop by category</p>
        <h1 className="mt-2 text-4xl font-semibold text-[#2d221f]">{category?.name ?? 'Fashion picks'}</h1>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-[28px] bg-[#f3e8ea]" />
          ))}
        </div>
      ) : looks.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {looks.map((look) => (
            <LookCard key={look.id} look={look} />
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-[#eaded9] bg-white px-6 py-12 text-center text-[#5e4d49]">
          No looks are published in this category yet.
        </div>
      )}
    </div>
  )
}
