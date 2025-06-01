import { useEffect, useState } from 'react'
import MobileComingSoon from '../pages/MobileComingSoon'

interface MobileDetectorProps {
  children: React.ReactNode
}

export default function MobileDetector({ children }: MobileDetectorProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    // Check on mount
    checkMobile()

    // Add resize listener
    window.addEventListener('resize', checkMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile) {
    return <MobileComingSoon />
  }

  return <>{children}</>
} 