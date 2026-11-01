import React, { useState, useEffect } from 'react'
import { getCountdown } from '../../lib/utils'
import { GoldDivider, SectionHeading } from '../ui/Ornaments'

const WEDDING = new Date('2027-02-13T00:00:00+01:00')

function CountdownUnit({ value, label }: { value: number; label: string }) {
  const formatted = String(value).padStart(2, '0')
  return (
    <div className="countdown-card" style={{ minWidth: '5.5rem', flex: 1 }}>
      <div
        className="font-cormorant"
        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, color: '#C6A46A', lineHeight: 1 }}
      >
        {formatted}
      </div>
      <div
        className="font-dm mt-2"
        style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(247,241,231,0.5)' }}
      >
        {label}
      </div>
    </div>
  )
}

export function WeddingCountdown() {
  const [time, setTime] = useState(() => getCountdown(WEDDING))

  useEffect(() => {
    const interval = setInterval(() => setTime(getCountdown(WEDDING)), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      id="countdown"
      className="py-24 relative overflow-hidden"
      style={{ background: '#303D2D' }}
    >
      {/* Gold radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(198,164,106,0.08) 0%, transparent 65%)`,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <SectionHeading
          eyebrow="The Big Day"
          title="Counting Down"
          subtitle="Every passing moment brings us closer to forever"
          light
        />

        {time.expired ? (
          <p className="font-allura text-4xl" style={{ color: '#C6A46A' }}>
            The celebration has begun!
          </p>
        ) : (
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            <CountdownUnit value={time.days} label="Days" />
            <div className="font-cormorant text-4xl" style={{ color: 'rgba(198,164,106,0.5)', marginTop: '-1rem' }}>:</div>
            <CountdownUnit value={time.hours} label="Hours" />
            <div className="font-cormorant text-4xl" style={{ color: 'rgba(198,164,106,0.5)', marginTop: '-1rem' }}>:</div>
            <CountdownUnit value={time.minutes} label="Minutes" />
            <div className="font-cormorant text-4xl" style={{ color: 'rgba(198,164,106,0.5)', marginTop: '-1rem' }}>:</div>
            <CountdownUnit value={time.seconds} label="Seconds" />
          </div>
        )}

        <GoldDivider className="max-w-xs mx-auto mt-12" />

        <p
          className="font-allura mt-4"
          style={{ color: 'rgba(247,241,231,0.5)', fontSize: '1.6rem' }}
        >
          We can't wait to celebrate with you
        </p>
      </div>
    </section>
  )
}
