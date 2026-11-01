import React from 'react'
import { SectionHeading, WeddingSeal, GoldDivider } from '../ui/Ornaments'
import { Link } from 'react-router-dom'

export function RSVPSection() {
  return (
    <section
      id="rsvp"
      className="py-24 relative overflow-hidden"
      style={{ background: '#303D2D' }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(184,92,56,0.08) 0%, transparent 65%)' }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <div className="flex justify-center mb-8">
          <WeddingSeal size={90} />
        </div>

        <SectionHeading
          eyebrow="Kindly Reply"
          title="RSVP"
          subtitle="Your presence would mean the world to us"
          light
        />

        <p
          className="font-cormorant mb-8"
          style={{ fontSize: '1.1rem', color: 'rgba(198,164,106,0.8)', fontStyle: 'italic', lineHeight: 1.6 }}
        >
          "WILL YOU BE JOINING US?"
        </p>

        <p
          className="font-dm mb-10 text-sm leading-relaxed"
          style={{ color: 'rgba(247,241,231,0.5)' }}
        >
          RSVP is only available through your personalised invitation link. If you have received an invitation link,
          please open it to submit your response. If you haven't received your link, please contact us below.
        </p>

        <GoldDivider className="max-w-xs mx-auto mb-10" />

        {/* Invitation link reminder */}
        <div
          className="p-6 text-left"
          style={{ background: 'rgba(247,241,231,0.04)', border: '1px solid rgba(198,164,106,0.2)' }}
        >
          <p className="font-dm text-xs mb-3" style={{ color: '#C6A46A', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Your Personalised Invitation
          </p>
          <p className="font-dm text-sm" style={{ color: 'rgba(247,241,231,0.55)', lineHeight: 1.7 }}>
            Your unique invitation link was sent to you personally. Look for a link in the format:
          </p>
          <code
            className="block mt-2 px-3 py-2 text-xs"
            style={{
              background: 'rgba(198,164,106,0.08)',
              border: '1px solid rgba(198,164,106,0.15)',
              color: '#C6A46A',
              fontFamily: 'monospace',
            }}
          >
            {window.location.origin}/invite/your-unique-code
          </code>
        </div>

        <p className="font-allura text-2xl mt-10" style={{ color: 'rgba(198,164,106,0.5)' }}>
          We hope to celebrate with you
        </p>
      </div>
    </section>
  )
}
