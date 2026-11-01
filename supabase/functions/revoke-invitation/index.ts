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
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders })

    const { guest_id } = await req.json()
    if (!guest_id) return new Response(JSON.stringify({ error: 'guest_id required' }), { status: 400, headers: corsHeaders })

    // Revoke all active tokens
    const { error } = await supabaseAdmin
      .from('invitation_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('guest_id', guest_id)
      .is('revoked_at', null)

    if (error) throw error

    // Update guest status
    await supabaseAdmin.from('guests').update({ invitation_status: 'revoked' }).eq('id', guest_id)

    // Audit
    await supabaseAdmin.from('audit_logs').insert({
      admin_user_id: user.id,
      action: 'revoke_invitation',
      record_type: 'invitation_tokens',
      record_id: guest_id,
    })

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
