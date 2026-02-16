import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SafeLayer BNB - Risk Intelligence',
  description: 'AI-powered risk intelligence engine for BNB Chain. Analyze wallet and smart contract risks before interacting.',
  keywords: ['BNB', 'Risk Assessment', 'Blockchain', 'Security', 'Smart Contract', 'Rug Pull'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">SafeLayer</h1>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">BNB</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block font-light">Risk analysis platform</p>
            </div>
          </nav>
        </header>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-16 sm:mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">SafeLayer</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Risk intelligence for BNB Chain</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                &copy; {new Date().getFullYear()} SafeLayer. Security analysis platform.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
