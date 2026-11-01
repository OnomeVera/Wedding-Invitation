import React from 'react'
import { MessageCircle, Mail, Phone } from 'lucide-react'
import { SectionHeading, GoldDivider, WeddingSeal } from '../ui/Ornaments'
import type { WeddingSettings } from '../../types/database'
import { buildWhatsAppUrl } from '../../lib/utils'

interface Props { settings: WeddingSettings }

export function ContactSection({ settings }: Props) {
  const whatsappUrl = settings.whatsapp_number
    ? buildWhatsAppUrl(settings.whatsapp_number, 'Hello! I have a question about the wedding of Elizabeth Meruwoma and Stephen Ukpong.')
    : null

  return (
    <footer
      id="contact"
      className="py-24 relative"
      style={{ background: '#303D2D' }}
    >
      {/* Gold glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(ellipse at 50% 0%, rgba(198,164,106,0.07) 0%, transparent 60%)` }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <SectionHeading
          eyebrow="Get in Touch"
          title="Contact the Organisers"
          subtitle="Have a question? We'd love to hear from you"
          light
        />

        <div className="grid sm:grid-cols-2 gap-6 mt-8">
          {settings.whatsapp_number && (
            <a
              href={whatsappUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 flex items-center gap-4 transition-transform hover:-translate-y-1 no-underline"
              style={{ background: 'rgba(247,241,231,0.06)', border: '1px solid rgba(198,164,106,0.2)' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(37,211,102,0.15)' }}
              >
                <MessageCircle size={20} style={{ color: '#25D366' }} />
              </div>
              <div className="text-left">
                <p className="font-dm text-xs mb-0.5" style={{ color: 'rgba(247,241,231,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  WhatsApp
                </p>
                <p className="font-cormorant text-lg" style={{ color: '#F7F1E7' }}>
                  {settings.whatsapp_number}
                </p>
              </div>
            </a>
          )}

          {settings.contact_details && (
            <div
              className="p-6 flex items-center gap-4"
              style={{ background: 'rgba(247,241,231,0.06)', border: '1px solid rgba(198,164,106,0.2)' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(198,164,106,0.12)' }}
              >
                <Mail size={20} style={{ color: '#C6A46A' }} />
              </div>
              <div className="text-left">
                <p className="font-dm text-xs mb-0.5" style={{ color: 'rgba(247,241,231,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Contact
                </p>
                <p className="font-cormorant text-lg" style={{ color: '#F7F1E7' }}>
                  {settings.contact_details}
                </p>
              </div>
            </div>
          )}
        </div>

        <GoldDivider className="max-w-xs mx-auto mt-12" />

        {/* Footer seal */}
        <div className="flex justify-center mt-8 mb-6">
          <WeddingSeal size={80} />
        </div>

        <p className="font-cormorant text-2xl" style={{ color: 'rgba(247,241,231,0.8)', fontWeight: 300 }}>
          Elizabeth Meruwoma &amp; Stephen Ukpong
        </p>
        <p className="font-allura text-xl mt-1" style={{ color: 'rgba(198,164,106,0.6)' }}>
          Saturday, 13 February 2027
        </p>

        <p
          className="font-dm mt-8 text-xs"
          style={{ color: 'rgba(247,241,231,0.25)', letterSpacing: '0.15em' }}
        >
          THE ROYAL WEDDING EXPERIENCE · A CELEBRATION OF LOVE, GRACE AND FOREVER
        </p>
      </div>
    </footer>
  )
}
