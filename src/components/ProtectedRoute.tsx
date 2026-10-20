import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isAdminUser } from '../lib/data'
import { supabase } from '../lib/supabase'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true

    const checkAccess = async () => {
      try {
        if (!supabase) {
          if (active) setAuthorized(false)
          return
        }

        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          if (active) setAuthorized(false)
          return
        }

        const isAdmin = await isAdminUser()
        if (active) setAuthorized(isAdmin)
      } catch {
        if (active) setAuthorized(false)
      }
    }

    void checkAccess()
    return () => {
      active = false
    }
  }, [location.pathname])

  if (authorized === null) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-zinc-600">Checking admin access…</div>
  }

  if (!authorized) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
