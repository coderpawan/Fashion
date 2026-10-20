import { supabase, isSupabaseConfigured } from './supabase'
import type { Category, DashboardSummary, Look, SiteSettings } from './types'

const requireSupabase = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Add your VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY values.')
  }

  return supabase
}

const normalizeLookRecord = (record: Record<string, unknown> | null) => {
  if (!record) return null

  const media = Array.isArray((record as { media?: unknown }).media)
    ? (record as { media?: unknown }).media
    : Array.isArray((record as { look_media?: unknown }).look_media)
      ? (record as { look_media?: unknown }).look_media
      : []

  return {
    ...record,
    media,
    shopping_links: Array.isArray((record as { shopping_links?: unknown }).shopping_links)
      ? (record as { shopping_links?: unknown }).shopping_links
      : [],
  }
}

const normalizeSlug = (value: string) => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return slug || 'new-look'
}

const generateUniqueSlug = async (baseSlug: string, excludeId?: string) => {
  const client = requireSupabase()
  const normalized = normalizeSlug(baseSlug)
  let candidate = normalized
  let attempt = 2

  while (true) {
    const { data, error } = await client
      .from('looks')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (!data || data.id === excludeId) {
      return candidate
    }

    candidate = `${normalized}-${attempt}`
    attempt += 1
  }
}

export const auth = {
  signIn: async (email: string, password: string) => {
    const client = requireSupabase()
    const { data, error } = await client.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  signOut: async () => {
    const client = requireSupabase()
    const { error } = await client.auth.signOut()
    if (error) throw error
  },

  getSession: async () => {
    const client = requireSupabase()
    const { data, error } = await client.auth.getSession()
    if (error) throw error
    return data.session
  },

  getUser: async () => {
    const client = requireSupabase()
    const { data, error } = await client.auth.getUser()
    if (error) throw error
    return data.user
  },
}

export const getSiteSettings = async (): Promise<SiteSettings | null> => {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export const getCategories = async (): Promise<Category[]> => {
  if (!isSupabaseConfigured) return []

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []) as Category[]
}

export const getPublishedLooks = async ({
  categoryId,
  search,
  retailer,
  minPrice,
  maxPrice,
  sort,
  limit = 12,
  offset = 0,
}: {
  categoryId?: string
  search?: string
  retailer?: string
  minPrice?: number
  maxPrice?: number
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc'
  limit?: number
  offset?: number
} = {}) => {
  if (!isSupabaseConfigured) return { data: [], count: 0 }

  let query = supabase
    .from('looks')
    .select('*, category:categories(*), shopping_links(*), look_media(*)', { count: 'exact' })
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })

  if (categoryId) query = query.eq('category_id', categoryId)
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,short_description.ilike.%${search}%`)
  if (retailer) query = query.filter('shopping_links.retailer_name', 'ilike', `%${retailer}%`)
  if (minPrice) query = query.gte('price', minPrice)
  if (maxPrice) query = query.lte('price', maxPrice)

  if (sort === 'oldest') {
    query = query.order('published_at', { ascending: true })
  } else if (sort === 'price_asc') {
    query = query.order('price', { ascending: true, nullsFirst: false })
  } else if (sort === 'price_desc') {
    query = query.order('price', { ascending: false, nullsFirst: false })
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1)

  if (error) throw error

  return {
    data: ((data ?? []) as Record<string, unknown>[]).map((item) => normalizeLookRecord(item) as Look),
    count: count ?? 0,
  }
}

export const getFeaturedLook = async (): Promise<Look | null> => {
  if (!isSupabaseConfigured) return null

  const { data, error } = await supabase
    .from('looks')
    .select('*, category:categories(*), shopping_links(*), look_media(*)')
    .eq('status', 'published')
    .eq('is_featured', true)
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return normalizeLookRecord(data as Record<string, unknown> | null) as Look | null
}

export const getLookBySlug = async (slug: string): Promise<Look | null> => {
  if (!isSupabaseConfigured) return null

  const { data, error } = await supabase
    .from('looks')
    .select('*, category:categories(*), shopping_links(*), look_media(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) throw error
  return normalizeLookRecord(data as Record<string, unknown> | null) as Look | null
}

export const getLookById = async (id: string): Promise<Look | null> => {
  if (!isSupabaseConfigured) return null

  const { data, error } = await supabase
    .from('looks')
    .select('*, category:categories(*), shopping_links(*), look_media(*)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return normalizeLookRecord(data as Record<string, unknown> | null) as Look | null
}

export const getAdminDashboardSummary = async (): Promise<DashboardSummary> => {
  if (!isSupabaseConfigured || !supabase) return { totalLooks: 0, publishedLooks: 0, draftLooks: 0, scheduledLooks: 0, totalShoppingLinks: 0 }

  const [{ data: looksData, error: looksError }, { data: linkData, error: linkError }] = await Promise.all([
    supabase.from('looks').select('status'),
    supabase.from('shopping_links').select('id'),
  ])

  if (looksError) throw looksError
  if (linkError) throw linkError

  const looks = looksData ?? []
  return {
    totalLooks: looks.length,
    publishedLooks: looks.filter((look) => look.status === 'published').length,
    draftLooks: looks.filter((look) => look.status === 'draft').length,
    scheduledLooks: looks.filter((look) => look.status === 'scheduled').length,
    totalShoppingLinks: linkData?.length ?? 0,
  }
}

export const getAdminLooks = async () => {
  if (!isSupabaseConfigured) return []

  const { data, error } = await supabase
    .from('looks')
    .select('*, category:categories(*), shopping_links(*), look_media(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return ((data ?? []) as Record<string, unknown>[]).map((item) => normalizeLookRecord(item) as Look)
}

export const saveLook = async (payload: Record<string, unknown>, id?: string) => {
  const client = requireSupabase()

  const { data: userData } = await client.auth.getUser()
  if (!userData.user) throw new Error('Authentication required.')

  const baseSlug = typeof payload.slug === 'string' && payload.slug.trim() ? payload.slug : 'new-look'
  const uniqueSlug = await generateUniqueSlug(baseSlug, id)
  const nextPayload = { ...payload, slug: uniqueSlug }

  if (id) {
    const { data, error } = await client
      .from('looks')
      .update(nextPayload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  try {
    const { data, error } = await client
      .from('looks')
      .insert({ ...nextPayload, created_by: userData.user.id })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (!message.toLowerCase().includes('duplicate') && !message.toLowerCase().includes('23505')) {
      throw error
    }

    const retrySlug = await generateUniqueSlug(baseSlug, id)
    const { data, error: retryError } = await client
      .from('looks')
      .insert({ ...nextPayload, slug: retrySlug, created_by: userData.user.id })
      .select()
      .single()

    if (retryError) throw retryError
    return data
  }
}

export const deleteLook = async (id: string) => {
  const client = requireSupabase()
  const { error } = await client.from('looks').delete().eq('id', id)
  if (error) throw error
}

export const saveCategory = async (category: Partial<Category>) => {
  const client = requireSupabase()
  const { data, error } = await client.from('categories').upsert(category).select().single()
  if (error) throw error
  return data
}

export const saveSiteSettings = async (settings: Partial<SiteSettings>) => {
  const client = requireSupabase()
  const { data, error } = await client.from('site_settings').upsert(settings).select().single()
  if (error) throw error
  return data
}

export const isAdminUser = async () => {
  if (!isSupabaseConfigured || !supabase) return false

  try {
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) return false

    const { data, error } = await supabase.rpc('is_admin_user')
    if (error) return false
    return Boolean(data)
  } catch {
    return false
  }
}
