import React, { useState } from 'react'
import { Save, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useWeddingSettings } from '../../hooks/useWeddingSettings'
import toast from 'react-hot-toast'

export function WeddingSettingsPage() {
  const { settings, loading, setSettings } = useWeddingSettings()
  const [saving, setSaving] = useState(false)

  const handleChange = (field: string, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)

    // Build upsert payload — exclude id if blank
    const payload = {
      bride_name: settings.bride_name,
      groom_name: settings.groom_name,
      wedding_date: settings.wedding_date,
      timezone: settings.timezone,
      ceremony_time: settings.ceremony_time,
      ceremony_venue: settings.ceremony_venue,
      reception_time: settings.reception_time,
      reception_venue: settings.reception_venue,
      dress_code: settings.dress_code,
      contact_details: settings.contact_details,
      whatsapp_number: settings.whatsapp_number,
      updated_at: new Date().toISOString(),
    }

    const { error } = settings.id
      ? await supabase.from('wedding_settings').update(payload).eq('id', settings.id)
      : await supabase.from('wedding_settings').insert(payload)

    if (error) toast.error(error.message)
    else toast.success('Settings saved successfully')

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 rounded" style={{ background: 'rgba(0,0,0,0.06)' }} />
        ))}
      </div>
    )
  }

  const Field = ({
    label, field, placeholder, type = 'text',
  }: {
    label: string; field: keyof typeof settings; placeholder?: string; type?: string
  }) => (
    <div>
      <label className="form-label">{label}</label>
      <input
        type={type}
        className="form-input mt-1"
        placeholder={placeholder}
        value={(settings[field] as string) ?? ''}
        onChange={(e) => handleChange(field as string, e.target.value)}
      />
    </div>
  )

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="font-cormorant text-2xl mb-1" style={{ color: '#292820', fontWeight: 400 }}>
          Wedding Settings
        </h2>
        <p className="font-dm text-sm" style={{ color: 'rgba(41,40,32,0.5)' }}>
          These details appear on the public website and all personalised invitations.
        </p>
      </div>

      <div className="space-y-5 p-6" style={{ background: 'white', border: '1px solid rgba(198,164,106,0.2)', borderRadius: 2 }}>
        {/* Names */}
        <div
          className="pb-4 mb-4"
          style={{ borderBottom: '1px solid rgba(198,164,106,0.12)' }}
        >
          <p className="font-dm text-xs mb-4" style={{ color: '#C6A46A', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Couple
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bride's Full Name" field="bride_name" placeholder="Elizabeth Meruwoma" />
            <Field label="Groom's Full Name" field="groom_name" placeholder="Stephen Ukpong" />
          </div>
        </div>

        {/* Date & timezone */}
        <div
          className="pb-4 mb-4"
          style={{ borderBottom: '1px solid rgba(198,164,106,0.12)' }}
        >
          <p className="font-dm text-xs mb-4" style={{ color: '#C6A46A', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Wedding Date
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Wedding Date" field="wedding_date" type="date" />
            <Field label="Timezone" field="timezone" placeholder="Africa/Lagos" />
          </div>
        </div>

        {/* Ceremony */}
        <div
          className="pb-4 mb-4"
          style={{ borderBottom: '1px solid rgba(198,164,106,0.12)' }}
        >
          <p className="font-dm text-xs mb-4" style={{ color: '#C6A46A', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Ceremony
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ceremony Time" field="ceremony_time" placeholder="e.g. 12:00 PM" />
            <Field label="Ceremony Venue" field="ceremony_venue" placeholder="St. Paul's Cathedral, Lagos" />
          </div>
        </div>

        {/* Reception */}
        <div
          className="pb-4 mb-4"
          style={{ borderBottom: '1px solid rgba(198,164,106,0.12)' }}
        >
          <p className="font-dm text-xs mb-4" style={{ color: '#C6A46A', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Reception
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Reception Time" field="reception_time" placeholder="e.g. 3:00 PM" />
            <Field label="Reception Venue" field="reception_venue" placeholder="Grand Ballroom, Lagos" />
          </div>
        </div>

        {/* Dress code & contact */}
        <div>
          <p className="font-dm text-xs mb-4" style={{ color: '#C6A46A', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Other Details
          </p>
          <div className="space-y-4">
            <Field label="Dress Code" field="dress_code" placeholder="Smart Elegant — Burnt Orange & Olive Green Accents" />
            <Field label="Contact Details" field="contact_details" placeholder="organiser@email.com" />
            <Field label="WhatsApp Number (with country code)" field="whatsapp_number" placeholder="+2348012345678" />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-forest w-full flex items-center justify-center gap-3"
          id="save-settings-btn"
          style={{ padding: '0.9rem', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? <><RefreshCw size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Settings</>}
        </button>
      </div>
    </div>
  )
}
