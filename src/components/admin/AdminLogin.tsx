import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { WeddingSeal } from '../ui/Ornaments'
import toast from 'react-hot-toast'

export function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Welcome back!')
    navigate('/admin')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{ background: '#303D2D' }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(198,164,106,0.07) 0%, transparent 65%)' }}
      />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <WeddingSeal size={80} />
          </div>
          <h1 className="font-cormorant text-2xl" style={{ color: '#F7F1E7', fontWeight: 300 }}>
            Administrator Portal
          </h1>
          <p className="font-dm text-xs mt-1" style={{ color: 'rgba(198,164,106,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Elizabeth &amp; Stephen · Royal Wedding
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-8"
          style={{ background: 'rgba(247,241,231,0.04)', border: '1px solid rgba(198,164,106,0.2)' }}
        >
          <div
            style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #C6A46A, transparent)', marginBottom: '2rem' }}
          />

          <div className="mb-5">
            <label className="form-label" style={{ color: 'rgba(198,164,106,0.7)' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input mt-1"
              placeholder="admin@example.com"
              required
              id="admin-email"
              style={{ background: 'rgba(247,241,231,0.06)', borderColor: 'rgba(198,164,106,0.25)', color: '#F7F1E7' }}
            />
          </div>

          <div className="mb-8">
            <label className="form-label" style={{ color: 'rgba(198,164,106,0.7)' }}>
              Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input pr-10"
                placeholder="••••••••"
                required
                id="admin-password"
                style={{ background: 'rgba(247,241,231,0.06)', borderColor: 'rgba(198,164,106,0.25)', color: '#F7F1E7' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(198,164,106,0.5)' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full flex items-center justify-center gap-3"
            id="admin-login-btn"
            style={{ padding: '0.9rem', opacity: loading ? 0.7 : 1 }}
          >
            <LogIn size={16} />
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <div
            style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #C6A46A, transparent)', marginTop: '2rem' }}
          />
        </form>

        <p className="text-center mt-6 font-dm text-xs" style={{ color: 'rgba(247,241,231,0.3)' }}>
          Access restricted to authorised personnel only.
        </p>

        <div className="text-center mt-4">
          <Link to="/" className="font-dm text-xs" style={{ color: 'rgba(198,164,106,0.5)', textDecoration: 'none' }}>
            ← Back to Wedding Website
          </Link>
        </div>
      </div>
    </div>
  )
}
