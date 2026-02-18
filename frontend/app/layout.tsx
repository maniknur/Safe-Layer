import type { Metadata } from 'next'
import './globals.css'
import LogoAnimation from '@/components/LogoAnimation'
import DigitalNetworkBackground from '@/components/DigitalNetworkBackground'
import ContractInfoButton from '@/components/ContractInfoButton'

export const metadata: Metadata = {
  title: 'SafeLayer — BNB Chain Risk Analysis',
  description: 'Check the risk profile of any wallet or smart contract on BNB Chain before you interact. Evidence-based scoring backed by on-chain data.',
  keywords: ['BNB Chain', 'risk analysis', 'smart contract security', 'wallet checker', 'rug pull detection'],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
        {/* Digital network ambient background */}
        <DigitalNetworkBackground />

        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
          {/* Top accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

          <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <LogoAnimation />
              <span className="font-semibold text-slate-900 dark:text-white tracking-tight text-sm">SafeLayer</span>
              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">BNB</span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">BNB Chain Testnet</span>
              <ContractInfoButton />
            </div>
          </nav>

          {/* Bottom accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
        </header>

        <main className="min-h-[calc(100vh-3.5rem-5rem)]">
          {children}
        </main>

        <footer className="border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              {/* About */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">SafeLayer</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  On-chain risk intelligence for BNB Chain. Analyze any wallet or smart contract before you interact.
                </p>
              </div>
              {/* Key Info */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">How It Works</h4>
                <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <li>Paste any BNB Chain address</li>
                  <li>AI + on-chain analysis generates risk score</li>
                  <li>Proof is stored immutably on-chain</li>
                  <li>Verify results on BscScan anytime</li>
                </ul>
              </div>
              {/* Verify */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Verify On-Chain</h4>
                <a
                  href="https://testnet.bscscan.com/address/0x20B28a7b961a6d82222150905b0C01256607B5A3#code"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Registry Contract on BscScan
                </a>
                <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1.5 font-mono break-all">
                  0x20B28a7b961a6d82222150905b0C01256607B5A3
                </p>
              </div>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                BNB Chain (Testnet) &middot; Evidence-based scoring &middot; Not financial advice
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-600">
                Always DYOR before interacting with any contract.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
