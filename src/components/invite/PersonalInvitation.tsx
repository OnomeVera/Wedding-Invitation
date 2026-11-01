import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { Download, Check, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { WeddingSeal, GoldDivider, FloralCorner } from '../ui/Ornaments'
import { RSVPForm } from './RSVPForm'
import { buildInvitationUrl } from '../../lib/utils'
import type { InvitationData } from '../../types/database'

export function PersonalInvitation() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [showRSVP, setShowRSVP] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link')
      setLoading(false)
      return
    }

    ;(async () => {
      const { data: result, error: fnErr } = await supabase.functions.invoke('verify-invitation', {
        body: { token },
      })

      if (fnErr || !result || result.error) {
        setError(result?.error || fnErr?.message || 'This invitation could not be verified.')
        setLoading(false)
        return
      }

      setData(result as InvitationData)

      // Generate QR code for venue check-in only
      try {
        const url = buildInvitationUrl(token)
        const qr = await QRCode.toDataURL(url, {
          width: 200,
          margin: 1,
          color: { dark: '#303D2D', light: '#F7F1E7' },
        })
        setQrDataUrl(qr)
      } catch (_) {
        // QR optional
      }

      setLoading(false)
    })()
  }, [token])

  const handleDownload = () => {
    window.print()
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#F7F1E7' }}
      >
        <div className="text-center">
          <WeddingSeal size={80} className="mx-auto mb-6 seal-pulse" />
          <p className="font-dm text-sm" style={{ color: 'rgba(41,40,32,0.5)', letterSpacing: '0.2em' }}>
            PREPARING YOUR INVITATION
          </p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#F7F1E7' }}
      >
        <div className="text-center max-w-md px-8">
          <WeddingSeal size={80} className="mx-auto mb-6" />
          <h2 className="font-cormorant text-2xl mb-3" style={{ color: '#292820' }}>
            Invitation Not Found
          </h2>
          <p className="font-dm text-sm" style={{ color: 'rgba(41,40,32,0.55)' }}>
            {error || 'This invitation link is invalid or has been revoked. Please contact the organisers.'}
          </p>
        </div>
      </div>
    )
  }

  const { guest, settings, rsvp } = data
  const hasResponded = !!rsvp

  return (
    <div
      className="min-h-screen"
      style={{ background: '#F7F1E7' }}
    >
      <div
        ref={printRef}
        className="max-w-2xl mx-auto px-4 py-12"
      >
        <div
          className="relative p-8 sm:p-12"
          style={{
            background: 'white',
            border: '1px solid rgba(198,164,106,0.35)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #C6A46A, transparent)', marginBottom: '0.5rem' }} />
          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, transparent, rgba(198,164,106,0.4), transparent)', marginBottom: '2rem' }} />

          <FloralCorner className="absolute top-6 left-6 opacity-50" style={{ width: 48, height: 48 }} />
          <FloralCorner className="absolute top-6 right-6 opacity-50" style={{ width: 48, height: 48, transform: 'scaleX(-1)' }} />
          <FloralCorner className="absolute bottom-6 left-6 opacity-40" style={{ width: 48, height: 48, transform: 'scaleY(-1)' }} />
          <FloralCorner className="absolute bottom-6 right-6 opacity-40" style={{ width: 48, height: 48, transform: 'scale(-1)' }} />

          <div className="flex justify-center mb-6">
            <WeddingSeal size={100} />
          </div>

          <div className="text-center mb-6">
            <p className="font-dm mb-2" style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C6A46A' }}>
              Dear
            </p>
            <h1
              className="font-cormorant"
              style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 400, color: '#292820' }}
            >
              {guest.full_name}
            </h1>
            {guest.category && (
              <span
                className="inline-block mt-2 px-3 py-0.5 text-xs font-dm"
                style={{ background: 'rgba(198,164,106,0.12)', color: '#A88648', border: '1px solid rgba(198,164,106,0.3)' }}
              >
                {guest.category}
              </span>
            )}
          </div>

          <GoldDivider />

          <p
            className="font-cormorant text-center my-6 leading-relaxed"
            style={{ fontSize: '1.05rem', color: 'rgba(41,40,32,0.75)', fontStyle: 'italic' }}
          >
            Elizabeth Meruwoma &amp; Stephen Ukpong warmly invite you to celebrate their special day.
          </p>

          <div
            className="grid grid-cols-2 gap-px my-6"
            style={{ background: 'rgba(198,164,106,0.15)' }}
          >
            {[
              { label: 'Date', value: 'Saturday, 13 February 2027' },
              { label: 'Ceremony', value: settings.ceremony_time || 'TBC' },
              { label: 'Venue', value: settings.ceremony_venue || 'TBC' },
              { label: 'Reception', value: settings.reception_time || 'TBC' },
              { label: 'Reception Venue', value: settings.reception_venue || 'TBC' },
              { label: 'Dress Code', value: settings.dress_code || 'Smart Elegant' },
            ].map((item) => (
              <div
                key={item.label}
                className="py-3 px-4"
                style={{ background: 'white' }}
              >
                <p className="font-dm text-xs mb-0.5" style={{ color: '#C6A46A', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  {item.label}
                </p>
                <p className="font-cormorant text-sm" style={{ color: '#292820' }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div
            className="text-center py-4 mb-6"
            style={{ background: '#303D2D', border: '1px solid rgba(198,164,106,0.2)' }}
          >
            <p className="font-dm text-xs mb-1" style={{ color: 'rgba(198,164,106,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Invitation is valid for
            </p>
            <p className="font-cormorant text-2xl" style={{ color: '#C6A46A', fontWeight: 300 }}>
              {guest.allocated_guests} {guest.allocated_guests === 1 ? 'Person' : 'Persons'}
            </p>
          </div>

          {hasResponded && (
            <div
              className="flex items-center justify-center gap-3 py-3 mb-4"
              style={{
                background: rsvp!.attendance_status === 'accepted'
                  ? 'rgba(85,97,61,0.08)'
                  : 'rgba(184,92,56,0.08)',
                border: `1px solid ${rsvp!.attendance_status === 'accepted' ? 'rgba(85,97,61,0.3)' : 'rgba(184,92,56,0.25)'}`,
              }}
            >
              {rsvp!.attendance_status === 'accepted'
                ? <Check size={16} style={{ color: '#55613D' }} />
                : <X size={16} style={{ color: '#B85C38' }} />}
              <p
                className="font-dm text-sm"
                style={{ color: rsvp!.attendance_status === 'accepted' ? '#55613D' : '#B85C38' }}
              >
                You have {rsvp!.attendance_status === 'accepted' ? 'accepted' : 'declined'} this invitation
              </p>
            </div>
          )}

          {qrDataUrl && (
            <div className="text-center mt-4">
              <img
                src={qrDataUrl}
                alt="Venue check-in QR code"
                className="mx-auto"
                style={{ width: 100, height: 100, border: '1px solid rgba(198,164,106,0.25)', padding: 4 }}
              />
              <p className="font-dm text-xs mt-1" style={{ color: 'rgba(41,40,32,0.35)', letterSpacing: '0.1em' }}>
                Present at venue for check-in
              </p>
            </div>
          )}

          <div style={{ height: '0.5px', background: 'linear-gradient(90deg, transparent, rgba(198,164,106,0.4), transparent)', marginTop: '2rem', marginBottom: '0.5rem' }} />
          <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #C6A46A, transparent)' }} />

          <p
            className="font-dm text-center mt-4"
            style={{ fontSize: '0.6rem', letterSpacing: '0.18em', color: 'rgba(41,40,32,0.28)', textTransform: 'uppercase' }}
          >
            This invitation is personal and non-transferable
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6 no-print">
          <button
            onClick={() => setShowRSVP(!showRSVP)}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
            id="open-rsvp-btn"
          >
            {hasResponded ? 'Update Your RSVP' : 'RSVP Now'}
          </button>
          <button
            onClick={handleDownload}
            className="btn-gold flex items-center justify-center gap-2 px-8"
            id="download-invitation-btn"
          >
            <Download size={14} />
            Save Invitation
          </button>
        </div>
      </div>

      {showRSVP && (
        <section id="rsvp" className="pb-16">
          <div
            className="max-w-2xl mx-auto mx-4 px-4"
            style={{ background: 'white', border: '1px solid rgba(198,164,106,0.25)' }}
          >
            <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #C6A46A, transparent)' }} />
            <RSVPForm
              guestId={guest.id}
              guestName={guest.full_name}
              allocatedGuests={guest.allocated_guests}
              existingRsvp={
                rsvp
                  ? {
                      attendance_status: rsvp.attendance_status,
                      attending_count: rsvp.attending_count,
                      dietary_requirements: rsvp.dietary_requirements,
                      special_requests: rsvp.special_requests,
                      personal_message: rsvp.personal_message,
                    }
                  : null
              }
              token={token}
              onSuccess={() => window.location.reload()}
            />
          </div>
        </section>
      )}
    </div>
  )
}
