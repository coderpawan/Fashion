import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, LockKeyhole } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { auth, isAdminUser } from '../lib/data'
import { supabase } from '../lib/supabase'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must contain at least 6 characters.'),
})

export function AdminLoginPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(loginSchema) })

  useEffect(() => {
    void (async () => {
      if (!supabase) return

      const { data } = await supabase.auth.getSession()
      if (data.session) {
        const admin = await isAdminUser()
        if (admin) navigate('/admin/dashboard', { replace: true })
      }
    })()
  }, [navigate])

  const onSubmit = async (values: { email: string; password: string }) => {
    try {
      const { user } = await auth.signIn(values.email, values.password)
      if (!user) {
        toast.error('Login failed.')
        return
      }

      const admin = await isAdminUser()
      if (!admin) {
        toast.error('This account is not authorized for the admin dashboard.')
        await auth.signOut()
        return
      }

      toast.success('Welcome back, Ankita.')
      navigate('/admin/dashboard', { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign in.')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-[#f8f4f1] px-4 py-10">
      <div className="w-full max-w-md rounded-[30px] border border-[#f0e3df] bg-white p-6 shadow-[0_20px_40px_rgba(62,38,32,0.06)]">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-[#a95b76]">Admin access</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#2d221f]">Sign in</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-[#554640]">Email</label>
            <div className="flex items-center gap-3 rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-3">
              <Mail size={16} className="text-[#7d635d]" />
              <input {...register('email')} className="w-full bg-transparent px-2 py-3 outline-none" placeholder="admin@example.com" />
            </div>
            {errors.email && <p className="mt-2 text-sm text-red-600">{String(errors.email.message)}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm text-[#554640]">Password</label>
            <div className="flex items-center gap-3 rounded-2xl border border-[#eaded9] bg-[#fffaf7] px-3">
              <LockKeyhole size={16} className="text-[#7d635d]" />
              <input type="password" {...register('password')} className="w-full bg-transparent px-2 py-3 outline-none" placeholder="••••••••" />
            </div>
            {errors.password && <p className="mt-2 text-sm text-red-600">{String(errors.password.message)}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-[#2a1d1e] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#492e30] disabled:opacity-60">
            {isSubmitting ? 'Signing in...' : 'Login to dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}
