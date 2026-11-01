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

    const body = await req.json()
    const {
      token,
      attendance_status,
      attending_count,
      dietary_requirements,
      special_requests,
      personal_message,
      accompanying_guests,
    } = body

    // ── Validate token ────────────────────────────────────────
    if (!token) return new Response(JSON.stringify({ error: 'Token required' }), { status: 400, headers: corsHeaders })
    if (!['accepted', 'declined'].includes(attendance_status)) {
      return new Response(JSON.stringify({ error: 'Invalid attendance_status' }), { status: 400, headers: corsHeaders })
    }

    const { data: tokenRecord, error: tokenErr } = await supabaseAdmin
      .from('invitation_tokens')
      .select('guest_id')
      .eq('token_hash', token)
      .is('revoked_at', null)
      .single()

    if (tokenErr || !tokenRecord) {
      return new Response(JSON.stringify({ error: 'Invalid or revoked invitation' }), { status: 404, headers: corsHeaders })
    }

    const { guest_id } = tokenRecord

    // ── Fetch guest and check allocation ─────────────────────
    const { data: guest, error: guestErr } = await supabaseAdmin
      .from('guests')
      .select('allocated_guests')
      .eq('id', guest_id)
      .single()

    if (guestErr || !guest) return new Response(JSON.stringify({ error: 'Guest not found' }), { status: 404, headers: corsHeaders })

    // SERVER-SIDE: enforce attendance limit
    const finalCount = attendance_status === 'declined' ? 0 : Number(attending_count)
    if (attendance_status === 'accepted' && finalCount > guest.allocated_guests) {
      return new Response(
        JSON.stringify({ error: `Attending count exceeds your allocation of ${guest.allocated_guests}` }),
        { status: 422, headers: corsHeaders }
      )
    }
    if (attendance_status === 'accepted' && finalCount < 1) {
      return new Response(JSON.stringify({ error: 'Attending count must be at least 1' }), { status: 422, headers: corsHeaders })
    }

    // ── Check for existing RSVP ───────────────────────────────
    const { data: existing } = await supabaseAdmin
      .from('rsvps')
      .select('id')
      .eq('guest_id', guest_id)
      .single()

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'An RSVP already exists. Please use the update endpoint.' }),
        { status: 409, headers: corsHeaders }
      )
    }

    // ── Insert RSVP ───────────────────────────────────────────
    const { data: rsvp, error: rsvpErr } = await supabaseAdmin
      .from('rsvps')
      .insert({
        guest_id,
        attendance_status,
        attending_count: finalCount,
        dietary_requirements: dietary_requirements || null,
        special_requests: special_requests || null,
        personal_message: personal_message || null,
      })
      .select()
      .single()

    if (rsvpErr) throw rsvpErr

    // ── Insert accompanying guests ────────────────────────────
    if (attendance_status === 'accepted' && Array.isArray(accompanying_guests) && accompanying_guests.length > 0) {
      const validCompanions = accompanying_guests
        .filter((g: { full_name?: string }) => g.full_name?.trim())
        .slice(0, guest.allocated_guests - 1)
        .map((g: { full_name: string }) => ({ rsvp_id: rsvp.id, full_name: g.full_name.trim() }))

      if (validCompanions.length > 0) {
        await supabaseAdmin.from('accompanying_guests').insert(validCompanions)
      }
    }

    // ── Audit log ─────────────────────────────────────────────
    await supabaseAdmin.from('audit_logs').insert({
      admin_user_id: null,
      action: 'rsvp_submit',
      record_type: 'rsvps',
      record_id: guest_id,
      metadata: { attendance_status, attending_count: finalCount },
    })

    return new Response(
      JSON.stringify({ success: true, rsvp_id: rsvp.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
