import React, { useState } from 'react'
import { Check, X, Plus, Trash2, Send, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { SectionHeading, GoldDivider } from '../ui/Ornaments'
import toast from 'react-hot-toast'

interface Props {
  guestId?: string
  guestName?: string
  allocatedGuests?: number
  existingRsvp?: {
    attendance_status: 'accepted' | 'declined'
    attending_count: number
    dietary_requirements: string | null
    special_requests: string | null
    personal_message: string | null
    accompanying_guests?: { full_name: string }[]
  } | null
  token?: string
  onSuccess?: () => void
}

export function RSVPForm({ guestId, guestName, allocatedGuests = 1, existingRsvp, token, onSuccess }: Props) {
  const [step, setStep] = useState<'choice' | 'details' | 'success'>(existingRsvp ? 'details' : 'choice')
  const [attendance, setAttendance] = useState<'accepted' | 'declined' | null>(existingRsvp?.attendance_status ?? null)
  const [attendingCount, setAttendingCount] = useState(existingRsvp?.attending_count ?? 1)
  const [dietary, setDietary] = useState(existingRsvp?.dietary_requirements ?? '')
  const [special, setSpecial] = useState(existingRsvp?.special_requests ?? '')
  const [message, setMessage] = useState(existingRsvp?.personal_message ?? '')
  const [companions, setCompanions] = useState<string[]>(
    existingRsvp?.accompanying_guests?.map((g) => g.full_name) ?? ['']
  )
  const [submitting, setSubmitting] = useState(false)

  const isUpdating = !!existingRsvp

  const handleChoice = (choice: 'accepted' | 'declined') => {
    setAttendance(choice)
    setStep('details')
  }

  const addCompanion = () => {
    if (companions.length < (allocatedGuests - 1)) {
      setCompanions([...companions, ''])
    }
  }

  const removeCompanion = (i: number) => {
    setCompanions(companions.filter((_, idx) => idx !== i))
  }

  const updateCompanion = (i: number, value: string) => {
    const updated = [...companions]
    updated[i] = value
    setCompanions(updated)
  }

  const handleSubmit = async () => {
    if (!guestId || !token) {
      toast.error('Invalid invitation link')
      return
    }

    if (attendance === 'accepted' && attendingCount > allocatedGuests) {
      toast.error(`You can only bring up to ${allocatedGuests} ${allocatedGuests === 1 ? 'guest' : 'guests'}`)
      return
    }

    setSubmitting(true)

    try {
      const endpoint = isUpdating ? 'update-rsvp' : 'submit-rsvp'
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: {
          token,
          attendance_status: attendance,
          attending_count: attendance === 'accepted' ? attendingCount : 0,
          dietary_requirements: dietary || null,
          special_requests: special || null,
          personal_message: message || null,
          accompanying_guests: attendance === 'accepted'
            ? companions.filter((c) => c.trim()).map((name) => ({ full_name: name.trim() }))
            : [],
        },
      })

      if (error || (data && data.error)) {
        throw new Error(error?.message || data?.error || 'Failed to submit RSVP')
      }

      setStep('success')
      onSuccess?.()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="text-center py-16 px-8">
        {/* Animated check */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{
            background: 'rgba(85,97,61,0.1)',
            border: '2px solid #55613D',
            animation: 'sealPulse 2s ease-in-out 3',
          }}
        >
          <Check size={36} style={{ color: '#55613D' }} />
        </div>

        <h3
          className="font-cormorant mb-3"
          style={{ fontSize: '1.8rem', color: '#292820', fontWeight: 400 }}
        >
          Your Response Has Been Received
        </h3>

        <GoldDivider className="max-w-xs mx-auto my-6" />

        {attendance === 'accepted' ? (
          <p className="font-dm" style={{ color: 'rgba(41,40,32,0.65)', lineHeight: 1.7, maxWidth: '400px', margin: '0 auto' }}>
            We are delighted to have you as part of our celebration.
            <br />
            <span className="font-allura text-xl" style={{ color: '#B85C38' }}>
              We can't wait to see you!
            </span>
          </p>
        ) : (
          <p className="font-dm" style={{ color: 'rgba(41,40,32,0.65)', lineHeight: 1.7, maxWidth: '400px', margin: '0 auto' }}>
            We completely understand and will miss having you with us.
            <br />
            <span className="font-allura text-xl" style={{ color: '#B85C38' }}>
              You will be in our hearts.
            </span>
          </p>
        )}
      </div>
    )
  }

  if (step === 'choice') {
    return (
      <div className="text-center py-12 px-6 max-w-2xl mx-auto">
        <p
          className="font-cormorant mb-2"
          style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', color: '#C6A46A', fontWeight: 400, letterSpacing: '0.05em' }}
        >
          YOUR PRESENCE WOULD MEAN THE WORLD TO US
        </p>

        {guestName && (
          <p className="font-allura text-3xl mb-4" style={{ color: '#292820' }}>
            Dear {guestName}
          </p>
        )}

        <p
          className="font-dm mb-10"
          style={{ color: 'rgba(41,40,32,0.55)', fontSize: '0.9rem', lineHeight: 1.6 }}
        >
          WILL YOU BE JOINING US?
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Accept */}
          <button
            className="rsvp-radio-card"
            onClick={() => handleChoice('accepted')}
            id="rsvp-accept-btn"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(85,97,61,0.12)', border: '1px solid rgba(85,97,61,0.3)' }}
            >
              <Check size={20} style={{ color: '#55613D' }} />
            </div>
            <p className="font-cormorant text-xl mb-1" style={{ color: '#292820' }}>
              Joyfully Accept
            </p>
            <p className="font-dm text-xs" style={{ color: 'rgba(41,40,32,0.45)' }}>
              I will be there to celebrate
            </p>
          </button>

          {/* Decline */}
          <button
            className="rsvp-radio-card"
            onClick={() => handleChoice('declined')}
            id="rsvp-decline-btn"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(184,92,56,0.1)', border: '1px solid rgba(184,92,56,0.25)' }}
            >
              <X size={20} style={{ color: '#B85C38' }} />
            </div>
            <p className="font-cormorant text-xl mb-1" style={{ color: '#292820' }}>
              Regretfully Decline
            </p>
            <p className="font-dm text-xs" style={{ color: 'rgba(41,40,32,0.45)' }}>
              I'm unable to attend
            </p>
          </button>
        </div>
      </div>
    )
  }

  // Details step
  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      {/* Back / status */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => setStep('choice')}
          className="font-dm text-xs flex items-center gap-1"
          style={{ color: '#C6A46A', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ← Change response
        </button>

        <span
          className="px-3 py-1 rounded-sm text-xs font-dm"
          style={
            attendance === 'accepted'
              ? { background: 'rgba(85,97,61,0.12)', color: '#55613D', border: '1px solid rgba(85,97,61,0.3)' }
              : { background: 'rgba(184,92,56,0.1)', color: '#B85C38', border: '1px solid rgba(184,92,56,0.25)' }
          }
        >
          {attendance === 'accepted' ? '✓ Joyfully Accepting' : '✗ Regretfully Declining'}
        </span>
      </div>

      {attendance === 'accepted' && (
        <>
          {/* Attending count */}
          <div className="mb-6">
            <label className="form-label">
              Number Attending (max {allocatedGuests})
            </label>
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => setAttendingCount(Math.max(1, attendingCount - 1))}
                className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors"
                style={{ borderColor: 'rgba(198,164,106,0.4)', color: '#A88648' }}
              >
                −
              </button>
              <span
                className="font-cormorant text-2xl w-8 text-center"
                style={{ color: '#292820' }}
              >
                {attendingCount}
              </span>
              <button
                onClick={() => setAttendingCount(Math.min(allocatedGuests, attendingCount + 1))}
                className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors"
                style={{ borderColor: 'rgba(198,164,106,0.4)', color: '#A88648' }}
              >
                +
              </button>
            </div>
          </div>

          {/* Companions */}
          {allocatedGuests > 1 && (
            <div className="mb-6">
              <label className="form-label">Names of Accompanying Guests</label>
              <div className="space-y-2 mt-2">
                {companions.map((name, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      className="form-input flex-1"
                      placeholder={`Guest ${i + 1} full name`}
                      value={name}
                      onChange={(e) => updateCompanion(i, e.target.value)}
                    />
                    {companions.length > 1 && (
                      <button
                        onClick={() => removeCompanion(i)}
                        className="p-2.5 rounded-sm"
                        style={{ background: 'rgba(184,92,56,0.1)', color: '#B85C38', border: 'none', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {companions.length < (allocatedGuests - 1) && (
                  <button
                    onClick={addCompanion}
                    className="flex items-center gap-2 text-xs font-dm mt-1"
                    style={{ color: '#C6A46A', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Plus size={12} />
                    Add another guest
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Dietary */}
          <div className="mb-6">
            <label className="form-label">Dietary Requirements</label>
            <input
              type="text"
              className="form-input mt-1"
              placeholder="e.g. Vegetarian, Halal, No nuts…"
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
            />
          </div>

          {/* Special requests */}
          <div className="mb-6">
            <label className="form-label">Special Requests</label>
            <input
              type="text"
              className="form-input mt-1"
              placeholder="Wheelchair access, baby changing facilities…"
              value={special}
              onChange={(e) => setSpecial(e.target.value)}
            />
          </div>
        </>
      )}

      {/* Personal message */}
      <div className="mb-8">
        <label className="form-label">Personal Message to the Couple (optional)</label>
        <textarea
          className="form-input mt-1"
          rows={3}
          placeholder="Share a warm wish or message…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ resize: 'vertical' }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="btn-forest w-full flex items-center justify-center gap-3"
        id="rsvp-submit-btn"
        style={{ padding: '1rem', opacity: submitting ? 0.7 : 1 }}
      >
        {submitting ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            <Send size={16} />
            {isUpdating ? 'Update My Response' : 'Submit My Response'}
          </>
        )}
      </button>
    </div>
  )
}
