'use client'

import { useState, useRef } from 'react'
import { isValidAddress } from '@/lib/utils'
import type { SearchHistoryItem } from '@/lib/types'

interface RiskAnalyzerProps {
  onAnalyze: (address: string) => void
  loading: boolean
  searchHistory: SearchHistoryItem[]
}

const EXAMPLE_ADDRESSES = [
  { address: '0x10ED43C718714eb63d5aA57B78B54704E256024E', protocol: 'PancakeSwap Router V2' },
  { address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', protocol: 'CAKE Token' },
  { address: '0x55d398326f99059fF775485246999027B3197955', protocol: 'USDT (BSC)' },
  { address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', protocol: 'WBNB' },
  { address: '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4', protocol: 'PancakeSwap Router V3' },
  { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', protocol: 'USDC (BSC)' },
  { address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', protocol: 'ETH (BSC)' },
  { address: '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE', protocol: 'XRP (BSC)' },
]

export default function RiskAnalyzer({ onAnalyze, loading, searchHistory }: RiskAnalyzerProps) {
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const exampleIndexRef = useRef(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmed = address.trim()

    if (!trimmed) {
      setError('Please enter a wallet address')
      return
    }

    if (!isValidAddress(trimmed)) {
      setError('Invalid address format (must be 0x followed by 40 hex characters)')
      return
    }

    onAnalyze(trimmed)
  }

  const handleExample = () => {
    const example = EXAMPLE_ADDRESSES[exampleIndexRef.current]
    setAddress(example.address)
    setError(null)
    exampleIndexRef.current = (exampleIndexRef.current + 1) % EXAMPLE_ADDRESSES.length
  }

  const handleHistoryClick = (historyAddress: string) => {
    setAddress(historyAddress)
    setError(null)
    onAnalyze(historyAddress)
  }

  // Find the current displayed example to show its protocol name
  const currentExample = EXAMPLE_ADDRESSES.find(e => e.address === address)

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
      <form onSubmit={handleSubmit}>
        <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Wallet or Contract Address
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              id="address"
              type="text"
              placeholder="0x..."
              value={address}
              onChange={(e) => {
                setAddress(e.target.value)
                setError(null)
              }}
              disabled={loading}
              autoComplete="off"
              spellCheck={false}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent disabled:opacity-50 transition-colors"
            />
            {currentExample && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 dark:text-slate-500 pointer-events-none hidden sm:inline">
                {currentExample.protocol}
              </span>
            )}
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-white dark:text-slate-900 font-medium py-2.5 px-6 rounded-md transition-colors text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Analyze'
              )}
            </button>
            <button
              type="button"
              onClick={handleExample}
              disabled={loading}
              className="px-4 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 rounded-md transition-colors text-sm border border-slate-200 dark:border-slate-700"
              title="Load example address (click again to cycle)"
            >
              Try example
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-2" role="alert">
            {error}
          </p>
        )}

        {/* Protocol hint on mobile when example is shown */}
        {currentExample && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 sm:hidden">
            {currentExample.protocol}
          </p>
        )}
      </form>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs text-slate-500 dark:text-slate-500 mb-2.5 uppercase tracking-wider">Recent searches</h3>
          <div className="flex flex-wrap gap-2">
            {searchHistory.slice(0, 5).map((item) => (
              <button
                key={`${item.address}-${item.timestamp}`}
                onClick={() => handleHistoryClick(item.address)}
                disabled={loading}
                className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-mono transition-colors"
                title={`Score: ${item.riskScore} — ${item.riskLevel}`}
              >
                {item.address.slice(0, 6)}...{item.address.slice(-4)}
                <span className={`ml-2 font-medium ${
                  item.riskScore < 40 ? 'text-green-600 dark:text-green-400' :
                  item.riskScore < 60 ? 'text-amber-600 dark:text-amber-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {item.riskScore}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Example addresses quick list */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-xs text-slate-500 dark:text-slate-500 mb-2.5 uppercase tracking-wider">Popular contracts on BNB Chain</h3>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_ADDRESSES.map((ex) => (
            <button
              key={ex.address}
              type="button"
              onClick={() => {
                setAddress(ex.address)
                setError(null)
              }}
              disabled={loading}
              className={`text-[11px] px-2.5 py-1 rounded transition-colors disabled:opacity-40 ${
                address === ex.address
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50'
              }`}
            >
              {ex.protocol}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
