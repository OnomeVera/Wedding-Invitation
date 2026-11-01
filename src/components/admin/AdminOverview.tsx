import React, { useEffect, useState } from 'react'
import { Users, CheckCircle, XCircle, Clock, UserCheck, QrCode, TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Stats {
  totalGuests: number
  confirmed: number
  declined: number
  pending: number
  totalAttendees: number
  checkedIn: number
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  iconBg,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  color: string
  iconBg: string
}) {
  return (
    <div className="stat-card" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-dm text-xs mb-1" style={{ color: 'rgba(41,40,32,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {label}
          </p>
          <p className="font-cormorant" style={{ fontSize: '2.2rem', lineHeight: 1, color: '#292820', fontWeight: 400 }}>
            {value}
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      </div>
    </div>
  )
}

export function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    totalGuests: 0,
    confirmed: 0,
    declined: 0,
    pending: 0,
    totalAttendees: 0,
    checkedIn: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const [guestsRes, rsvpsRes, checkinRes] = await Promise.all([
        supabase.from('guests').select('id', { count: 'exact', head: true }),
        supabase.from('rsvps').select('attendance_status, attending_count'),
        supabase.from('guest_checkins').select('attendance_count'),
      ])

      const total = guestsRes.count ?? 0
      const rsvps = rsvpsRes.data ?? []
      const confirmed = rsvps.filter((r) => r.attendance_status === 'accepted').length
      const declined = rsvps.filter((r) => r.attendance_status === 'declined').length
      const pending = total - rsvps.length
      const totalAttendees = rsvps
        .filter((r) => r.attendance_status === 'accepted')
        .reduce((sum, r) => sum + (r.attending_count || 0), 0)
      const checkedIn = (checkinRes.data ?? []).reduce((sum, c) => sum + (c.attendance_count || 0), 0)

      setStats({ totalGuests: total, confirmed, declined, pending, totalAttendees, checkedIn })
      setLoading(false)
    }

    fetchStats()
  }, [])

  // Acceptance rate
  const responseRate = stats.totalGuests > 0
    ? Math.round(((stats.confirmed + stats.declined) / stats.totalGuests) * 100)
    : 0

  const statCards = [
    { icon: Users, label: 'Total Invited', value: stats.totalGuests, color: '#C6A46A', iconBg: 'rgba(198,164,106,0.12)' },
    { icon: CheckCircle, label: 'Accepted', value: stats.confirmed, color: '#55613D', iconBg: 'rgba(85,97,61,0.12)' },
    { icon: XCircle, label: 'Declined', value: stats.declined, color: '#B85C38', iconBg: 'rgba(184,92,56,0.1)' },
    { icon: Clock, label: 'Pending', value: stats.pending, color: '#A88648', iconBg: 'rgba(168,134,72,0.12)' },
    { icon: UserCheck, label: 'Total Attendees', value: stats.totalAttendees, color: '#303D2D', iconBg: 'rgba(48,61,45,0.1)' },
    { icon: QrCode, label: 'Checked In', value: stats.checkedIn, color: '#C6A46A', iconBg: 'rgba(198,164,106,0.12)' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-cormorant text-3xl mb-1" style={{ color: '#292820', fontWeight: 400 }}>
          Wedding Dashboard
        </h1>
        <p className="font-dm text-sm" style={{ color: 'rgba(41,40,32,0.5)' }}>
          Elizabeth Meruwoma &amp; Stephen Ukpong · 13 February 2027
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-4 w-24 rounded mb-4" style={{ background: 'rgba(0,0,0,0.06)' }} />
              <div className="h-8 w-12 rounded" style={{ background: 'rgba(0,0,0,0.06)' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

      {/* Response Rate Bar */}
      <div
        className="p-6 mb-6"
        style={{ background: 'white', border: '1px solid rgba(198,164,106,0.2)', borderRadius: 2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="font-dm text-xs" style={{ color: 'rgba(41,40,32,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Response Rate
          </p>
          <p className="font-cormorant text-xl" style={{ color: '#292820' }}>
            {responseRate}%
          </p>
        </div>
        <div className="h-2 rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }}>
          <div
            className="h-2 rounded-full transition-all duration-1000"
            style={{
              width: `${responseRate}%`,
              background: 'linear-gradient(90deg, #55613D, #C6A46A)',
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <p className="font-dm text-xs" style={{ color: '#55613D' }}>{stats.confirmed} accepted</p>
          <p className="font-dm text-xs" style={{ color: '#B85C38' }}>{stats.declined} declined</p>
          <p className="font-dm text-xs" style={{ color: '#A88648' }}>{stats.pending} pending</p>
        </div>
      </div>

      {/* Attendance bar */}
      {stats.totalAttendees > 0 && (
        <div
          className="p-6"
          style={{ background: 'white', border: '1px solid rgba(198,164,106,0.2)', borderRadius: 2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-dm text-xs" style={{ color: 'rgba(41,40,32,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Check-in Progress
            </p>
            <p className="font-cormorant text-xl" style={{ color: '#292820' }}>
              {stats.checkedIn} / {stats.totalAttendees}
            </p>
          </div>
          <div className="h-2 rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }}>
            <div
              className="h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${stats.totalAttendees > 0 ? (stats.checkedIn / stats.totalAttendees) * 100 : 0}%`,
                background: '#C6A46A',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
