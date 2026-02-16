'use client'

import type { RegistryData } from '@/lib/types'

interface RegistryStatusProps {
  registry: RegistryData
}

const BSCSCAN_TX_URL = 'https://testnet.bscscan.com/tx/'
const BSCSCAN_ADDRESS_URL = 'https://testnet.bscscan.com/address/'

export default function RegistryStatus({ registry }: RegistryStatusProps) {
  const proof = registry.onChainProof
  const isConfirmed = registry.submissionStatus === 'confirmed' && proof

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${isConfirmed ? 'bg-green-500' : 'bg-slate-400'}`} />
        <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          On-Chain Registry
        </h3>
      </div>

      {isConfirmed ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-slate-700 dark:text-slate-300">Report verified on-chain</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 dark:text-slate-500">Tx Hash</span>
              <a
                href={`${BSCSCAN_TX_URL}${proof.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white truncate transition-colors"
              >
                {proof.txHash.slice(0, 10)}...{proof.txHash.slice(-8)}
              </a>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500">Block</span>
              <p className="font-mono text-slate-600 dark:text-slate-400">{proof.blockNumber}</p>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500">Report Hash</span>
              <p className="font-mono text-slate-600 dark:text-slate-400 truncate">{proof.reportHash.slice(0, 10)}...{proof.reportHash.slice(-8)}</p>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500">Gas Used</span>
              <p className="font-mono text-slate-600 dark:text-slate-400">{Number(proof.gasUsed).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-400 dark:text-slate-500">
              {registry.totalReportsForAddress} report{registry.totalReportsForAddress !== 1 ? 's' : ''} on-chain
            </div>
            <a
              href={`${BSCSCAN_ADDRESS_URL}${registry.contractAddress}#readContract`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              View Contract
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {registry.submissionError
              ? 'On-chain submission skipped'
              : 'No on-chain proof available'}
          </p>
          {registry.submissionError && (
            <p className="text-xs text-slate-400 dark:text-slate-600">
              {registry.submissionError}
            </p>
          )}
          {registry.previousReport && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Previous on-chain report</p>
              <div className="flex items-center gap-3 text-xs">
                <span className="font-mono text-slate-600 dark:text-slate-400">
                  Score: {registry.previousReport.riskScore}
                </span>
                <span className="text-slate-300 dark:text-slate-700">&middot;</span>
                <span className="text-slate-500 dark:text-slate-500">
                  {new Date(registry.previousReport.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
