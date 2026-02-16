'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, ExternalLink } from 'lucide-react';
import { RiskFlag } from '@/lib/types';
import CodeSnippet from './CodeSnippet';

interface EvidencePanelProps {
  flags: string[] | RiskFlag[];
  address: string;
}

const flagSupport: { [key: string]: RiskFlag } = {
  'Mint function disabled': {
    severity: 'MAJOR',
    description: 'The contract has no mint function, reducing inflation risk.',
    riskExplanation: 'This is actually a positive flag - it means tokens cannot be created arbitrarily.',
    codeSnippet: '// Contract has no mint() function\n// Checked contract.functions.mint === undefined',
    confidence: 95,
    category: 'Supply Security'
  },
  'Burn function disabled': {
    severity: 'MODERATE',
    description: 'The contract does not support token burning.',
    riskExplanation: 'Lack of burn mechanism may limit liquidity management options.',
    confidence: 80,
    category: 'Token Mechanics'
  },
  'No liquidity pool detected': {
    severity: 'MAJOR',
    description: 'No DEX liquidity pool found for this token.',
    riskExplanation: 'Critical for trading - tokens cannot be swapped without liquidity.',
    confidence: 99,
    category: 'Liquidity'
  },
  'Owner has suspicious privileges': {
    severity: 'CRITICAL',
    description: 'Owner address has dangerous contract functions.',
    riskExplanation: 'Owner can potentially perform rug pull or steal funds.',
    codeSnippet: 'function transferOwnership(address newOwner) external onlyOwner {\n  require(newOwner != address(0));\n  _transferOwnership(newOwner);\n}',
    confidence: 85,
    category: 'Ownership'
  },
  'Recent ownership transfer': {
    severity: 'MAJOR',
    description: 'Ownership was recently transferred.',
    riskExplanation: 'Could indicate change in control or cleanup before rug pull.',
    confidence: 75,
    category: 'Ownership History'
  }
};

function getSeverityColor(severity?: string): string {
  switch (severity) {
    case 'CRITICAL': return 'bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200 border-red-200 dark:border-red-800';
    case 'MAJOR': return 'bg-orange-50 dark:bg-orange-950/30 text-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-800';
    case 'MODERATE': return 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
    case 'INFO': return 'bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800';
    default: return 'bg-slate-50 dark:bg-slate-800/30 text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-700';
  }
}

export default function EvidencePanel({ flags, address }: EvidencePanelProps) {
  const [expandedFlags, setExpandedFlags] = useState<{ [key: number]: boolean }>({});

  const toggleFlag = (index: number) => {
    setExpandedFlags(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const bscscanLink = `https://bscscan.com/address/${address}`;

  return (
    <div className="space-y-4">
      {/* BscScan Link */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ExternalLink size={18} className="text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-blue-900 dark:text-blue-200">View on BscScan</span>
          </div>
          <a
            href={bscscanLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors text-sm font-medium"
          >
            Open BscScan
          </a>
        </div>
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">Verify on-chain data and contract interactions</p>
      </div>

      {/* Risk Flags Evidence */}
      <div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">Risk Evidence ({flags.length})</h3>
        <div className="space-y-3">
          {flags.map((flag, index) => {
            const flagText = typeof flag === 'string' ? flag : flag.name || 'Unknown';
            const flagInfo = typeof flag === 'string' ? flagSupport[flag] || {} : flag;
            const isExpanded = expandedFlags[index];

            return (
              <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <button
                  onClick={() => toggleFlag(index)}
                  className="w-full p-4 flex items-start justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 text-left">
                    <AlertCircle size={20} className="text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{flagText}</p>
                      {flagInfo.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{flagInfo.description}</p>
                      )}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-slate-400 dark:text-slate-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-slate-400 dark:text-slate-600 flex-shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 p-4 space-y-4">
                    {/* Severity Badge */}
                    {flagInfo.severity && (
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(flagInfo.severity)}`}>
                          {flagInfo.severity}
                        </span>
                        {flagInfo.confidence && (
                          <span className="text-xs text-slate-600">
                            Confidence: {flagInfo.confidence}%
                          </span>
                        )}
                      </div>
                    )}

                    {/* Category */}
                    {flagInfo.category && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Category:</span>
                        <span className="text-xs text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                          {flagInfo.category}
                        </span>
                      </div>
                    )}

                    {/* Risk Explanation */}
                    {flagInfo.riskExplanation && (
                      <div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Why This Matters:</p>
                        <p className="text-sm text-slate-700 dark:text-slate-400">{flagInfo.riskExplanation}</p>
                      </div>
                    )}

                    {/* Code Snippet */}
                    {flagInfo.codeSnippet && (
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-2">Evidence:</p>
                        <CodeSnippet
                          code={flagInfo.codeSnippet}
                          language="solidity"
                          title="Contract Analysis"
                        />
                      </div>
                    )}

                    {/* BscScan Reference */}
                    {flagInfo.bscscanLink && (
                      <div className="flex items-center gap-2">
                        <ExternalLink size={16} className="text-blue-600" />
                        <a
                          href={flagInfo.bscscanLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Evidence on BscScan
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
