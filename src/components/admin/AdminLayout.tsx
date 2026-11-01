import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Mail, ClipboardList, QrCode,
  Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { WeddingSeal } from '../ui/Ornaments'

const NAV = [
  { path: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { path: '/admin/guests', icon: Users, label: 'Guests' },
  { path: '/admin/invitations', icon: Mail, label: 'Invitations' },
  { path: '/admin/rsvps', icon: ClipboardList, label: 'RSVPs' },
  { path: '/admin/checkin', icon: QrCode, label: 'Check-In' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
]

interface Props {
  children: React.ReactNode
}

export function AdminLayout({ children }: Props) {
  const location = useLocation()
  const { profile, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/admin/login'
  }

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div
        className="px-6 py-6 flex items-center gap-3"
        style={{ borderBottom: '1px solid rgba(198,164,106,0.12)' }}
      >
        <WeddingSeal size={36} />
        <div>
          <p className="font-cormorant text-sm font-semibold" style={{ color: '#F7F1E7', lineHeight: 1.1 }}>
            E &amp; S Wedding
          </p>
          <p className="font-dm text-xs" style={{ color: 'rgba(198,164,106,0.5)', letterSpacing: '0.1em' }}>
            Admin Portal
          </p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="px-3 py-4 flex-1">
        {NAV.map(({ path, icon: Icon, label }) => {
          const active = path === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(path)
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-sm transition-all"
              style={{
                background: active ? 'rgba(198,164,106,0.12)' : 'transparent',
                color: active ? '#C6A46A' : 'rgba(247,241,231,0.55)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              <Icon size={16} />
              <span>{label}</span>
              {active && <ChevronRight size={14} className="ml-auto" style={{ color: '#C6A46A' }} />}
            </Link>
          )
        })}
      </nav>

      {/* User + sign out */}
      <div
        className="px-6 py-4 mt-auto"
        style={{ borderTop: '1px solid rgba(198,164,106,0.12)' }}
      >
        <div className="mb-3">
          <p className="font-dm text-xs" style={{ color: 'rgba(247,241,231,0.6)' }}>
            {profile?.full_name || 'Administrator'}
          </p>
          <p className="font-dm text-xs" style={{ color: 'rgba(198,164,106,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.65rem' }}>
            {profile?.role || 'admin'}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-xs font-dm transition-colors"
          style={{ color: 'rgba(184,92,56,0.7)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen" style={{ background: '#F7F1E7' }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-56 fixed left-0 top-0 bottom-0 z-30 admin-sidebar"
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="relative admin-sidebar flex flex-col w-56 z-50"
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 px-6 py-4 flex items-center gap-4"
          style={{
            background: 'rgba(247,241,231,0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(198,164,106,0.15)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#292820' }}
          >
            <Menu size={20} />
          </button>

          <div className="flex-1">
            <h2 className="font-cormorant text-xl" style={{ color: '#292820', fontWeight: 400 }}>
              {NAV.find((n) =>
                n.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(n.path)
              )?.label || 'Dashboard'}
            </h2>
          </div>

          <Link
            to="/"
            className="font-dm text-xs"
            style={{ color: '#A88648', textDecoration: 'none', letterSpacing: '0.1em' }}
          >
            ← Public Site
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
