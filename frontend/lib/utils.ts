/**
 * Validate Ethereum/BNB Chain address format
 */
export function isValidAddress(address: string): boolean {
  if (!address) return false
  const addressRegex = /^0x[a-fA-F0-9]{40}$/
  return addressRegex.test(address.trim())
}

/**
 * Normalize address to lowercase
 */
export function normalizeAddress(address: string): string {
  return address.trim().toLowerCase()
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string, chars = 6): string {
  if (!address) return ''
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`
}

/**
 * Get color classes for risk level
 */
export function getRiskColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'very low':
      return 'text-green-400'
    case 'low':
      return 'text-blue-400'
    case 'medium':
      return 'text-yellow-400'
    case 'high':
      return 'text-orange-400'
    case 'very high':
      return 'text-red-400'
    default:
      return 'text-slate-400'
  }
}

/**
 * Get background + border classes for risk level badges
 */
export function getRiskBadgeClasses(level: string): string {
  switch (level.toLowerCase()) {
    case 'very low':
      return 'text-green-400 bg-green-900/20 border-green-700'
    case 'low':
      return 'text-blue-400 bg-blue-900/20 border-blue-700'
    case 'medium':
      return 'text-yellow-400 bg-yellow-900/20 border-yellow-700'
    case 'high':
      return 'text-orange-400 bg-orange-900/20 border-orange-700'
    case 'very high':
      return 'text-red-400 bg-red-900/20 border-red-700'
    default:
      return 'text-slate-400 bg-slate-900/20 border-slate-700'
  }
}

/**
 * Get gauge gradient color based on score
 */
export function getRiskGaugeColor(score: number): string {
  if (score < 20) return 'from-green-500 to-green-600'
  if (score < 40) return 'from-blue-500 to-blue-600'
  if (score < 60) return 'from-yellow-500 to-yellow-600'
  if (score < 80) return 'from-orange-500 to-orange-600'
  return 'from-red-500 to-red-600'
}
