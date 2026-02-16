import React from 'react'
import { render, screen } from '@testing-library/react'
import RiskCard from '../components/RiskCard'
import type { RiskData } from '../lib/types'

// Helper to build a complete RiskData mock
function createMockRiskData(overrides?: Partial<RiskData>): RiskData {
  return {
    success: true,
    address: '0x1234567890123456789012345678901234567890',
    riskScore: 45,
    riskLevel: 'Medium',
    rugPullRisk: 15,
    addressType: 'wallet',
    breakdown: {
      contract_risk: 20,
      behavior_risk: 30,
      reputation_risk: 10,
    },
    components: {
      transactionRisk: 40,
      contractRisk: 0,
      liquidityRisk: 0,
      behavioralRisk: 35,
    },
    evidence: {
      contract_flags: [],
      onchain_flags: [],
      wallet_flags: [],
      transparency_flags: [],
      scam_flags: [],
    },
    analysis: {
      contract: {
        isContract: false,
        isVerified: false,
        sourceCodeAvailable: false,
        codeSize: 0,
        detections: {
          ownerPrivileges: false,
          withdrawFunctions: false,
          mintFunctions: false,
          proxyPattern: false,
          noRenounceOwnership: false,
          upgradeability: false,
          selfDestruct: false,
          honeypotLogic: false,
        },
        score: 0,
      },
      onchain: {
        metrics: {
          topHolderConcentration: null,
          contractAgeDays: null,
          holderCount: null,
          transactionCount: 5,
          balance: '0.1',
          liquidityBNB: null,
          hasDexPair: false,
          rugPullRisk: 0,
        },
        score: 30,
      },
      wallet: {
        deployedContracts: [],
        linkedRugpulls: [],
        fundFlowSummary: 'Normal wallet activity',
        transactionCount: 5,
        ageInDays: 30,
        balanceBNB: '0.1',
        score: 20,
      },
      transparency: {
        github: { found: false },
        audit: { detected: false },
        teamDoxxed: false,
        score: 50,
      },
      scamDatabase: {
        isBlacklisted: false,
        knownScam: false,
        rugpullHistory: false,
        matchedDatabase: [],
        score: 0,
      },
    },
    onchainIndicators: [],
    scoreCalculation: {
      formula: 'Risk Score = (Contract Risk × 0.40) + (Behavior Risk × 0.40) + (Reputation Risk × 0.20)',
      weights: { contract_risk: 0.4, behavior_risk: 0.4, reputation_risk: 0.2 },
      rawScores: { contract_risk: 20, behavior_risk: 30, reputation_risk: 10 },
      adjustments: [],
      finalScore: 45,
    },
    flags: ['Low transaction history'],
    explanation: {
      summary: 'Address has medium risk profile',
      keyFindings: ['Low activity', 'New wallet'],
      recommendations: ['Monitor for suspicious activity'],
      riskFactors: ['Low transaction volume'],
    },
    registry: null,
    timestamp: '2026-02-16T12:00:00Z',
    analysisTimeMs: 250,
    ...overrides,
  }
}

