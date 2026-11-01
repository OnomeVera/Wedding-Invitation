# Elizabeth & Stephen — Royal Wedding Platform
## Setup Guide

---

## ✅ Local Development

The app is running at **http://localhost:5174**

```
npm run dev
```

---

## 🗄️ STEP 1 — Run the Database Migration

Open your Supabase project at https://supabase.com/dashboard

1. Click **SQL Editor** in the left sidebar
2. Open the file below and paste the **entire contents** into the SQL editor
3. Click **Run**

📄 File: `supabase/migrations/001_initial_schema.sql`

This creates all 9 tables with RLS, indexes, and seeds default data.

---

## 🚀 STEP 2 — Deploy Edge Functions

Install the Supabase CLI first (if not installed):
```
npm install -g supabase
```

Login and link your project:
```
supabase login
supabase link --project-ref dahufcewpbsictfuuwsw
```

Deploy all 8 Edge Functions at once:
```
supabase functions deploy create-invitation
supabase functions deploy verify-invitation
supabase functions deploy submit-rsvp
supabase functions deploy update-rsvp
supabase functions deploy revoke-invitation
supabase functions deploy guest-checkin
supabase functions deploy export-rsvps
supabase functions deploy send-invitation-email
```

> ⚠️ The functions use `SUPABASE_SERVICE_ROLE_KEY` automatically — it is injected by Supabase at runtime. Never expose it in the frontend.

---

## 👤 STEP 3 — Create Your First Admin Account

### A. Enable Email Auth in Supabase
1. Go to **Authentication → Providers**
2. Ensure **Email** is enabled

### B. Register your admin account
1. Go to **Authentication → Users** in your Supabase dashboard
2. Click **Add User → Create new user**
3. Enter your admin email + password
4. Copy the new user's **UUID**

### C. Insert an admin profile
In the **SQL Editor**, run:
```sql
INSERT INTO admin_profiles (user_id, full_name, role)
VALUES (
  'YOUR-USER-UUID-HERE',
  'Your Full Name',
  'super_admin'
);
```

Now you can log into **/admin/login** with your email and password.

---

## 📋 STEP 4 — Configure Wedding Details

1. Log into the admin dashboard at **/admin/login**
2. Go to **Settings**
3. Fill in your ceremony venue, reception venue, times, dress code, contact details and WhatsApp number
4. Click **Save Settings**

These details appear on the public website and all personalised invitations.

---

## 👥 STEP 5 — Add Guests

1. Go to **Admin → Guests**
2. Click **Add Guest** for individual guests
3. Or click **Import CSV** for bulk import

CSV format expected columns:
```
full_name, email, phone, category, allocated_guests
```

---

## 💌 STEP 6 — Generate & Send Invitations

1. Go to **Admin → Guests** or **Admin → Invitations**
2. Click the ✉️ envelope icon next to any guest to generate their unique link
3. Or click **Generate All Missing** to create links for everyone at once
4. Deliver the invitation using any of the 3 admin-only methods:
   - 🔗 **Copy link** — paste into any channel you choose
   - 💬 **WhatsApp** — opens a pre-written message (requires guest phone number)
   - 📧 **Email** — sends a beautiful branded email (requires guest email + Resend setup)

Each invitation URL is unique and personalised:
```
https://yoursite.com/invite/{unique-token}
```

> 🔒 **Invitees cannot re-share their link.** The guest-facing invitation page has no Share button. A clear "personal & non-transferable" notice is shown. The admin is the only one who can distribute invitation links.

---

## 📧 OPTIONAL — Enable Email Invitations (via Resend)

To send invitation emails directly from the admin panel:

1. Create a free account at https://resend.com
2. Add and verify your sending domain
3. Copy your **API key**
4. Set these Supabase secrets:
```
supabase secrets set RESEND_API_KEY=re_xxxxxxx
supabase secrets set FROM_EMAIL=wedding@yourdomain.com
supabase secrets set SITE_URL=https://yourdomain.com
```
5. Redeploy the function: `supabase functions deploy send-invitation-email`

Without the `RESEND_API_KEY` set, the email button will return a graceful message.

---

## 🔒 Security Notes

- The Supabase **anon key** is safe to expose in the frontend (it's public)
- The **service role key** is only used inside Edge Functions — never in the browser
- Row Level Security (RLS) prevents guests from accessing each other's data
- Invitation tokens are stored as SHA-256 hashes — the raw token is never stored
- RSVP attendance limits are enforced server-side in Edge Functions
- **Guests cannot share their invitation link** — the Share button is absent from the guest view

---

## 📱 URL Routes

| URL | Description |
|-----|-------------|
| `/` | Public wedding website |
| `/invite/:token` | Personalised guest invitation |
| `/admin` | Admin dashboard (overview) |
| `/admin/login` | Admin login |
| `/admin/guests` | Guest management |
| `/admin/invitations` | Invitation management |
| `/admin/rsvps` | RSVP responses |
| `/admin/checkin` | Day-of check-in |
| `/admin/settings` | Wedding settings |

---

## 🎨 Brand Colours

| Name | Hex |
|------|-----|
| Burnt Orange | `#B85C38` |
| Olive Green | `#55613D` |
| Deep Forest | `#303D2D` |
| Warm Ivory | `#F7F1E7` |
| Champagne Gold | `#C6A46A` |
| Antique Gold | `#A88648` |
| Charcoal | `#292820` |
