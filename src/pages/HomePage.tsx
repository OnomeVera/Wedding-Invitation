import React, { useState } from 'react'
import { Navbar } from '../components/public/Navbar'
import { HeroSection } from '../components/public/HeroSection'
import { LoveStory } from '../components/public/LoveStory'
import { WeddingCountdown } from '../components/public/WeddingCountdown'
import { WeddingDetails } from '../components/public/WeddingDetails'
import { WeddingProgramme } from '../components/public/WeddingProgramme'
import { Gallery } from '../components/public/Gallery'
import { RSVPSection } from '../components/public/RSVPSection'
import { ContactSection } from '../components/public/ContactSection'
import { RoyalIntro } from '../components/public/RoyalIntro'
import { useWeddingSettings } from '../hooks/useWeddingSettings'

export function HomePage() {
  const [introShown, setIntroShown] = useState(true)
  const { settings } = useWeddingSettings()

  if (introShown) {
    return <RoyalIntro onEnter={() => setIntroShown(false)} />
  }

  return (
    <div style={{ background: '#F7F1E7' }}>
      <Navbar />
      <HeroSection />
      <LoveStory />
      <WeddingCountdown />
      <WeddingDetails settings={settings} />
      <WeddingProgramme />
      <Gallery />
      <RSVPSection />
      <ContactSection settings={settings} />
    </div>
  )
}
