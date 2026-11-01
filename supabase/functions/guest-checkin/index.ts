import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401, headers: corsHeaders })

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userErr } = await supabaseClient.auth.getUser()
    if (userErr || !user) return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401, headers: corsHeaders })

    const { data: profile } = await supabaseAdmin
      .from('admin_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders })

    const { guest_id, attendance_count } = await req.json()
    if (!guest_id) return new Response(JSON.stringify({ error: 'guest_id required' }), { status: 400, headers: corsHeaders })

    // Verify guest exists
    const { data: guest } = await supabaseAdmin.from('guests').select('id, full_name, allocated_guests').eq('id', guest_id).single()
    if (!guest) return new Response(JSON.stringify({ error: 'Guest not found' }), { status: 404, headers: corsHeaders })

    // Prevent duplicate check-ins (UNIQUE constraint on guest_id in guest_checkins)
    const { data: existing } = await supabaseAdmin.from('guest_checkins').select('id').eq('guest_id', guest_id).single()
    if (existing) {
      return new Response(JSON.stringify({ error: 'Guest is already checked in.', already_checked_in: true }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const count = Math.max(1, Number(attendance_count) || 1)

    const { error: checkinErr } = await supabaseAdmin.from('guest_checkins').insert({
      guest_id,
      checked_in_by: user.id,
      attendance_count: count,
    })

    if (checkinErr) throw checkinErr

    // Audit
    await supabaseAdmin.from('audit_logs').insert({
      admin_user_id: user.id,
      action: 'guest_checkin',
      record_type: 'guest_checkins',
      record_id: guest_id,
      metadata: { guest_name: guest.full_name, attendance_count: count },
    })

    return new Response(JSON.stringify({ success: true, guest_name: guest.full_name }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
