'use client';

import { RiskComponents } from '@/lib/types';

interface FormulaBreakdownProps {
  components: RiskComponents;
  riskScore: number;
  flags: string[] | any[];
}

export default function FormulaBreakdown({ components, riskScore, flags }: FormulaBreakdownProps) {
  // The formula: (transaction×0.45) + (contract×0.25) + (liquidity×0.20) + (behavioral×0.10)
  const weights = {
    transactionRisk: 0.45,
    contractRisk: 0.25,
    liquidityRisk: 0.20,
    behavioralRisk: 0.10
  };

  const weighted = {
    transactionRisk: components.transactionRisk * weights.transactionRisk,
    contractRisk: components.contractRisk * weights.contractRisk,
    liquidityRisk: components.liquidityRisk * weights.liquidityRisk,
    behavioralRisk: components.behavioralRisk * weights.behavioralRisk
  };

  const sum = Object.values(weighted).reduce((a, b) => a + b, 0);

  const floorRules = [
    {
      name: 'Max Component Floor',
      applies: Math.max(components.transactionRisk, components.contractRisk, components.liquidityRisk, components.behavioralRisk) >= 50,
      effect: 'If any component ≥ 50, overall score ≥ 42'
    },
    {
      name: 'Red Flag Floor',
      applies: flags && flags.length >= 3,
      effect: '3+ red flags → overall score ≥ 45'
    }
  ];

  const finalScore = Math.max(sum, ...floorRules.filter(r => r.applies).map(r => {
    if (r.name === 'Max Component Floor') return 42;
    if (r.name === 'Red Flag Floor') return 45;
    return 0;
  }));

  function getComponentColor(score: number): string {
    if (score >= 60) return 'bg-red-500';
    if (score >= 40) return 'bg-orange-500';
    if (score >= 20) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  function getComponentLabel(score: number): string {
    if (score >= 60) return 'Critical';
    if (score >= 40) return 'Medium';
    if (score >= 20) return 'Low';
    return 'Very Low';
  }

  return (
    <div className="space-y-6">
      {/* Formula Explanation */}
      <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <h3 className="font-medium text-slate-900 dark:text-white mb-3">Risk Calculation Formula</h3>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-3 font-mono text-sm mb-3">
          <p className="text-slate-700 dark:text-slate-300">
            <span className="text-blue-600 dark:text-blue-400">Overall Risk</span> = 
            <span className="text-red-600 dark:text-red-400"> T × 45%</span> + 
            <span className="text-green-600 dark:text-green-400"> C × 25%</span> + 
            <span className="text-yellow-600 dark:text-yellow-400"> L × 20%</span> + 
            <span className="text-purple-600 dark:text-purple-400"> B × 10%</span>
          </p>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Where T = Transaction Risk, C = Contract Risk, L = Liquidity Risk, B = Behavioral Risk
        </p>
      </div>

      {/* Component Breakdown */}
      <div className="space-y-4">
        <h3 className="font-medium text-slate-900 dark:text-white">Component Scores</h3>

        {/* Transaction Risk */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-slate-900 dark:text-white">Transaction Risk (45% weight)</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{components.transactionRisk}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full ${getComponentColor(components.transactionRisk)}`}
              style={{ width: `${Math.min(components.transactionRisk, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-400">{getComponentLabel(components.transactionRisk)}</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Contribution: {weighted.transactionRisk.toFixed(2)} pts
            </span>
          </div>
        </div>

        {/* Contract Risk */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-slate-900 dark:text-white">Contract Risk (25% weight)</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{components.contractRisk}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full ${getComponentColor(components.contractRisk)}`}
              style={{ width: `${Math.min(components.contractRisk, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-400">{getComponentLabel(components.contractRisk)}</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Contribution: {weighted.contractRisk.toFixed(2)} pts
            </span>
          </div>
        </div>

        {/* Liquidity Risk */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-slate-900 dark:text-white">Liquidity Risk (20% weight)</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{components.liquidityRisk}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full ${getComponentColor(components.liquidityRisk)}`}
              style={{ width: `${Math.min(components.liquidityRisk, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-400">{getComponentLabel(components.liquidityRisk)}</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Contribution: {weighted.liquidityRisk.toFixed(2)} pts
            </span>
          </div>
        </div>

        {/* Behavioral Risk */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-slate-900 dark:text-white">Behavioral Risk (10% weight)</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{components.behavioralRisk}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full ${getComponentColor(components.behavioralRisk)}`}
              style={{ width: `${Math.min(components.behavioralRisk, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-400">{getComponentLabel(components.behavioralRisk)}</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Contribution: {weighted.behavioralRisk.toFixed(2)} pts
            </span>
          </div>
        </div>
      </div>

      {/* Floor Rules */}
      <div className="space-y-3">
        <h3 className="font-medium text-slate-900 dark:text-white">Floor Rules Applied</h3>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-200 dark:divide-slate-800">
          {floorRules.map((rule, idx) => (
            <div key={idx} className="p-3 flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{rule.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{rule.effect}</p>
              </div>
              <div className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ml-2 ${
                rule.applies 
                  ? 'bg-orange-100 dark:bg-orange-950/30 text-orange-900 dark:text-orange-200' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {rule.applies ? 'Active' : 'Inactive'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final Result */}
      <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <span className="font-semibold text-slate-900 dark:text-white">Base Calculation (Weighted Sum)</span>
            <span className="font-bold text-lg text-slate-900 dark:text-white">{sum.toFixed(2)} pts</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <span className="font-semibold text-slate-900 dark:text-white">Floor Rules Adjustment</span>
            <span className="font-bold text-lg text-slate-900 dark:text-white">
              {finalScore > sum ? `+${(finalScore - sum).toFixed(2)} pts` : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="font-bold text-slate-900 dark:text-white text-lg">Final Risk Score</span>
            <span className="font-bold text-3xl text-slate-900 dark:text-white">{riskScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
