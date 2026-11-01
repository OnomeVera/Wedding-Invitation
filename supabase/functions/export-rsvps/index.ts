import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
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
      .from('admin_profiles').select('id').eq('user_id', user.id).single()
    if (!profile) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders })

    const { data: rsvps } = await supabaseAdmin
      .from('rsvps')
      .select(`
        *,
        guest:guests ( full_name, email, phone, category, allocated_guests ),
        accompanying_guests ( full_name )
      `)
      .order('responded_at', { ascending: false })

    const headers = ['Name', 'Email', 'Phone', 'Category', 'Allocation', 'Status', 'Attending', 'Dietary', 'Special Requests', 'Message', 'Companions', 'Responded At']

    const rows = (rsvps ?? []).map((r: any) => [
      r.guest?.full_name,
      r.guest?.email,
      r.guest?.phone,
      r.guest?.category,
      r.guest?.allocated_guests,
      r.attendance_status,
      r.attending_count,
      r.dietary_requirements,
      r.special_requests,
      r.personal_message,
      (r.accompanying_guests ?? []).map((g: any) => g.full_name).join('; '),
      r.responded_at,
    ].map(escapeCsv).join(','))

    const csv = [headers.join(','), ...rows].join('\n')

    return new Response(csv, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="rsvp-export.csv"',
      }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
