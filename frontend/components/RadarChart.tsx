'use client';

import type { RiskBreakdown } from '@/lib/types';

interface RadarChartProps {
  breakdown: RiskBreakdown;
  size?: number;
}

const CATEGORIES = [
  { key: 'contract_risk' as const, label: 'Contract', angle: -90 },
  { key: 'behavior_risk' as const, label: 'Behavior', angle: 30 },
  { key: 'reputation_risk' as const, label: 'Reputation', angle: 150 },
];

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function getRiskFillColor(maxScore: number): string {
  if (maxScore >= 60) return 'rgba(239, 68, 68, 0.25)';  // red
  if (maxScore >= 40) return 'rgba(245, 158, 11, 0.25)';  // amber
  if (maxScore >= 20) return 'rgba(234, 179, 8, 0.25)';   // yellow
  return 'rgba(34, 197, 94, 0.25)';                        // green
}

function getRiskStrokeColor(maxScore: number): string {
  if (maxScore >= 60) return 'rgba(239, 68, 68, 0.8)';
  if (maxScore >= 40) return 'rgba(245, 158, 11, 0.8)';
  if (maxScore >= 20) return 'rgba(234, 179, 8, 0.8)';
  return 'rgba(34, 197, 94, 0.8)';
}

export default function RadarChart({ breakdown, size = 220 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.38;

  const values = CATEGORIES.map(cat => breakdown[cat.key] ?? 0);
  const maxScore = Math.max(...values);

  // Grid rings at 25%, 50%, 75%, 100%
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Data polygon points
  const dataPoints = CATEGORIES.map((cat, i) => {
    const score = breakdown[cat.key] ?? 0;
    const radius = (score / 100) * maxRadius;
    return polarToCartesian(cx, cy, radius, cat.angle);
  });
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Grid rings */}
        {rings.map((ring, i) => {
          const ringPoints = CATEGORIES.map(cat => polarToCartesian(cx, cy, maxRadius * ring, cat.angle));
          const ringPath = ringPoints.map((p, j) => `${j === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
          return (
            <path
              key={i}
              d={ringPath}
              fill="none"
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-700"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Axis lines */}
        {CATEGORIES.map((cat, i) => {
          const end = polarToCartesian(cx, cy, maxRadius, cat.angle);
          return (
            <line
              key={i}
              x1={cx} y1={cy}
              x2={end.x} y2={end.y}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-700"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Data polygon */}
        <path
          d={dataPath}
          fill={getRiskFillColor(maxScore)}
          stroke={getRiskStrokeColor(maxScore)}
          strokeWidth={2}
        />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x} cy={p.y} r={3}
            fill={getRiskStrokeColor(maxScore)}
          />
        ))}

        {/* Labels */}
        {CATEGORIES.map((cat, i) => {
          const labelRadius = maxRadius + 20;
          const pos = polarToCartesian(cx, cy, labelRadius, cat.angle);
          const score = breakdown[cat.key] ?? 0;
          return (
            <g key={i}>
              <text
                x={pos.x} y={pos.y - 6}
                textAnchor="middle"
                className="fill-slate-600 dark:fill-slate-400 text-[10px] font-medium"
              >
                {cat.label}
              </text>
              <text
                x={pos.x} y={pos.y + 8}
                textAnchor="middle"
                className="fill-slate-800 dark:fill-slate-200 text-xs font-semibold"
              >
                {score}%
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        {CATEGORIES.map(cat => (
          <span key={cat.key} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getRiskStrokeColor(breakdown[cat.key] ?? 0) }} />
            {cat.label}: {breakdown[cat.key] ?? 0}%
          </span>
        ))}
      </div>
    </div>
  );
}
