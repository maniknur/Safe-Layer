'use client';

import type { RiskData } from '@/lib/types';

interface AuditPanelProps {
  data: RiskData;
}

export default function AuditPanel({ data }: AuditPanelProps) {
  const scam = data.analysis?.scamDatabase;
  const contract = data.analysis?.contract;

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-medium text-slate-900 dark:text-white uppercase tracking-wide">
        Scam Database & Contract Security
      </h3>

      {/* Scam Database Status */}
      <div className={`border rounded-md p-4 ${
        scam?.knownScam || scam?.isBlacklisted
          ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
          : scam?.rugpullHistory
          ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'
          : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {scam?.knownScam || scam?.isBlacklisted ? (
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          )}
          <span className={`font-medium text-sm ${
            scam?.knownScam || scam?.isBlacklisted
              ? 'text-red-900 dark:text-red-200'
              : 'text-green-900 dark:text-green-200'
          }`}>
            {scam?.knownScam ? 'KNOWN SCAM' : scam?.isBlacklisted ? 'BLACKLISTED' : 'No Scam Records Found'}
          </span>
        </div>
        <p className={`text-xs ${
          scam?.knownScam || scam?.isBlacklisted
            ? 'text-red-700 dark:text-red-300'
            : 'text-green-700 dark:text-green-300'
        }`}>
          {scam?.knownScam || scam?.isBlacklisted
            ? 'This address was found in one or more scam databases. Exercise extreme caution.'
            : 'Address not found in internal scam DB, honeypot registry, or community blacklist.'}
        </p>
      </div>

      {/* Matched Databases */}
      {scam?.matchedDatabase && scam.matchedDatabase.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <p className="text-[10px] font-semibold text-red-800 dark:text-red-300 uppercase tracking-wider mb-2">Matched In</p>
          <ul className="space-y-1">
            {scam.matchedDatabase.map((db, idx) => (
              <li key={idx} className="text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {db}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Check Summary */}
      <div className="grid grid-cols-3 gap-3">
        <StatusCard
          label="Known Scam"
          status={scam?.knownScam ? 'danger' : 'safe'}
          value={scam?.knownScam ? 'Yes' : 'No'}
        />
        <StatusCard
          label="Blacklisted"
          status={scam?.isBlacklisted ? 'danger' : 'safe'}
          value={scam?.isBlacklisted ? 'Yes' : 'No'}
        />
        <StatusCard
          label="Rugpull History"
          status={scam?.rugpullHistory ? 'danger' : 'safe'}
          value={scam?.rugpullHistory ? 'Yes' : 'No'}
        />
      </div>

      {/* Contract Security Summary */}
      {contract && contract.isContract && (
        <div>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Contract Security Detections</p>
          <div className="grid grid-cols-2 gap-2">
            <DetectionRow label="Owner Privileges" detected={contract.detections.ownerPrivileges} />
            <DetectionRow label="Withdraw Functions" detected={contract.detections.withdrawFunctions} />
            <DetectionRow label="Mint Functions" detected={contract.detections.mintFunctions} />
            <DetectionRow label="Proxy Pattern" detected={contract.detections.proxyPattern} />
            <DetectionRow label="No Renounce" detected={contract.detections.noRenounceOwnership} />
            <DetectionRow label="Upgradeability" detected={contract.detections.upgradeability} />
            <DetectionRow label="Self-Destruct" detected={contract.detections.selfDestruct} />
            <DetectionRow label="Honeypot Logic" detected={contract.detections.honeypotLogic} />
          </div>
        </div>
      )}

      {/* Contract Verification */}
      {contract && contract.isContract && (
        <div className={`border rounded-md p-4 ${
          contract.isVerified
            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
            : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-medium text-sm ${
              contract.isVerified ? 'text-green-900 dark:text-green-200' : 'text-yellow-900 dark:text-yellow-200'
            }`}>
              Source Code: {contract.isVerified ? 'Verified' : 'Not Verified'}
            </span>
          </div>
          <p className={`text-xs ${contract.isVerified ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
            {contract.isVerified
              ? `Verified on BscScan${contract.compilerVersion ? ` (${contract.compilerVersion})` : ''}.`
              : 'Contract source code is not verified on BscScan. Cannot inspect for malicious logic.'}
          </p>
        </div>
      )}

      {/* Databases Checked */}
      <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-md p-3">
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          Checked: SafeLayer Internal DB, Honeypot Registry, Community Blacklist, Scam Deployer Registry, BscScan Verification
        </p>
      </div>
    </div>
  );
}

function StatusCard({ label, status, value }: { label: string; status: 'safe' | 'danger'; value: string }) {
  return (
    <div className={`border rounded-md p-3 text-center ${
      status === 'danger'
        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
        : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
    }`}>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-medium mt-0.5 ${
        status === 'danger' ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'
      }`}>{value}</p>
    </div>
  );
}

function DetectionRow({ label, detected }: { label: string; detected: boolean }) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-3 py-2">
      <span className="text-xs text-slate-700 dark:text-slate-300">{label}</span>
      <span className={`text-xs font-medium ${detected ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
        {detected ? 'Detected' : 'Clean'}
      </span>
    </div>
  );
}
