'use client';

import type { RiskData } from '@/lib/types';

interface HolderAnalysisPanelProps {
  data: RiskData;
}

export default function HolderAnalysisPanel({ data }: HolderAnalysisPanelProps) {
  const wallet = data.analysis?.wallet;
  const onchain = data.analysis?.onchain;

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-medium text-slate-900 dark:text-white uppercase tracking-wide">
        Wallet History & Fund Flow
      </h3>

      {/* Wallet Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Transactions" value={wallet?.transactionCount?.toString() ?? '0'} />
        <MetricCard label="Age (days)" value={wallet?.ageInDays?.toString() ?? '0'} />
        <MetricCard label="Balance" value={`${parseFloat(wallet?.balanceBNB ?? '0').toFixed(4)} BNB`} />
        <MetricCard label="Wallet Score" value={`${wallet?.score ?? 0}/100`} />
      </div>

      {/* Fund Flow Summary */}
      {wallet?.fundFlowSummary && (
        <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-md p-4">
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Fund Flow Summary</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-light font-mono">{wallet.fundFlowSummary}</p>
        </div>
      )}

      {/* Deployed Contracts */}
      {wallet?.deployedContracts && wallet.deployedContracts.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Deployed Contracts ({wallet.deployedContracts.length})
          </p>
          <div className="space-y-1.5">
            {wallet.deployedContracts.slice(0, 10).map((addr, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-3 py-2">
                <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                  {addr.slice(0, 10)}...{addr.slice(-6)}
                </span>
                <a
                  href={`https://bscscan.com/address/${addr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  BscScan
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Linked Rugpulls */}
      {wallet?.linkedRugpulls && wallet.linkedRugpulls.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <p className="text-xs font-semibold text-red-900 dark:text-red-200 mb-2">
            Linked Rugpull Contracts ({wallet.linkedRugpulls.length})
          </p>
          <div className="space-y-1.5">
            {wallet.linkedRugpulls.map((addr, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-xs font-mono text-red-800 dark:text-red-300">
                  {addr.slice(0, 10)}...{addr.slice(-6)}
                </span>
                <a
                  href={`https://bscscan.com/address/${addr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  BscScan
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* On-chain Liquidity Metrics */}
      {onchain?.metrics && (
        <div>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">On-Chain Metrics</p>
          <div className="grid grid-cols-2 gap-3">
            {onchain.metrics.liquidityBNB && (
              <MetricCard label="Liquidity" value={`${onchain.metrics.liquidityBNB} BNB`} />
            )}
            <MetricCard label="DEX Pair" value={onchain.metrics.hasDexPair ? 'Found' : 'Not Found'} />
            <MetricCard label="Rug Pull Risk" value={`${onchain.metrics.rugPullRisk}%`} />
            {onchain.metrics.contractAgeDays !== null && (
              <MetricCard label="Contract Age" value={`${onchain.metrics.contractAgeDays} days`} />
            )}
          </div>
        </div>
      )}

      {/* BscScan Link */}
      <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-md p-3 flex items-center justify-between">
        <span className="text-xs text-slate-600 dark:text-slate-400">View full holder list on BscScan</span>
        <a
          href={`https://bscscan.com/token/${data.address}#holders`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded text-xs font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          View Holders
        </a>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-3">
      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">{value}</p>
    </div>
  );
}
