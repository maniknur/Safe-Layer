'use client';

import type { RiskData } from '@/lib/types';

interface FormulaBreakdownProps {
  data: RiskData;
}

function getComponentColor(score: number): string {
  if (score >= 60) return 'bg-red-500';
  if (score >= 40) return 'bg-orange-500';
  if (score >= 20) return 'bg-yellow-500';
  return 'bg-green-500';
}

function getComponentLabel(score: number): string {
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  if (score >= 20) return 'Low';
  return 'Very Low';
}

export default function FormulaBreakdown({ data }: FormulaBreakdownProps) {
  const calc = data.scoreCalculation;

  if (!calc) {
    return (
      <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
        Score calculation data not available.
      </div>
    );
  }

  const components = [
    {
      label: 'Contract Risk',
      key: 'contract_risk' as const,
      weight: calc.weights.contract_risk,
      raw: calc.rawScores.contract_risk,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'On-chain Behavior Risk',
      key: 'behavior_risk' as const,
      weight: calc.weights.behavior_risk,
      raw: calc.rawScores.behavior_risk,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Reputation Risk',
      key: 'reputation_risk' as const,
      weight: calc.weights.reputation_risk,
      raw: calc.rawScores.reputation_risk,
      color: 'text-amber-600 dark:text-amber-400',
    },
  ];

  const weightedSum = components.reduce((sum, c) => sum + c.raw * c.weight, 0);

  return (
    <div className="space-y-6">
      {/* Formula Display */}
      <div>
        <h3 className="text-sm font-medium text-slate-900 dark:text-white uppercase tracking-wide mb-3">
          How This Score Is Calculated
        </h3>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md p-4 font-mono text-sm">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="text-slate-900 dark:text-white font-medium">Risk Score</span> ={' '}
            <span className="text-purple-600 dark:text-purple-400">(Contract Risk x {(calc.weights.contract_risk * 100).toFixed(0)}%)</span>{' '}
            + <span className="text-blue-600 dark:text-blue-400">(Behavior Risk x {(calc.weights.behavior_risk * 100).toFixed(0)}%)</span>{' '}
            + <span className="text-amber-600 dark:text-amber-400">(Reputation Risk x {(calc.weights.reputation_risk * 100).toFixed(0)}%)</span>
          </p>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Each category is scored 0-100 independently, then combined using the weights above.
        </p>
      </div>

      {/* Component Scores */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-900 dark:text-white uppercase tracking-wide">
          Category Scores
        </h3>
        {components.map(comp => {
          const weighted = comp.raw * comp.weight;
          return (
            <div key={comp.key} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {comp.label}
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                    ({(comp.weight * 100).toFixed(0)}% weight)
                  </span>
                </span>
                <span className={`text-lg font-light ${comp.color}`}>{comp.raw}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-2">
                <div
                  className={`h-1.5 rounded-full ${getComponentColor(comp.raw)}`}
                  style={{ width: `${Math.min(comp.raw, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">{getComponentLabel(comp.raw)}</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Contribution: {weighted.toFixed(1)} pts
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weight Explanation */}
      <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-md p-4">
        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-3">Why These Weights?</h4>
        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <li className="flex gap-2">
            <span className="text-purple-500 font-bold shrink-0">40%</span>
            <span><strong className="text-slate-800 dark:text-slate-200">Contract Risk</strong> — Smart contract vulnerabilities are the primary vector for rugpulls and exploits.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500 font-bold shrink-0">40%</span>
            <span><strong className="text-slate-800 dark:text-slate-200">On-chain Behavior</strong> — Transaction patterns, liquidity depth, and holder activity reveal real-time risk signals.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-500 font-bold shrink-0">20%</span>
            <span><strong className="text-slate-800 dark:text-slate-200">Reputation</strong> — Transparency, audit status, and scam database matches provide external validation.</span>
          </li>
        </ul>
      </div>

      {/* Adjustments Applied */}
      {calc.adjustments && calc.adjustments.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-900 dark:text-white uppercase tracking-wide mb-3">
            Adjustments Applied
          </h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md divide-y divide-slate-200 dark:divide-slate-800">
            {calc.adjustments.map((adj, idx) => (
              <div key={idx} className="px-4 py-3 flex items-start gap-3">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  adj.includes('→') ? 'bg-orange-500' : 'bg-slate-400'
                }`} />
                <span className="text-sm text-slate-700 dark:text-slate-300 font-light">{adj}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final Calculation */}
      <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-md p-4 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Weighted Sum</span>
          <span className="text-lg font-light text-slate-900 dark:text-white">{Math.round(weightedSum)}</span>
        </div>
        {calc.finalScore !== Math.round(weightedSum) && (
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">After Adjustments</span>
            <span className="text-lg font-light text-orange-600 dark:text-orange-400">
              +{calc.finalScore - Math.round(weightedSum)} pts
            </span>
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">Final Risk Score</span>
          <span className="text-3xl font-light text-slate-900 dark:text-white">{data.riskScore}</span>
        </div>
      </div>
    </div>
  );
}
