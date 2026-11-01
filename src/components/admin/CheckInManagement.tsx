import React, { useState, useEffect, useCallback } from 'react'
import { Search, QrCode, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Badge } from '../ui/Ornaments'
import { formatDateTime } from '../../lib/utils'
import toast from 'react-hot-toast'
import type { Guest, RSVP, GuestCheckin } from '../../types/database'

interface GuestRecord {
  guest: Guest
  rsvp: RSVP | null
  checkin: GuestCheckin | null
}

export function CheckInManagement() {
  const [search, setSearch] = useState('')
  const [records, setRecords] = useState<GuestRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [checkingIn, setCheckingIn] = useState<string | null>(null)

  const fetchRecords = useCallback(async () => {
    if (!search.trim()) { setRecords([]); return }
    setLoading(true)

    const { data, error } = await supabase
      .from('guests')
      .select(`
        *,
        rsvp:rsvps ( * ),
        checkin:guest_checkins ( * )
      `)
      .ilike('full_name', `%${search}%`)
      .limit(20)

    if (error) {
      toast.error('Search failed')
    } else {
      const mapped = (data ?? []).map((g: any) => ({
        guest: g,
        rsvp: Array.isArray(g.rsvp) ? g.rsvp[0] ?? null : g.rsvp ?? null,
        checkin: Array.isArray(g.checkin) ? g.checkin[0] ?? null : g.checkin ?? null,
      }))
      setRecords(mapped)
    }

    setLoading(false)
  }, [search])

  useEffect(() => {
    const timer = setTimeout(fetchRecords, 400)
    return () => clearTimeout(timer)
  }, [fetchRecords])

  const handleCheckin = async (record: GuestRecord) => {
    if (record.checkin) {
      toast('Guest is already checked in', { icon: 'ℹ️' })
      return
    }

    const attendingCount = record.rsvp?.attendance_status === 'accepted'
      ? (record.rsvp.attending_count ?? 1)
      : 1

    setCheckingIn(record.guest.id)

    const { data, error } = await supabase.functions.invoke('guest-checkin', {
      body: {
        guest_id: record.guest.id,
        attendance_count: attendingCount,
      },
    })

    if (error || data?.error) {
      toast.error(data?.error || error?.message || 'Check-in failed')
    } else {
      toast.success(`${record.guest.full_name} checked in! (${attendingCount} attending)`)
      fetchRecords()
    }

    setCheckingIn(null)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-cormorant text-2xl mb-1" style={{ color: '#292820', fontWeight: 400 }}>
          Guest Check-In
        </h2>
        <p className="font-dm text-sm" style={{ color: 'rgba(41,40,32,0.5)' }}>
          Search for a guest by name or scan their QR code to check them in.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-lg">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(41,40,32,0.35)' }} />
        {loading && (
          <RefreshCw size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin" style={{ color: '#C6A46A' }} />
        )}
        <input
          type="text"
          className="form-input pl-10 pr-10"
          placeholder="Search guest name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="checkin-search"
          style={{ fontSize: '1rem', padding: '0.85rem 1rem 0.85rem 2.5rem' }}
          autoFocus
        />
      </div>

      {/* QR note */}
      <div
        className="flex items-center gap-3 p-4 mb-6"
        style={{ background: 'rgba(198,164,106,0.08)', border: '1px solid rgba(198,164,106,0.2)' }}
      >
        <QrCode size={20} style={{ color: '#C6A46A', flexShrink: 0 }} />
        <p className="font-dm text-sm" style={{ color: 'rgba(41,40,32,0.65)' }}>
          To use QR scanning, scan the QR code on the guest's invitation — it will open their invitation page.
          Then use the search above to find and check them in.
        </p>
      </div>

      {/* Results */}
      {records.length > 0 && (
        <div className="space-y-3">
          {records.map(({ guest, rsvp, checkin }) => {
            const isCheckedIn = !!checkin
            const hasRSVP = !!rsvp
            const accepted = rsvp?.attendance_status === 'accepted'

            return (
              <div
                key={guest.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                style={{
                  background: 'white',
                  border: `1px solid ${isCheckedIn ? 'rgba(85,97,61,0.3)' : 'rgba(198,164,106,0.2)'}`,
                  borderRadius: 2,
                }}
              >
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-cormorant text-lg" style={{ color: '#292820', fontWeight: 500 }}>
                      {guest.full_name}
                    </p>
                    <Badge label={guest.category} color="gold" />
                    {isCheckedIn && <Badge label="✓ Checked In" color="green" />}
                    {!hasRSVP && <Badge label="No RSVP" color="grey" />}
                    {hasRSVP && !accepted && <Badge label="Declined" color="orange" />}
                  </div>

                  <div className="flex gap-4 flex-wrap">
                    <p className="font-dm text-xs" style={{ color: 'rgba(41,40,32,0.5)' }}>
                      Allocation: <strong style={{ color: '#292820' }}>{guest.allocated_guests}</strong>
                    </p>
                    {accepted && (
                      <p className="font-dm text-xs" style={{ color: 'rgba(41,40,32,0.5)' }}>
                        Attending: <strong style={{ color: '#55613D' }}>{rsvp?.attending_count}</strong>
                      </p>
                    )}
                    {isCheckedIn && (
                      <p className="font-dm text-xs" style={{ color: 'rgba(41,40,32,0.5)' }}>
                        Checked in: <strong style={{ color: '#55613D' }}>{formatDateTime(checkin!.checked_in_at)}</strong>
                      </p>
                    )}
                  </div>

                  {!accepted && hasRSVP && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle size={14} style={{ color: '#B85C38' }} />
                      <p className="font-dm text-xs" style={{ color: '#B85C38' }}>
                        Guest has declined their invitation
                      </p>
                    </div>
                  )}
                </div>

                {/* Check-in button */}
                <button
                  onClick={() => handleCheckin({ guest, rsvp, checkin })}
                  disabled={isCheckedIn || checkingIn === guest.id}
                  className="flex items-center gap-2 font-dm text-xs px-5 py-2.5"
                  style={{
                    background: isCheckedIn ? 'rgba(85,97,61,0.1)' : '#303D2D',
                    color: isCheckedIn ? '#55613D' : '#F7F1E7',
                    border: `1px solid ${isCheckedIn ? 'rgba(85,97,61,0.3)' : 'transparent'}`,
                    borderRadius: 2,
                    cursor: isCheckedIn ? 'default' : 'pointer',
                    opacity: checkingIn === guest.id ? 0.7 : 1,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    transition: 'all 0.2s',
                    minWidth: '120px',
                    justifyContent: 'center',
                  }}
                  id={`checkin-${guest.id}`}
                >
                  {checkingIn === guest.id ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : isCheckedIn ? (
                    <><CheckCircle size={13} /> Checked In</>
                  ) : (
                    <>Check In</>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {search && !loading && records.length === 0 && (
        <p className="font-dm text-sm text-center py-8" style={{ color: 'rgba(41,40,32,0.4)' }}>
          No guests found matching "{search}"
        </p>
      )}

      {!search && (
        <p className="font-dm text-sm text-center py-8" style={{ color: 'rgba(41,40,32,0.3)' }}>
          Start typing to search for a guest
        </p>
      )}
    </div>
  )
}
