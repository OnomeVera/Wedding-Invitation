import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { WeddingSettings } from '../types/database'

const DEFAULT_SETTINGS: WeddingSettings = {
  id: '',
  bride_name: 'Elizabeth Meruwoma',
  groom_name: 'Stephen Ukpong',
  wedding_date: '2027-02-13',
  timezone: 'Africa/Lagos',
  ceremony_time: 'TBD',
  ceremony_venue: 'TBD',
  reception_time: 'TBD',
  reception_venue: 'TBD',
  dress_code: 'Smart Elegant — Burnt Orange & Olive Green Accents',
  contact_details: null,
  whatsapp_number: null,
  updated_at: new Date().toISOString(),
}

export function useWeddingSettings() {
  const [settings, setSettings] = useState<WeddingSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase
      .from('wedding_settings')
      .select('*')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (mounted && data) setSettings(data)
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  return { settings, loading, setSettings }
}