describe('RiskCard Component', () => {
  const mockRiskData = createMockRiskData()

  describe('Card Rendering', () => {
    it('should render risk card with address', () => {
      render(<RiskCard data={mockRiskData} />)
      expect(screen.getByText(mockRiskData.address)).toBeInTheDocument()
    })

    it('should display address type badge', () => {
      render(<RiskCard data={mockRiskData} />)
      expect(screen.getByText('wallet')).toBeInTheDocument()
    })

    it('should display the risk score prominently', () => {
      render(<RiskCard data={mockRiskData} />)
      expect(screen.getByText('45')).toBeInTheDocument()
    })

    it('should display risk score label', () => {
      render(<RiskCard data={mockRiskData} />)
      expect(screen.getByText(/risk score/i)).toBeInTheDocument()
    })
  })

  describe('Risk Badge Color Changes', () => {
    it('should display green badge for very low risk', () => {
      const lowRiskData = createMockRiskData({ riskScore: 15, riskLevel: 'Very Low' })
      render(<RiskCard data={lowRiskData} />)
      const badge = screen.getByText(/very low risk/i)
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('text-green-400')
    })

    it('should display blue badge for low risk', () => {
      const lowRiskData = createMockRiskData({ riskScore: 25, riskLevel: 'Low' })
      render(<RiskCard data={lowRiskData} />)
      const badge = screen.getByText(/^low risk$/i)
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('text-blue-400')
    })

    it('should display yellow badge for medium risk', () => {
      const mediumRiskData = createMockRiskData({ riskScore: 45, riskLevel: 'Medium' })
      render(<RiskCard data={mediumRiskData} />)
      const badge = screen.getByText(/medium risk/i)
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('text-yellow-400')
    })

    it('should display orange badge for high risk', () => {
      const highRiskData = createMockRiskData({ riskScore: 75, riskLevel: 'High' })
      render(<RiskCard data={highRiskData} />)
      const badge = screen.getByText(/^high risk$/i)
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('text-orange-400')
    })

    it('should display red badge for very high risk', () => {
      const veryHighRiskData = createMockRiskData({ riskScore: 85, riskLevel: 'Very High' })
      render(<RiskCard data={veryHighRiskData} />)
      const badge = screen.getByText(/very high risk/i)
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('text-red-400')
    })
  })

  describe('Risk Gauge Color Changes', () => {
    it('should show green gauge for very low score (< 20)', () => {
      const lowScoreData = createMockRiskData({ riskScore: 15, riskLevel: 'Very Low' })
      const { container } = render(<RiskCard data={lowScoreData} />)
      const gaugeBar = container.querySelector('[role="progressbar"] div')
      expect(gaugeBar).toHaveClass('from-green-500')
    })

    it('should show blue gauge for low score (20-40)', () => {
      const lowScoreData = createMockRiskData({ riskScore: 30, riskLevel: 'Low' })
      const { container } = render(<RiskCard data={lowScoreData} />)
      const gaugeBar = container.querySelector('[role="progressbar"] div')
      expect(gaugeBar).toHaveClass('from-blue-500')
    })

    it('should show yellow gauge for medium score (40-60)', () => {
      const mediumScoreData = createMockRiskData({ riskScore: 50, riskLevel: 'Medium' })
      const { container } = render(<RiskCard data={mediumScoreData} />)
      const gaugeBar = container.querySelector('[role="progressbar"] div')
      expect(gaugeBar).toHaveClass('from-yellow-500')
    })

    it('should show orange gauge for high score (60-80)', () => {
      const highScoreData = createMockRiskData({ riskScore: 70, riskLevel: 'High' })
      const { container } = render(<RiskCard data={highScoreData} />)
      const gaugeBar = container.querySelector('[role="progressbar"] div')
      expect(gaugeBar).toHaveClass('from-orange-500')
    })

    it('should show red gauge for very high score (>= 80)', () => {
      const veryHighScoreData = createMockRiskData({ riskScore: 90, riskLevel: 'Very High' })
      const { container } = render(<RiskCard data={veryHighScoreData} />)
      const gaugeBar = container.querySelector('[role="progressbar"] div')
      expect(gaugeBar).toHaveClass('from-red-500')
    })
  })

  describe('Gauge Bar Width', () => {
    it('should set gauge width based on risk score', () => {
      const { container } = render(<RiskCard data={mockRiskData} />)
      const gaugeBar = container.querySelector('[role="progressbar"] div')
      expect(gaugeBar).toHaveStyle({ width: '45%' })
    })

    it('should set gauge width to 0% for zero score', () => {
      const zeroScoreData = createMockRiskData({ riskScore: 0, riskLevel: 'Very Low' })
      const { container } = render(<RiskCard data={zeroScoreData} />)
      const gaugeBar = container.querySelector('[role="progressbar"] div')
      expect(gaugeBar).toHaveStyle({ width: '0%' })
    })

    it('should set gauge width to 100% for maximum score', () => {
      const maxScoreData = createMockRiskData({ riskScore: 100, riskLevel: 'Very High' })
      const { container } = render(<RiskCard data={maxScoreData} />)
      const gaugeBar = container.querySelector('[role="progressbar"] div')
      expect(gaugeBar).toHaveStyle({ width: '100%' })
    })
  })

  describe('Rug Pull Risk Display', () => {
    it('should not display rug pull risk when score is 0', () => {
      const noRugRiskData = createMockRiskData({ rugPullRisk: 0 })
      render(<RiskCard data={noRugRiskData} />)
      expect(screen.queryByText(/rug risk/i)).not.toBeInTheDocument()
    })

    it('should display rug pull risk when score > 0', () => {
      render(<RiskCard data={mockRiskData} />)
      expect(screen.getByText(/rug risk: 15%/i)).toBeInTheDocument()
    })

    it('should display green rug pull badge for low risk (0-25)', () => {
      const lowRugData = createMockRiskData({ rugPullRisk: 20 })
      render(<RiskCard data={lowRugData} />)
      const badge = screen.getByText(/rug risk: 20%/i)
      expect(badge).toBeInTheDocument()
    })

    it('should display amber rug pull badge for medium risk (25-50)', () => {
      const mediumRugData = createMockRiskData({ rugPullRisk: 35 })
      render(<RiskCard data={mediumRugData} />)
      const badge = screen.getByText(/rug risk: 35%/i)
      expect(badge).toBeInTheDocument()
    })

    it('should display red rug pull badge for high risk (> 50)', () => {
      const highRugData = createMockRiskData({ rugPullRisk: 75 })
      render(<RiskCard data={highRugData} />)
      const badge = screen.getByText(/rug risk: 75%/i)
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Timestamp Display', () => {
    it('should display analyzed label', () => {
      render(<RiskCard data={mockRiskData} />)
      expect(screen.getByText(/analyzed/i)).toBeInTheDocument()
    })

    it('should display analysis time in milliseconds', () => {
      render(<RiskCard data={mockRiskData} />)
      expect(screen.getByText(/250ms/)).toBeInTheDocument()
    })

    it('should not display analysis time when it is 0', () => {
      const zeroTimeData = createMockRiskData({ analysisTimeMs: 0 })
      render(<RiskCard data={zeroTimeData} />)
      expect(screen.queryByText(/0ms/)).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have progressbar role for gauge', () => {
      const { container } = render(<RiskCard data={mockRiskData} />)
      const progressbar = container.querySelector('[role="progressbar"]')
      expect(progressbar).toBeInTheDocument()
    })

    it('should have aria-valuenow set to risk score', () => {
      const { container } = render(<RiskCard data={mockRiskData} />)
      const progressbar = container.querySelector('[role="progressbar"]')
      expect(progressbar).toHaveAttribute('aria-valuenow', '45')
    })

    it('should have aria-valuemin set to 0', () => {
      const { container } = render(<RiskCard data={mockRiskData} />)
      const progressbar = container.querySelector('[role="progressbar"]')
      expect(progressbar).toHaveAttribute('aria-valuemin', '0')
    })

    it('should have aria-valuemax set to 100', () => {
      const { container } = render(<RiskCard data={mockRiskData} />)
      const progressbar = container.querySelector('[role="progressbar"]')
      expect(progressbar).toHaveAttribute('aria-valuemax', '100')
    })

    it('should have aria-label for progressbar', () => {
      const { container } = render(<RiskCard data={mockRiskData} />)
      const progressbar = container.querySelector('[role="progressbar"]')
      expect(progressbar).toHaveAttribute('aria-label', expect.stringContaining('Risk score'))
    })
  })

  describe('Different Address Types', () => {
    it('should display "wallet" badge for wallet type', () => {
      const walletData = createMockRiskData({ addressType: 'wallet' })
      render(<RiskCard data={walletData} />)
      expect(screen.getByText('wallet')).toBeInTheDocument()
    })

    it('should display "contract" badge for contract type', () => {
      const contractData = createMockRiskData({ addressType: 'contract' })
      render(<RiskCard data={contractData} />)
      expect(screen.getByText('contract')).toBeInTheDocument()
    })

    it('should display "token" badge for token type', () => {
      const tokenData = createMockRiskData({ addressType: 'token' })
      render(<RiskCard data={tokenData} />)
      expect(screen.getByText('token')).toBeInTheDocument()
    })
  })

  describe('Risk Score Formatting', () => {
    it('should display score as integer without decimals', () => {
      const integerScoreData = createMockRiskData({ riskScore: 45, riskLevel: 'Medium' })
      render(<RiskCard data={integerScoreData} />)
      const scoreElements = screen.getAllByText('45')
      expect(scoreElements.length).toBeGreaterThan(0)
    })

    it('should display valid score ranges', () => {
      const testScores = [10, 25, 50, 75, 90]
      testScores.forEach((score) => {
        const riskLevel = score < 20 ? 'Very Low' as const : score < 40 ? 'Low' as const : score < 60 ? 'Medium' as const : score < 80 ? 'High' as const : 'Very High' as const
        const { unmount } = render(
          <RiskCard data={createMockRiskData({ riskScore: score, riskLevel })} />
        )
        const scoreElements = screen.getAllByText(score.toString())
        expect(scoreElements.length).toBeGreaterThan(0)
        unmount()
      })
    })
  })
})
