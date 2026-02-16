'use client';

import type { RiskData } from '@/lib/types';

interface GitHubPanelProps {
  data: RiskData;
}

export default function GitHubPanel({ data }: GitHubPanelProps) {
  const transparency = data.analysis?.transparency;
  const github = transparency?.github;
  const audit = transparency?.audit;
  const teamDoxxed = transparency?.teamDoxxed;
  const transparencyScore = transparency?.score ?? 0;

  const githubSearchUrl = `https://github.com/search?q=${encodeURIComponent(data.address)} OR BSC token`;

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-medium text-slate-900 dark:text-white uppercase tracking-wide">
        Transparency & GitHub
      </h3>

      {/* GitHub Repository */}
      {github?.found ? (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-green-900 dark:text-green-200 text-sm">Public Repository Found</span>
          </div>
          {github.repoUrl && (
            <a
              href={github.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-1.5 mb-3"
            >
              View Repository
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {github.lastCommitDate && (
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Commit</p>
                <p className="font-medium text-slate-900 dark:text-white text-xs mt-0.5">
                  {new Date(github.lastCommitDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {github.contributorsCount !== undefined && (
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contributors</p>
                <p className="font-medium text-slate-900 dark:text-white text-xs mt-0.5">{github.contributorsCount}</p>
              </div>
            )}
            {github.starsCount !== undefined && (
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stars</p>
                <p className="font-medium text-slate-900 dark:text-white text-xs mt-0.5">{github.starsCount}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-medium text-yellow-900 dark:text-yellow-200 text-sm">No Public Repository Found</span>
          </div>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
            No GitHub repository could be found for this project. Open-source code increases trust and verifiability.
          </p>
          <a
            href={githubSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 text-xs"
          >
            Try GitHub Search
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}

      {/* Audit Status */}
      <div className={`border rounded-md p-4 ${
        audit?.detected
          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
          : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {audit?.detected ? (
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
          <span className={`font-medium text-sm ${
            audit?.detected ? 'text-green-900 dark:text-green-200' : 'text-yellow-900 dark:text-yellow-200'
          }`}>
            {audit?.detected ? `Audit Report: ${audit.auditorName || 'Detected'}` : 'No Audit Report Detected'}
          </span>
        </div>
        <p className={`text-xs ${
          audit?.detected ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'
        }`}>
          {audit?.detected
            ? 'A security audit report was found in the project materials.'
            : 'No known audit firm (CertiK, SlowMist, PeckShield, etc.) was detected.'}
        </p>
      </div>

      {/* Team Identity */}
      <div className={`border rounded-md p-4 ${
        teamDoxxed
          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
          : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <svg className={`w-5 h-5 ${teamDoxxed ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className={`font-medium text-sm ${
            teamDoxxed ? 'text-green-900 dark:text-green-200' : 'text-yellow-900 dark:text-yellow-200'
          }`}>
            Team Members {teamDoxxed ? 'Identified' : 'Anonymous'}
          </span>
        </div>
        <p className={`text-xs ${teamDoxxed ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
          {teamDoxxed
            ? 'Team members have public identities and verified profiles.'
            : 'Team members remain anonymous. Anonymous teams carry higher trust risk.'}
        </p>
      </div>

      {/* Transparency Score */}
      <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-md p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">Transparency Risk Score</span>
          <span className="text-lg font-light text-slate-900 dark:text-white">{transparencyScore}/100</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${
              transparencyScore >= 60 ? 'bg-red-500' : transparencyScore >= 40 ? 'bg-orange-500' : transparencyScore >= 20 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${transparencyScore}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">
          Higher score = more transparency concerns. Includes GitHub, audit, and team doxxing checks.
        </p>
      </div>
    </div>
  );
}
