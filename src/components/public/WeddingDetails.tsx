import React from 'react'
import { MapPin, Clock, Calendar, Navigation } from 'lucide-react'
import { SectionHeading, FloralCorner, GoldDivider } from '../ui/Ornaments'
import type { WeddingSettings } from '../../types/database'

interface Props { settings: WeddingSettings }

function DetailCard({
  icon: Icon,
  label,
  title,
  subtitle,
  action,
}: {
  icon: React.ElementType
  label: string
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div
      className="p-8 relative group transition-transform duration-300 hover:-translate-y-1"
      style={{
        background: 'white',
        border: '1px solid rgba(198,164,106,0.25)',
        borderRadius: 2,
      }}
    >
      {/* Top gold accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #C6A46A, transparent)' }}
      />

      <div
        className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'rgba(198,164,106,0.12)' }}
      >
        <Icon size={18} style={{ color: '#C6A46A' }} />
      </div>

      <p
        className="font-dm mb-1"
        style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C6A46A' }}
      >
        {label}
      </p>
      <h3 className="font-cormorant text-xl mb-1" style={{ color: '#292820', fontWeight: 500 }}>
        {title}
      </h3>
      {subtitle && (
        <p className="font-dm text-sm" style={{ color: 'rgba(41,40,32,0.55)' }}>
          {subtitle}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function WeddingDetails({ settings }: Props) {
  const mapsUrl = (venue: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`

  return (
    <section
      id="details"
      className="py-24 relative"
      style={{ background: '#F7F1E7' }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          eyebrow="Wedding Details"
          title="The Celebration"
          subtitle="Join us as we begin our beautiful journey together"
        />

        {/* Date banner */}
        <div
          className="text-center py-6 mb-12 relative"
          style={{ background: '#303D2D', border: '1px solid rgba(198,164,106,0.25)' }}
        >
          <p
            className="font-dm mb-1"
            style={{ fontSize: '0.6rem', letterSpacing: '0.4em', color: '#C6A46A', textTransform: 'uppercase' }}
          >
            Save the Date
          </p>
          <p className="font-cormorant text-3xl" style={{ color: '#F7F1E7', fontWeight: 300 }}>
            Saturday, 13 February 2027
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Ceremony */}
          <DetailCard
            icon={Clock}
            label="Ceremony"
            title={settings.ceremony_venue || 'Venue TBC'}
            subtitle={settings.ceremony_time || 'Time to be announced'}
            action={
              settings.ceremony_venue && settings.ceremony_venue !== 'TBD' ? (
                <a
                  href={mapsUrl(settings.ceremony_venue)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-dm text-xs"
                  style={{ color: '#C6A46A', textDecoration: 'none' }}
                >
                  <Navigation size={12} />
                  Get Directions
                </a>
              ) : undefined
            }
          />

          {/* Reception */}
          <DetailCard
            icon={MapPin}
            label="Reception"
            title={settings.reception_venue || 'Venue TBC'}
            subtitle={settings.reception_time || 'Time to be announced'}
            action={
              settings.reception_venue && settings.reception_venue !== 'TBD' ? (
                <a
                  href={mapsUrl(settings.reception_venue)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-dm text-xs"
                  style={{ color: '#C6A46A', textDecoration: 'none' }}
                >
                  <Navigation size={12} />
                  Get Directions
                </a>
              ) : undefined
            }
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Dress Code */}
          <div
            className="p-8"
            style={{ background: '#303D2D', border: '1px solid rgba(198,164,106,0.2)' }}
          >
            <p
              className="font-dm mb-2"
              style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C6A46A' }}
            >
              Dress Code
            </p>
            <h3 className="font-cormorant text-xl mb-3" style={{ color: '#F7F1E7', fontWeight: 400 }}>
              {settings.dress_code || 'Smart Elegant'}
            </h3>
            <p className="font-dm text-sm" style={{ color: 'rgba(247,241,231,0.55)' }}>
              Complement our colour palette — burnt orange &amp; olive green accents are warmly welcomed.
            </p>
            {/* Colour swatches */}
            <div className="flex gap-3 mt-4">
              {[
                { hex: '#B85C38', label: 'Burnt Orange' },
                { hex: '#55613D', label: 'Olive Green' },
                { hex: '#C6A46A', label: 'Champagne Gold' },
                { hex: '#F7F1E7', label: 'Warm Ivory' },
              ].map((c) => (
                <div key={c.hex} title={c.label}>
                  <div
                    className="w-7 h-7 rounded-full border"
                    style={{ background: c.hex, borderColor: 'rgba(198,164,106,0.4)' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Map embed placeholder */}
          <div
            className="p-8 flex flex-col justify-between"
            style={{ background: 'white', border: '1px solid rgba(198,164,106,0.25)', minHeight: '200px' }}
          >
            <div>
              <p
                className="font-dm mb-2"
                style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C6A46A' }}
              >
                Location
              </p>
              <h3 className="font-cormorant text-xl mb-2" style={{ color: '#292820', fontWeight: 400 }}>
                Find Us
              </h3>
              <p className="font-dm text-sm mb-4" style={{ color: 'rgba(41,40,32,0.55)' }}>
                {settings.ceremony_venue && settings.ceremony_venue !== 'TBD'
                  ? settings.ceremony_venue
                  : 'Venue details will be shared soon'}
              </p>
            </div>
            {settings.ceremony_venue && settings.ceremony_venue !== 'TBD' && (
              <a
                href={mapsUrl(settings.ceremony_venue)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-forest no-underline inline-flex items-center gap-2 justify-center"
                style={{ padding: '0.6rem 1.5rem' }}
              >
                <MapPin size={14} />
                Open in Google Maps
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
