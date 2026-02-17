'use client'

import { useState, useCallback } from 'react'
import RiskAnalyzer from '@/components/RiskAnalyzer'
import RiskCard from '@/components/RiskCard'
import EvidencePanel from '@/components/EvidencePanel'
import FormulaBreakdown from '@/components/FormulaBreakdown'
import GitHubPanel from '@/components/GitHubPanel'
import HolderAnalysisPanel from '@/components/HolderAnalysisPanel'
import AuditPanel from '@/components/AuditPanel'
import RadarChart from '@/components/RadarChart'
import OnChainIndicatorsTable from '@/components/OnChainIndicatorsTable'
import RegistryStatus from '@/components/RegistryStatus'
import type { RiskData, SearchHistoryItem } from '@/lib/types'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

type TabKey = 'overview' | 'evidence' | 'formula' | 'onchain' | 'wallet' | 'transparency' | 'scam'

export default function Home() {
  const [riskData, setRiskData] = useState<RiskData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  const handleAnalyze = useCallback(async (address: string) => {
    setLoading(true)
    setError(null)
    setRiskData(null)
    setActiveTab('overview')

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60_000)

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
        throw new Error('Too many requests. Please wait a moment.')
      }
      if (response.status === 404) {
        throw new Error('Backend not reachable. Is the server running?')
      }
      if (!response.ok) {
        throw new Error(`Server error (${response.status})`)
      }

      const data: RiskData = await response.json()

      if (!data.success) {
        throw new Error('Analysis failed. Please try again.')
      }

      setRiskData(data)

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
        ].slice(0, 10)
      })
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request timed out. Please try again.')
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('Cannot connect to backend at ' + BACKEND_URL)
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

  const evidenceCount = riskData?.evidence
    ? Object.values(riskData.evidence).flat().filter(f => f.severity !== 'info').length
    : 0

  return (
    <div className="relative min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-20">
      {/* Search */}
      <div className="mb-8">
        <RiskAnalyzer onAnalyze={handleAnalyze} loading={loading} searchHistory={searchHistory} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4 mb-6" role="alert">
          <div className="flex items-start justify-between gap-3">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-lg leading-none" aria-label="Dismiss">
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-20" role="status">
          <svg className="animate-spin h-6 w-6 text-slate-400 dark:text-slate-500 mb-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Analyzing address...</p>
          <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">Checking contract, on-chain data, and scam databases</p>
        </div>
      )}

      {/* Results */}
      {riskData && !loading && (
        <div className="space-y-5">
          {/* Meta bar */}
          <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500">
            <span>Completed in {riskData.analysisTimeMs}ms</span>
            <button
              onClick={() => handleAnalyze(riskData.address)}
              className="hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Re-analyze
            </button>
          </div>

          {/* Score + Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <RiskCard data={riskData} />
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Risk Breakdown</p>
              {riskData.breakdown && (
                <RadarChart breakdown={riskData.breakdown} size={200} />
              )}
            </div>
          </div>

          {/* On-Chain Registry Status */}
          {riskData.registry && (
            <RegistryStatus registry={riskData.registry} />
          )}

          {/* Tabs */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
              <TabButton label="Overview" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
              <TabButton label="Evidence" isActive={activeTab === 'evidence'} onClick={() => setActiveTab('evidence')} badge={evidenceCount} />
              <TabButton label="On-Chain" isActive={activeTab === 'onchain'} onClick={() => setActiveTab('onchain')} />
              <TabButton label="Wallet" isActive={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} />
              <TabButton label="Transparency" isActive={activeTab === 'transparency'} onClick={() => setActiveTab('transparency')} />
              <TabButton label="Scam DB" isActive={activeTab === 'scam'} onClick={() => setActiveTab('scam')} />
              <TabButton label="Formula" isActive={activeTab === 'formula'} onClick={() => setActiveTab('formula')} />
            </div>

            <div className="p-6 sm:p-8">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Category breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <BreakdownCard label="Contract" value={riskData.breakdown?.contract_risk ?? 0} weight="40%" color="text-purple-600 dark:text-purple-400" />
                    <BreakdownCard label="Behavior" value={riskData.breakdown?.behavior_risk ?? 0} weight="40%" color="text-blue-600 dark:text-blue-400" />
                    <BreakdownCard label="Reputation" value={riskData.breakdown?.reputation_risk ?? 0} weight="20%" color="text-amber-600 dark:text-amber-400" />
                  </div>

                  {/* Flags */}
                  {riskData.flags && riskData.flags.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-md border border-amber-200 dark:border-amber-800/50 p-5">
                      <h3 className="text-xs font-medium text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-3">
                        Risk Indicators ({riskData.flags.length})
                      </h3>
                      <ul className="space-y-1.5">
                        {riskData.flags.slice(0, 8).map((flag, idx) => (
                          <li key={idx} className="text-sm text-amber-900 dark:text-amber-200/80 flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5 shrink-0">&bull;</span>
                            {flag}
                          </li>
                        ))}
                        {riskData.flags.length > 8 && (
                          <li className="text-xs text-amber-600 dark:text-amber-400 pt-1">
                            +{riskData.flags.length - 8} more — see Evidence tab
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Summary */}
                  {riskData.explanation && (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {riskData.explanation.summary}
                      </p>

                      {riskData.explanation.keyFindings.length > 0 && (
                        <div>
                          <h4 className="text-[11px] text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2">Key Findings</h4>
                          <ul className="space-y-1">
                            {riskData.explanation.keyFindings.map((f, i) => (
                              <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                <span className="text-slate-300 dark:text-slate-600 mt-0.5 shrink-0">&bull;</span>
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {riskData.explanation.recommendations.length > 0 && (
                        <div>
                          <h4 className="text-[11px] text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2">Recommendations</h4>
                          <ul className="space-y-1">
                            {riskData.explanation.recommendations.map((r, i) => (
                              <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                <span className="text-green-500 dark:text-green-600 mt-0.5 shrink-0">&bull;</span>
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'evidence' && <EvidencePanel data={riskData} />}
              {activeTab === 'onchain' && <OnChainIndicatorsTable indicators={riskData.onchainIndicators || []} />}
              {activeTab === 'wallet' && <HolderAnalysisPanel data={riskData} />}
              {activeTab === 'transparency' && <GitHubPanel data={riskData} />}
              {activeTab === 'scam' && <AuditPanel data={riskData} />}
              {activeTab === 'formula' && <FormulaBreakdown data={riskData} />}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!riskData && !loading && !error && (
        <div className="text-center py-20">
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            Paste any BNB Chain address above to see its risk profile.
          </p>
        </div>
      )}
      </div>
    </div>
  )
}

function BreakdownCard({ label, value, weight, color }: { label: string; value: number; weight: string; color: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-md border border-slate-200 dark:border-slate-700/50 p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-[10px] text-slate-400 dark:text-slate-600">{weight}</span>
      </div>
      <div className="flex items-end gap-1.5">
        <span className={`text-2xl font-light ${color}`}>{value}</span>
        <span className="text-xs text-slate-400 dark:text-slate-600 mb-0.5">/ 100</span>
      </div>
      <div className="mt-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1 overflow-hidden">
        <div
          className={`h-full ${getGaugeColor(value)} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function getGaugeColor(score: number): string {
  if (score < 20) return 'bg-green-500'
  if (score < 40) return 'bg-blue-500'
  if (score < 60) return 'bg-yellow-500'
  if (score < 80) return 'bg-orange-500'
  return 'bg-red-500'
}

function TabButton({ label, isActive, onClick, badge }: { label: string; isActive: boolean; onClick: () => void; badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
        isActive
          ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-medium'
          : 'border-transparent text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
      }`}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[10px] rounded-full font-medium">
          {badge}
        </span>
      )}
    </button>
  )
}
