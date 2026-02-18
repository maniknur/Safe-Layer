'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

// ============================================================
// DigitalNetworkBackground
// ============================================================
//
// "Digital Intelligence Network in Space"
//
// Visual system:
//   - Small glowing gold dots (nodes) drift slowly upward
//   - Subtle twinkle animation on each node (opacity oscillation)
//   - 1–2 faint connecting lines that fade in/out
//   - Two depth layers for parallax:
//       foreground: brighter, slightly faster
//       background: dimmer, slower, smaller
//
// Architecture:
//   - position: fixed, inset: 0, pointer-events: none
//   - Nodes are spawned on an interval (1.5–3s)
//   - Each node self-removes via onAnimationEnd
//   - Max 25 nodes active at once
//   - Lines are always present (2 static elements with CSS animation)
//   - All motion uses transform + opacity only (GPU composited)
//   - Full animation shorthand set INLINE to avoid Next.js
//     CSS pipeline conflicts
//   - SSR-safe: renders null on server
//
// Performance:
//   - Max 25 nodes + 2 lines = 27 DOM elements
//   - will-change: transform, opacity on animated elements
//   - No filter in keyframes (stays on compositor)
//   - Interval cleaned up on unmount
// ============================================================

// --------------- Types ---------------

type DepthLayer = 'fg' | 'bg'

interface Node {
  id: number
  /** Horizontal position 0–100% */
  x: number
  /** Depth layer */
  layer: DepthLayer
  /** Dot size in px (2–5) */
  size: number
  /** Peak opacity (0.3–0.8) */
  opacity: number
  /** Upward drift duration in seconds */
  driftDuration: number
  /** Twinkle speed in seconds */
  twinkleDuration: number
  /** Horizontal drift in px */
  drift: number
  /** Start delay in seconds */
  delay: number
}

// --------------- Constants ---------------

const MAX_NODES = 25
const SPAWN_MIN_MS = 1500
const SPAWN_MAX_MS = 3000

// --------------- Helpers ---------------

const rand = (min: number, max: number) => min + Math.random() * (max - min)

// ============================================================
// Component
// ============================================================

export default function DigitalNetworkBackground() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [isClient, setIsClient] = useState(false)
  const nextId = useRef(0)
  const spawnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ---- Node factory ----

  const createNode = useCallback((delay = 0): Node => {
    const isForeground = Math.random() < 0.4 // 40% foreground

    if (isForeground) {
      return {
        id: nextId.current++,
        x: rand(3, 97),
        layer: 'fg',
        size: rand(3.5, 6),
        opacity: rand(0.7, 1),
        driftDuration: rand(20, 32),
        twinkleDuration: rand(3, 5),
        drift: rand(-30, 30),
        delay,
      }
    }

    // Background node: smaller, slightly dimmer, slower
    return {
      id: nextId.current++,
      x: rand(3, 97),
      layer: 'bg',
      size: rand(2.5, 4),
      opacity: rand(0.45, 0.7),
      driftDuration: rand(28, 40),
      twinkleDuration: rand(4, 7),
      drift: rand(-18, 18),
      delay,
    }
  }, [])

  // ---- Remove node after animation ends ----

  const removeNode = useCallback((id: number) => {
    setNodes((prev) => prev.filter((n) => n.id !== id))
  }, [])

  // ---- SSR gate ----

  useEffect(() => { setIsClient(true) }, [])

  // ---- Spawn lifecycle ----

  useEffect(() => {
    if (!isClient) return

    // Seed initial batch with staggered delays
    setNodes(
      Array.from({ length: 8 }, () => createNode(rand(0, 6)))
    )

    // Recursive spawner with random interval
    const scheduleNext = () => {
      spawnTimer.current = setTimeout(() => {
        setNodes((prev) => {
          if (prev.length >= MAX_NODES) {
            scheduleNext()
            return prev
          }
          return [...prev, createNode()]
        })
        scheduleNext()
      }, rand(SPAWN_MIN_MS, SPAWN_MAX_MS))
    }
    scheduleNext()

    return () => {
      if (spawnTimer.current) clearTimeout(spawnTimer.current)
    }
  }, [isClient, createNode])

  // ---- SSR gate ----

  if (!isClient) return null

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* ---- Nodes (glowing dots) ---- */}
      {nodes.map((n) => (
        <div
          key={n.id}
          className="net-node"
          onAnimationEnd={(e) => {
            // Only remove on the drift animation ending, not the twinkle
            if (e.animationName === 'netDrift') {
              removeNode(n.id)
            }
          }}
          style={{
            left: `${n.x}%`,
            width: `${n.size}px`,
            height: `${n.size}px`,
            '--n-opacity': n.opacity,
            '--n-drift': `${n.drift}px`,
            zIndex: n.layer === 'fg' ? 2 : 1,
            animation: [
              `netDrift ${n.driftDuration}s linear ${n.delay}s forwards`,
              `netTwinkle ${n.twinkleDuration}s ease-in-out ${n.delay}s infinite`,
            ].join(', '),
          } as React.CSSProperties}
        />
      ))}

      {/* ---- Connecting lines (always present, CSS-only) ---- */}
      <div
        className="net-line"
        style={{
          left: '15%',
          top: '25%',
          width: '160px',
          animation: 'netLinePulse 10s ease-in-out infinite',
          transform: 'rotate(-12deg)',
        }}
      />
      <div
        className="net-line"
        style={{
          right: '18%',
          top: '45%',
          width: '130px',
          animation: 'netLinePulse 13s ease-in-out 3s infinite',
          transform: 'rotate(15deg)',
        }}
      />
      <div
        className="net-line"
        style={{
          left: '45%',
          top: '70%',
          width: '100px',
          animation: 'netLinePulse 16s ease-in-out 6s infinite',
          transform: 'rotate(-8deg)',
        }}
      />
    </div>
  )
}
