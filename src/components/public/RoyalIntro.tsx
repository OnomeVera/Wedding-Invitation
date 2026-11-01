import React, { useState, useEffect, useCallback } from 'react'
import { WeddingSeal, FloralCorner } from '../ui/Ornaments'

interface IntroProps {
  onEnter: () => void
}

export function RoyalIntro({ onEnter }: IntroProps) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const handleEnter = useCallback(() => {
    setLeaving(true)
    setTimeout(onEnter, 900)
  }, [onEnter])

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: '#303D2D',
        opacity: leaving ? 0 : 1,
        transition: 'opacity 0.9s ease',
        pointerEvents: leaving ? 'none' : 'all',
      }}
    >
      {/* Texture overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(198,164,106,0.06) 0%, transparent 70%)`,
        }}
      />

      {/* Corner florals */}
      <FloralCorner className="absolute top-6 left-6" />
      <FloralCorner className="absolute top-6 right-6" style={{ transform: 'scaleX(-1)' }} />
      <FloralCorner className="absolute bottom-6 left-6" style={{ transform: 'scaleY(-1)' }} />
      <FloralCorner className="absolute bottom-6 right-6" style={{ transform: 'scale(-1)' }} />

      {/* Gold border frame */}
      <div
        className="absolute inset-8 pointer-events-none"
        style={{ border: '1px solid rgba(198,164,106,0.25)' }}
      />
      <div
        className="absolute inset-10 pointer-events-none"
        style={{ border: '1px solid rgba(198,164,106,0.12)' }}
      />

      {/* Content */}
      <div
        className="relative text-center px-8 py-12 z-10"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 1s ease, transform 1s ease',
        }}
      >
        {/* Eyebrow */}
        <p
          className="font-dm mb-6"
          style={{
            color: '#C6A46A',
            letterSpacing: '0.5em',
            fontSize: '0.65rem',
            textTransform: 'uppercase',
          }}
        >
          A Celebration of Love
        </p>

        {/* Seal */}
        <div className="flex justify-center mb-8">
          <WeddingSeal size={160} className="seal-pulse" />
        </div>

        {/* Names */}
        <p
          className="font-cormorant"
          style={{
            color: 'rgba(198,164,106,0.8)',
            fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
          }}
        >
          Elizabeth Meruwoma
        </p>
        <p
          className="font-allura"
          style={{ color: 'rgba(247,241,231,0.5)', fontSize: '2rem', lineHeight: 1, marginBottom: '0.5rem' }}
        >
          &amp;
        </p>
        <p
          className="font-cormorant"
          style={{
            color: 'rgba(198,164,106,0.8)',
            fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            marginBottom: '2rem',
          }}
        >
          Stephen Ukpong
        </p>

        {/* Gold line */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #C6A46A, transparent)', marginBottom: '2rem' }} />

        {/* Date */}
        <p
          className="font-dm mb-1"
          style={{ color: '#C6A46A', fontSize: '0.7rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}
        >
          13 February 2027
        </p>

        {/* Theme */}
        <p
          className="font-allura mb-10"
          style={{ color: 'rgba(247,241,231,0.6)', fontSize: '1.4rem' }}
        >
          Two Hearts. One Beautiful Journey.
        </p>

        {/* CTA */}
        <button
          onClick={handleEnter}
          className="btn-gold"
          style={{ letterSpacing: '0.25em', padding: '0.9rem 3rem' }}
          id="open-invitation-btn"
        >
          Open Your Invitation
        </button>
      </div>
    </div>
  )
}
