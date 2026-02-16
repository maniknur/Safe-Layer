'use client';

import { HolderAnalysis } from '@/lib/types';
import { AlertCircle, TrendingDown, ExternalLink } from 'lucide-react';

interface HolderAnalysisPanelProps {
  holders?: HolderAnalysis;
  address: string;
}

export default function HolderAnalysisPanel({ holders, address }: HolderAnalysisPanelProps) {
  // Mock data if not provided
  const mockHolders: HolderAnalysis = holders || {
    top1Percent: 45,
    top5Percent: 72,
    top10Percent: 88,
    totalHolders: 1250,
    concentration: 'HIGH'
  };

  const concentrationRiskLevel = mockHolders.top1Percent && mockHolders.top1Percent >= 40 ? 'CRITICAL' : 'MODERATE';
  const isHighRisk = mockHolders.concentration === 'HIGH' || mockHolders.concentration === 'VERY_HIGH';

  const bscscanHoldersLink = `https://bscscan.com/token/${address}#holders`;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">Holder Concentration Analysis</h3>

      {isHighRisk && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-200">High Concentration Risk</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Token ownership is concentrated among a few holders. This increases risk of sudden price dumps or manipulation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Holder Distribution */}
      <div className="space-y-3">
        <h4 className="font-medium text-slate-900 dark:text-white text-sm">Token Distribution</h4>

        {/* Top 1% */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Top 1% of Holders</p>
              <p className={`text-xs font-semibold ${
                concentrationRiskLevel === 'CRITICAL' 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                {concentrationRiskLevel === 'CRITICAL' ? '🔴 Critical' : '🟠 Moderate'}
              </p>
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{mockHolders.top1Percent}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${
                mockHolders.top1Percent && mockHolders.top1Percent >= 40 ? 'bg-red-500' : 'bg-orange-500'
              }`}
              style={{ width: `${Math.min(mockHolders.top1Percent || 0, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
            {mockHolders.top1Percent && mockHolders.top1Percent >= 40
              ? 'Critical concentration - High risk of rug pull'
              : 'Concerning concentration - Monitor closely'}
          </p>
        </div>

        {/* Top 5% */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-slate-900 dark:text-white">Top 5% of Holders</p>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{mockHolders.top5Percent}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-yellow-500"
              style={{ width: `${Math.min(mockHolders.top5Percent || 0, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
            Tokens held by top 5% holders
          </p>
        </div>

        {/* Top 10% */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-slate-900 dark:text-white">Top 10% of Holders</p>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{mockHolders.top10Percent}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-green-500"
              style={{ width: `${Math.min(mockHolders.top10Percent || 0, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
            Tokens held by top 10% holders
          </p>
        </div>
      </div>

      {/* Total Holders */}
      {mockHolders.totalHolders && (
        <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold tracking-wide mb-1">Total Holders</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{mockHolders.totalHolders.toLocaleString()}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
            More holders generally indicates better distribution and lower rug pull risk
          </p>
        </div>
      )}

      {/* Concentration Metric */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">Risk Interpretation</h4>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
          <div className="flex gap-2">
            <span className="flex-shrink-0">
              {mockHolders.top1Percent && mockHolders.top1Percent >= 50 ? '🔴' : mockHolders.top1Percent && mockHolders.top1Percent >= 30 ? '🟠' : '🟡'}
            </span>
            <span>Top 1% holder owns <strong>{mockHolders.top1Percent}%</strong> of all tokens</span>
          </div>
          <div className="flex gap-2">
            <span className="flex-shrink-0">📊</span>
            <span>Distribution across <strong>{mockHolders.totalHolders?.toLocaleString()}</strong> unique addresses</span>
          </div>
          <div className="flex gap-2">
            <span className="flex-shrink-0">⚠️</span>
            <span>
              {isHighRisk
                ? 'High concentration increases risk of instant liquidity withdrawal'
                : 'Acceptable distribution, but monitor changes'}
            </span>
          </div>
        </div>
      </div>

      {/* BscScan Link */}
      <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          View complete holder list and real-time distribution on BscScan
        </p>
        <a
          href={bscscanHoldersLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors text-sm font-medium"
        >
          View Holders on BscScan
          <ExternalLink size={16} className="hidden sm:inline" />
        </a>
      </div>

      {/* Recommendations */}
      <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-3">Recommendations</h4>
        <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-300">
          <li className="flex gap-2">
            <span className="flex-shrink-0">✓</span>
            <span>Watch for large holder movements - sudden sales could crash price</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0">✓</span>
            <span>Check if top holders have vesting schedules or lock periods</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0">✓</span>
            <span>More evenly distributed tokens generally indicate healthier projects</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
