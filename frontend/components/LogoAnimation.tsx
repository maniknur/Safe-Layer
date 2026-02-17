'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function LogoAnimation() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="group relative inline-flex items-center">
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(217, 119, 6, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(217, 119, 6, 0.8);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .logo-container {
          animation: float 3s ease-in-out infinite;
        }

        .logo-container:hover {
          animation: float 2s ease-in-out infinite, glow 2s ease-in-out infinite;
        }

        .logo-glow {
          animation: glow 3s ease-in-out infinite;
        }

        .logo-spin {
          animation: spin-slow 20s linear infinite;
        }

        .logo-spin:hover {
          animation: spin-slow 10s linear infinite;
        }

        .logo-pulse {
          animation: pulse-scale 2s ease-in-out infinite;
        }

        .logo-fade-in {
          animation: fadeIn 0.6s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .logo-hover-icon::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 8px;
          background: linear-gradient(45deg, rgb(217, 119, 6), rgb(180, 83, 9));
          opacity: 0;
          z-index: -1;
          transition: opacity 0.3s ease;
        }

        .logo-hover-icon:hover::after {
          opacity: 0.1;
        }
      `}</style>

      <div className={`logo-container logo-fade-in relative ${isLoaded ? '' : ''}`}>
        <div className="logo-glow relative inline-flex">
          <Image
            src="/logo.png"
            alt="SafeLayer Logo"
            width={80}
            height={80}
            className="h-20 w-20 object-cover rounded-lg transition-transform hover:scale-110 cursor-pointer"
            priority
          />
        </div>
      </div>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        SafeLayer Risk Intelligence
      </div>
    </div>
  )
}
