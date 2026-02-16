'use client';

import { GitHubInfo } from '@/lib/types';
import { Github, ExternalLink, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface GitHubPanelProps {
  github?: GitHubInfo;
  address: string;
}

export default function GitHubPanel({ github, address }: GitHubPanelProps) {
  // Mock GitHub data since backend might not have it yet
  const mockGitHub: GitHubInfo = github || {
    repositoryFound: false,
    transparencyScore: 0
  };

  // Example: try to construct a GitHub search URL
  const githubSearchUrl = `https://github.com/search?q=${encodeURIComponent(address)} OR BSC token`;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">Team Transparency & GitHub</h3>

      {mockGitHub.repositoryFound ? (
        <>
          {/* Repository Found */}
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
              <span className="font-semibold text-green-900 dark:text-green-200">Public Repository Found</span>
            </div>
            {mockGitHub.url && (
              <a
                href={mockGitHub.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2 mb-3"
              >
                <Github size={18} />
                View Repository
                <ExternalLink size={14} />
              </a>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {mockGitHub.commitCount !== undefined && (
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">Total Commits</p>
                  <p className="font-bold text-slate-900 dark:text-white">{mockGitHub.commitCount}</p>
                </div>
              )}
              {mockGitHub.lastCommit && (
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">Last Commit</p>
                  <p className="font-bold text-slate-900 dark:text-white">{mockGitHub.lastCommit}</p>
                </div>
              )}
              {mockGitHub.stars !== undefined && (
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">Stars</p>
                  <p className="font-bold text-slate-900 dark:text-white">⭐ {mockGitHub.stars}</p>
                </div>
              )}
            </div>
          </div>

          {/* Team Doxxing */}
          {mockGitHub.teamDoxxed !== undefined && (
            <div className={`border rounded-lg p-4 ${
              mockGitHub.teamDoxxed 
                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {mockGitHub.teamDoxxed ? (
                  <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle size={18} className="text-yellow-600 dark:text-yellow-400" />
                )}
                <span className={`font-semibold ${
                  mockGitHub.teamDoxxed 
                    ? 'text-green-900 dark:text-green-200' 
                    : 'text-yellow-900 dark:text-yellow-200'
                }`}>
                  Team Members {mockGitHub.teamDoxxed ? 'Identified' : 'Anonymous'}
                </span>
              </div>
              <p className={`text-sm ${
                mockGitHub.teamDoxxed 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-yellow-700 dark:text-yellow-300'
              }`}>
                {mockGitHub.teamDoxxed
                  ? 'Team members have public identities and verified GitHub profiles'
                  : 'Team members remain anonymous; consider this when assessing risk'}
              </p>
            </div>
          )}

          {/* Audits */}
          {mockGitHub.hasAudits && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={18} className="text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-900 dark:text-blue-200">Security Audits Available</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Third-party security audits have been conducted and published
              </p>
            </div>
          )}

          {/* Transparency Score */}
          {mockGitHub.transparencyScore !== undefined && (
            <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Transparency Score</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3 max-w-xs">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full"
                    style={{ width: `${Math.max(mockGitHub.transparencyScore, 0)}%` }}
                  />
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {mockGitHub.transparencyScore}%
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* No Repository Found */}
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400" />
              <span className="font-semibold text-yellow-900 dark:text-yellow-200">No Public Repository Found</span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
              We couldn't locate an official GitHub repository for this project. This increases risk as there's no transparent development history.
            </p>
            <a
              href={githubSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2 text-sm"
            >
              <Github size={16} />
              Try GitHub Search
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">What This Means</h4>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
              <li className="flex gap-2">
                <span className="flex-shrink-0">⚠️</span>
                <span>No transparent development history available</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0">⚠️</span>
                <span>Cannot verify code history or team contributions</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0">⚠️</span>
                <span>Higher risk for project abandonment or malicious code</span>
              </li>
            </ul>
          </div>
        </>
      )}

      {/* AntiBot Integration Notice */}
      <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-xs text-slate-600 dark:text-slate-400">
        <p>💡 GitHub integration helps verify team legitimacy and development activity. Anonymous teams with no GitHub presence carry higher risk.</p>
      </div>
    </div>
  );
}
