import React from 'react'
import { FloralCorner, GoldDivider } from '../ui/Ornaments'

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #F7F1E7 0%, #EFE5CF 50%, #F7F1E7 100%)' }}
    >
      {/* Subtle texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 30%, rgba(184,92,56,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(85,97,61,0.06) 0%, transparent 50%)
          `,
        }}
      />

      {/* Botanical corner decorations */}
      <FloralCorner className="absolute top-24 left-8 opacity-60" />
      <FloralCorner className="absolute top-24 right-8 opacity-60" style={{ transform: 'scaleX(-1)' }} />
      <FloralCorner className="absolute bottom-12 left-8 opacity-40" style={{ transform: 'scaleY(-1)' }} />
      <FloralCorner className="absolute bottom-12 right-8 opacity-40" style={{ transform: 'scale(-1)' }} />

      {/* Gold border lines */}
      <div className="absolute inset-12 pointer-events-none" style={{ border: '1px solid rgba(198,164,106,0.18)' }} />

      {/* Content */}
      <div className="relative z-10 text-center px-6 py-24">
        {/* Eyebrow */}
        <p
          className="font-dm fade-in-up mb-6"
          style={{
            color: '#C6A46A',
            letterSpacing: '0.5em',
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            animationDelay: '0.1s',
          }}
        >
          Together with their families
        </p>

        {/* Bride name */}
        <h1
          className="font-cormorant fade-in-up"
          style={{
            fontSize: 'clamp(2.5rem, 7vw, 6rem)',
            fontWeight: 400,
            color: '#292820',
            lineHeight: 1.05,
            animationDelay: '0.25s',
          }}
        >
          Elizabeth Meruwoma
        </h1>

        {/* Ampersand */}
        <p
          className="font-allura fade-in-up"
          style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            color: '#B85C38',
            lineHeight: 1,
            margin: '0.25rem 0',
            animationDelay: '0.4s',
          }}
        >
          &amp;
        </p>

        {/* Groom name */}
        <h2
          className="font-cormorant fade-in-up"
          style={{
            fontSize: 'clamp(2.5rem, 7vw, 6rem)',
            fontWeight: 400,
            color: '#292820',
            lineHeight: 1.05,
            animationDelay: '0.55s',
          }}
        >
          Stephen Ukpong
        </h2>

        <GoldDivider className="my-8 max-w-xs mx-auto" />

        {/* Date */}
        <p
          className="font-cormorant fade-in-up"
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
            fontWeight: 300,
            color: '#55613D',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            animationDelay: '0.7s',
          }}
        >
          Saturday · 13 February 2027
        </p>

        {/* Theme */}
        <p
          className="font-allura fade-in-up mt-4"
          style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'rgba(41,40,32,0.45)', animationDelay: '0.85s' }}
        >
          Two Hearts. One Beautiful Journey. A Lifetime of Love.
        </p>

        {/* Invitation quote */}
        <p
          className="font-dm fade-in-up max-w-2xl mx-auto mt-8 leading-relaxed"
          style={{ color: 'rgba(41,40,32,0.6)', fontSize: '0.9rem', animationDelay: '1s' }}
        >
          With hearts filled with joy and gratitude, together with their families, Elizabeth Meruwoma and
          Stephen Ukpong request the honour of your presence as they celebrate the beginning of their beautiful
          journey together.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 fade-in-up" style={{ animationDelay: '1.1s' }}>
          <a href="#details" className="btn-forest no-underline inline-block" id="explore-invitation-btn">
            Explore Our Invitation
          </a>
          <a href="#rsvp" className="btn-gold no-underline inline-block" id="rsvp-now-btn">
            RSVP Now
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 fade-in"
        style={{ animationDelay: '1.5s' }}
      >
        <div
          className="w-px h-12 mx-auto"
          style={{
            background: 'linear-gradient(180deg, rgba(198,164,106,0.6), transparent)',
            animation: 'fadeInUp 2s ease infinite',
          }}
        />
        <p className="font-dm text-center mt-1" style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(198,164,106,0.7)', textTransform: 'uppercase' }}>
          Scroll
        </p>
      </div>
    </section>
  )
}
