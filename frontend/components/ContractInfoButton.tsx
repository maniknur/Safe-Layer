'use client'

import { useState, useRef, useEffect } from 'react'

export default function ContractInfoButton() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md border border-amber-500/30 text-amber-500 dark:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all"
      >
        {/* Info icon */}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        Contract Info
      </button>

      {/* Popover panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-[60] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">SafeLayer Registry</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-medium">
                BNB Testnet
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-3 space-y-3">
            {/* What it does */}
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Every risk analysis is hashed and recorded on-chain as immutable proof.
                Results can be independently verified on BscScan.
              </p>
            </div>

            {/* Contract address */}
            <div className="rounded-md bg-slate-50 dark:bg-slate-800/50 p-2.5">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">Contract Address</p>
              <p className="text-[10px] font-mono text-slate-600 dark:text-slate-300 break-all leading-relaxed">
                0x20B28a7b961a6d82222150905b0C01256607B5A3
              </p>
            </div>

            {/* Key facts */}
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Stores keccak256 hash of each analysis report</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Only approved analyzers can submit reports</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">No wallet connection required for users</p>
              </div>
            </div>
          </div>

          {/* Footer with BscScan link */}
          <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
            <a
              href="https://testnet.bscscan.com/address/0x20B28a7b961a6d82222150905b0C01256607B5A3#code"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-medium"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              View on BscScan
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
