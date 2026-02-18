'use client'

import Image from 'next/image'

export default function LogoAnimation() {

  return (
    <div className="group relative inline-flex items-center">
      <div className="logo-container logo-fade-in relative">
        <div className="logo-glow relative inline-flex">
          <Image
            src="/logo.png"
            alt="SafeLayer Logo"
            width={36}
            height={36}
            className="h-9 w-9 object-cover rounded-md transition-transform hover:scale-110 cursor-pointer"
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
