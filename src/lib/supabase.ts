import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabasePublishableKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export const getStoragePublicUrl = (path?: string | null) => {
  if (!path || !supabaseUrl) return ''
  return `${supabaseUrl}/storage/v1/object/public/${import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ?? 'fashion-media'}/${path}`
}

export const getStorageSignedUrl = async (path: string) => {
  if (!path || !supabase) return ''

  const { data, error } = await supabase.storage
    .from(import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ?? 'fashion-media')
    .createSignedUrl(path, 60 * 60)

  if (error || !data?.signedUrl) return ''

  return data.signedUrl
}
