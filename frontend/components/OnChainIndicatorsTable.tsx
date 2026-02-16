'use client';

import type { OnChainIndicator } from '@/lib/types';

interface OnChainIndicatorsTableProps {
  indicators: OnChainIndicator[];
}

function getRiskColor(weight: number): string {
  if (weight >= 20) return 'text-red-600 dark:text-red-400';
  if (weight >= 10) return 'text-orange-600 dark:text-orange-400';
  if (weight >= 5) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
}

function getRiskDot(weight: number): string {
  if (weight >= 20) return 'bg-red-500';
  if (weight >= 10) return 'bg-orange-500';
  if (weight >= 5) return 'bg-yellow-500';
  return 'bg-green-500';
}

export default function OnChainIndicatorsTable({ indicators }: OnChainIndicatorsTableProps) {
  if (!indicators || indicators.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
        No on-chain indicators available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-slate-900 dark:text-white uppercase tracking-wide">
        On-Chain Indicators
      </h3>

      <div className="border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          <div className="col-span-3 text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Indicator</div>
          <div className="col-span-7 text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Evidence</div>
          <div className="col-span-2 text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-right">Risk</div>
        </div>

        {/* Table Rows */}
        {indicators.map((row, idx) => (
          <div
            key={idx}
            className={`grid grid-cols-12 gap-2 px-4 py-3 border-b last:border-b-0 border-slate-200 dark:border-slate-800 ${
              idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-900/50'
            }`}
          >
            <div className="col-span-3 text-xs font-medium text-slate-800 dark:text-slate-200">
              {row.indicator}
            </div>
            <div className="col-span-7 text-xs text-slate-600 dark:text-slate-400 font-light">
              {row.evidence}
            </div>
            <div className={`col-span-2 text-xs font-medium text-right flex items-center justify-end gap-1.5 ${getRiskColor(row.riskWeight)}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${getRiskDot(row.riskWeight)}`} />
              {row.riskWeight}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-slate-500 dark:text-slate-400">
        Risk weight indicates contribution to overall on-chain behavior score. Higher = more concerning.
      </p>
    </div>
  );
}
