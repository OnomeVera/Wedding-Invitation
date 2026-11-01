import React from 'react'

// ── Ornamental SVG seal ──────────────────────────────────────
export function WeddingSeal({ size = 180, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer ring */}
      <circle cx="100" cy="100" r="95" stroke="#C6A46A" strokeWidth="1" fill="none" />
      <circle cx="100" cy="100" r="89" stroke="#C6A46A" strokeWidth="0.5" fill="none" strokeDasharray="4 3" />

      {/* Background */}
      <circle cx="100" cy="100" r="87" fill="#303D2D" />

      {/* Inner decorative ring */}
      <circle cx="100" cy="100" r="78" stroke="#C6A46A" strokeWidth="0.8" fill="none" />

      {/* Star ornaments at cardinal points */}
      {[0, 90, 180, 270].map((deg) => {
        const rad = (deg * Math.PI) / 180
        const x = 100 + 83 * Math.sin(rad)
        const y = 100 - 83 * Math.cos(rad)
        return <circle key={deg} cx={x} cy={y} r="2.5" fill="#C6A46A" />
      })}

      {/* Interlinked rings (E & S) */}
      <circle cx="88" cy="100" r="18" stroke="#C6A46A" strokeWidth="1.5" fill="none" opacity="0.8" />
      <circle cx="112" cy="100" r="18" stroke="#C6A46A" strokeWidth="1.5" fill="none" opacity="0.8" />

      {/* E initial */}
      <text x="82" y="105" textAnchor="middle" fill="#C6A46A" fontSize="14" fontFamily="Cormorant Garamond, serif" fontWeight="600">E</text>
      {/* S initial */}
      <text x="118" y="105" textAnchor="middle" fill="#C6A46A" fontSize="14" fontFamily="Cormorant Garamond, serif" fontWeight="600">S</text>

      {/* & ampersand */}
      <text x="100" y="105" textAnchor="middle" fill="#C6A46A" fontSize="10" fontFamily="Cormorant Garamond, serif" fontStyle="italic">&amp;</text>

      {/* Top text arc — "A CELEBRATION OF" */}
      <path id="topArc" d="M 25,100 A 75,75 0 0,1 175,100" fill="none" />
      <text fontSize="7" fill="#C6A46A" letterSpacing="3" fontFamily="DM Sans, sans-serif">
        <textPath href="#topArc" startOffset="5%">A CELEBRATION OF LOVE</textPath>
      </text>

      {/* Bottom text arc — date */}
      <path id="bottomArc" d="M 30,110 A 75,75 0 0,0 170,110" fill="none" />
      <text fontSize="7" fill="#C6A46A" letterSpacing="2" fontFamily="DM Sans, sans-serif">
        <textPath href="#bottomArc" startOffset="8%">13 FEBRUARY 2027</textPath>
      </text>

      {/* Small diamond ornaments */}
      {[-30, -15, 0, 15, 30].map((offset, i) => (
        <rect
          key={i}
          x={97 + offset}
          y={132}
          width="5"
          height="5"
          fill={i === 2 ? '#C6A46A' : 'none'}
          stroke="#C6A46A"
          strokeWidth="0.6"
          transform={`rotate(45 ${99.5 + offset} 134.5)`}
        />
      ))}
    </svg>
  )
}

// ── Gold divider ─────────────────────────────────────────────
export function GoldDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`gold-divider ${className}`}>
      <div className="gold-divider-dot" />
      <div className="gold-divider-dot" style={{ width: 4, height: 4 }} />
      <div className="gold-divider-dot" />
    </div>
  )
}

// ── Floral corner decoration ─────────────────────────────────
export function FloralCorner({ className = '', style, width, height }: { className?: string; style?: React.CSSProperties; width?: number; height?: number }) {
  return (
    <svg
      width={width ?? 80}
      height={height ?? 80}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* Stems */}
      <path d="M5 75 Q20 50 40 30 Q55 15 75 5" stroke="#55613D" strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M5 75 Q10 55 15 35" stroke="#55613D" strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M5 75 Q25 65 50 60" stroke="#55613D" strokeWidth="0.8" fill="none" opacity="0.4" />

      {/* Leaves */}
      <ellipse cx="18" cy="52" rx="8" ry="4" fill="#55613D" transform="rotate(-45 18 52)" opacity="0.7" />
      <ellipse cx="35" cy="35" rx="7" ry="3.5" fill="#55613D" transform="rotate(-60 35 35)" opacity="0.7" />
      <ellipse cx="52" cy="20" rx="6" ry="3" fill="#303D2D" transform="rotate(-75 52 20)" opacity="0.6" />

      {/* Flowers */}
      <circle cx="40" cy="28" r="5" fill="#B85C38" opacity="0.8" />
      <circle cx="40" cy="28" r="2.5" fill="#C6A46A" opacity="0.9" />

      <circle cx="60" cy="14" r="4" fill="#B85C38" opacity="0.7" />
      <circle cx="60" cy="14" r="2" fill="#C6A46A" opacity="0.9" />

      <circle cx="22" cy="48" r="3.5" fill="#B85C38" opacity="0.6" />
      <circle cx="22" cy="48" r="1.8" fill="#C6A46A" opacity="0.9" />

      {/* Petal details */}
      {[0, 72, 144, 216, 288].map((angle) => {
        const rad = (angle * Math.PI) / 180
        return (
          <ellipse
            key={angle}
            cx={40 + 5 * Math.cos(rad)}
            cy={28 + 5 * Math.sin(rad)}
            rx="3"
            ry="1.5"
            fill="#B85C38"
            transform={`rotate(${angle} ${40 + 5 * Math.cos(rad)} ${28 + 5 * Math.sin(rad)})`}
            opacity="0.6"
          />
        )
      })}

      {/* Small dot accents */}
      <circle cx="30" cy="42" r="1.5" fill="#C6A46A" opacity="0.6" />
      <circle cx="48" cy="24" r="1.2" fill="#C6A46A" opacity="0.6" />
      <circle cx="66" cy="10" r="1" fill="#C6A46A" opacity="0.6" />
    </svg>
  )
}

// ── Section heading ──────────────────────────────────────────
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  light = false,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  light?: boolean
}) {
  return (
    <div className="section-heading">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 style={{ color: light ? '#F7F1E7' : '#292820' }}>{title}</h2>
      {subtitle && (
        <p
          className="font-dm mt-4 text-base leading-relaxed max-w-xl mx-auto"
          style={{ color: light ? 'rgba(247,241,231,0.7)' : 'rgba(41,40,32,0.65)' }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

// ── Badge ────────────────────────────────────────────────────
type BadgeColor = 'gold' | 'green' | 'orange' | 'red' | 'grey'
export function Badge({ label, color = 'gold' }: { label: string; color?: BadgeColor }) {
  const map: Record<BadgeColor, React.CSSProperties> = {
    gold: { background: 'rgba(198,164,106,0.15)', color: '#A88648', border: '1px solid rgba(198,164,106,0.4)' },
    green: { background: 'rgba(85,97,61,0.15)', color: '#55613D', border: '1px solid rgba(85,97,61,0.4)' },
    orange: { background: 'rgba(184,92,56,0.15)', color: '#B85C38', border: '1px solid rgba(184,92,56,0.4)' },
    red: { background: 'rgba(220,38,38,0.1)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.3)' },
    grey: { background: 'rgba(41,40,32,0.08)', color: '#555', border: '1px solid rgba(0,0,0,0.12)' },
  }
  return (
    <span
      className="font-dm inline-block px-2 py-0.5 rounded-sm text-xs font-medium"
      style={map[color]}
    >
      {label}
    </span>
  )
}
