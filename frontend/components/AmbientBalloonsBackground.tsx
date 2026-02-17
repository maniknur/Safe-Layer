'use client'

import { useEffect, useState, useRef } from 'react'

interface Balloon {
  id: string
  left: number // 0-100 percentage
  duration: number // 10-20 seconds for initial, 15-30 for ambient
  delay: number // 0-2 seconds stagger
  scale: number // 0.5-1.5 for initial, 0.3-0.8 for ambient
  opacity: number // Starting opacity
  zIndex: number // Random z-index for depth
}

interface AmbientBalloonsBackgroundProps {
  isInteracted?: boolean
}

export default function AmbientBalloonsBackground({
  isInteracted = false,
}: AmbientBalloonsBackgroundProps) {
  const [balloons, setBalloons] = useState<Balloon[]>([])
  const [isClient, setIsClient] = useState(false)
  const balloonCountRef = useRef(0)
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Generate a unique balloon
  const generateBalloon = (): Balloon => {
    balloonCountRef.current += 1

    if (isInteracted) {
      // Ambient mode: smaller, subtler, longer duration
      return {
        id: `balloon-${balloonCountRef.current}-${Date.now()}`,
        left: Math.random() * 100,
        duration: 15 + Math.random() * 15, // 15-30 seconds
        delay: Math.random() * 3, // 0-3 seconds
        scale: 0.3 + Math.random() * 0.5, // 0.3-0.8
        opacity: 0.25 + Math.random() * 0.25, // 0.25-0.5 opacity
        zIndex: Math.floor(Math.random() * 20) + 10, // 10-30
      }
    } else {
      // Initial mode: larger, more prominent, standard duration
      return {
        id: `balloon-${balloonCountRef.current}-${Date.now()}`,
        left: Math.random() * 100,
        duration: 10 + Math.random() * 10, // 10-20 seconds
        delay: Math.random() * 2, // 0-2 seconds
        scale: 0.7 + Math.random() * 0.8, // 0.7-1.5
        opacity: 0.6 + Math.random() * 0.3, // 0.6-0.9 opacity
        zIndex: Math.floor(Math.random() * 15) + 5, // 5-20
      }
    }
  }

  // Spawn balloons periodically
  useEffect(() => {
    setIsClient(true)

    // Clear any existing interval
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current)
    }

    // Initial balloon batch
    const initialBalloons = Array.from(
      { length: isInteracted ? 6 : 4 },
      () => generateBalloon()
    )
    setBalloons(initialBalloons)

    // Spawn new balloons at intervals
    const spawnInterval = isInteracted ? 3000 : 2500 // 2.5-3 seconds

    spawnIntervalRef.current = setInterval(() => {
      setBalloons((prev) => {
        // Add new balloon
        const newBalloon = generateBalloon()
        const updated = [...prev, newBalloon]

        // Remove oldest balloons when count exceeds max
        const maxBalloons = isInteracted ? 20 : 12
        return updated.length > maxBalloons
          ? updated.slice(updated.length - maxBalloons)
          : updated
      })
    }, spawnInterval)

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current)
      }
    }
  }, [isInteracted])

  if (!isClient) return null

  return (
    <>
      <style>{`
        @keyframes float-balloon-up {
          0% {
            transform: translateY(0) translateX(0);
            opacity: var(--balloon-opacity);
          }
          50% {
            transform: translateY(-50vh) translateX(var(--balloon-drift));
          }
          100% {
            transform: translateY(-120vh) translateX(var(--balloon-drift-end));
            opacity: 0;
          }
        }

        @keyframes subtle-sway {
          0%, 100% {
            transform: translateX(0px);
          }
          25% {
            transform: translateX(15px);
          }
          50% {
            transform: translateX(-20px);
          }
          75% {
            transform: translateX(10px);
          }
        }

        .balloon-item {
          position: absolute;
          width: 60px;
          height: 80px;
          pointer-events: none;
          bottom: -150px;
          animation: float-balloon-up linear forwards,
                     subtle-sway 8s ease-in-out infinite;
        }

        .balloon-shape {
          width: 100%;
          height: 75%;
          border-radius: 50% 50% 50% 45%;
          background: linear-gradient(
            135deg,
            rgba(255, 215, 0, 0.95) 0%,
            rgba(218, 165, 32, 0.85) 50%,
            rgba(184, 134, 11, 0.8) 100%
          );
          box-shadow: 
            inset -3px -5px 15px rgba(0, 0, 0, 0.2),
            0 0 20px rgba(255, 215, 0, 0.6),
            0 0 40px rgba(218, 165, 32, 0.3);
          position: relative;
          overflow: hidden;
        }

        .balloon-shine {
          position: absolute;
          top: 10%;
          left: 15%;
          width: 25%;
          height: 30%;
          background: radial-gradient(
            circle at 30% 30%,
            rgba(255, 255, 255, 0.6),
            transparent
          );
          border-radius: 50%;
          filter: blur(4px);
        }

        .balloon-rope {
          width: 1.5px;
          height: 25%;
          background: linear-gradient(
            to bottom,
            rgba(100, 100, 100, 0.6),
            rgba(100, 100, 100, 0.3)
          );
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
        }

        .balloon-basket {
          width: 100%;
          height: 25%;
          background: linear-gradient(
            180deg,
            rgba(210, 180, 140, 0.7),
            rgba(184, 134, 11, 0.6)
          );
          border-top: 1px solid rgba(0, 0, 0, 0.2);
          border-radius: 2px;
          box-shadow: 
            inset 0px 2px 4px rgba(255, 255, 255, 0.3),
            inset 0px -2px 4px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .basket-weave {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
            linear-gradient(0deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
          background-size: 4px 3px;
        }

        /* Optional glow enhancement for elegance */
        .balloon-glow {
          position: absolute;
          inset: -8px;
          background: radial-gradient(
            circle,
            rgba(255, 215, 0, 0.2),
            transparent 70%
          );
          border-radius: 50%;
          filter: blur(8px);
          z-index: -1;
        }

        @media (prefers-reduced-motion: reduce) {
          .balloon-item {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>

      {/* Full-screen animation container */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: isInteracted ? 5 : 15,
          overflow: 'hidden',
          background: 'transparent',
        }}
      >
        {balloons.map((balloon) => {
          // Random horizontal drift for organic movement
          const drift = (Math.random() - 0.5) * 80 // -40 to 40px
          const driftEnd = drift + (Math.random() - 0.5) * 60 // Additional drift at end

          return (
            <div
              key={balloon.id}
              className="balloon-item"
              style={{
                left: `${balloon.left}%`,
                animationDuration: `${balloon.duration}s`,
                animationDelay: `${balloon.delay}s`,
                transform: `scale(${balloon.scale})`,
                zIndex: balloon.zIndex,
                '--balloon-opacity': Math.min(balloon.opacity, 0.9),
                '--balloon-drift': `${drift}px`,
                '--balloon-drift-end': `${driftEnd}px`,
              } as React.CSSProperties & Record<string, any>}
            >
              {/* Glow background */}
              <div className="balloon-glow" />

              {/* Main balloon shape */}
              <div className="balloon-shape">
                <div className="balloon-shine" />
              </div>

              {/* Rope connecting to basket */}
              <div className="balloon-rope" />

              {/* Basket */}
              <div className="balloon-basket">
                <div className="basket-weave" />
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
