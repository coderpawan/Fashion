import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { getCategories, getSiteSettings, saveCategory, saveSiteSettings } from '../lib/data'
import type { Category, SiteSettings } from '../lib/types'

const schema = z.object({
  site_name: z.string().min(2),
  homepage_headline: z.string().min(2),
  homepage_introduction: z.string().min(2),
  about_page_content: z.string().optional(),
  instagram_url: z.string().optional(),
  youtube_url: z.string().optional(),
  footer_content: z.string().optional(),
  affiliate_disclosure: z.string().optional(),
  ai_disclaimer: z.string().optional(),
})

export function AdminSettingsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      site_name: 'Fashion with Ankita',
      homepage_headline: 'Daily fashion finds curated for you',
      homepage_introduction: 'Discover elegant outfits and modern styling inspiration.',
      about_page_content: '',
      instagram_url: '',
      youtube_url: '',
      footer_content: '',
      affiliate_disclosure: 'Some links may be affiliate links.',
      ai_disclaimer: 'Some visuals may be AI-generated fashion creative references.',
    },
  })

  useEffect(() => {
    void (async () => {
      try {
        const [nextCategories, nextSettings] = await Promise.all([getCategories(), getSiteSettings()])
        setCategories(nextCategories)
        if (nextSettings) {
          setSettings(nextSettings)
          reset({
            site_name: nextSettings.site_name,
            homepage_headline: nextSettings.homepage_headline,
            homepage_introduction: nextSettings.homepage_introduction,
            about_page_content: nextSettings.about_page_content ?? '',
            instagram_url: nextSettings.instagram_url ?? '',
            youtube_url: nextSettings.youtube_url ?? '',
            footer_content: nextSettings.footer_content ?? '',
            affiliate_disclosure: nextSettings.affiliate_disclosure ?? '',
            ai_disclaimer: nextSettings.ai_disclaimer ?? '',
          })
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load settings.')
      }
    })()
  }, [reset])

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await saveSiteSettings({
        id: settings?.id,
        site_name: values.site_name,
        homepage_headline: values.homepage_headline,
        homepage_introduction: values.homepage_introduction,
        about_page_content: values.about_page_content,
        instagram_url: values.instagram_url,
        youtube_url: values.youtube_url,
        footer_content: values.footer_content,
        affiliate_disclosure: values.affiliate_disclosure,
        ai_disclaimer: values.ai_disclaimer,
      })
      toast.success('Site settings saved.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save settings.')
    }
  }

  const addCategory = async () => {
    if (!categoryName.trim()) {
      toast.error('Category name is required.')
      return
    }

    try {
      await saveCategory({
        name: categoryName.trim(),
        slug: categoryName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: 'Custom category',
        is_active: true,
      })
      setCategoryName('')
      const nextCategories = await getCategories()
      setCategories(nextCategories)
      toast.success('Category saved.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save category.')
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[#a95b76]">Brand settings</p>
        <h1 className="mt-2 text-4xl font-semibold text-[#2d221f]">Website settings</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-[28px] border border-[#f0e3df] bg-white p-6 shadow-sm">
          <div>
            <label className="mb-2 block text-sm text-[#554640]">Brand name</label>
            <input {...register('site_name')} className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-[#554640]">Homepage headline</label>
            <input {...register('homepage_headline')} className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-[#554640]">Homepage intro</label>
            <textarea {...register('homepage_introduction')} rows={3} className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-[#554640]">About page content</label>
            <textarea {...register('about_page_content')} rows={4} className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-[#554640]">Instagram profile URL</label>
            <input {...register('instagram_url')} className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-[#554640]">YouTube URL</label>
            <input {...register('youtube_url')} className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-[#554640]">Footer content</label>
            <textarea {...register('footer_content')} rows={2} className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-[#554640]">Affiliate disclosure</label>
            <textarea {...register('affiliate_disclosure')} rows={3} className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-[#554640]">AI disclosure</label>
            <textarea {...register('ai_disclaimer')} rows={3} className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3" />
          </div>

          <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-[#2a1d1e] px-6 py-3 text-sm font-medium text-white">
            <Save size={16} /> Save settings
          </button>
        </form>

        <div className="rounded-[28px] border border-[#f0e3df] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#2d221f]">Categories</h2>
          <div className="mt-5 flex gap-2">
            <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="New category name" className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3" />
            <button type="button" onClick={addCategory} className="rounded-full bg-[#2a1d1e] px-4 py-3 text-sm font-medium text-white">Add</button>
          </div>
          <ul className="mt-6 space-y-2">
            {categories.map((category) => (
              <li key={category.id} className="rounded-2xl border border-[#f0e3df] bg-[#fffaf7] px-4 py-3 text-sm text-[#392f2d]">
                {category.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
