import React, { useState, useEffect, useCallback } from 'react'
import {
  Plus, Search, Edit2, Trash2, Mail, Link2, MessageCircle, Upload,
  RefreshCw, ChevronDown, Filter, Download, AtSign
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Ornaments'
import { buildInvitationUrl, buildWhatsAppUrl, buildWhatsAppMessage, downloadCSV, parseCSV } from '../../lib/utils'
import toast from 'react-hot-toast'
import type { Guest } from '../../types/database'

const CATEGORIES = ['Family', 'Friends', 'Work Colleagues', 'Church', 'VIP', 'General']

const STATUS_MAP: Record<string, { label: string; color: 'gold' | 'green' | 'orange' | 'red' | 'grey' }> = {
  not_sent:  { label: 'Not Sent', color: 'grey' },
  sent:      { label: 'Sent', color: 'gold' },
  viewed:    { label: 'Viewed', color: 'green' },
  revoked:   { label: 'Revoked', color: 'red' },
}

interface GuestWithToken extends Guest {
  token?: string | null
}

export function GuestManagement() {
  const [guests, setGuests] = useState<GuestWithToken[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editGuest, setEditGuest] = useState<Guest | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [generating, setGenerating] = useState<string | null>(null)
  const [emailing, setEmailing] = useState<string | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)

  // Form state
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', category: 'General', allocated_guests: 1,
  })

  const fetchGuests = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('guests')
      .select(`
        *,
        invitation_tokens ( id, token_hash, revoked_at )
      `)
      .order('full_name', { ascending: true })

    if (error) {
      toast.error('Failed to load guests')
    } else {
      // Attach token field
      const enriched = (data ?? []).map((g: any) => {
        const tokens = g.invitation_tokens ?? []
        const activeToken = tokens.find((t: any) => !t.revoked_at)
        return { ...g, token: activeToken?.token_hash ?? null, invitation_tokens: undefined }
      })
      setGuests(enriched)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchGuests() }, [fetchGuests])

  const filtered = guests.filter((g) => {
    const matchSearch = !search ||
      g.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (g.email ?? '').toLowerCase().includes(search.toLowerCase())
    const matchCat = !categoryFilter || g.category === categoryFilter
    return matchSearch && matchCat
  })

  const openAdd = () => {
    setForm({ full_name: '', email: '', phone: '', category: 'General', allocated_guests: 1 })
    setShowAdd(true)
  }

  const openEdit = (g: Guest) => {
    setForm({
      full_name: g.full_name,
      email: g.email ?? '',
      phone: g.phone_e164 ?? '',
      category: g.category,
      allocated_guests: g.allocated_guests,
    })
    setEditGuest(g)
  }

  const saveGuest = async () => {
  if (!form.full_name.trim()) {
    toast.error('Name is required')
    return
  }

  if (!form.phone.trim()) {
    toast.error('Phone number is required')
    return
  }

  if (form.allocated_guests < 1) {
    toast.error('Must allocate at least 1 guest')
    return
  }


    const payload = {
      full_name: form.full_name.trim(),
      email: form.email || null,
      phone_e164: form.phone.trim(),
      category: form.category,
      allocated_guests: Number(form.allocated_guests),
    }

    if (editGuest) {
      const { error } = await supabase.from('guests').update(payload).eq('id', editGuest.id)
      if (error) { toast.error(error.message); return }
      toast.success('Guest updated')
      setEditGuest(null)
    } else {
      const { error } = await supabase.from('guests').insert(payload)
      if (error) { toast.error(error.message); return }
      toast.success('Guest added')
      setShowAdd(false)
    }

    fetchGuests()
  }

  const deleteGuest = async (id: string) => {
    if (!confirm('Delete this guest? This will also remove their invitation and RSVP.')) return
    setDeleting(id)
    const { error } = await supabase.from('guests').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Guest deleted'); fetchGuests() }
    setDeleting(null)
  }

  const generateInvitation = async (guest: GuestWithToken) => {
    setGenerating(guest.id)
    const { data, error } = await supabase.functions.invoke('create-invitation', {
      body: { guest_id: guest.id },
    })
    if (error || data?.error) {
      toast.error(data?.error || error?.message || 'Failed to generate invitation')
    } else {
      toast.success('Invitation generated!')
      fetchGuests()
    }
    setGenerating(null)
  }

  const revokeInvitation = async (guest: GuestWithToken) => {
    if (!guest.token) return
    if (!confirm('Revoke this invitation? The guest will no longer be able to use their link.')) return
    const { data, error } = await supabase.functions.invoke('revoke-invitation', {
      body: { guest_id: guest.id },
    })
    if (error || data?.error) toast.error(data?.error || 'Failed to revoke')
    else { toast.success('Invitation revoked'); fetchGuests() }
  }

  const copyLink = (token: string) => {
    const url = buildInvitationUrl(token)
    navigator.clipboard.writeText(url).then(() => toast.success('Link copied!'))
  }

  const shareWhatsApp = (guest: GuestWithToken) => {
    if (!guest.token || !guest.phone_e164) {
      toast.error('Guest needs a phone number and active invitation')
      return
    }
    const url = buildInvitationUrl(guest.token)
    const msg = buildWhatsAppMessage(guest.full_name, url)
    window.open(buildWhatsAppUrl(guest.phone_e164, msg), '_blank')
  }

  const sendEmail = async (guest: GuestWithToken) => {
    if (!guest.token) { toast.error('Generate an invitation first'); return }
    if (!guest.email) { toast.error('Guest has no email address'); return }
    setEmailing(guest.id)
    const { data, error } = await supabase.functions.invoke('send-invitation-email', {
      body: { guest_id: guest.id, token: guest.token },
    })
    if (error || data?.error) {
      toast.error(data?.error || error?.message || 'Failed to send email')
    } else {
      toast.success(`Invitation email sent to ${guest.email}`)
    }
    setEmailing(null)
  }

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const rows = parseCSV(text)
    if (rows.length === 0) { toast.error('No valid rows found'); return }

    const toInsert = rows.map((r) => ({
      full_name: r['full_name'] || r['name'] || '',
      email: r['email'] || null,
      phone_e164: r['phone']?.trim() || '',
      category: r['category'] || 'General',
      allocated_guests: Number(r['allocated_guests'] || r['allocation'] || 1),
    })).filter((r) => r.full_name)

    const { error } = await supabase.from('guests').insert(toInsert)
    if (error) toast.error(error.message)
    else { toast.success(`Imported ${toInsert.length} guests`); fetchGuests() }
    e.target.value = ''
  }

  const exportCSV = () => {
    downloadCSV(
      filtered.map((g) => ({
        name: g.full_name,
        email: g.email ?? '',
        phone: g.phone_e164 ?? '',
        category: g.category,
        allocation: g.allocated_guests,
        status: g.invitation_status,
        invitation_link: g.token ? buildInvitationUrl(g.token) : '',
      })),
      'guests-export.csv'
    )
  }

  const renderGuestFormFields = () => (
    <div className="space-y-4">
      <div>
        <label className="form-label">Full Name *</label>
        <input className="form-input mt-1" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Jane Smith" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Email</label>
          <input type="email" className="form-input mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
        </div>
        <div>
          <label className="form-label">Phone (with country code)</label>
          <input type="tel" className="form-input mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234801234567" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Category</label>
          <select className="form-input mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Allocated Guests</label>
          <input type="number" min={1} max={20} className="form-input mt-1" value={form.allocated_guests} onChange={(e) => setForm({ ...form, allocated_guests: Number(e.target.value) })} />
        </div>
      </div>
      <button onClick={saveGuest} className="btn-forest w-full mt-2">
        {editGuest ? 'Save Changes' : 'Add Guest'}
      </button>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <h2 className="font-cormorant text-2xl flex-1" style={{ color: '#292820', fontWeight: 400 }}>
          Guest Management
        </h2>
        <div className="flex gap-2 flex-wrap">
          <input
            type="file"
            accept=".csv"
            ref={fileRef}
            onChange={handleCSVImport}
            className="hidden"
          />
          <button onClick={() => fileRef.current?.click()} className="btn-gold flex items-center gap-2" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }}>
            <Upload size={12} /> Import CSV
          </button>
          <button onClick={exportCSV} className="btn-gold flex items-center gap-2" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }}>
            <Download size={12} /> Export
          </button>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2" id="add-guest-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }}>
            <Plus size={12} /> Add Guest
          </button>
        </div>
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
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper" style={{ background: 'white', border: '1px solid rgba(198,164,106,0.2)', borderRadius: 2 }}>
        <table className="w-full text-sm font-dm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(198,164,106,0.15)', background: 'rgba(247,241,231,0.6)' }}>
              {['Name', 'Category', 'Allocation', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left" style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(41,40,32,0.45)', fontWeight: 500 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 rounded animate-pulse" style={{ background: 'rgba(0,0,0,0.06)', width: j === 0 ? '150px' : '80px' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center" style={{ color: 'rgba(41,40,32,0.35)' }}>
                  No guests found
                </td>
              </tr>
            ) : (
              filtered.map((g) => {
                const st = STATUS_MAP[g.invitation_status] ?? STATUS_MAP.not_sent
                return (
                  <tr key={g.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }} className="hover:bg-amber-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium" style={{ color: '#292820' }}>{g.full_name}</p>
                      {g.email && <p style={{ color: 'rgba(41,40,32,0.4)', fontSize: '0.75rem' }}>{g.email}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={g.category} color="gold" />
                    </td>
                    <td className="px-4 py-3" style={{ color: '#292820' }}>
                      {g.allocated_guests}
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={st.label} color={st.color} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {/* Edit */}
                        <button
                          onClick={() => openEdit(g)}
                          className="p-1.5 rounded-sm transition-colors hover:bg-amber-50"
                          title="Edit guest"
                          style={{ color: '#A88648', border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Generate / Revoke invitation */}
                        {g.token ? (
                          <>
                            <button
                              onClick={() => copyLink(g.token!)}
                              className="p-1.5 rounded-sm"
                              title="Copy invitation link"
                              style={{ color: '#55613D', border: 'none', background: 'none', cursor: 'pointer' }}
                            >
                              <Link2 size={13} />
                            </button>
                            <button
                              onClick={() => shareWhatsApp(g)}
                              className="p-1.5 rounded-sm"
                              title={g.phone_e164 ? 'Send via WhatsApp' : 'No phone number'}
                              style={{ color: g.phone_e164 ? '#25D366' : 'rgba(41,40,32,0.2)', border: 'none', background: 'none', cursor: g.phone_e164 ? 'pointer' : 'not-allowed' }}
                            >
                              <MessageCircle size={13} />
                            </button>
                            <button
                              onClick={() => sendEmail(g)}
                              disabled={emailing === g.id}
                              className="p-1.5 rounded-sm"
                              title={g.email ? 'Send via Email' : 'No email address'}
                              style={{ color: g.email ? '#A88648' : 'rgba(41,40,32,0.2)', border: 'none', background: 'none', cursor: g.email ? 'pointer' : 'not-allowed' }}
                            >
                              {emailing === g.id
                                ? <RefreshCw size={13} className="animate-spin" />
                                : <AtSign size={13} />}
                            </button>
                            <button
                              onClick={() => revokeInvitation(g)}
                              className="p-1.5 rounded-sm"
                              title="Revoke invitation"
                              style={{ color: '#B85C38', border: 'none', background: 'none', cursor: 'pointer' }}
                            >
                              <Mail size={13} style={{ opacity: 0.5 }} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => generateInvitation(g)}
                            disabled={generating === g.id}
                            className="p-1.5 rounded-sm"
                            title="Generate invitation"
                            style={{ color: '#C6A46A', border: 'none', background: 'none', cursor: 'pointer' }}
                          >
                            {generating === g.id
                              ? <RefreshCw size={13} className="animate-spin" />
                              : <Mail size={13} />}
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => deleteGuest(g.id)}
                          disabled={deleting === g.id}
                          className="p-1.5 rounded-sm"
                          title="Delete guest"
                          style={{ color: '#B85C38', border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                          {deleting === g.id
                            ? <RefreshCw size={13} className="animate-spin" />
                            : <Trash2 size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <p className="font-dm text-xs" style={{ color: 'rgba(41,40,32,0.4)' }}>
            Showing {filtered.length} of {guests.length} guests
          </p>
        </div>
      </div>

      {/* Add Guest Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Guest">
        {renderGuestFormFields()}
      </Modal>

      {/* Edit Guest Modal */}
      <Modal isOpen={!!editGuest} onClose={() => setEditGuest(null)} title="Edit Guest">
        {renderGuestFormFields()}
      </Modal>
    </div>
  )
}
