/*
 * Copyright (c) 2026. All rights reserved.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { BookOpen, Loader2, Building2, User, Upload } from 'lucide-react'
import { authApi, uploadApi } from '@/api/services'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  companyName: z.string().min(2, 'Company name required'),
  companyDomain: z.string().optional(),
  companyEmail: z.string().email().optional().or(z.literal('')),
  username:  z.string().min(3, 'Min 3 characters'),
  firstName: z.string().optional(),
  lastName:  z.string().optional(),
  email:     z.string().email('Valid email required'),
  password:  z.string().min(8, 'Min 8 characters'),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      let companyLogoUrl = ''
      if (logoFile) {
        const uploadRes = await uploadApi.uploadFile(logoFile)
        companyLogoUrl = uploadRes.data.url
      }

      const payload = { ...data, companyLogoUrl }
      const res = await authApi.register(payload as Record<string, string>)
      if (res.success) {
        setAuth(res.data.accessToken, res.data.refreshToken, res.data.user)
        toast.success('Enterprise registered successfully!')
        navigate('/dashboard')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-md">
            <BookOpen size={20} className="text-white" />
          </div>
          <span className="text-2xl font-semibold text-slate-900">CatalogueHub</span>
        </div>

        <div className="card p-8">
          <h1 className="text-lg font-semibold text-slate-900 mb-1">Register your company</h1>
          <p className="text-sm text-slate-500 mb-6">Set up your enterprise account to get started</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Company section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={14} className="text-brand-600" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 form-group">
                  <label className="label">Company Name *</label>
                  <input {...register('companyName')} className={`input ${errors.companyName ? 'input-error' : ''}`} placeholder="Acme Corp" />
                  {errors.companyName && <p className="field-error">{errors.companyName.message}</p>}
                </div>
                <div className="form-group">
                  <label className="label">Domain</label>
                  <input {...register('companyDomain')} className="input" placeholder="acme.com" />
                </div>
                <div className="form-group">
                  <label className="label">Company Email</label>
                  <input {...register('companyEmail')} type="email" className="input" placeholder="info@acme.com" />
                </div>
                <div className="col-span-2 form-group">
                  <label className="label">Company Logo</label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer flex items-center justify-center w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-500 hover:bg-brand-50 transition-colors">
                      {logoFile ? (
                        <img src={URL.createObjectURL(logoFile)} alt="Logo Preview" className="w-full h-full object-contain rounded-xl p-1" />
                      ) : (
                        <div className="flex flex-col items-center text-slate-400">
                          <Upload size={20} className="mb-1" />
                          <span className="text-[10px] font-medium uppercase tracking-wider">Upload</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setLogoFile(e.target.files[0])
                          }
                        }} 
                      />
                    </label>
                    <div className="text-sm text-slate-500">
                      <p className="font-medium text-slate-700">Logo Image</p>
                      <p>PNG, JPG up to 5MB.</p>
                      <p>Will be used in your PDF catalogues.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Owner account */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User size={14} className="text-brand-600" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Owner Account</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="label">First Name</label>
                  <input {...register('firstName')} className="input" placeholder="John" />
                </div>
                <div className="form-group">
                  <label className="label">Last Name</label>
                  <input {...register('lastName')} className="input" placeholder="Doe" />
                </div>
                <div className="col-span-2 form-group">
                  <label className="label">Username *</label>
                  <input {...register('username')} className={`input ${errors.username ? 'input-error' : ''}`} placeholder="johndoe" />
                  {errors.username && <p className="field-error">{errors.username.message}</p>}
                </div>
                <div className="col-span-2 form-group">
                  <label className="label">Email *</label>
                  <input {...register('email')} type="email" className={`input ${errors.email ? 'input-error' : ''}`} placeholder="john@acme.com" />
                  {errors.email && <p className="field-error">{errors.email.message}</p>}
                </div>
                <div className="col-span-2 form-group">
                  <label className="label">Password *</label>
                  <input {...register('password')} type="password" className={`input ${errors.password ? 'input-error' : ''}`} placeholder="Min 8 characters" />
                  {errors.password && <p className="field-error">{errors.password.message}</p>}
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Create Enterprise Account
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
