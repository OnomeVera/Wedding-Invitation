import React from 'react'
import { GoldDivider, SectionHeading, FloralCorner } from '../ui/Ornaments'

const STORY_CHAPTERS = [
  {
    chapter: 'One',
    title: 'How It All Began',
    text: `Every great love story has a beginning — a moment when two souls first recognise in each other something extraordinary. For Elizabeth and Stephen, that moment arrived quietly, beautifully, and with the gentle certainty that their lives would never quite be the same again.`,
    side: 'left',
  },
  {
    chapter: 'Two',
    title: 'Growing Together',
    text: `Through seasons of laughter and moments of stillness, through adventures shared and dreams discovered, Elizabeth and Stephen grew — not just as individuals, but as one. Their love deepened with every passing day, a testament to patience, devotion, and the quiet magic of truly knowing another person.`,
    side: 'right',
  },
  {
    chapter: 'Three',
    title: 'A Promise Forever',
    text: `On 13 February 2027, before the people they love most in this world, Elizabeth and Stephen will stand together and say yes — to each other, to forever, to the beautiful life they have chosen to build side by side.`,
    side: 'left',
  },
]

export function LoveStory() {
  return (
    <section
      id="story"
      className="py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #EFE5CF 0%, #F7F1E7 100%)' }}
    >
      {/* Subtle botanical background */}
      <div className="absolute top-12 right-0 opacity-10">
        <FloralCorner style={{ transform: 'scale(3) scaleX(-1)', transformOrigin: 'top right' }} />
      </div>
      <div className="absolute bottom-12 left-0 opacity-10">
        <FloralCorner style={{ transform: 'scale(3) scaleY(-1)', transformOrigin: 'bottom left' }} />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <SectionHeading
          eyebrow="Our Love Story"
          title="Two Hearts, One Journey"
          subtitle="The story of Elizabeth and Stephen — told in three beautiful chapters"
        />

        <div className="space-y-16 mt-8">
          {STORY_CHAPTERS.map((chapter, i) => (
            <div
              key={chapter.chapter}
              className={`flex flex-col ${chapter.side === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center`}
            >
              {/* Image placeholder */}
              <div
                className="w-full md:w-80 flex-shrink-0 relative"
                style={{ aspectRatio: '3/4', maxHeight: '320px' }}
              >
                <div
                  className="w-full h-full"
                  style={{
                    background: i % 2 === 0
                      ? 'linear-gradient(135deg, #303D2D 0%, #55613D 100%)'
                      : 'linear-gradient(135deg, #B85C38 0%, #C6A46A 100%)',
                    border: '1px solid rgba(198,164,106,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '240px',
                  }}
                >
                  <div className="text-center px-4">
                    <p className="font-allura text-3xl" style={{ color: 'rgba(247,241,231,0.6)' }}>
                      Chapter {chapter.chapter}
                    </p>
                    <p className="font-dm text-xs mt-2" style={{ color: 'rgba(247,241,231,0.35)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                      Photograph
                    </p>
                  </div>
                </div>

                {/* Gold corner accent */}
                <div
                  className="absolute top-3 left-3 w-6 h-6"
                  style={{
                    borderTop: '2px solid rgba(198,164,106,0.5)',
                    borderLeft: '2px solid rgba(198,164,106,0.5)',
                  }}
                />
                <div
                  className="absolute bottom-3 right-3 w-6 h-6"
                  style={{
                    borderBottom: '2px solid rgba(198,164,106,0.5)',
                    borderRight: '2px solid rgba(198,164,106,0.5)',
                  }}
                />
              </div>

              {/* Text */}
              <div className="flex-1">
                <p
                  className="font-dm mb-2"
                  style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C6A46A' }}
                >
                  Chapter {chapter.chapter}
                </p>
                <h3
                  className="font-cormorant mb-4"
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: '#292820', fontWeight: 400 }}
                >
                  {chapter.title}
                </h3>
                <div style={{ width: '3rem', height: 1, background: '#C6A46A', marginBottom: '1rem' }} />
                <p className="font-dm leading-relaxed" style={{ color: 'rgba(41,40,32,0.65)', fontSize: '0.95rem' }}>
                  {chapter.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <GoldDivider className="max-w-xs mx-auto mt-16" />
        <p
          className="font-allura text-center text-3xl mt-4"
          style={{ color: 'rgba(184,92,56,0.6)' }}
        >
          And so the journey begins…
        </p>
      </div>
    </section>
  )
}
