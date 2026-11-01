export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface AdminProfile {
  id: string
  user_id: string
  full_name: string
  role: 'super_admin' | 'admin' | 'organiser'
  created_at: string
}

export interface Guest {
  id: string
  full_name: string
  email: string | null
  phone_e164: string
  category: string
  allocated_guests: number
  invitation_status: 'not_sent' | 'sent' | 'viewed' | 'revoked'
  created_at: string
  updated_at: string
}

export interface InvitationToken {
  id: string
  guest_id: string
  token_hash: string
  expires_at: string | null
  revoked_at: string | null
  created_at: string
}

export interface RSVP {
  id: string
  guest_id: string
  attendance_status: 'accepted' | 'declined'
  attending_count: number
  dietary_requirements: string | null
  special_requests: string | null
  personal_message: string | null
  responded_at: string
  updated_at: string
}

export interface AccompanyingGuest {
  id: string
  rsvp_id: string
  full_name: string
  created_at: string
}

export interface WeddingSettings {
  id: string
  bride_name: string
  groom_name: string
  wedding_date: string
  timezone: string
  ceremony_time: string
  ceremony_venue: string
  reception_time: string
  reception_venue: string
  dress_code: string
  contact_details: string | null
  whatsapp_number: string | null
  updated_at: string
}

export interface WeddingEvent {
  id: string
  event_name: string
  event_time: string
  event_location: string
  event_description: string | null
  display_order: number
}

export interface GuestCheckin {
  id: string
  guest_id: string
  checked_in_by: string
  checked_in_at: string
  attendance_count: number
}

export interface AuditLog {
  id: string
  admin_user_id: string
  action: string
  record_type: string
  record_id: string | null
  created_at: string
}

// View/joined types
export interface GuestWithRSVP extends Guest {
  rsvp?: RSVP | null
  invitation_token?: { token_hash: string; revoked_at: string | null } | null
  checkin?: GuestCheckin | null
}

export interface RSVPWithGuest extends RSVP {
  guest: Guest
  accompanying_guests?: AccompanyingGuest[]
}

export interface InvitationData {
  guest: Guest
  settings: WeddingSettings
  token: string
  rsvp?: RSVP | null
}
