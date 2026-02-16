'use client';

import { useState } from 'react';

interface CodeSnippetProps {
  code: string;
  language?: string;
  title?: string;
}

export default function CodeSnippet({ code, language = 'solidity', title }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 mb-4">
      {title && (
        <div className="bg-slate-200 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
          <p className="text-sm font-mono font-semibold text-slate-700 dark:text-slate-300">{title}</p>
        </div>
      )}
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded transition-colors"
          title="Copy code"
        >
          {copied ? (
            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
        <pre className="overflow-x-auto p-4 text-sm">
          <code className="text-slate-800 dark:text-slate-300 font-mono">{code}</code>
        </pre>
      </div>
    </div>
  );
}
