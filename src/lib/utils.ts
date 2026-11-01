// Brand colours
export const COLORS = {
  burntOrange: '#B85C38',
  oliveGreen: '#55613D',
  deepForest: '#303D2D',
  warmIvory: '#F7F1E7',
  champagneGold: '#C6A46A',
  antiqueGold: '#A88648',
  charcoal: '#292820',
} as const

// Wedding date constant (Africa/Lagos = UTC+1)
export const WEDDING_DATE = new Date('2027-02-13T00:00:00+01:00')
export const WEDDING_TIMEZONE = 'Africa/Lagos'

// Format display date
export function formatWeddingDate(): string {
  return 'Saturday, 13 February 2027'
}

// Generate a random invitation token (client-side, for display only; hashed server-side)
export function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

// Simple hash using SubtleCrypto (browser) — mirrors server-side hash
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Truncate long strings
export function truncate(str: string, len = 40): string {
  return str.length > len ? str.slice(0, len) + '…' : str
}

// Format datetime nicely
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Build invitation URL
export function buildInvitationUrl(token: string): string {
  return `${window.location.origin}/invite/${token}`
}

// Build WhatsApp message URL
export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '')
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
}

// Build WhatsApp invitation message
export function buildWhatsAppMessage(guestName: string, inviteUrl: string): string {
  return `Hello ${guestName}, you are cordially invited to celebrate the wedding of Elizabeth Meruwoma and Stephen Ukpong on 13 February 2027. Please open your personalised invitation here: ${inviteUrl}`
}

// CSV export helper
export function downloadCSV(rows: Record<string, unknown>[], filename: string): void {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((h) => {
        const val = row[h]
        const s = val == null ? '' : String(val)
        return s.includes(',') || s.includes('"') || s.includes('\n')
          ? `"${s.replace(/"/g, '""')}"`
          : s
      }).join(',')
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Countdown helper — returns { days, hours, minutes, seconds }
export function getCountdown(target: Date): { days: number; hours: number; minutes: number; seconds: number; expired: boolean } {
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  const seconds = Math.floor((diff / 1000) % 60)
  const minutes = Math.floor((diff / 1000 / 60) % 60)
  const hours   = Math.floor((diff / 1000 / 60 / 60) % 24)
  const days    = Math.floor(diff / 1000 / 60 / 60 / 24)
  return { days, hours, minutes, seconds, expired: false }
}

// Parse CSV text into array of objects
export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''))
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  })
}
