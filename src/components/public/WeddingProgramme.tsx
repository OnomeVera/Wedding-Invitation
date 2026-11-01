import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { SectionHeading, GoldDivider } from '../ui/Ornaments'
import type { WeddingEvent } from '../../types/database'

const DEFAULT_EVENTS: WeddingEvent[] = [
  { id: '1', event_name: 'Arrival of Guests', event_time: '11:00 AM', event_location: 'Main Entrance', event_description: 'Guests are warmly welcomed', display_order: 1 },
  { id: '2', event_name: 'Wedding Ceremony', event_time: '12:00 PM', event_location: 'Ceremony Venue', event_description: 'The exchange of vows and rings', display_order: 2 },
  { id: '3', event_name: 'Photography Session', event_time: '1:30 PM', event_location: 'Garden Grounds', event_description: 'Capturing beautiful moments', display_order: 3 },
  { id: '4', event_name: 'Reception Begins', event_time: '3:00 PM', event_location: 'Reception Hall', event_description: 'Dinner, speeches and celebration', display_order: 4 },
  { id: '5', event_name: 'First Dance', event_time: '5:00 PM', event_location: 'Reception Hall', event_description: 'Elizabeth & Stephen\'s first dance as husband and wife', display_order: 5 },
  { id: '6', event_name: 'Evening Celebrations', event_time: '7:00 PM', event_location: 'Reception Hall', event_description: 'Music, dancing and merriment', display_order: 6 },
]

export function WeddingProgramme() {
  const [events, setEvents] = useState<WeddingEvent[]>(DEFAULT_EVENTS)

  useEffect(() => {
    supabase
      .from('wedding_events')
      .select('*')
      .order('display_order', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setEvents(data)
      })
  }, [])

  return (
    <section
      id="programme"
      className="py-24"
      style={{ background: 'linear-gradient(180deg, #F7F1E7 0%, #EFE5CF 100%)' }}
    >
      <div className="max-w-3xl mx-auto px-6">
        <SectionHeading
          eyebrow="The Order of the Day"
          title="Wedding Programme"
          subtitle="A beautifully curated day of celebration and joy"
        />

        <div className="mt-8 space-y-8">
          {events.map((event, index) => (
            <div key={event.id} className="timeline-item">
              {/* Dot */}
              <div>
                <div className="timeline-dot">
                  <span
                    className="font-cormorant font-semibold"
                    style={{ fontSize: '0.8rem', color: '#C6A46A' }}
                  >
                    {index + 1}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="pb-8 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-1">
                  <h3
                    className="font-cormorant text-xl"
                    style={{ color: '#292820', fontWeight: 500 }}
                  >
                    {event.event_name}
                  </h3>
                  <span
                    className="font-dm text-xs"
                    style={{ color: '#C6A46A', letterSpacing: '0.1em' }}
                  >
                    {event.event_time}
                  </span>
                </div>
                {event.event_location && (
                  <p
                    className="font-dm text-xs mb-1"
                    style={{ color: '#55613D', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                  >
                    {event.event_location}
                  </p>
                )}
                {event.event_description && (
                  <p className="font-dm text-sm" style={{ color: 'rgba(41,40,32,0.55)' }}>
                    {event.event_description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <GoldDivider className="max-w-xs mx-auto mt-8" />
        <p
          className="font-allura text-center text-2xl"
          style={{ color: 'rgba(41,40,32,0.4)' }}
        >
          A day crafted with love
        </p>
      </div>
    </section>
  )
}
