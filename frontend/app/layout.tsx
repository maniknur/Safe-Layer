import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SafeLayer — BNB Chain Risk Analysis',
  description: 'Check the risk profile of any wallet or smart contract on BNB Chain before you interact. Evidence-based scoring backed by on-chain data.',
  keywords: ['BNB Chain', 'risk analysis', 'smart contract security', 'wallet checker', 'rug pull detection'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
        <header className="border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
          <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-white tracking-tight">SafeLayer</span>
              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">BNB</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://testnet.bscscan.com/address/0x20B28a7b961a6d82222150905b0C01256607B5A3#code"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors hidden sm:inline"
              >
                Registry Contract
              </a>
              <span className="text-xs text-slate-400 dark:text-slate-600 hidden sm:inline">|</span>
              <span className="text-xs text-slate-500 dark:text-slate-500">Testnet</span>
            </div>
          </nav>
        </header>

        <main className="min-h-[calc(100vh-3.5rem-5rem)]">
          {children}
        </main>

        <footer className="border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="font-medium text-slate-900 dark:text-white text-sm">SafeLayer</span>
                <span className="text-xs text-slate-400 dark:text-slate-600">&middot;</span>
                <span className="text-xs text-slate-500 dark:text-slate-500">On-chain risk analysis for BNB Chain</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-600">
                Not financial advice. Always DYOR.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
