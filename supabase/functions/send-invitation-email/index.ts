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
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401, headers: corsHeaders })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: userErr } = await supabaseClient.auth.getUser()
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401, headers: corsHeaders })
    }

    // Check admin role
    const { data: profile } = await supabaseAdmin
      .from('admin_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders })
    }

    const { guest_id, token } = await req.json()
    if (!guest_id || !token) {
      return new Response(JSON.stringify({ error: 'guest_id and token are required' }), { status: 400, headers: corsHeaders })
    }

    // Fetch guest
    const { data: guest, error: guestErr } = await supabaseAdmin
      .from('guests')
      .select('id, full_name, email')
      .eq('id', guest_id)
      .single()

    if (guestErr || !guest) {
      return new Response(JSON.stringify({ error: 'Guest not found' }), { status: 404, headers: corsHeaders })
    }

    if (!guest.email) {
      return new Response(JSON.stringify({ error: 'Guest has no email address' }), { status: 422, headers: corsHeaders })
    }

    // Verify token is still active
    const { data: tokenRecord } = await supabaseAdmin
      .from('invitation_tokens')
      .select('id')
      .eq('token_hash', token)
      .eq('guest_id', guest_id)
      .is('revoked_at', null)
      .single()

    if (!tokenRecord) {
      return new Response(JSON.stringify({ error: 'Token is not valid or has been revoked' }), { status: 400, headers: corsHeaders })
    }

    const inviteUrl = `${Deno.env.get('SITE_URL') || 'https://your-wedding-site.com'}/invite/${token}`

    // Build the email HTML
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Wedding Invitation</title>
</head>
<body style="margin:0;padding:0;background:#F7F1E7;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F1E7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:white;border:1px solid rgba(198,164,106,0.4);max-width:600px;width:100%;">
          <!-- Gold top bar -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,transparent,#C6A46A,transparent);"></td>
          </tr>
          <!-- Header -->
          <tr>
            <td align="center" style="padding:40px 40px 20px;">
              <p style="font-family:Georgia,serif;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#C6A46A;margin:0 0 12px;">
                You Are Cordially Invited
              </p>
              <h1 style="font-family:Georgia,serif;font-size:36px;font-weight:400;color:#292820;margin:0;line-height:1.2;">
                Elizabeth &amp; Stephen
              </h1>
              <p style="font-family:Georgia,serif;font-size:14px;color:#A88648;margin:8px 0 0;letter-spacing:0.1em;">
                Saturday, 13 February 2027
              </p>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#C6A46A,transparent);"></div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:30px 40px;text-align:center;">
              <p style="font-family:Georgia,serif;font-size:15px;color:rgba(41,40,32,0.6);margin:0 0 6px;">Dear</p>
              <p style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#292820;margin:0 0 24px;">${guest.full_name}</p>
              <p style="font-family:Arial,sans-serif;font-size:13px;color:rgba(41,40,32,0.65);line-height:1.7;margin:0 0 32px;">
                Elizabeth Meruwoma &amp; Stephen Ukpong joyfully request the pleasure of your company<br/>
                as they celebrate the beginning of their new life together.
              </p>
              <!-- CTA Button -->
              <a
                href="${inviteUrl}"
                style="display:inline-block;background:#303D2D;color:#F7F1E7;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;text-decoration:none;padding:16px 40px;border:1px solid rgba(198,164,106,0.3);"
              >
                Open My Invitation &amp; RSVP
              </a>
              <p style="font-family:Arial,sans-serif;font-size:11px;color:rgba(41,40,32,0.35);margin:24px 0 0;letter-spacing:0.1em;">
                This invitation is personal and non-transferable.
              </p>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:0 40px 10px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#C6A46A,transparent);"></div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding:16px 40px 32px;">
              <p style="font-family:Arial,sans-serif;font-size:10px;color:rgba(41,40,32,0.3);letter-spacing:0.1em;margin:0;">
                ELIZABETH MERUWOMA &amp; STEPHEN UKPONG &middot; ROYAL WEDDING 2027
              </p>
            </td>
          </tr>
          <!-- Gold bottom bar -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,transparent,#C6A46A,transparent);"></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    // Send email via Resend (or log if key not set)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'wedding@elizabethandstephen.com'

    if (!resendApiKey) {
      // No email provider configured — log and return gracefully
      console.warn('RESEND_API_KEY not set; email not sent. URL:', inviteUrl)
      return new Response(
        JSON.stringify({ success: true, note: 'Email provider not configured — link logged server-side.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Elizabeth & Stephen Wedding <${fromEmail}>`,
        to: guest.email,
        subject: `Your personal invitation — Elizabeth & Stephen's Wedding`,
        html: emailHtml,
      }),
    })

    if (!emailRes.ok) {
      const errText = await emailRes.text()
      throw new Error(`Email send failed: ${errText}`)
    }

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      admin_user_id: user.id,
      action: 'send_invitation_email',
      record_type: 'guests',
      record_id: guest_id,
      metadata: { guest_name: guest.full_name, email: guest.email },
    })

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
