import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AdminLayout } from '../components/admin/AdminLayout'
import { AdminLogin } from '../components/admin/AdminLogin'
import { AdminOverview } from '../components/admin/AdminOverview'
import { GuestManagement } from '../components/admin/GuestManagement'
import { InvitationManagement } from '../components/admin/InvitationManagement'
import { RSVPManagement } from '../components/admin/RSVPManagement'
import { CheckInManagement } from '../components/admin/CheckInManagement'
import { WeddingSettingsPage } from '../components/admin/WeddingSettings'
import { WeddingSeal } from '../components/ui/Ornaments'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F1E7' }}>
        <div className="text-center">
          <WeddingSeal size={60} className="mx-auto mb-4 seal-pulse" />
          <p className="font-dm text-xs" style={{ color: 'rgba(41,40,32,0.4)', letterSpacing: '0.2em' }}>
            LOADING
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}

export function AdminPage() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route index element={<AdminOverview />} />
                <Route path="guests" element={<GuestManagement />} />
                <Route path="invitations" element={<InvitationManagement />} />
                <Route path="rsvps" element={<RSVPManagement />} />
                <Route path="checkin" element={<CheckInManagement />} />
                <Route path="settings" element={<WeddingSettingsPage />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
