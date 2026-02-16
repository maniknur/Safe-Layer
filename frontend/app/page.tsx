'use client'

import { useState, useCallback } from 'react'
import RiskAnalyzer from '@/components/RiskAnalyzer'
import RiskCard from '@/components/RiskCard'
import EvidencePanel from '@/components/EvidencePanel'
import FormulaBreakdown from '@/components/FormulaBreakdown'
import GitHubPanel from '@/components/GitHubPanel'
import HolderAnalysisPanel from '@/components/HolderAnalysisPanel'
import AuditPanel from '@/components/AuditPanel'
import type { RiskData, SearchHistoryItem } from '@/lib/types'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
const FETCH_TIMEOUT_MS = 30_000

export default function Home() {
  const [riskData, setRiskData] = useState<RiskData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'formula' | 'github' | 'holders' | 'audits'>('overview')

  const handleAnalyze = useCallback(async (address: string) => {
    setLoading(true)
    setError(null)
    setRiskData(null)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/risk/${address.trim()}`,
        { signal: controller.signal }
      )

      if (response.status === 400) {
        const data = await response.json()
        throw new Error(data.message || 'Invalid address format')
      }

      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.')
      }

      if (response.status === 404) {
        throw new Error('API endpoint not found. Make sure the backend is running.')
      }

      if (!response.ok) {
        throw new Error(`Server error (${response.status}). Please try again later.`)
      }

      const data: RiskData = await response.json()

      if (!data.success) {
        throw new Error('Analysis failed. Please try again.')
      }

      setRiskData(data)

      // Update search history
      setSearchHistory(prev => {
        const filtered = prev.filter(h => h.address !== data.address)
        return [
          {
            address: data.address,
            riskScore: data.riskScore,
            riskLevel: data.riskLevel,
            timestamp: data.timestamp,
          },
          ...filtered,
        ].slice(0, 10) // Keep last 10
      })
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request timed out. The server may be busy - please try again.')
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('Cannot connect to backend. Make sure the server is running on ' + BACKEND_URL)
        } else {
          setError(err.message)
        }
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }, [])

  const handleRetry = () => {
    if (riskData?.address) {
      handleAnalyze(riskData.address)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Hero Section */}
        <div className="mb-12">
          <h2 className="text-4xl sm:text-5xl font-light text-slate-900 dark:text-white mb-4 tracking-tight">
            Risk Intelligence
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed font-light">
            Analyze wallet and smart contract risks on BNB Chain with real-time blockchain data. 
            Make informed decisions with comprehensive risk intelligence.
          </p>
        </div>

        {/* Analyzer Section */}
        <div className="mb-12">
          <RiskAnalyzer
            onAnalyze={handleAnalyze}
            loading={loading}
            searchHistory={searchHistory}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8" role="alert">
            <div className="flex items-start justify-between gap-4">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 shrink-0 text-sm focus:outline-none"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-16" role="status" aria-live="polite">
            <div className="animate-pulse">
              <div className="h-8 w-8 bg-slate-300 dark:bg-slate-700 rounded-full mb-4" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Analyzing address</p>
            <p className="text-slate-500 dark:text-slate-500 text-xs mt-2">Processing blockchain data</p>
          </div>
        )}

        {/* Results Section */}
        {riskData && !loading && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Refresh Button */}
            <div className="flex justify-end">
              <button
                onClick={handleRetry}
                className="text-sm text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 py-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Re-analyze
              </button>
            </div>

            <RiskCard data={riskData} />

            {/* Tabbed Interface */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <TabButton
                  label="Overview"
                  isActive={activeTab === 'overview'}
                  onClick={() => setActiveTab('overview')}
                />
                <TabButton
                  label="Evidence"
                  isActive={activeTab === 'evidence'}
                  onClick={() => setActiveTab('evidence')}
                  badge={riskData.flags?.length}
                />
                <TabButton
                  label="Formula"
                  isActive={activeTab === 'formula'}
                  onClick={() => setActiveTab('formula')}
                />
                <TabButton
                  label="GitHub"
                  isActive={activeTab === 'github'}
                  onClick={() => setActiveTab('github')}
                />
                <TabButton
                  label="Holders"
                  isActive={activeTab === 'holders'}
                  onClick={() => setActiveTab('holders')}
                />
                <TabButton
                  label="Audits"
                  isActive={activeTab === 'audits'}
                  onClick={() => setActiveTab('audits')}
                />
              </div>

              {/* Tab Content */}
              <div className="p-6 sm:p-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-7">
                    {/* Detailed Breakdown */}
                    <div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Risk Components</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <BreakdownCard
                          label="Transaction Risk"
                          value={riskData.components.transactionRisk}
                          color="text-blue-600 dark:text-blue-400"
                        />
                        <BreakdownCard
                          label="Contract Risk"
                          value={riskData.components.contractRisk}
                          color="text-purple-600 dark:text-purple-400"
                        />
                        <BreakdownCard
                          label="Liquidity Risk"
                          value={riskData.components.liquidityRisk}
                          color="text-amber-600 dark:text-amber-400"
                        />
                        <BreakdownCard
                          label="Behavioral Risk"
                          value={riskData.components.behavioralRisk}
                          color="text-pink-600 dark:text-pink-400"
                        />
                      </div>
                    </div>

                    {/* Risk Flags */}
                    {riskData.flags && riskData.flags.length > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800 p-5">
                        <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 uppercase tracking-wide mb-3">
                          Risk Indicators ({riskData.flags.length})
                        </h3>
                        <ul className="space-y-2">
                          {riskData.flags.map((flag, idx) => {
                            const flagText = typeof flag === 'string' ? flag : flag.name || 'Unknown'
                            return (
                              <li
                                key={`flag-${idx}`}
                                className="flex items-start gap-3 text-sm text-amber-900 dark:text-amber-200 font-light"
                              >
                                <span className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0 font-bold">•</span>
                                {flagText}
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}

                    {/* AI Risk Analysis */}
                    {riskData.explanation && (
                      <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="text-base font-medium text-slate-900 dark:text-white mb-5">Analysis</h3>

                        <div className="space-y-6">
                          <div>
                            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-2">Summary</h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-light">{riskData.explanation.summary}</p>
                          </div>

                          {riskData.explanation.keyFindings.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-3">Key Findings</h4>
                              <ul className="space-y-2">
                                {riskData.explanation.keyFindings.map((finding, idx) => (
                                  <li key={`finding-${idx}`} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 font-light">
                                    <span className="text-slate-400 dark:text-slate-600 mt-1.5 shrink-0">→</span>
                                    {finding}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {riskData.explanation.recommendations.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-3">
                                Recommendations
                              </h4>
                              <ul className="space-y-2">
                                {riskData.explanation.recommendations.map((rec, idx) => (
                                  <li key={`rec-${idx}`} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 font-light">
                                    <span className="text-green-600 dark:text-green-500 mt-1.5 shrink-0 font-bold">✓</span>
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Evidence Tab */}
                {activeTab === 'evidence' && (
                  <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                    <EvidencePanel flags={riskData.flags || []} address={riskData.address} />
                  </div>
                )}

                {/* Formula Tab */}
                {activeTab === 'formula' && (
                  <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                    <FormulaBreakdown
                      components={riskData.components}
                      riskScore={riskData.riskScore}
                      flags={riskData.flags || []}
                    />
                  </div>
                )}

                {/* GitHub Tab */}
                {activeTab === 'github' && (
                  <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                    <GitHubPanel github={riskData.github} address={riskData.address} />
                  </div>
                )}

                {/* Holders Tab */}
                {activeTab === 'holders' && (
                  <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                    <HolderAnalysisPanel holders={riskData.holders} address={riskData.address} />
                  </div>
                )}

                {/* Audits Tab */}
                {activeTab === 'audits' && (
                  <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                    <AuditPanel audits={riskData.audits} address={riskData.address} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!riskData && !loading && !error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-slate-400 text-lg mb-2">
              Enter a wallet or contract address to begin
            </p>
            <p className="text-slate-500 text-sm">
              SafeLayer queries the BNB Chain in real-time to assess risk
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function BreakdownCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5">
      <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase mb-2">
        {label}
      </h3>
      <div className="flex items-end gap-2">
        <p className={`text-3xl font-bold ${color}`}>
          {value}
        </p>
        <span className="text-sm text-slate-500 dark:text-slate-500 mb-1">/ 100</span>
      </div>
      <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full ${getRiskGaugeColorInline(value)} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function getRiskGaugeColorInline(score: number): string {
  if (score < 20) return 'bg-green-500'
  if (score < 40) return 'bg-blue-500'
  if (score < 60) return 'bg-yellow-500'
  if (score < 80) return 'bg-orange-500'
  return 'bg-red-500'
}

function TabButton({
  label,
  isActive,
  onClick,
  badge,
}: {
  label: string
  isActive: boolean
  onClick: () => void
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
        isActive
          ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
          : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
      }`}
    >
      {label}
      {badge && badge > 0 && (
        <span className="ml-1 px-2 py-0.5 bg-amber-600 dark:bg-amber-700 text-white text-xs rounded-full font-light">
          {badge}
        </span>
      )}
    </button>
  )
}
