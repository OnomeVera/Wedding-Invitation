import React, { useState, useEffect } from 'react'
import { Link2, MessageCircle, Mail, Copy, RefreshCw, Send, AtSign } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Badge } from '../ui/Ornaments'
import { buildInvitationUrl, buildWhatsAppUrl, buildWhatsAppMessage } from '../../lib/utils'
import toast from 'react-hot-toast'
import type { Guest } from '../../types/database'

interface InviteRecord {
  guest: Guest
  token: string | null
  revoked_at: string | null
}

export function InvitationManagement() {
  const [records, setRecords] = useState<InviteRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [emailing, setEmailing] = useState<string | null>(null)

  const fetchRecords = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('guests')
      .select('*, invitation_tokens ( token_hash, revoked_at )')
      .order('full_name', { ascending: true })

    if (!error && data) {
      const mapped = data.map((g: any) => {
        const tokens: any[] = g.invitation_tokens ?? []
        const active = tokens.find((t) => !t.revoked_at)
        return {
          guest: g,
          token: active?.token_hash ?? null,
          revoked_at: active ? null : (tokens[0]?.revoked_at ?? null),
        }
      })
      setRecords(mapped)
    }
    setLoading(false)
  }

  useEffect(() => { fetchRecords() }, [])

  const generateAll = async () => {
    const noToken = records.filter((r) => !r.token)
    if (noToken.length === 0) { toast('All guests already have invitations'); return }

    toast(`Generating ${noToken.length} invitations…`)
    for (const r of noToken) {
      await supabase.functions.invoke('create-invitation', { body: { guest_id: r.guest.id } })
    }
    toast.success('All invitations generated!')
    fetchRecords()
  }

  const generate = async (guestId: string) => {
    setGenerating(guestId)
    const { data, error } = await supabase.functions.invoke('create-invitation', { body: { guest_id: guestId } })
    if (error || data?.error) toast.error(data?.error || 'Failed')
    else { toast.success('Invitation generated'); fetchRecords() }
    setGenerating(null)
  }

  const copy = (token: string) => {
    navigator.clipboard.writeText(buildInvitationUrl(token))
      .then(() => toast.success('Link copied!'))
  }

  const shareWhatsApp = (r: InviteRecord) => {
    if (!r.token || !r.guest.phone) {
      toast.error('Guest needs a phone number and active invitation')
      return
    }
    const url = buildInvitationUrl(r.token)
    const msg = buildWhatsAppMessage(r.guest.full_name, url)
    window.open(buildWhatsAppUrl(r.guest.phone, msg), '_blank')
  }

  const sendEmail = async (r: InviteRecord) => {
    if (!r.token) { toast.error('Generate an invitation first'); return }
    if (!r.guest.email) { toast.error('Guest has no email address on record'); return }

    setEmailing(r.guest.id)
    const { data, error } = await supabase.functions.invoke('send-invitation-email', {
      body: { guest_id: r.guest.id, token: r.token },
    })
    if (error || data?.error) {
      toast.error(data?.error || error?.message || 'Failed to send email')
    } else {
      toast.success(`Invitation email sent to ${r.guest.email}`)
    }
    setEmailing(null)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <h2 className="font-cormorant text-2xl flex-1" style={{ color: '#292820', fontWeight: 400 }}>
          Invitation Management
        </h2>
        <button
          onClick={generateAll}
          className="btn-forest flex items-center gap-2"
          style={{ padding: '0.5rem 1.2rem', fontSize: '0.7rem' }}
          id="generate-all-invitations-btn"
        >
          <Mail size={12} /> Generate All Missing
        </button>
      </div>

      {/* Info banner */}
      <div
        className="flex items-start gap-3 p-4 mb-5 rounded-sm"
        style={{ background: 'rgba(48,61,45,0.06)', border: '1px solid rgba(48,61,45,0.15)' }}
      >
        <Send size={14} style={{ color: '#55613D', marginTop: 2, flexShrink: 0 }} />
        <p className="font-dm text-xs" style={{ color: 'rgba(41,40,32,0.6)', lineHeight: 1.6 }}>
          Only the <strong style={{ color: '#55613D' }}>admin</strong> can send invitations. Each invitation link is
          personalised and non-transferable — guests cannot forward or re-share their link.
        </p>
      </div>

      <div className="table-wrapper" style={{ background: 'white', border: '1px solid rgba(198,164,106,0.2)', borderRadius: 2 }}>
        <table className="w-full text-sm font-dm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(198,164,106,0.15)', background: 'rgba(247,241,231,0.6)' }}>
              {['Guest', 'Category', 'Status', 'Invitation URL', 'Send To Guest'].map((h) => (
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
                      <div className="h-4 rounded animate-pulse" style={{ background: 'rgba(0,0,0,0.06)', width: '80px' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center" style={{ color: 'rgba(41,40,32,0.35)' }}>
                  No guests yet
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.guest.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }} className="hover:bg-amber-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: '#292820' }}>{r.guest.full_name}</p>
                    <div className="flex gap-2 mt-0.5 flex-wrap">
                      {r.guest.phone && (
                        <p style={{ color: 'rgba(41,40,32,0.4)', fontSize: '0.72rem' }}>{r.guest.phone}</p>
                      )}
                      {r.guest.email && (
                        <p style={{ color: 'rgba(41,40,32,0.4)', fontSize: '0.72rem' }}>{r.guest.email}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={r.guest.category} color="gold" />
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={r.token ? 'Active' : r.revoked_at ? 'Revoked' : 'Not Generated'}
                      color={r.token ? 'green' : r.revoked_at ? 'red' : 'grey'}
                    />
                  </td>
                  <td className="px-4 py-3" style={{ maxWidth: '220px' }}>
                    {r.token ? (
                      <div className="flex items-center gap-2">
                        <code
                          className="text-xs block overflow-hidden flex-1"
                          style={{
                            color: '#55613D',
                            background: 'rgba(85,97,61,0.08)',
                            padding: '2px 6px',
                            borderRadius: 2,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {buildInvitationUrl(r.token)}
                        </code>
                        <button
                          onClick={() => copy(r.token!)}
                          className="p-1.5 rounded-sm flex-shrink-0"
                          title="Copy link"
                          style={{ color: '#55613D', border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'rgba(41,40,32,0.3)', fontSize: '0.75rem' }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 items-center">
                      {r.token ? (
                        <>
                          {/* Send via WhatsApp */}
                          <button
                            onClick={() => shareWhatsApp(r)}
                            className="p-1.5 rounded-sm"
                            title={r.guest.phone ? 'Send via WhatsApp' : 'No phone number on record'}
                            style={{
                              color: r.guest.phone ? '#25D366' : 'rgba(41,40,32,0.2)',
                              border: 'none', background: 'none',
                              cursor: r.guest.phone ? 'pointer' : 'not-allowed',
                            }}
                          >
                            <MessageCircle size={14} />
                          </button>

                          {/* Send via Email */}
                          <button
                            onClick={() => sendEmail(r)}
                            disabled={emailing === r.guest.id}
                            className="p-1.5 rounded-sm"
                            title={r.guest.email ? 'Send via Email' : 'No email address on record'}
                            style={{
                              color: r.guest.email ? '#A88648' : 'rgba(41,40,32,0.2)',
                              border: 'none', background: 'none',
                              cursor: r.guest.email ? 'pointer' : 'not-allowed',
                            }}
                          >
                            {emailing === r.guest.id
                              ? <RefreshCw size={14} className="animate-spin" />
                              : <AtSign size={14} />}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => generate(r.guest.id)}
                          disabled={generating === r.guest.id}
                          className="p-1.5 rounded-sm"
                          title="Generate invitation"
                          style={{ color: '#C6A46A', border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                          {generating === r.guest.id
                            ? <RefreshCw size={14} className="animate-spin" />
                            : <Mail size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
