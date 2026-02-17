'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

interface Balloon {
  id: string
  left: number
  duration: number
  delay: number
  scale: number
  startOpacity: number
  zIndex: number
  horizontalDrift: number
}

export default function FloatingBalloons() {
  const [balloons, setBalloons] = useState<Balloon[]>([])
  const [isClient, setIsClient] = useState(false)
  const [isInteractive, setIsInteractive] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const balloonIdRef = useRef(0)
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Generate a single balloon with random properties
   * Different characteristics based on interaction state
   */
  const createBalloon = useCallback((): Balloon => {
    balloonIdRef.current += 1

    if (isInteractive) {
      // Subtle ambient mode after user interaction
      return {
        id: `balloon-${balloonIdRef.current}`,
        left: Math.random() * 100,
        duration: 18 + Math.random() * 14, // 18-32 seconds
        delay: Math.random() * 2,
        scale: 0.4 + Math.random() * 0.4, // 0.4-0.8
        startOpacity: 0.15 + Math.random() * 0.15, // 0.15-0.3
        zIndex: Math.floor(Math.random() * 10) + 5, // 5-15
        horizontalDrift: (Math.random() - 0.5) * 60, // -30 to 30px
      }
    } else {
      // Prominent pre-interaction mode
      return {
        id: `balloon-${balloonIdRef.current}`,
        left: Math.random() * 100,
        duration: 12 + Math.random() * 10, // 12-22 seconds
        delay: Math.random() * 1.5,
        scale: 0.8 + Math.random() * 0.5, // 0.8-1.3
        startOpacity: 0.5 + Math.random() * 0.3, // 0.5-0.8
        zIndex: Math.floor(Math.random() * 20) + 10, // 10-30
        horizontalDrift: (Math.random() - 0.5) * 100, // -50 to 50px
      }
    }
  }, [isInteractive])

  /**
   * Initialize and manage balloon spawning lifecycle
   */
  useEffect(() => {
    setIsClient(true)

    // Clean up existing interval
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current)

    // Initial batch of balloons
    const initialCount = isInteractive ? 8 : 4
    const initialBalloons = Array.from({ length: initialCount }, () =>
      createBalloon()
    )
    setBalloons(initialBalloons)

    // Continuous spawning: every 2.5-3.5 seconds
    const spawnInterval = isInteractive ? 3200 : 2800

    spawnIntervalRef.current = setInterval(() => {
      setBalloons((prev) => {
        const newBalloon = createBalloon()
        const updated = [...prev, newBalloon]

        // Maintain reasonable balloon count (memory efficient)
        const maxBalloons = isInteractive ? 24 : 16
        if (updated.length > maxBalloons) {
          return updated.slice(-maxBalloons)
        }

        return updated
      })
    }, spawnInterval)

    // Cleanup on unmount or state change
    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current)
      }
    }
  }, [isInteractive, createBalloon])

  /**
   * Detect user interaction and transition to ambient mode
   */
  useEffect(() => {
    if (isInteractive) return // Already in interactive mode

    const handleInteraction = () => {
      setIsInteractive(true)
      // Remove event listeners after first interaction
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }

    document.addEventListener('click', handleInteraction)
    document.addEventListener('touchstart', handleInteraction)

    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }
  }, [isInteractive])

  if (!isClient) return null

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(120vh) translateX(0);
            opacity: var(--balloon-start-opacity);
          }
          10% {
            opacity: var(--balloon-start-opacity);
          }
          85% {
            opacity: var(--balloon-start-opacity);
          }
          100% {
            transform: translateY(-20vh) translateX(var(--balloon-drift));
            opacity: 0;
          }
        }

        @keyframes delightfulSway {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(12px);
          }
          50% {
            transform: translateX(-8px);
          }
          75% {
            transform: translateX(8px);
          }
        }

        .floating-balloons-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
          background: transparent;
        }

        .balloon-item {
          position: absolute;
          width: 48px;
          height: 64px;
          pointer-events: none;
          bottom: -100px;
          will-change: transform, opacity;
        }

        .balloon-body {
          width: 100%;
          height: 85%;
          border-radius: 50% 50% 50% 48%;
          background: linear-gradient(
            135deg,
            rgba(255, 215, 0, 0.85) 0%,
            rgba(218, 165, 32, 0.75) 40%,
            rgba(184, 134, 11, 0.7) 100%
          );
          box-shadow:
            inset -2px -4px 12px rgba(0, 0, 0, 0.15),
            0 0 24px rgba(255, 215, 0, 0.4),
            0 0 48px rgba(218, 165, 32, 0.15);
          position: relative;
          backdrop-filter: blur(0.5px);
        }

        .balloon-highlight {
          position: absolute;
          top: 8%;
          left: 12%;
          width: 20%;
          height: 28%;
          background: radial-gradient(
            ellipse at 35% 35%,
            rgba(255, 255, 255, 0.5),
            transparent
          );
          border-radius: 50%;
          filter: blur(3px);
        }

        .balloon-tether {
          width: 1px;
          height: 15%;
          background: linear-gradient(
            to bottom,
            rgba(80, 80, 80, 0.5),
            rgba(100, 100, 100, 0.25)
          );
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
        }

        .balloon-basket {
          width: 100%;
          height: 15%;
          background: linear-gradient(
            180deg,
            rgba(200, 170, 140, 0.6),
            rgba(170, 145, 120, 0.5)
          );
          border-top: 0.5px solid rgba(0, 0, 0, 0.15);
          position: relative;
        }

        .basket-texture {
          width: 100%;
          height: 100%;
          background-image:
            linear-gradient(90deg, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
            linear-gradient(0deg, rgba(0, 0, 0, 0.08) 1px, transparent 1px);
          background-size: 3px 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .balloon-item {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>

      <div className="floating-balloons-container" ref={containerRef}>
        {balloons.map((balloon) => (
          <div
            key={balloon.id}
            className="balloon-item"
            style={{
              left: `${balloon.left}%`,
              '--balloon-start-opacity': balloon.startOpacity,
              '--balloon-drift': `${balloon.horizontalDrift}px`,
              animation: `floatUp ${balloon.duration}s linear ${balloon.delay}s forwards, delightfulSway ${balloon.duration * 0.75}s ease-in-out ${balloon.delay}s infinite`,
              transform: `scale(${balloon.scale})`,
              zIndex: balloon.zIndex,
            } as React.CSSProperties & Record<string, any>}
          >
            <div className="balloon-body">
              <div className="balloon-highlight" />
            </div>
            <div className="balloon-tether" />
            <div className="balloon-basket">
              <div className="basket-texture" />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
