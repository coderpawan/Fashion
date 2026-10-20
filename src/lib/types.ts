export type LookStatus = 'draft' | 'scheduled' | 'published'

export type Category = {
  id: string
  name: string
  slug: string
  description?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ShoppingLink = {
  id: string
  look_id: string
  retailer_name: string
  affiliate_url: string
  button_label: string
  displayed_price?: number | null
  currency: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type LookMedia = {
  id: string
  look_id: string
  storage_path: string
  media_type: 'image' | 'video'
  alt_text?: string | null
  display_order: number
  created_at: string
}

export type Look = {
  id: string
  title: string
  slug: string
  short_description?: string | null
  description?: string | null
  category_id?: string | null
  category?: Category | null
  published_at?: string | null
  scheduled_at?: string | null
  status: LookStatus
  main_image_path?: string | null
  video_path?: string | null
  instagram_url?: string | null
  youtube_url?: string | null
  thumbnail_path?: string | null
  price?: number | null
  original_price?: number | null
  currency: string
  brand?: string | null
  material?: string | null
  color?: string | null
  sizes?: string[] | Record<string, unknown>[] | null
  fit?: string | null
  occasion?: string | null
  length?: string | null
  pattern?: string | null
  care_instructions?: string | null
  styling_tips?: string | null
  additional_notes?: string | null
  is_featured: boolean
  created_at: string
  updated_at: string
  created_by: string
  shopping_links?: ShoppingLink[]
  media?: LookMedia[]
}

export type SiteSettings = {
  id: string
  site_name: string
  logo_path?: string | null
  homepage_headline: string
  homepage_introduction: string
  about_page_content?: string | null
  instagram_url?: string | null
  youtube_url?: string | null
  footer_content?: string | null
  affiliate_disclosure?: string | null
  ai_disclaimer?: string | null
  updated_at: string
}

export type DashboardSummary = {
  totalLooks: number
  publishedLooks: number
  draftLooks: number
  scheduledLooks: number
  totalShoppingLinks: number
}

export type CategoryDraft = {
  name: string
  slug: string
  description?: string | null
  is_active?: boolean
}

export type LookFormValues = {
  title: string
  slug: string
  short_description: string
  description: string
  category_id: string
  status: LookStatus
  published_at: string
  scheduled_at: string
  price: string
  original_price: string
  currency: string
  brand: string
  material: string
  color: string
  sizes: string
  fit: string
  occasion: string
  length: string
  pattern: string
  care_instructions: string
  styling_tips: string
  additional_notes: string
  instagram_url: string
  youtube_url: string
  is_featured: boolean
  shopping_links: Array<{
    id?: string
    retailer_name: string
    affiliate_url: string
    button_label: string
    displayed_price: string
    display_order: number
    is_active: boolean
  }>
}
