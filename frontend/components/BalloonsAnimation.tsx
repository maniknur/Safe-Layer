'use client'

import { useEffect, useState } from 'react'

interface Balloon {
  id: number
  left: number
  duration: number
  delay: number
  color: string
}

export default function BalloonsAnimation() {
  const [balloons, setBalloons] = useState<Balloon[]>([])
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const colors = [
      'from-red-400 to-red-600',
      'from-yellow-400 to-orange-500',
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600',
      'from-indigo-400 to-indigo-600',
      'from-cyan-400 to-cyan-600',
    ]

    // Generate random balloons
    const generatedBalloons = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 6 + Math.random() * 4, // 6-10 seconds
      delay: Math.random() * 2, // 0-2 seconds delay
      color: colors[Math.floor(Math.random() * colors.length)],
    }))

    setBalloons(generatedBalloons)
  }, [])

  return (
    <>
      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(100px);
            opacity: 0;
          }
        }

        @keyframes balloon-sway {
          0%, 100% {
            transform: translateX(0px);
          }
          25% {
            transform: translateX(20px);
          }
          50% {
            transform: translateX(-15px);
          }
          75% {
            transform: translateX(10px);
          }
        }

        .balloon-container {
          position: fixed;
          bottom: -100px;
          width: 40px;
          height: 60px;
          pointer-events: none;
          z-index: 40;
        }

        .balloon {
          width: 100%;
          height: 100%;
          border-radius: 50% 50% 50% 0%;
          position: relative;
          box-shadow: inset -2px -2px 8px rgba(0, 0, 0, 0.2);
          animation: float-up var(--duration)s linear var(--delay)s infinite,
                    balloon-sway calc(var(--duration)s * 1.5) ease-in-out var(--delay)s infinite;
        }

        .balloon::before {
          content: '';
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 20px;
          background: rgba(0, 0, 0, 0.3);
        }

        .balloon::after {
          content: '';
          position: absolute;
          bottom: -25px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 5px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .balloon {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>

      {isVisible && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {balloons.map((balloon) => (
            <div
              key={balloon.id}
              className="balloon-container"
              style={{
                left: `${balloon.left}%`,
                '--duration': balloon.duration,
                '--delay': balloon.delay,
              } as React.CSSProperties & { '--duration': number; '--delay': number }}
            >
              <div
                className={`balloon bg-gradient-to-b ${balloon.color}`}
              />
            </div>
          ))}
        </div>
      )}
    </>
  )
}
