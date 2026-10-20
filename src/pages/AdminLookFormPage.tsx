import { zodResolver } from '@hookform/resolvers/zod'
import { Save, UploadCloud, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { getCategories, getLookById, saveLook } from '../lib/data'
import { supabase } from '../lib/supabase'
import type { Category, LookFormValues } from '../lib/types'

const shoppingLinkSchema = z.object({
  id: z.string().optional(),
  retailer_name: z.string().optional().or(z.literal('')),
  affiliate_url: z.string().optional().or(z.literal('')),
  button_label: z.string().optional().or(z.literal('')),
  displayed_price: z.string().optional().or(z.literal('')),
  display_order: z.number().min(0),
  is_active: z.boolean().default(true),
}).superRefine((link, ctx) => {
  const hasAnyFilledValue = Boolean(link.retailer_name?.trim() || link.affiliate_url?.trim() || link.button_label?.trim() || link.displayed_price?.trim())

  if (!hasAnyFilledValue) {
    return
  }

  if (!link.retailer_name?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Retailer is required.', path: ['retailer_name'] })
  }

  if (link.affiliate_url && link.affiliate_url.trim() && !/^https?:\/\//i.test(link.affiliate_url.trim())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a valid affiliate URL.', path: ['affiliate_url'] })
  }

  if (!link.button_label?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Button label is required.', path: ['button_label'] })
  }
})

const schema = z.object({
  title: z.string().min(3, 'Title is required.'),
  slug: z.string().min(2, 'Slug is required.'),
  short_description: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  category_id: z.string().min(1, 'Please select a category.'),
  status: z.enum(['draft', 'scheduled', 'published']),
  published_at: z.string().optional().or(z.literal('')),
  scheduled_at: z.string().optional().or(z.literal('')),
  price: z.string().optional().or(z.literal('')),
  original_price: z.string().optional().or(z.literal('')),
  currency: z.string().default('INR'),
  brand: z.string().optional().or(z.literal('')),
  material: z.string().optional().or(z.literal('')),
  color: z.string().optional().or(z.literal('')),
  sizes: z.string().optional().or(z.literal('')),
  fit: z.string().optional().or(z.literal('')),
  occasion: z.string().optional().or(z.literal('')),
  length: z.string().optional().or(z.literal('')),
  pattern: z.string().optional().or(z.literal('')),
  care_instructions: z.string().optional().or(z.literal('')),
  styling_tips: z.string().optional().or(z.literal('')),
  additional_notes: z.string().optional().or(z.literal('')),
  instagram_url: z.string().optional().or(z.literal('')),
  youtube_url: z.string().optional().or(z.literal('')),
  is_featured: z.boolean().default(false),
  shopping_links: z.array(shoppingLinkSchema).default([]),
})

const emptyValues: LookFormValues = {
  title: '',
  slug: '',
  short_description: '',
  description: '',
  category_id: '',
  status: 'published',
  published_at: '',
  scheduled_at: '',
  price: '',
  original_price: '',
  currency: 'INR',
  brand: '',
  material: '',
  color: '',
  sizes: '',
  fit: '',
  occasion: '',
  length: '',
  pattern: '',
  care_instructions: '',
  styling_tips: '',
  additional_notes: '',
  instagram_url: '',
  youtube_url: '',
  is_featured: false,
  shopping_links: [
    {
      retailer_name: 'Amazon',
      affiliate_url: '',
      button_label: 'Shop on Amazon',
      displayed_price: '',
      display_order: 1,
      is_active: true,
    },
  ],
}

export function AdminLookFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [existingLookId, setExistingLookId] = useState<string | null>(id ?? null)
  const [loading, setLoading] = useState(true)
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const mainImageInputRef = useRef<HTMLInputElement | null>(null)
  const galleryInputRef = useRef<HTMLInputElement | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)

  const form = useForm<LookFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  })

  const { register, handleSubmit, setValue, watch, reset } = form

  useEffect(() => {
    void (async () => {
      try {
        const nextCategories = await getCategories()
        setCategories(nextCategories)

        if (id) {
          const look = await getLookById(id)
          if (look) {
            reset({
              title: look.title,
              slug: look.slug,
              short_description: look.short_description ?? '',
              description: look.description ?? '',
              category_id: look.category_id ?? '',
              status: look.status,
              published_at: look.published_at ? new Date(look.published_at).toISOString().slice(0, 16) : '',
              scheduled_at: look.scheduled_at ? new Date(look.scheduled_at).toISOString().slice(0, 16) : '',
              price: look.price ? String(look.price) : '',
              original_price: look.original_price ? String(look.original_price) : '',
              currency: look.currency ?? 'INR',
              brand: look.brand ?? '',
              material: look.material ?? '',
              color: look.color ?? '',
              sizes: Array.isArray(look.sizes) ? look.sizes.join(', ') : typeof look.sizes === 'string' ? look.sizes : '',
              fit: look.fit ?? '',
              occasion: look.occasion ?? '',
              length: look.length ?? '',
              pattern: look.pattern ?? '',
              care_instructions: look.care_instructions ?? '',
              styling_tips: look.styling_tips ?? '',
              additional_notes: look.additional_notes ?? '',
              instagram_url: look.instagram_url ?? '',
              youtube_url: look.youtube_url ?? '',
              is_featured: look.is_featured,
              shopping_links: (look.shopping_links ?? []).map((link) => ({
                id: link.id,
                retailer_name: link.retailer_name,
                affiliate_url: link.affiliate_url,
                button_label: link.button_label,
                displayed_price: link.displayed_price ? String(link.displayed_price) : '',
                display_order: link.display_order,
                is_active: link.is_active,
              })),
            })
          }
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load the form.')
      } finally {
        setLoading(false)
      }
    })()
  }, [id, reset])

  const generateSlug = (title: string) => {
    return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'new-look'
  }

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextTitle = event.target.value
    if (!watch('slug') || watch('slug') === generateSlug((watch('title') ?? '').trim())) {
      setValue('slug', generateSlug(nextTitle), { shouldValidate: false })
    }
  }

  const addShoppingLink = () => {
    const current = watch('shopping_links') ?? []
    setValue('shopping_links', [...current, { retailer_name: '', affiliate_url: '', button_label: '', displayed_price: '', display_order: current.length + 1, is_active: true }], { shouldValidate: false })
  }

  const removeShoppingLink = (index: number) => {
    const current = [...(watch('shopping_links') ?? [])]
    current.splice(index, 1)
    setValue('shopping_links', current, { shouldValidate: false })
  }

  const handleMainImageSelect = (fileList: FileList | null) => {
    const nextFile = fileList?.[0]
    if (!nextFile || !nextFile.type.startsWith('image/')) {
      return
    }

    setMainImageFile(nextFile)
  }

  const handleGallerySelect = (fileList: FileList | null) => {
    if (!fileList?.length) return

    const nextFiles = Array.from(fileList).filter((file) => file.type.startsWith('image/'))
    if (!nextFiles.length) return

    setGalleryFiles((current) => [...current, ...nextFiles])
  }

  const handleVideoSelect = (fileList: FileList | null) => {
    const nextFile = fileList?.[0]
    if (!nextFile || !nextFile.type.startsWith('video/')) {
      return
    }

    setVideoFile(nextFile)
  }

  const removeGalleryFile = (index: number) => {
    setGalleryFiles((current) => current.filter((_, currentIndex) => currentIndex !== index))
  }

  const createSafeStorageFileName = (fileName: string) => {
    const normalized = fileName
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')

    return normalized || `file-${Date.now()}`
  }

  const uploadFile = async (file: File, path: string) => {
    const bucketName = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ?? 'fashion-media'
    const safeFileName = createSafeStorageFileName(file.name)
    const fileName = `${Date.now()}-${safeFileName}`
    const uploadPath = `${path}/${fileName}`
    const { error } = await supabase.storage.from(bucketName).upload(uploadPath, file, {
      cacheControl: '3600',
      upsert: true,
    })

    if (error) {
      const reason = error.message.includes('row-level security') || error.message.includes('bucket')
        ? 'Ensure the bucket exists in Supabase Storage and your logged-in user is added to admin_users.'
        : error.message

      throw new Error(`Storage upload failed for bucket "${bucketName}". ${reason}`)
    }

    return uploadPath
  }

  const saveGalleryMedia = async (lookId: string, files: File[]) => {
    if (!lookId || !files.length) return

    const rows = await Promise.all(
      files.map(async (file, index) => {
        const uploadPath = await uploadFile(file, `looks/${lookId}/gallery`)

        return {
          look_id: lookId,
          storage_path: uploadPath,
          media_type: 'image' as const,
          alt_text: file.name,
          display_order: index,
        }
      }),
    )

    const { data, error } = await supabase.from('look_media').insert(rows).select()
    if (error) throw error
    if (!data?.length) {
      throw new Error('Gallery images were uploaded but no media rows were created. Check the Supabase admin policies and the look_media table.')
    }
  }

  const saveVideoMedia = async (lookId: string, file: File | null) => {
    if (!lookId || !file) return

    const uploadPath = await uploadFile(file, `looks/${lookId}/videos`)

    const { data, error: mediaError } = await supabase.from('look_media').insert({
      look_id: lookId,
      storage_path: uploadPath,
      media_type: 'video',
      alt_text: file.name,
      display_order: 999,
    }).select()

    if (mediaError) throw mediaError
    if (!data?.length) {
      throw new Error('Video was uploaded but no media row was created. Check the Supabase admin policies and the look_media table.')
    }

    return uploadPath
  }

  const onSubmit = async (values: LookFormValues) => {
    try {
      const payload: Record<string, unknown> = {
        title: values.title,
        slug: values.slug || generateSlug(values.title),
        short_description: values.short_description || null,
        description: values.description || null,
        category_id: values.category_id,
        status: 'published',
        published_at: values.published_at ? new Date(values.published_at).toISOString() : new Date().toISOString(),
        scheduled_at: null,
        price: values.price ? Number(values.price) : null,
        original_price: values.original_price ? Number(values.original_price) : null,
        currency: values.currency || 'INR',
        brand: values.brand || null,
        material: values.material || null,
        color: values.color || null,
        sizes: values.sizes ? values.sizes.split(',').map((item) => item.trim()).filter(Boolean) : null,
        fit: values.fit || null,
        occasion: values.occasion || null,
        length: values.length || null,
        pattern: values.pattern || null,
        care_instructions: values.care_instructions || null,
        styling_tips: values.styling_tips || null,
        additional_notes: values.additional_notes || null,
        instagram_url: values.instagram_url || null,
        youtube_url: values.youtube_url || null,
        is_featured: values.is_featured,
      }

      const savedLook = await saveLook(payload, existingLookId ?? undefined)
      const lookId = existingLookId ?? savedLook.id
      setExistingLookId(lookId)

      if (mainImageFile) {
        const mainImagePath = await uploadFile(mainImageFile, `looks/${lookId}/images`)
        payload.main_image_path = mainImagePath

        const { error: mainImageUpdateError } = await supabase
          .from('looks')
          .update({ main_image_path: mainImagePath })
          .eq('id', lookId)

        if (mainImageUpdateError) throw mainImageUpdateError
      }

      if (galleryFiles.length) {
        await saveGalleryMedia(lookId, galleryFiles)
      }

      if (videoFile) {
        const uploadedVideoPath = await saveVideoMedia(lookId, videoFile)
        payload.video_path = uploadedVideoPath ?? null

        const { error: videoUpdateError } = await supabase
          .from('looks')
          .update({ video_path: payload.video_path })
          .eq('id', lookId)

        if (videoUpdateError) throw videoUpdateError
      }

      if (values.shopping_links?.length) {
        const links = values.shopping_links
          .filter((link) => link.retailer_name && link.affiliate_url && link.button_label)
          .map((link) => {
            const baseLink = {
              look_id: lookId,
              retailer_name: link.retailer_name,
              affiliate_url: link.affiliate_url,
              button_label: link.button_label,
              displayed_price: link.displayed_price ? Number(link.displayed_price) : null,
              currency: values.currency || 'INR',
              display_order: link.display_order || 0,
              is_active: link.is_active,
            }

            return link.id ? { ...baseLink, id: link.id } : baseLink
          })

        if (links.length) {
          const { error } = await supabase.from('shopping_links').upsert(links, { onConflict: 'id' })
          if (error) throw error
        }
      }

      toast.success(existingLookId ? 'Look updated successfully.' : 'Look created successfully.')
      navigate('/admin/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong while saving the look.')
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-6xl p-8 text-[#5e4d49]">Loading form…</div>
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[#a95b76]">Fashion CMS</p>
        <h1 className="mt-2 text-4xl font-semibold text-[#2d221f]">{existingLookId ? 'Edit look' : 'Create new look'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <section className="rounded-[28px] border border-[#f0e3df] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#2d221f]">Dress summary</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-[#554640]">Published date</label>
              <input type="datetime-local" {...register('published_at')} className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-[#554640]">Dress name</label>
              <input {...register('title')} onChange={handleTitleChange} className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#554640]">Brand</label>
              <input {...register('brand')} className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#554640]">Category</label>
              <select {...register('category_id')} className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3">
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#554640]">Price</label>
              <input {...register('price')} className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#554640]">URL slug</label>
              <input {...register('slug')} className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3" />
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#f0e3df] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#2d221f]">Media and store link</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-[#554640]">Main image (optional)</label>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => mainImageInputRef.current?.click()} className="rounded-full border border-[#eaded9] bg-[#fffaf7] px-4 py-2 text-sm font-medium text-[#2d221f]">
                    {mainImageFile ? 'Replace image' : 'Add image'}
                  </button>
                  {mainImageFile && <span className="text-sm text-[#7d635d]">{mainImageFile.name}</span>}
                </div>

                <input
                  ref={mainImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    handleMainImageSelect(event.target.files)
                    event.target.value = ''
                  }}
                />

                {mainImageFile && (
                  <div className="overflow-hidden rounded-2xl border border-[#eaded9] bg-[#fffaf7] p-3">
                    <img src={URL.createObjectURL(mainImageFile)} alt={mainImageFile.name} className="h-40 w-full rounded-xl object-cover" />
                    <div className="mt-2 flex items-center justify-between gap-2 text-sm text-[#2d221f]">
                      <span className="truncate">{mainImageFile.name}</span>
                      <button type="button" onClick={() => setMainImageFile(null)} className="rounded-full border border-[#eaded9] p-1.5 text-[#2d221f]" aria-label="Remove main image">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-[#554640]">Gallery images (multiple)</label>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => galleryInputRef.current?.click()} className="rounded-full border border-[#eaded9] bg-[#fffaf7] px-4 py-2 text-sm font-medium text-[#2d221f]">
                    Add images
                  </button>
                  <span className="text-sm text-[#7d635d]">{galleryFiles.length} selected</span>
                </div>

                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    handleGallerySelect(event.target.files)
                    event.target.value = ''
                  }}
                />

                {galleryFiles.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {galleryFiles.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="relative overflow-hidden rounded-2xl border border-[#eaded9] bg-[#fffaf7] p-2">
                        <img src={URL.createObjectURL(file)} alt={file.name} className="h-24 w-full rounded-xl object-cover" />
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="truncate text-[11px] text-[#5e4d49]">{file.name}</span>
                          <button type="button" onClick={() => removeGalleryFile(index)} className="rounded-full border border-[#eaded9] p-1 text-[#2d221f]" aria-label={`Remove ${file.name}`}>
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-[#554640]">Video (optional)</label>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => videoInputRef.current?.click()} className="rounded-full border border-[#eaded9] bg-[#fffaf7] px-4 py-2 text-sm font-medium text-[#2d221f]">
                    {videoFile ? 'Replace video' : 'Add video'}
                  </button>
                  {videoFile && <span className="text-sm text-[#7d635d]">{videoFile.name}</span>}
                </div>

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(event) => {
                    handleVideoSelect(event.target.files)
                    event.target.value = ''
                  }}
                />

                {videoFile && (
                  <div className="overflow-hidden rounded-2xl border border-[#eaded9] bg-[#fffaf7] p-3">
                    <video src={URL.createObjectURL(videoFile)} controls className="h-40 w-full rounded-xl object-cover" />
                    <div className="mt-2 flex items-center justify-between gap-2 text-sm text-[#2d221f]">
                      <span className="truncate">{videoFile.name}</span>
                      <button type="button" onClick={() => setVideoFile(null)} className="rounded-full border border-[#eaded9] p-1.5" aria-label="Remove video">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-[#554640]">Affiliate / shopping link</label>
              <input value={watch('shopping_links')?.[0]?.affiliate_url ?? ''} onChange={(event) => {
                const next = [...(watch('shopping_links') ?? [])]
                next[0] = { ...(next[0] ?? { retailer_name: 'Amazon', affiliate_url: '', button_label: 'Shop on Amazon', displayed_price: '', display_order: 1, is_active: true }), affiliate_url: event.target.value }
                setValue('shopping_links', next, { shouldValidate: false })
              }} placeholder="https://example.com/affiliate" className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#554640]">Button label</label>
              <input value={watch('shopping_links')?.[0]?.button_label ?? 'Shop on Amazon'} onChange={(event) => {
                const next = [...(watch('shopping_links') ?? [])]
                next[0] = { ...(next[0] ?? { retailer_name: 'Amazon', affiliate_url: '', button_label: 'Shop on Amazon', displayed_price: '', display_order: 1, is_active: true }), button_label: event.target.value }
                setValue('shopping_links', next, { shouldValidate: false })
              }} className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#554640]">Retailer</label>
              <input value={watch('shopping_links')?.[0]?.retailer_name ?? 'Amazon'} onChange={(event) => {
                const next = [...(watch('shopping_links') ?? [])]
                next[0] = { ...(next[0] ?? { retailer_name: 'Amazon', affiliate_url: '', button_label: 'Shop on Amazon', displayed_price: '', display_order: 1, is_active: true }), retailer_name: event.target.value }
                setValue('shopping_links', next, { shouldValidate: false })
              }} className="w-full rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-4 py-3" />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-[#2a1d1e] px-6 py-3 text-sm font-medium text-white">
            <Save size={16} /> Save
          </button>
          <button type="button" className="rounded-full border border-[#eaded9] bg-white px-6 py-3 text-sm font-medium text-[#2d221f]" onClick={() => navigate('/admin/dashboard')}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
