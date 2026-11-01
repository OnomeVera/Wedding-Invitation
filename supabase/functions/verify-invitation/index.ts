import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { token } = await req.json()
    if (!token) {
      return new Response(JSON.stringify({ error: 'Token is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Look up the invitation token (the raw token IS the hash in our system)
    const { data: tokenRecord, error: tokenErr } = await supabaseAdmin
      .from('invitation_tokens')
      .select('*, guest:guests(*)')
      .eq('token_hash', token)
      .is('revoked_at', null)
      .single()

    if (tokenErr || !tokenRecord) {
      return new Response(JSON.stringify({ error: 'This invitation is invalid or has been revoked.' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check expiry
    if (tokenRecord.expires_at && new Date(tokenRecord.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'This invitation has expired.' }), {
        status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const guest = tokenRecord.guest

    // Update invitation status to viewed
    await supabaseAdmin
      .from('guests')
      .update({ invitation_status: 'viewed' })
      .eq('id', guest.id)
      .eq('invitation_status', 'sent') // Only update if still 'sent'

    // Fetch RSVP if exists
    const { data: rsvp } = await supabaseAdmin
      .from('rsvps')
      .select('*, accompanying_guests(*)')
      .eq('guest_id', guest.id)
      .single()

    // Fetch wedding settings
    const { data: settings } = await supabaseAdmin
      .from('wedding_settings')
      .select('*')
      .limit(1)
      .single()

    return new Response(
      JSON.stringify({
        guest,
        settings,
        rsvp: rsvp ?? null,
        token,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
