import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // Authenticate admin
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

    // Check admin role
    const { data: profile } = await supabaseAdmin
      .from('admin_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders })

    const { guest_id } = await req.json()
    if (!guest_id) return new Response(JSON.stringify({ error: 'guest_id is required' }), { status: 400, headers: corsHeaders })

    // Verify guest exists
    const { data: guest, error: guestErr } = await supabaseAdmin
      .from('guests')
      .select('id, full_name')
      .eq('id', guest_id)
      .single()

    if (guestErr || !guest) return new Response(JSON.stringify({ error: 'Guest not found' }), { status: 404, headers: corsHeaders })

    // Revoke any existing active tokens for this guest
    await supabaseAdmin
      .from('invitation_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('guest_id', guest_id)
      .is('revoked_at', null)

    // Generate secure random token
    const rawToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')

    // Hash the token with SHA-256
    const encoder = new TextEncoder()
    const data = encoder.encode(rawToken)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const tokenHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

    // Insert token record
    const { error: tokenErr } = await supabaseAdmin.from('invitation_tokens').insert({
      guest_id,
      token_hash: tokenHash,
      expires_at: null, // Never expires
    })

    if (tokenErr) throw tokenErr

    // Update guest status
    await supabaseAdmin.from('guests').update({ invitation_status: 'sent' }).eq('id', guest_id)

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      admin_user_id: user.id,
      action: 'create_invitation',
      record_type: 'invitation_tokens',
      record_id: guest_id,
      metadata: { guest_name: guest.full_name },
    })

    return new Response(
      JSON.stringify({ token: tokenHash, success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
