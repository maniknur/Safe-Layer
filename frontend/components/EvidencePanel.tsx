'use client';

import { useState } from 'react';
import type { EvidenceFlag, RiskData } from '@/lib/types';
import CodeSnippet from './CodeSnippet';

interface EvidencePanelProps {
  data: RiskData;
}

const SEVERITY_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  critical: { label: 'CRITICAL', bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-900 dark:text-red-200', border: 'border-red-200 dark:border-red-800', dot: 'bg-red-500' },
  high:     { label: 'HIGH',     bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-900 dark:text-orange-200', border: 'border-orange-200 dark:border-orange-800', dot: 'bg-orange-500' },
  medium:   { label: 'MEDIUM',   bg: 'bg-yellow-50 dark:bg-yellow-950/30', text: 'text-yellow-900 dark:text-yellow-200', border: 'border-yellow-200 dark:border-yellow-800', dot: 'bg-yellow-500' },
  low:      { label: 'LOW',      bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-900 dark:text-blue-200', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' },
  info:     { label: 'INFO',     bg: 'bg-slate-50 dark:bg-slate-800/30', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700', dot: 'bg-slate-400' },
};

const CATEGORY_TABS = [
  { key: 'all', label: 'All Evidence' },
  { key: 'contract', label: 'Smart Contract' },
  { key: 'onchain', label: 'On-Chain Behavior' },
  { key: 'wallet', label: 'Wallet History' },
  { key: 'transparency', label: 'Transparency' },
  { key: 'scam', label: 'Scam Database' },
] as const;

export default function EvidencePanel({ data }: EvidencePanelProps) {
  const [expandedFlags, setExpandedFlags] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const allFlags: EvidenceFlag[] = [
    ...(data.evidence?.contract_flags || []),
    ...(data.evidence?.onchain_flags || []),
    ...(data.evidence?.wallet_flags || []),
    ...(data.evidence?.transparency_flags || []),
    ...(data.evidence?.scam_flags || []),
  ];

  const filteredFlags = activeCategory === 'all'
    ? allFlags
    : allFlags.filter(f => f.category === activeCategory);

  // Sort by severity weight (critical first)
  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  const sortedFlags = [...filteredFlags].sort((a, b) =>
    (severityOrder[a.severity] ?? 5) - (severityOrder[b.severity] ?? 5)
  );

  const toggleFlag = (id: string) => {
    setExpandedFlags(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const bscscanLink = `https://bscscan.com/address/${data.address}`;

  const categoryCounts: Record<string, number> = {};
  for (const f of allFlags) {
    categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
  }

  return (
    <div className="space-y-5">
      {/* BscScan Link */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-md p-3">
        <span className="text-sm text-slate-700 dark:text-slate-300">Verify on-chain data</span>
        <a
          href={bscscanLink}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded text-xs font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          View on BscScan
        </a>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_TABS.map(tab => {
          const count = tab.key === 'all' ? allFlags.length : (categoryCounts[tab.key] || 0);
          if (tab.key !== 'all' && count === 0) return null;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                activeCategory === tab.key
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Evidence Count Summary */}
      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        {['critical', 'high', 'medium', 'low'].map(sev => {
          const count = sortedFlags.filter(f => f.severity === sev).length;
          if (count === 0) return null;
          const cfg = SEVERITY_CONFIG[sev];
          return (
            <span key={sev} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              {count} {cfg.label}
            </span>
          );
        })}
      </div>

      {/* Evidence Flags */}
      <div className="space-y-2">
        {sortedFlags.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
            No evidence flags in this category.
          </div>
        ) : (
          sortedFlags.map((flag, index) => {
            const cfg = SEVERITY_CONFIG[flag.severity] || SEVERITY_CONFIG.info;
            const isExpanded = expandedFlags[flag.id || `flag-${index}`];

            return (
              <div
                key={flag.id || `flag-${index}`}
                className={`border rounded-md overflow-hidden ${cfg.border}`}
              >
                {/* Flag Header */}
                <button
                  onClick={() => toggleFlag(flag.id || `flag-${index}`)}
                  className={`w-full p-4 flex items-start justify-between text-left hover:bg-opacity-80 transition-colors ${cfg.bg}`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-sm font-medium ${cfg.text}`}>{flag.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                        {flag.source && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {flag.source}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{flag.description}</p>
                    </div>
                  </div>
                  <svg className={`w-4 h-4 shrink-0 ml-2 mt-1 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 space-y-4">
                    {/* Evidence */}
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Evidence</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-light">{flag.evidence}</p>
                    </div>

                    {/* Why Dangerous */}
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Why This Is Dangerous</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-light">{flag.description}</p>
                    </div>

                    {/* Risk Weight */}
                    <div className="flex items-center gap-3">
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Risk Weight</p>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${cfg.dot}`} style={{ width: `${Math.min(flag.riskWeight * 5, 100)}%` }} />
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{flag.riskWeight}</span>
                      </div>
                    </div>

                    {/* Code Snippet */}
                    {flag.codeSnippet && (
                      <div>
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Source Code Evidence</p>
                        <CodeSnippet code={flag.codeSnippet} language="solidity" title="Contract Source" />
                      </div>
                    )}

                    {/* BscScan Link */}
                    {flag.bscscanLink && (
                      <a
                        href={flag.bscscanLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Proof on BscScan
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
