import React from 'react'
import { render, screen } from '@testing-library/react'
import RiskCard from '../components/RiskCard'
import type { RiskData } from '../lib/types'

describe('RiskCard Component', () => {
  const mockRiskData: RiskData = {
    success: true,
    address: '0x1234567890123456789012345678901234567890',
    riskScore: 45,
    riskLevel: 'Medium',
    rugPullRisk: 15,
    addressType: 'wallet',
    breakdown: {
      walletRisk: 30,
      smartContractRisk: 0,
      liquidityRisk: 0,
    },
    components: {
      transactionRisk: 40,
      contractRisk: 0,
      liquidityRisk: 0,
      behavioralRisk: 35,
    },
    flags: ['Low transaction history'],
    explanation: {
      summary: 'Address has medium risk profile',
      keyFindings: ['Low activity', 'New wallet'],
      recommendations: ['Monitor for suspicious activity'],
      riskFactors: ['Low transaction volume'],
    },
    timestamp: '2026-02-16T12:00:00Z',
    analysisTimeMs: 250,
  }

  describe('Card Rendering', () => {
    it('should render risk card', () => {
      render(<RiskCard data={mockRiskData} />)
      expect(screen.getByText(/analyzing address/i)).toBeInTheDocument()
    })

    it('should display the wallet address', () => {
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

    it('should display overall risk score label', () => {
      render(<RiskCard data={mockRiskData} />)
      expect(screen.getByText(/overall risk score/i)).toBeInTheDocument()
    })
  })

  describe('Risk Badge Color Changes', () => {
    it('should display green badge for very low risk', () => {
      const lowRiskData = { ...mockRiskData, riskScore: 15, riskLevel: 'Very Low' }
      render(<RiskCard data={lowRiskData} />)
      const badge = screen.getByText(/very low risk/i)
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('text-green-400')
    })

    it('should display blue badge for low risk', () => {
      const lowRiskData = { ...mockRiskData, riskScore: 25, riskLevel: 'Low' }
      render(<RiskCard data={lowRiskData} />)
      const badge = screen.getByText(/^low risk$/i)
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('text-blue-400')
    })

    it('should display yellow badge for medium risk', () => {
      const mediumRiskData = { ...mockRiskData, riskScore: 45, riskLevel: 'Medium' }
      render(<RiskCard data={mediumRiskData} />)
      const badge = screen.getByText(/medium risk/i)
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('text-yellow-400')
    })

    it('should display orange badge for high risk', () => {
      const highRiskData = { ...mockRiskData, riskScore: 75, riskLevel: 'High' }
      render(<RiskCard data={highRiskData} />)
      const badge = screen.getByText(/^high risk$/i)
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('text-orange-400')
    })

    it('should display red badge for very high risk', () => {
      const veryHighRiskData = { ...mockRiskData, riskScore: 85, riskLevel: 'Very High' }
      render(<RiskCard data={veryHighRiskData} />)
      const badge = screen.getByText(/very high risk/i)
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('text-red-400')
    })
  })

  describe('Risk Gauge Color Changes', () => {
    it('should show green gauge for very low score (< 20)', () => {
      const lowScoreData = { ...mockRiskData, riskScore: 15, riskLevel: 'Very Low' }
      const { container } = render(<RiskCard data={lowScoreData} />)
      const gaugeBar = container.querySelector('[role="progressbar"] div')
      expect(gaugeBar).toHaveClass('from-green-500')
    })

    it('should show blue gauge for low score (20-40)', () => {
      const lowScoreData = { ...mockRiskData, riskScore: 30, riskLevel: 'Low' }
      const { container } = render(<RiskCard data={lowScoreData} />)
      const gaugeBar = container.querySelector('[role="progressbar"] div')
      expect(gaugeBar).toHaveClass('from-blue-500')
    })

    it('should show yellow gauge for medium score (40-60)', () => {
      const mediumScoreData = { ...mockRiskData, riskScore: 50, riskLevel: 'Medium' }
      const { container } = render(<RiskCard data={mediumScoreData} />)
      const gaugeBar = container.querySelector('[role="progressbar"] div')
      expect(gaugeBar).toHaveClass('from-yellow-500')
    })

    it('should show orange gauge for high score (60-80)', () => {
      const highScoreData = { ...mockRiskData, riskScore: 70, riskLevel: 'High' }
      const { container } = render(<RiskCard data={highScoreData} />)
      const gaugeBar = container.querySelector('[role="progressbar"] div')
      expect(gaugeBar).toHaveClass('from-orange-500')
    })

    it('should show red gauge for very high score (>= 80)', () => {
      const veryHighScoreData = { ...mockRiskData, riskScore: 90, riskLevel: 'Very High' }
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
      const zeroScoreData = { ...mockRiskData, riskScore: 0, riskLevel: 'Very Low' }
      const { container } = render(<RiskCard data={zeroScoreData} />)
      const gaugeBar = container.querySelector('[role="progressbar"] div')
      expect(gaugeBar).toHaveStyle({ width: '0%' })
    })

    it('should set gauge width to 100% for maximum score', () => {
      const maxScoreData = { ...mockRiskData, riskScore: 100, riskLevel: 'Very High' }
      const { container } = render(<RiskCard data={maxScoreData} />)
      const gaugeBar = container.querySelector('[role="progressbar"] div')
      expect(gaugeBar).toHaveStyle({ width: '100%' })
    })
  })

  describe('Rug Pull Risk Display', () => {
    it('should not display rug pull risk when score is 0', () => {
      const noRugRiskData = { ...mockRiskData, rugPullRisk: 0 }
      render(<RiskCard data={noRugRiskData} />)
      expect(screen.queryByText(/rug pull risk/i)).not.toBeInTheDocument()
    })

    it('should display rug pull risk when score > 0', () => {
      render(<RiskCard data={mockRiskData} />)
      expect(screen.getByText(/rug pull risk: 15%/i)).toBeInTheDocument()
    })

    it('should display green rug pull badge for low risk (0-25)', () => {
      const lowRugData = { ...mockRiskData, rugPullRisk: 20 }
      render(<RiskCard data={lowRugData} />)
      const badge = screen.getByText(/rug pull risk: 20%/i)
      expect(badge).toHaveClass('text-green-400')
    })

    it('should display yellow rug pull badge for medium risk (25-50)', () => {
      const mediumRugData = { ...mockRiskData, rugPullRisk: 35 }
      render(<RiskCard data={mediumRugData} />)
      const badge = screen.getByText(/rug pull risk: 35%/i)
      expect(badge).toHaveClass('text-yellow-400')
    })

    it('should display red rug pull badge for high risk (> 50)', () => {
      const highRugData = { ...mockRiskData, rugPullRisk: 75 }
      render(<RiskCard data={highRugData} />)
      const badge = screen.getByText(/rug pull risk: 75%/i)
      expect(badge).toHaveClass('text-red-400')
    })
  })

  describe('Timestamp Display', () => {
    it('should display analyzed timestamp', () => {
      render(<RiskCard data={mockRiskData} />)
      expect(screen.getByText(/analyzed/i)).toBeInTheDocument()
    })

    it('should display analysis time in milliseconds', () => {
      render(<RiskCard data={mockRiskData} />)
      expect(screen.getByText(/250ms/)).toBeInTheDocument()
    })

    it('should not display analysis time when it is 0', () => {
      const zeroTimeData = { ...mockRiskData, analysisTimeMs: 0 }
      render(<RiskCard data={zeroTimeData} />)
      expect(screen.queryByText(/0ms/)).not.toBeInTheDocument()
    })

    it('should format ISO timestamp to locale string', () => {
      render(<RiskCard data={mockRiskData} />)
      const timestamp = new Date(mockRiskData.timestamp).toLocaleString()
      expect(screen.getByText(timestamp)).toBeInTheDocument()
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
      const walletData = { ...mockRiskData, addressType: 'wallet' }
      render(<RiskCard data={walletData} />)
      expect(screen.getByText('wallet')).toBeInTheDocument()
    })

    it('should display "contract" badge for contract type', () => {
      const contractData = { ...mockRiskData, addressType: 'contract' }
      render(<RiskCard data={contractData} />)
      expect(screen.getByText('contract')).toBeInTheDocument()
    })

    it('should display "token" badge for token type', () => {
      const tokenData = { ...mockRiskData, addressType: 'token' }
      render(<RiskCard data={tokenData} />)
      expect(screen.getByText('token')).toBeInTheDocument()
    })
  })

  describe('Risk Score Formatting', () => {
    it('should display score as integer without decimals', () => {
      const integerScoreData = { ...mockRiskData, riskScore: 45, riskLevel: 'Medium' }
      render(<RiskCard data={integerScoreData} />)
      // The score is displayed in a dedicated span
      const scoreElements = screen.getAllByText('45')
      expect(scoreElements.length).toBeGreaterThan(0)
    })

    it('should display valid score ranges', () => {
      const testScores = [10, 25, 50, 75, 90]
      testScores.forEach((score) => {
        const { unmount } = render(
          <RiskCard data={{ ...mockRiskData, riskScore: score, riskLevel: score < 20 ? 'Very Low' : score < 40 ? 'Low' : score < 60 ? 'Medium' : score < 80 ? 'High' : 'Very High' }} />
        )
        // Score should be visible as a number (getAllByText handles multiple matches)
        const scoreElements = screen.getAllByText(score.toString())
        expect(scoreElements.length).toBeGreaterThan(0)
        unmount()
      })
    })
  })
})
