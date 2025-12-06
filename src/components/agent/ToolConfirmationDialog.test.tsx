import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ToolConfirmationDialog } from './ToolConfirmationDialog'

describe('ToolConfirmationDialog', () => {
  const defaultToolCall = {
    id: 'test-id',
    name: 'createEvent',
    arguments: {
      title: 'Tech Conference 2024',
      eventType: 'conference',
      startDate: '2024-06-15',
      expectedAttendees: 500,
    },
  }

  const defaultProps = {
    toolCall: defaultToolCall,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render with correct title', () => {
      render(<ToolConfirmationDialog {...defaultProps} />)
      expect(screen.getByText('Create Event')).toBeInTheDocument()
    })

    it('should render with correct description', () => {
      render(<ToolConfirmationDialog {...defaultProps} />)
      expect(
        screen.getByText('This will create a new event with the following details:')
      ).toBeInTheDocument()
    })

    it('should display tool arguments', () => {
      render(<ToolConfirmationDialog {...defaultProps} />)
      expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument()
      expect(screen.getByText('conference')).toBeInTheDocument()
      expect(screen.getByText('2024-06-15')).toBeInTheDocument()
      expect(screen.getByText('500')).toBeInTheDocument()
    })

    it('should format argument keys with spaces', () => {
      render(<ToolConfirmationDialog {...defaultProps} />)
      // "eventType" should become "event Type" or similar
      expect(screen.getByText(/event\s*Type/i)).toBeInTheDocument()
    })

    it('should render Confirm and Cancel buttons', () => {
      render(<ToolConfirmationDialog {...defaultProps} />)
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should call onConfirm when Confirm button is clicked', () => {
      const onConfirm = vi.fn()
      render(<ToolConfirmationDialog {...defaultProps} onConfirm={onConfirm} />)

      fireEvent.click(screen.getByRole('button', { name: /confirm/i }))
      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should call onCancel when Cancel button is clicked', () => {
      const onCancel = vi.fn()
      render(<ToolConfirmationDialog {...defaultProps} onCancel={onCancel} />)

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
      expect(onCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('loading state', () => {
    it('should disable buttons when loading', () => {
      render(<ToolConfirmationDialog {...defaultProps} isLoading={true} />)

      expect(screen.getByRole('button', { name: /confirming/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
    })

    it('should show "Confirming..." text when loading', () => {
      render(<ToolConfirmationDialog {...defaultProps} isLoading={true} />)
      expect(screen.getByText('Confirming...')).toBeInTheDocument()
    })
  })

  describe('different tool types', () => {
    it('should render vendor tool correctly', () => {
      const vendorToolCall = {
        id: 'vendor-id',
        name: 'addVendorToEvent',
        arguments: {
          vendorId: 'v123',
          eventId: 'e456',
          proposedBudget: 5000,
        },
      }
      render(<ToolConfirmationDialog {...defaultProps} toolCall={vendorToolCall} />)
      expect(screen.getByText('Add Vendor to Event')).toBeInTheDocument()
      expect(screen.getByText('This will send an inquiry to the vendor:')).toBeInTheDocument()
    })

    it('should render sponsor tool correctly', () => {
      const sponsorToolCall = {
        id: 'sponsor-id',
        name: 'addSponsorToEvent',
        arguments: {
          sponsorId: 's123',
          eventId: 'e456',
          tier: 'gold',
        },
      }
      render(<ToolConfirmationDialog {...defaultProps} toolCall={sponsorToolCall} />)
      expect(screen.getByText('Add Sponsor to Event')).toBeInTheDocument()
      expect(screen.getByText('This will create a sponsorship inquiry:')).toBeInTheDocument()
    })
  })

  describe('argument filtering', () => {
    it('should not display organizerId in arguments', () => {
      const toolCallWithOrganizerId = {
        ...defaultToolCall,
        arguments: {
          ...defaultToolCall.arguments,
          organizerId: 'user-123',
        },
      }
      render(<ToolConfirmationDialog {...defaultProps} toolCall={toolCallWithOrganizerId} />)
      expect(screen.queryByText('user-123')).not.toBeInTheDocument()
    })

    it('should not display arguments starting with underscore', () => {
      const toolCallWithPrivateArgs = {
        ...defaultToolCall,
        arguments: {
          ...defaultToolCall.arguments,
          _internalId: 'internal-123',
        },
      }
      render(<ToolConfirmationDialog {...defaultProps} toolCall={toolCallWithPrivateArgs} />)
      expect(screen.queryByText('internal-123')).not.toBeInTheDocument()
    })
  })

  describe('value formatting', () => {
    it('should format null values as "Not specified"', () => {
      const toolCallWithNull = {
        ...defaultToolCall,
        arguments: {
          title: null,
        },
      }
      render(<ToolConfirmationDialog {...defaultProps} toolCall={toolCallWithNull} />)
      expect(screen.getByText('Not specified')).toBeInTheDocument()
    })

    it('should format undefined values as "Not specified"', () => {
      const toolCallWithUndefined = {
        ...defaultToolCall,
        arguments: {
          title: undefined,
        },
      }
      render(<ToolConfirmationDialog {...defaultProps} toolCall={toolCallWithUndefined} />)
      expect(screen.getByText('Not specified')).toBeInTheDocument()
    })

    it('should format boolean true as "Yes"', () => {
      const toolCallWithBoolean = {
        ...defaultToolCall,
        arguments: {
          confirmed: true,
        },
      }
      render(<ToolConfirmationDialog {...defaultProps} toolCall={toolCallWithBoolean} />)
      expect(screen.getByText('Yes')).toBeInTheDocument()
    })

    it('should format boolean false as "No"', () => {
      const toolCallWithBoolean = {
        ...defaultToolCall,
        arguments: {
          confirmed: false,
        },
      }
      render(<ToolConfirmationDialog {...defaultProps} toolCall={toolCallWithBoolean} />)
      expect(screen.getByText('No')).toBeInTheDocument()
    })
  })

  describe('unknown tools', () => {
    it('should render fallback title for unknown tools', () => {
      const unknownToolCall = {
        id: 'unknown-id',
        name: 'unknownTool',
        arguments: { data: 'test' },
      }
      render(<ToolConfirmationDialog {...defaultProps} toolCall={unknownToolCall} />)
      expect(screen.getByText('unknownTool')).toBeInTheDocument()
    })

    it('should render fallback description for unknown tools', () => {
      const unknownToolCall = {
        id: 'unknown-id',
        name: 'unknownTool',
        arguments: { data: 'test' },
      }
      render(<ToolConfirmationDialog {...defaultProps} toolCall={unknownToolCall} />)
      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument()
    })
  })
})
