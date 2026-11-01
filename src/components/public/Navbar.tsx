import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FloralCorner, WeddingSeal } from '../ui/Ornaments'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const links = [
    { href: '#story', label: 'Our Story' },
    { href: '#details', label: 'Details' },
    { href: '#programme', label: 'Programme' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#rsvp', label: 'RSVP' },
    { href: '#contact', label: 'Contact' },
  ]

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(247,241,231,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(198,164,106,0.2)' : 'none',
        padding: scrolled ? '0.75rem 0' : '1.25rem 0',
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-3 no-underline">
          <WeddingSeal size={36} />
          <div>
            <p className="font-cormorant text-sm font-semibold" style={{ color: '#292820', lineHeight: 1.1 }}>
              Elizabeth &amp; Stephen
            </p>
            <p className="font-dm text-xs" style={{ color: '#A88648', letterSpacing: '0.12em' }}>
              13 · 02 · 2027
            </p>
          </div>
        </a>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="nav-link">
              {l.label}
            </a>
          ))}
          <a
            href="#rsvp"
            className="btn-primary no-underline inline-block"
            style={{ padding: '0.5rem 1.5rem', fontSize: '0.7rem' }}
          >
            RSVP Now
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className="block w-6 h-px transition-all"
            style={{ background: '#292820', transform: menuOpen ? 'rotate(45deg) translate(3px, 3px)' : 'none' }}
          />
          <span
            className="block w-6 h-px transition-all"
            style={{ background: '#292820', opacity: menuOpen ? 0 : 1 }}
          />
          <span
            className="block w-6 h-px transition-all"
            style={{ background: '#292820', transform: menuOpen ? 'rotate(-45deg) translate(3px, -3px)' : 'none' }}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="lg:hidden px-6 py-4 flex flex-col gap-4"
          style={{ background: 'rgba(247,241,231,0.98)', borderTop: '1px solid rgba(198,164,106,0.2)' }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="nav-link text-base"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a href="#rsvp" className="btn-primary text-center" onClick={() => setMenuOpen(false)}>
            RSVP Now
          </a>
        </div>
      )}
    </header>
  )
}
