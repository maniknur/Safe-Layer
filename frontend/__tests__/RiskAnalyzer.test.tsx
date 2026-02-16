import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RiskAnalyzer from '../components/RiskAnalyzer'

describe('RiskAnalyzer Component', () => {
  const mockOnAnalyze = jest.fn()
  const defaultProps = {
    onAnalyze: mockOnAnalyze,
    loading: false,
    searchHistory: [],
  }

  beforeEach(() => {
    mockOnAnalyze.mockClear()
  })

  describe('Input Field Rendering', () => {
    it('should render input field', () => {
      render(<RiskAnalyzer {...defaultProps} />)
      const input = screen.getByRole('textbox', { name: /wallet.*contract address/i })
      expect(input).toBeInTheDocument()
    })

    it('should render input with correct placeholder', () => {
      render(<RiskAnalyzer {...defaultProps} />)
      const input = screen.getByPlaceholderText('0x...')
      expect(input).toBeInTheDocument()
    })

    it('should render label for input field', () => {
      render(<RiskAnalyzer {...defaultProps} />)
      expect(screen.getByLabelText(/wallet.*contract address/i)).toBeInTheDocument()
    })

    it('should update input value on change', async () => {
      const user = userEvent.setup()
      render(<RiskAnalyzer {...defaultProps} />)
      const input = screen.getByPlaceholderText('0x...')

      await user.type(input, '0x1234567890123456789012345678901234567890')
      expect(input).toHaveValue('0x1234567890123456789012345678901234567890')
    })

    it('should disable input when loading', () => {
      render(<RiskAnalyzer {...defaultProps} loading={true} />)
      const input = screen.getByPlaceholderText('0x...')
      expect(input).toBeDisabled()
    })
  })

  describe('Button Click and API Call', () => {
    it('should render Analyze Risk button', () => {
      render(<RiskAnalyzer {...defaultProps} />)
      expect(screen.getByRole('button', { name: /analyze risk/i })).toBeInTheDocument()
    })

    it('should call onAnalyze when form is submitted with valid address', async () => {
      const user = userEvent.setup()
      render(<RiskAnalyzer {...defaultProps} />)
      const input = screen.getByPlaceholderText('0x...')
      const button = screen.getByRole('button', { name: /analyze risk/i })

      await user.type(input, '0x1234567890123456789012345678901234567890')
      await user.click(button)

      expect(mockOnAnalyze).toHaveBeenCalledWith('0x1234567890123456789012345678901234567890')
      expect(mockOnAnalyze).toHaveBeenCalledTimes(1)
    })

    it('should call onAnalyze when enter key is pressed', async () => {
      const user = userEvent.setup()
      render(<RiskAnalyzer {...defaultProps} />)
      const input = screen.getByPlaceholderText('0x...')

      await user.type(input, '0x1234567890123456789012345678901234567890{Enter}')

      expect(mockOnAnalyze).toHaveBeenCalledWith('0x1234567890123456789012345678901234567890')
    })

    it('should disable button when loading', () => {
      render(<RiskAnalyzer {...defaultProps} loading={true} />)
      const button = screen.getByRole('button', { name: /analyzing/i })
      expect(button).toBeDisabled()
    })

    it('should not call onAnalyze with empty input', async () => {
      const user = userEvent.setup()
      render(<RiskAnalyzer {...defaultProps} />)
      const button = screen.getByRole('button', { name: /analyze risk/i })

      await user.click(button)

      expect(mockOnAnalyze).not.toHaveBeenCalled()
    })

    it('should not call onAnalyze with only whitespace', async () => {
      const user = userEvent.setup()
      render(<RiskAnalyzer {...defaultProps} />)
      const input = screen.getByPlaceholderText('0x...')
      const button = screen.getByRole('button', { name: /analyze risk/i })

      await user.type(input, '   ')
      await user.click(button)

      expect(mockOnAnalyze).not.toHaveBeenCalled()
    })

    it('should render Try Example button', () => {
      render(<RiskAnalyzer {...defaultProps} />)
      expect(screen.getByRole('button', { name: /try example/i })).toBeInTheDocument()
    })

    it('should populate input with example address when Try Example is clicked', async () => {
      const user = userEvent.setup()
      render(<RiskAnalyzer {...defaultProps} />)
      const exampleButton = screen.getByRole('button', { name: /try example/i })

      await user.click(exampleButton)

      const input = screen.getByPlaceholderText('0x...') as HTMLInputElement
      expect(input.value).toBe('0x10ED43C718714eb63d5aA57B78B54704E256024E')
    })
  })

  describe('Loading State', () => {
    it('should show loading spinner when loading is true', () => {
      render(<RiskAnalyzer {...defaultProps} loading={true} />)
      expect(screen.getByText(/analyzing/i)).toBeInTheDocument()
    })

    it('should show "Analyzing..." text during loading', () => {
      render(<RiskAnalyzer {...defaultProps} loading={true} />)
      expect(screen.getByText(/analyzing\.\.\./i)).toBeInTheDocument()
    })

    it('should show "Analyze Risk" text when not loading', () => {
      render(<RiskAnalyzer {...defaultProps} loading={false} />)
      expect(screen.getByRole('button', { name: /^analyze risk$/i })).toBeInTheDocument()
    })

    it('should disable Try Example button during loading', () => {
      render(<RiskAnalyzer {...defaultProps} loading={true} />)
      const exampleButton = screen.getByRole('button', { name: /try example/i })
      expect(exampleButton).toBeDisabled()
    })
  })

  describe('Error Message Handling', () => {
    it('should show error for empty address', async () => {
      const user = userEvent.setup()
      render(<RiskAnalyzer {...defaultProps} />)
      const button = screen.getByRole('button', { name: /analyze risk/i })

      await user.click(button)

      expect(screen.getByRole('alert')).toHaveTextContent(/please enter a wallet address/i)
    })

    it('should show error for invalid address format', async () => {
      const user = userEvent.setup()
      render(<RiskAnalyzer {...defaultProps} />)
      const input = screen.getByPlaceholderText('0x...')
      const button = screen.getByRole('button', { name: /analyze risk/i })

      await user.type(input, 'invalid-address')
      await user.click(button)

      expect(screen.getByRole('alert')).toHaveTextContent(/invalid address format/i)
    })

    it('should show error for address without 0x prefix', async () => {
      const user = userEvent.setup()
      render(<RiskAnalyzer {...defaultProps} />)
      const input = screen.getByPlaceholderText('0x...')
      const button = screen.getByRole('button', { name: /analyze risk/i })

      await user.type(input, '1234567890123456789012345678901234567890')
      await user.click(button)

      expect(screen.getByRole('alert')).toHaveTextContent(/invalid address format/i)
    })

    it('should show error for address that is too short', async () => {
      const user = userEvent.setup()
      render(<RiskAnalyzer {...defaultProps} />)
      const input = screen.getByPlaceholderText('0x...')
      const button = screen.getByRole('button', { name: /analyze risk/i })

      await user.type(input, '0x123')
      await user.click(button)

      expect(screen.getByRole('alert')).toHaveTextContent(/invalid address format/i)
    })

    it('should clear error when input becomes valid', async () => {
      const user = userEvent.setup()
      render(<RiskAnalyzer {...defaultProps} />)
      const input = screen.getByPlaceholderText('0x...')
      const button = screen.getByRole('button', { name: /analyze risk/i })

      // First, trigger an error
      await user.click(button)
      expect(screen.getByRole('alert')).toBeInTheDocument()

      // Then type a valid address
      await user.type(input, '0x1234567890123456789012345678901234567890')

      // Error should be cleared
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('should clear error when Try Example button is clicked', async () => {
      const user = userEvent.setup()
      render(<RiskAnalyzer {...defaultProps} />)
      const input = screen.getByPlaceholderText('0x...')
      const button = screen.getByRole('button', { name: /analyze risk/i })

      // First, trigger an error
      await user.type(input, 'invalid')
      await user.click(button)
      expect(screen.getByRole('alert')).toBeInTheDocument()

      // Click Try Example
      const exampleButton = screen.getByRole('button', { name: /try example/i })
      await user.click(exampleButton)

      // Error should be cleared
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('should have role="alert" for error messages', async () => {
      const user = userEvent.setup()
      render(<RiskAnalyzer {...defaultProps} />)
      const button = screen.getByRole('button', { name: /analyze risk/i })

      await user.click(button)

      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  describe('Search History', () => {
    it('should not render search history when empty', () => {
      render(<RiskAnalyzer {...defaultProps} searchHistory={[]} />)
      expect(screen.queryByText(/recent searches/i)).not.toBeInTheDocument()
    })

    it('should render search history when populated', () => {
      const searchHistory = [
        {
          address: '0x1234567890123456789012345678901234567890',
          riskScore: 25,
          riskLevel: 'Low' as const,
          timestamp: '2026-02-16T00:00:00Z',
        },
      ]
      render(<RiskAnalyzer {...defaultProps} searchHistory={searchHistory} />)
      expect(screen.getByText(/recent searches/i)).toBeInTheDocument()
    })

    it('should display shortened address in history', () => {
      const searchHistory = [
        {
          address: '0x1234567890123456789012345678901234567890',
          riskScore: 25,
          riskLevel: 'Low' as const,
          timestamp: '2026-02-16T00:00:00Z',
        },
      ]
      render(<RiskAnalyzer {...defaultProps} searchHistory={searchHistory} />)
      expect(screen.getByText(/0x1234\.\.\.7890/)).toBeInTheDocument()
    })

    it('should display risk score in history', () => {
      const searchHistory = [
        {
          address: '0x1234567890123456789012345678901234567890',
          riskScore: 42,
          riskLevel: 'Medium' as const,
          timestamp: '2026-02-16T00:00:00Z',
        },
      ]
      render(<RiskAnalyzer {...defaultProps} searchHistory={searchHistory} />)
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('should trigger onAnalyze when history item is clicked', async () => {
      const user = userEvent.setup()
      const searchHistory = [
        {
          address: '0x1234567890123456789012345678901234567890',
          riskScore: 25,
          riskLevel: 'Low' as const,
          timestamp: '2026-02-16T00:00:00Z',
        },
      ]
      render(<RiskAnalyzer {...defaultProps} searchHistory={searchHistory} />)

      const historyButton = screen.getByTitle(/score: 25/i)
      await user.click(historyButton)

      expect(mockOnAnalyze).toHaveBeenCalledWith('0x1234567890123456789012345678901234567890')
    })

    it('should populate input when history item is clicked', async () => {
      const user = userEvent.setup()
      const searchHistory = [
        {
          address: '0x1234567890123456789012345678901234567890',
          riskScore: 25,
          riskLevel: 'Low' as const,
          timestamp: '2026-02-16T00:00:00Z',
        },
      ]
      render(<RiskAnalyzer {...defaultProps} searchHistory={searchHistory} />)

      const historyButton = screen.getByTitle(/score: 25/i)
      await user.click(historyButton)

      const input = screen.getByPlaceholderText('0x...') as HTMLInputElement
      expect(input.value).toBe('0x1234567890123456789012345678901234567890')
    })
  })
})
