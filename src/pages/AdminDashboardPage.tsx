import { Eye, Pencil, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { deleteLook, getAdminDashboardSummary, getAdminLooks } from '../lib/data'
import { getStoragePublicUrl } from '../lib/supabase'
import type { Look } from '../lib/types'

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const [looks, setLooks] = useState<Look[]>([])
  const [summary, setSummary] = useState({ totalLooks: 0, publishedLooks: 0, draftLooks: 0, scheduledLooks: 0, totalShoppingLinks: 0 })
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [nextSummary, nextLooks] = await Promise.all([getAdminDashboardSummary(), getAdminLooks()])
      setSummary(nextSummary)
      setLooks(nextLooks)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const filteredLooks = looks.filter((look) => {
    const matchesStatus = statusFilter === 'all' || look.status === statusFilter
    const matchesSearch = `${look.title} ${look.short_description ?? ''}`.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleDelete = async (look: Look) => {
    if (!window.confirm(`Delete ${look.title}? This action cannot be undone.`)) return

    try {
      await deleteLook(look.id)
      toast.success('Post deleted.')
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete the post.')
    }
  }

  const handlePreview = (look: Look) => {
    navigate(`/look/${look.slug}`)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#a95b76]">Admin</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#2d221f]">Dashboard</h1>
        </div>
        <Link to="/admin/looks/new" className="rounded-full bg-[#2a1d1e] px-5 py-3 text-sm font-medium text-white hover:bg-[#4b2f31]">
          Create new look
        </Link>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-5">
        {[
          ['Total posts', summary.totalLooks],
          ['Published', summary.publishedLooks],
          ['Drafts', summary.draftLooks],
          ['Scheduled', summary.scheduledLooks],
          ['Shopping links', summary.totalShoppingLinks],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[24px] border border-[#f0e3df] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#7d635d]">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-[#2d221f]">{value as number}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[28px] border border-[#f0e3df] bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-3 text-[#7d635d]" size={16} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search looks" className="w-full rounded-full border border-[#eaded9] bg-[#fffaf7] py-2.5 pl-10 pr-4 outline-none" />
          </div>
          <div className="flex gap-3">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-full border border-[#eaded9] bg-[#fffaf7] px-3 py-2">
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
            <Link to="/admin/settings" className="rounded-full border border-[#eaded9] px-4 py-2 text-sm text-[#2d221f]">Settings</Link>
          </div>
        </div>

        {loading ? (
          <div className="h-60 animate-pulse rounded-[24px] bg-[#f6eaf0]" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-[#4a3f3d]">
              <thead>
                <tr className="border-b border-[#f4ece9] text-xs uppercase tracking-[0.18em] text-[#7d635d]">
                  <th className="px-3 py-4">Thumb</th>
                  <th className="px-3 py-4">Title</th>
                  <th className="px-3 py-4">Date</th>
                  <th className="px-3 py-4">Category</th>
                  <th className="px-3 py-4">Links</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLooks.map((look) => (
                  <tr key={look.id} className="border-b border-[#f5efed] align-middle">
                    <td className="px-3 py-3">
                      <img src={look.main_image_path ? getStoragePublicUrl(look.main_image_path) : '/placeholder-fashion.svg'} alt={look.title} className="h-14 w-14 rounded-xl object-cover" />
                    </td>
                    <td className="px-3 py-3 font-medium text-[#2d221f]">{look.title}</td>
                    <td className="px-3 py-3">{look.published_at ? new Date(look.published_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-3 py-3">{look.category?.name ?? 'Unassigned'}</td>
                    <td className="px-3 py-3">{look.shopping_links?.length ?? 0}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-[#fff0f5] px-2.5 py-1 text-xs uppercase tracking-[0.15em] text-[#a95b76]">{look.status}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => navigate(`/admin/looks/${look.id}/edit`)} className="rounded-full bg-[#f6edf0] p-2 text-[#2d221f]" aria-label="Edit"><Pencil size={15} /></button>
                        <button type="button" onClick={() => handlePreview(look)} className="rounded-full bg-[#f6edf0] p-2 text-[#2d221f]" aria-label="Preview"><Eye size={15} /></button>
                        <button type="button" onClick={() => handleDelete(look)} className="rounded-full bg-[#fce7ea] p-2 text-[#b13c4d]" aria-label="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
