'use client';

import { AuditInfo } from '@/lib/types';
import { CheckCircle, AlertCircle, XCircle, ExternalLink } from 'lucide-react';

interface AuditPanelProps {
  audits?: AuditInfo[];
  address: string;
}

export default function AuditPanel({ audits, address }: AuditPanelProps) {
  // Mock data if not provided
  const mockAudits: AuditInfo[] = audits || [
    {
      firm: 'Certik',
      date: '2024-01-15',
      status: 'PASSED',
      reportUrl: 'https://certik.com'
    },
    {
      firm: 'SlowMist',
      date: '2023-12-20',
      status: 'FINDINGS',
      reportUrl: 'https://slowmist.com'
    }
  ];

  const hasAudits = mockAudits && mockAudits.length > 0;
  const passedAudits = mockAudits?.filter(a => a.status === 'PASSED') || [];
  const criticalAudits = mockAudits?.filter(a => a.status === 'CRITICAL') || [];

  function getAuditBadgeColor(status?: string): string {
    switch (status) {
      case 'PASSED':
        return 'bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-200 border-green-200 dark:border-green-800';
      case 'FINDINGS':
        return 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      case 'CRITICAL':
        return 'bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200 border-red-200 dark:border-red-800';
      default:
        return 'bg-slate-50 dark:bg-slate-800/30 text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-700';
    }
  }

  function getAuditIcon(status?: string) {
    switch (status) {
      case 'PASSED':
        return <CheckCircle size={20} className="text-green-600 dark:text-green-400" />;
      case 'FINDINGS':
        return <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400" />;
      case 'CRITICAL':
        return <XCircle size={20} className="text-red-600 dark:text-red-400" />;
      default:
        return <AlertCircle size={20} className="text-slate-600 dark:text-slate-400" />;
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">Security Audits</h3>

      {hasAudits ? (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold tracking-wide mb-1">
                Total Audits
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{mockAudits?.length || 0}</p>
            </div>
            <div className={`border rounded-lg p-4 ${
              passedAudits.length > 0 
                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
            }`}>
              <p className={`text-xs uppercase font-semibold tracking-wide mb-1 ${
                passedAudits.length > 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-yellow-600 dark:text-yellow-400'
              }`}>
                Passed
              </p>
              <p className={`text-3xl font-bold ${
                passedAudits.length > 0 
                  ? 'text-green-900 dark:text-green-200' 
                  : 'text-yellow-900 dark:text-yellow-200'
              }`}>
                {passedAudits.length}
              </p>
            </div>
          </div>

          {/* Critical Findings Alert */}
          {criticalAudits.length > 0 && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <XCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-200">Critical Issues Found</p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {criticalAudits.length} audit(s) reported critical security issues
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Audit List */}
          <div className="space-y-3">
            {mockAudits?.map((audit, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {getAuditIcon(audit.status)}
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{audit.firm}</p>
                      {audit.date && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          Dated: {new Date(audit.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getAuditBadgeColor(audit.status)}`}>
                    {audit.status}
                  </span>
                </div>

                {audit.reportUrl && (
                  <a
                    href={audit.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Audit Report
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Audit Interpretation */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">What This Means</h4>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
              {passedAudits.length > 0 && (
                <li className="flex gap-2">
                  <span className="flex-shrink-0">✓</span>
                  <span>Third-party audits provide some verification of code quality</span>
                </li>
              )}
              {criticalAudits.length > 0 && (
                <li className="flex gap-2">
                  <span className="flex-shrink-0">⚠️</span>
                  <span>Critical issues found - verify if they've been patched</span>
                </li>
              )}
              <li className="flex gap-2">
                <span className="flex-shrink-0">💡</span>
                <span>Always review the full audit report before investing</span>
              </li>
            </ul>
          </div>
        </>
      ) : (
        <>
          {/* No Audits Found */}
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-200">No Audits Found</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  This contract has not been audited by known security firms.
                </p>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <h4 className="font-semibold text-orange-900 dark:text-orange-200 mb-3">Recommendation</h4>
            <ul className="space-y-2 text-sm text-orange-800 dark:text-orange-300">
              <li className="flex gap-2">
                <span className="flex-shrink-0">⚠️</span>
                <span>Lack of professional audit increases risk</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0">⚠️</span>
                <span>No third-party verification of code security</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0">⚠️</span>
                <span>More prone to undiscovered vulnerabilities</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0">💡</span>
                <span>Check if audit is pending or in progress</span>
              </li>
            </ul>
          </div>

          {/* Popular Audit Firms */}
          <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">Common Audit Firms</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a href="https://certik.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                Certik →
              </a>
              <a href="https://slowmist.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                SlowMist →
              </a>
              <a href="https://hacken.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                Hacken →
              </a>
              <a href="https://www.byterocket.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                ByteRocket →
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
