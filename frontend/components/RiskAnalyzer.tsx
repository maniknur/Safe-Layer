'use client'

import { useState } from 'react'
import { isValidAddress } from '@/lib/utils'
import type { SearchHistoryItem } from '@/lib/types'

interface RiskAnalyzerProps {
  onAnalyze: (address: string) => void
  loading: boolean
  searchHistory: SearchHistoryItem[]
}

export default function RiskAnalyzer({ onAnalyze, loading, searchHistory }: RiskAnalyzerProps) {
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)

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
    // PancakeSwap Router - a real, well-known BNB Chain contract
    const exampleAddress = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
    setAddress(exampleAddress)
    setError(null)
  }

  const handleHistoryClick = (historyAddress: string) => {
    setAddress(historyAddress)
    setError(null)
    onAnalyze(historyAddress)
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
      <h2 className="text-2xl font-light text-slate-900 dark:text-white mb-6 tracking-tight">Analyze Risk</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Wallet or Contract Address
          </label>
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
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-900 transition-colors"
          />
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-light" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-slate-900 font-semibold py-3 px-6 rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-slate-900 text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-current" />
                Analyzing
              </span>
            ) : (
              'Analyze'
            )}
          </button>

          <button
            type="button"
            onClick={handleExample}
            disabled={loading}
            className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-slate-100 font-semibold rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-slate-900 text-sm"
          >
            Example
          </button>
        </div>
      </form>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="mt-7 pt-5 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wider">Recent</h3>
          <div className="flex flex-wrap gap-2">
            {searchHistory.slice(0, 5).map((item) => (
              <button
                key={`${item.address}-${item.timestamp}`}
                onClick={() => handleHistoryClick(item.address)}
                disabled={loading}
                className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 rounded-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600"
                title={`Score: ${item.riskScore} - ${item.riskLevel}`}
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

      <div className="mt-7 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-light">
          Enter a wallet or contract address to analyze risk factors including holder concentration, 
          liquidity patterns, and smart contract behavior on BNB Chain.
        </p>
      </div>
    </div>
  )
}
