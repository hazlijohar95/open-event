import { describe, it, expect } from 'vitest'
import {
  EVENT_STATUS,
  VENDOR_STATUS,
  SPONSOR_TIER,
  APPROVAL_STATUS,
  LOCATION_TYPE,
  eventStatusColors,
  eventStatusFilters,
  vendorStatusColors,
  sponsorTierColors,
  formatDate,
  formatTime,
  formatCurrency,
} from './constants'

describe('constants', () => {
  describe('EVENT_STATUS', () => {
    it('should define all expected event statuses', () => {
      expect(EVENT_STATUS.DRAFT).toBe('draft')
      expect(EVENT_STATUS.PLANNING).toBe('planning')
      expect(EVENT_STATUS.ACTIVE).toBe('active')
      expect(EVENT_STATUS.COMPLETED).toBe('completed')
      expect(EVENT_STATUS.CANCELLED).toBe('cancelled')
    })

    it('should have 5 status values', () => {
      expect(Object.keys(EVENT_STATUS)).toHaveLength(5)
    })
  })

  describe('VENDOR_STATUS', () => {
    it('should define all expected vendor statuses', () => {
      expect(VENDOR_STATUS.INQUIRY).toBe('inquiry')
      expect(VENDOR_STATUS.NEGOTIATING).toBe('negotiating')
      expect(VENDOR_STATUS.CONFIRMED).toBe('confirmed')
      expect(VENDOR_STATUS.DECLINED).toBe('declined')
      expect(VENDOR_STATUS.COMPLETED).toBe('completed')
    })

    it('should have 5 status values', () => {
      expect(Object.keys(VENDOR_STATUS)).toHaveLength(5)
    })
  })

  describe('SPONSOR_TIER', () => {
    it('should define all expected sponsor tiers', () => {
      expect(SPONSOR_TIER.PLATINUM).toBe('platinum')
      expect(SPONSOR_TIER.GOLD).toBe('gold')
      expect(SPONSOR_TIER.SILVER).toBe('silver')
      expect(SPONSOR_TIER.BRONZE).toBe('bronze')
    })

    it('should have 4 tier values', () => {
      expect(Object.keys(SPONSOR_TIER)).toHaveLength(4)
    })
  })

  describe('APPROVAL_STATUS', () => {
    it('should define all expected approval statuses', () => {
      expect(APPROVAL_STATUS.PENDING).toBe('pending')
      expect(APPROVAL_STATUS.APPROVED).toBe('approved')
      expect(APPROVAL_STATUS.REJECTED).toBe('rejected')
    })

    it('should have 3 status values', () => {
      expect(Object.keys(APPROVAL_STATUS)).toHaveLength(3)
    })
  })

  describe('LOCATION_TYPE', () => {
    it('should define all expected location types', () => {
      expect(LOCATION_TYPE.IN_PERSON).toBe('in-person')
      expect(LOCATION_TYPE.VIRTUAL).toBe('virtual')
      expect(LOCATION_TYPE.HYBRID).toBe('hybrid')
    })

    it('should have 3 location types', () => {
      expect(Object.keys(LOCATION_TYPE)).toHaveLength(3)
    })
  })

  describe('eventStatusColors', () => {
    it('should have colors for all event statuses', () => {
      const statuses = ['draft', 'planning', 'active', 'completed', 'cancelled']
      statuses.forEach((status) => {
        expect(eventStatusColors[status]).toBeDefined()
        expect(eventStatusColors[status].bg).toBeDefined()
        expect(eventStatusColors[status].text).toBeDefined()
        expect(eventStatusColors[status].label).toBeDefined()
      })
    })

    it('should have correct structure for each status color', () => {
      Object.values(eventStatusColors).forEach((color) => {
        expect(typeof color.bg).toBe('string')
        expect(typeof color.text).toBe('string')
        expect(typeof color.label).toBe('string')
        expect(color.bg).toMatch(/^bg-/)
        expect(color.text).toMatch(/^text-/)
      })
    })

    it('should have correct labels', () => {
      expect(eventStatusColors.draft.label).toBe('Draft')
      expect(eventStatusColors.planning.label).toBe('Planning')
      expect(eventStatusColors.active.label).toBe('Active')
      expect(eventStatusColors.completed.label).toBe('Completed')
      expect(eventStatusColors.cancelled.label).toBe('Cancelled')
    })
  })

  describe('eventStatusFilters', () => {
    it('should include all filter with correct label', () => {
      const allFilter = eventStatusFilters.find((f) => f.value === 'all')
      expect(allFilter).toBeDefined()
      expect(allFilter?.label).toBe('All')
    })

    it('should include all event status filters', () => {
      const values = eventStatusFilters.map((f) => f.value)
      expect(values).toContain('all')
      expect(values).toContain('draft')
      expect(values).toContain('planning')
      expect(values).toContain('active')
      expect(values).toContain('completed')
    })

    it('should have correct structure for each filter', () => {
      eventStatusFilters.forEach((filter) => {
        expect(typeof filter.value).toBe('string')
        expect(typeof filter.label).toBe('string')
      })
    })
  })

  describe('vendorStatusColors', () => {
    it('should have colors for all vendor statuses', () => {
      const statuses = ['inquiry', 'negotiating', 'confirmed', 'declined', 'completed']
      statuses.forEach((status) => {
        expect(vendorStatusColors[status]).toBeDefined()
        expect(vendorStatusColors[status].bg).toBeDefined()
        expect(vendorStatusColors[status].text).toBeDefined()
      })
    })

    it('should have correct structure for each status color', () => {
      Object.values(vendorStatusColors).forEach((color) => {
        expect(typeof color.bg).toBe('string')
        expect(typeof color.text).toBe('string')
        expect(color.bg).toMatch(/^bg-/)
        expect(color.text).toMatch(/^text-/)
      })
    })
  })

  describe('sponsorTierColors', () => {
    it('should have colors for all sponsor tiers', () => {
      const tiers = ['platinum', 'gold', 'silver', 'bronze']
      tiers.forEach((tier) => {
        expect(sponsorTierColors[tier]).toBeDefined()
        expect(sponsorTierColors[tier].bg).toBeDefined()
        expect(sponsorTierColors[tier].text).toBeDefined()
      })
    })

    it('should have correct structure for each tier color', () => {
      Object.values(sponsorTierColors).forEach((color) => {
        expect(typeof color.bg).toBe('string')
        expect(typeof color.text).toBe('string')
        expect(color.bg).toMatch(/^bg-/)
        expect(color.text).toMatch(/^text-/)
      })
    })
  })

  describe('formatDate', () => {
    const testTimestamp = new Date('2024-06-15T10:30:00').getTime()

    it('should format date in short format by default', () => {
      const result = formatDate(testTimestamp)
      expect(result).toContain('Jun')
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })

    it('should format date in short format when specified', () => {
      const result = formatDate(testTimestamp, 'short')
      expect(result).toContain('Jun')
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })

    it('should format date in long format when specified', () => {
      const result = formatDate(testTimestamp, 'long')
      expect(result).toContain('June')
      expect(result).toContain('15')
      expect(result).toContain('2024')
      expect(result).toContain('Saturday')
    })

    it('should handle different dates correctly', () => {
      const jan1 = new Date('2025-01-01T00:00:00').getTime()
      const result = formatDate(jan1, 'short')
      expect(result).toContain('Jan')
      expect(result).toContain('1')
      expect(result).toContain('2025')
    })
  })

  describe('formatTime', () => {
    it('should format morning time correctly', () => {
      const timestamp = new Date('2024-06-15T09:30:00').getTime()
      const result = formatTime(timestamp)
      expect(result).toMatch(/9:30\s*AM/i)
    })

    it('should format afternoon time correctly', () => {
      const timestamp = new Date('2024-06-15T14:45:00').getTime()
      const result = formatTime(timestamp)
      expect(result).toMatch(/2:45\s*PM/i)
    })

    it('should format midnight correctly', () => {
      const timestamp = new Date('2024-06-15T00:00:00').getTime()
      const result = formatTime(timestamp)
      expect(result).toMatch(/12:00\s*AM/i)
    })

    it('should format noon correctly', () => {
      const timestamp = new Date('2024-06-15T12:00:00').getTime()
      const result = formatTime(timestamp)
      expect(result).toMatch(/12:00\s*PM/i)
    })
  })

  describe('formatCurrency', () => {
    it('should format USD currency by default', () => {
      const result = formatCurrency(1000)
      expect(result).toBe('$1,000')
    })

    it('should format large amounts with thousands separator', () => {
      const result = formatCurrency(1234567)
      expect(result).toBe('$1,234,567')
    })

    it('should format zero correctly', () => {
      const result = formatCurrency(0)
      expect(result).toBe('$0')
    })

    it('should accept custom currency', () => {
      const result = formatCurrency(1000, 'EUR')
      expect(result).toContain('1,000')
    })

    it('should not show decimal places', () => {
      const result = formatCurrency(1000.99)
      expect(result).toBe('$1,001')
    })
  })
})
