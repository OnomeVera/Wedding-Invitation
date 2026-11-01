import React, { useState, useEffect, useCallback } from 'react'
import { Search, Download, Filter } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Badge } from '../ui/Ornaments'
import { downloadCSV, formatDateTime } from '../../lib/utils'
import type { RSVPWithGuest } from '../../types/database'

export function RSVPManagement() {
  const [rsvps, setRsvps] = useState<RSVPWithGuest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortField, setSortField] = useState('responded_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const fetchRSVPs = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('rsvps')
      .select(`
        *,
        guest:guests ( id, full_name, category, allocated_guests, email, phone ),
        accompanying_guests ( id, full_name )
      `)
      .order(sortField, { ascending: sortDir === 'asc' })

    if (!error) setRsvps((data as RSVPWithGuest[]) ?? [])
    setLoading(false)
  }, [sortField, sortDir])

  useEffect(() => { fetchRSVPs() }, [fetchRSVPs])

  const filtered = rsvps.filter((r) => {
    const matchSearch = !search ||
      r.guest?.full_name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || r.attendance_status === statusFilter
    return matchSearch && matchStatus
  })

  const exportCSV = () => {
    downloadCSV(
      filtered.map((r) => ({
        name: r.guest?.full_name ?? '',
        category: r.guest?.category ?? '',
        allocation: r.guest?.allocated_guests ?? '',
        status: r.attendance_status,
        attending: r.attending_count,
        dietary: r.dietary_requirements ?? '',
        special: r.special_requests ?? '',
        message: r.personal_message ?? '',
        responded: formatDateTime(r.responded_at),
        companions: (r.accompanying_guests ?? []).map((g) => g.full_name).join('; '),
      })),
      'rsvp-export.csv'
    )
  }

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ field }: { field: string }) =>
    sortField === field
      ? <span style={{ color: '#C6A46A' }}>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
      : null

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <h2 className="font-cormorant text-2xl flex-1" style={{ color: '#292820', fontWeight: 400 }}>
          RSVP Management
        </h2>
        <button onClick={exportCSV} className="btn-gold flex items-center gap-2" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }}>
          <Download size={12} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(41,40,32,0.35)' }} />
          <input
            type="text"
            className="form-input pl-9"
            placeholder="Search guests…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-input"
          style={{ minWidth: '140px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Responses</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper" style={{ background: 'white', border: '1px solid rgba(198,164,106,0.2)', borderRadius: 2 }}>
        <table className="w-full text-sm font-dm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(198,164,106,0.15)', background: 'rgba(247,241,231,0.6)' }}>
              {[
                { label: 'Guest Name', field: 'guest_id' },
                { label: 'Category', field: null },
                { label: 'Allocation', field: null },
                { label: 'Attending', field: 'attending_count' },
                { label: 'Status', field: 'attendance_status' },
                { label: 'Response Date', field: 'responded_at' },
              ].map(({ label, field }) => (
                <th
                  key={label}
                  className="px-4 py-3 text-left select-none"
                  style={{
                    fontSize: '0.65rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'rgba(41,40,32,0.45)',
                    fontWeight: 500,
                    cursor: field ? 'pointer' : 'default',
                  }}
                  onClick={() => field && toggleSort(field)}
                >
                  {label}{field && <SortIcon field={field} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 rounded animate-pulse" style={{ background: 'rgba(0,0,0,0.06)', width: '80px' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center" style={{ color: 'rgba(41,40,32,0.35)' }}>
                  No RSVP responses yet
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: '#292820' }}>{r.guest?.full_name}</p>
                    {r.accompanying_guests && r.accompanying_guests.length > 0 && (
                      <p style={{ color: 'rgba(41,40,32,0.4)', fontSize: '0.72rem' }}>
                        + {r.accompanying_guests.map((g) => g.full_name).join(', ')}
                      </p>
                    )}
                    {r.dietary_requirements && (
                      <p style={{ color: '#A88648', fontSize: '0.7rem' }}>
                        🍽 {r.dietary_requirements}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={r.guest?.category ?? '—'} color="gold" />
                  </td>
                  <td className="px-4 py-3" style={{ color: '#292820' }}>
                    {r.guest?.allocated_guests ?? '—'}
                  </td>
                  <td className="px-4 py-3" style={{ color: '#292820' }}>
                    {r.attendance_status === 'accepted' ? r.attending_count : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={r.attendance_status === 'accepted' ? 'Accepted' : 'Declined'}
                      color={r.attendance_status === 'accepted' ? 'green' : 'orange'}
                    />
                  </td>
                  <td className="px-4 py-3" style={{ color: 'rgba(41,40,32,0.55)', fontSize: '0.8rem' }}>
                    {formatDateTime(r.responded_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <p className="font-dm text-xs" style={{ color: 'rgba(41,40,32,0.4)' }}>
            {filtered.length} responses · {filtered.filter((r) => r.attendance_status === 'accepted').reduce((s, r) => s + r.attending_count, 0)} attending
          </p>
        </div>
      </div>
    </div>
  )
}
