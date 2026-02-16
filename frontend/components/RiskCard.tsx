'use client'

import type { RiskData } from '@/lib/types'
import { shortenAddress, getRiskBadgeClasses, getRiskGaugeColor } from '@/lib/utils'

interface RiskCardProps {
  data: RiskData
}

export default function RiskCard({ data }: RiskCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Address</p>
            <span className={`text-xs px-2.5 py-0.5 rounded-sm border font-medium ${getRiskBadgeClasses(data.riskLevel)}`}>
              {data.addressType}
            </span>
          </div>
          <p className="font-mono text-sm text-slate-700 dark:text-slate-300 break-all font-light">
            {data.address}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-slate-600 dark:text-slate-500 mb-1 font-medium">Analyzed</p>
          <p className="text-xs text-slate-700 dark:text-slate-400 font-light">
            {new Date(data.timestamp).toLocaleDateString()} {new Date(data.timestamp).toLocaleTimeString()}
          </p>
          {data.analysisTimeMs > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-600 mt-1.5 font-light">
              {data.analysisTimeMs}ms
            </p>
          )}
        </div>
      </div>

      {/* Risk Score Gauge */}
      <div className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-baseline mb-4">
          <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Risk Score</h4>
          <span className={`text-5xl font-light tracking-tighter ${getRiskBadgeClasses(data.riskLevel).split(' ')[0]}`}>
            {data.riskScore}
          </span>
        </div>

        {/* Gauge Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden" role="progressbar" aria-valuenow={data.riskScore} aria-valuemin={0} aria-valuemax={100} aria-label={`Risk score: ${data.riskScore} out of 100`}>
          <div
            className={`h-full ${getRiskGaugeColor(data.riskScore)} transition-all duration-700 ease-out`}
            style={{ width: `${data.riskScore}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-600 mt-2 font-light">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>

      {/* Risk Level Badge + Rug Pull Risk */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2">
        <div className={`inline-block px-4 py-2 rounded-md border font-medium text-sm ${getRiskBadgeClasses(data.riskLevel)}`}>
          {data.riskLevel} Risk
        </div>

        {data.rugPullRisk > 0 && (
          <div className={`inline-block px-3 py-1.5 rounded-md border text-xs font-medium ${
            data.rugPullRisk > 50
              ? 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
              : data.rugPullRisk > 25
              ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
              : 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
          }`}>
            Rug Risk: {data.rugPullRisk}%
          </div>
        )}
      </div>
    </div>
  )
}
