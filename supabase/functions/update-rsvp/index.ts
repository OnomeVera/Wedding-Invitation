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

    const {
      token,
      attendance_status,
      attending_count,
      dietary_requirements,
      special_requests,
      personal_message,
      accompanying_guests,
    } = await req.json()

    if (!token) return new Response(JSON.stringify({ error: 'Token required' }), { status: 400, headers: corsHeaders })

    // Verify token
    const { data: tokenRecord } = await supabaseAdmin
      .from('invitation_tokens')
      .select('guest_id')
      .eq('token_hash', token)
      .is('revoked_at', null)
      .single()

    if (!tokenRecord) return new Response(JSON.stringify({ error: 'Invalid invitation' }), { status: 404, headers: corsHeaders })

    const { guest_id } = tokenRecord

    // Get guest allocation for server-side enforcement
    const { data: guest } = await supabaseAdmin
      .from('guests')
      .select('allocated_guests')
      .eq('id', guest_id)
      .single()

    if (!guest) return new Response(JSON.stringify({ error: 'Guest not found' }), { status: 404, headers: corsHeaders })

    const finalCount = attendance_status === 'declined' ? 0 : Number(attending_count)

    if (attendance_status === 'accepted' && finalCount > guest.allocated_guests) {
      return new Response(
        JSON.stringify({ error: `Attending count exceeds your allocation of ${guest.allocated_guests}` }),
        { status: 422, headers: corsHeaders }
      )
    }

    // Ensure RSVP exists to update
    const { data: existingRsvp } = await supabaseAdmin
      .from('rsvps')
      .select('id')
      .eq('guest_id', guest_id)
      .single()

    if (!existingRsvp) {
      return new Response(JSON.stringify({ error: 'No RSVP found to update. Please submit one first.' }), { status: 404, headers: corsHeaders })
    }

    // Update RSVP
    await supabaseAdmin.from('rsvps').update({
      attendance_status,
      attending_count: finalCount,
      dietary_requirements: dietary_requirements || null,
      special_requests: special_requests || null,
      personal_message: personal_message || null,
      updated_at: new Date().toISOString(),
    }).eq('id', existingRsvp.id)

    // Replace accompanying guests
    await supabaseAdmin.from('accompanying_guests').delete().eq('rsvp_id', existingRsvp.id)

    if (attendance_status === 'accepted' && Array.isArray(accompanying_guests) && accompanying_guests.length > 0) {
      const validCompanions = accompanying_guests
        .filter((g: { full_name?: string }) => g.full_name?.trim())
        .slice(0, guest.allocated_guests - 1)
        .map((g: { full_name: string }) => ({ rsvp_id: existingRsvp.id, full_name: g.full_name.trim() }))

      if (validCompanions.length > 0) {
        await supabaseAdmin.from('accompanying_guests').insert(validCompanions)
      }
    }

    // Audit
    await supabaseAdmin.from('audit_logs').insert({
      admin_user_id: null,
      action: 'rsvp_update',
      record_type: 'rsvps',
      record_id: guest_id,
      metadata: { attendance_status, attending_count: finalCount },
    })

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
