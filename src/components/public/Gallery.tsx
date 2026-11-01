import React, { useState, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { SectionHeading } from '../ui/Ornaments'

// Placeholder gallery images using beautiful CSS gradient placeholders
const GALLERY_ITEMS = [
  { id: 1, label: 'Our Engagement', aspect: 'portrait' },
  { id: 2, label: 'First Dance Preview', aspect: 'landscape' },
  { id: 3, label: 'Garden Moments', aspect: 'portrait' },
  { id: 4, label: 'Golden Hour', aspect: 'square' },
  { id: 5, label: 'Family Celebration', aspect: 'landscape' },
  { id: 6, label: 'Love Story', aspect: 'portrait' },
]

const GRADIENTS = [
  'linear-gradient(135deg, #B85C38 0%, #C6A46A 100%)',
  'linear-gradient(135deg, #303D2D 0%, #55613D 100%)',
  'linear-gradient(135deg, #C6A46A 0%, #F7F1E7 100%)',
  'linear-gradient(135deg, #55613D 0%, #B85C38 100%)',
  'linear-gradient(135deg, #292820 0%, #C6A46A 100%)',
  'linear-gradient(135deg, #B85C38 0%, #303D2D 100%)',
]

function PlaceholderImage({
  index,
  label,
  onClick,
}: {
  index: number
  label: string
  onClick: () => void
}) {
  return (
    <div
      className="relative overflow-hidden cursor-pointer group"
      style={{ borderRadius: 2 }}
      onClick={onClick}
    >
      <div
        className="w-full h-full transition-transform duration-500 group-hover:scale-105"
        style={{ background: GRADIENTS[index], minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {/* Decorative text */}
        <div className="text-center">
          <p className="font-allura text-3xl" style={{ color: 'rgba(247,241,231,0.7)' }}>
            {label}
          </p>
        </div>
      </div>

      {/* Overlay on hover */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'rgba(41,40,32,0.5)' }}
      >
        <ZoomIn size={28} style={{ color: '#C6A46A' }} />
      </div>

      {/* Bottom label */}
      <div
        className="absolute bottom-0 left-0 right-0 py-3 px-4"
        style={{ background: 'linear-gradient(transparent, rgba(41,40,32,0.7))' }}
      >
        <p className="font-dm text-xs" style={{ color: 'rgba(247,241,231,0.8)', letterSpacing: '0.1em' }}>
          {label}
        </p>
      </div>
    </div>
  )
}

export function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prev = useCallback(() => setLightboxIndex((i) => (i === null ? 0 : (i - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length)), [])
  const next = useCallback(() => setLightboxIndex((i) => (i === null ? 0 : (i + 1) % GALLERY_ITEMS.length)), [])

  return (
    <section id="gallery" className="py-24" style={{ background: '#F7F1E7' }}>
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          eyebrow="Cherished Memories"
          title="Our Gallery"
          subtitle="Moments captured in time — our story told through photographs"
        />

        {/* Masonry-like grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {GALLERY_ITEMS.map((item, index) => (
            <PlaceholderImage
              key={item.id}
              index={index}
              label={item.label}
              onClick={() => setLightboxIndex(index)}
            />
          ))}
        </div>

        <p
          className="font-dm text-center mt-8 text-sm"
          style={{ color: 'rgba(41,40,32,0.4)' }}
        >
          Photographs will be updated as we get closer to the big day
        </p>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full"
            style={{ background: 'rgba(198,164,106,0.2)', border: '1px solid rgba(198,164,106,0.4)' }}
            onClick={(e) => { e.stopPropagation(); prev() }}
            aria-label="Previous"
          >
            <ChevronLeft size={24} style={{ color: '#C6A46A' }} />
          </button>

          <div
            className="relative mx-4"
            style={{ maxWidth: '700px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full flex items-center justify-center"
              style={{
                background: GRADIENTS[lightboxIndex],
                minHeight: '400px',
                borderRadius: 2,
                border: '1px solid rgba(198,164,106,0.3)',
              }}
            >
              <p className="font-allura text-4xl" style={{ color: 'rgba(247,241,231,0.8)' }}>
                {GALLERY_ITEMS[lightboxIndex].label}
              </p>
            </div>
            <p
              className="font-dm text-center mt-3 text-sm"
              style={{ color: 'rgba(247,241,231,0.6)', letterSpacing: '0.1em' }}
            >
              {lightboxIndex + 1} / {GALLERY_ITEMS.length}
            </p>
          </div>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full"
            style={{ background: 'rgba(198,164,106,0.2)', border: '1px solid rgba(198,164,106,0.4)' }}
            onClick={(e) => { e.stopPropagation(); next() }}
            aria-label="Next"
          >
            <ChevronRight size={24} style={{ color: '#C6A46A' }} />
          </button>

          <button
            className="absolute top-4 right-4 p-2 rounded-full"
            style={{ background: 'rgba(41,40,32,0.7)' }}
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            <X size={20} style={{ color: '#C6A46A' }} />
          </button>
        </div>
      )}
    </section>
  )
}
