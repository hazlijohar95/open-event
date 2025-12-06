/**
 * Centralized tool configuration for the AI agent UI
 *
 * This module provides consistent labels, icons, and descriptions
 * for all agent tools across the application.
 */

import {
  Calendar,
  Storefront,
  Handshake,
  User,
  Wrench,
  type IconWeight,
} from '@phosphor-icons/react'
import type { FC } from 'react'

// Type for Phosphor icon components
type PhosphorIcon = FC<{ size?: number | string; weight?: IconWeight; className?: string }>

export type ToolName =
  | 'createEvent'
  | 'updateEvent'
  | 'getEventDetails'
  | 'getUpcomingEvents'
  | 'searchVendors'
  | 'addVendorToEvent'
  | 'searchSponsors'
  | 'addSponsorToEvent'
  | 'getUserProfile'

export interface ToolConfig {
  icon: PhosphorIcon
  /** Label shown during execution (gerund form) */
  executingLabel: string
  /** Label for confirmation dialogs (imperative form) */
  confirmLabel: string
  /** Description for confirmation dialogs */
  confirmDescription: string
  /** Category for grouping */
  category: 'events' | 'vendors' | 'sponsors' | 'profile'
}

export const TOOL_CONFIG: Record<ToolName, ToolConfig> = {
  createEvent: {
    icon: Calendar,
    executingLabel: 'Creating Event',
    confirmLabel: 'Create Event',
    confirmDescription: 'This will create a new event with the following details:',
    category: 'events',
  },
  updateEvent: {
    icon: Calendar,
    executingLabel: 'Updating Event',
    confirmLabel: 'Update Event',
    confirmDescription: 'This will update the event with the following changes:',
    category: 'events',
  },
  getEventDetails: {
    icon: Calendar,
    executingLabel: 'Getting Event Details',
    confirmLabel: 'Get Event Details',
    confirmDescription: 'Retrieving event information.',
    category: 'events',
  },
  getUpcomingEvents: {
    icon: Calendar,
    executingLabel: 'Getting Upcoming Events',
    confirmLabel: 'Get Upcoming Events',
    confirmDescription: 'Fetching your upcoming events.',
    category: 'events',
  },
  searchVendors: {
    icon: Storefront,
    executingLabel: 'Searching Vendors',
    confirmLabel: 'Search Vendors',
    confirmDescription: 'Searching for vendors matching your criteria.',
    category: 'vendors',
  },
  addVendorToEvent: {
    icon: Storefront,
    executingLabel: 'Adding Vendor',
    confirmLabel: 'Add Vendor to Event',
    confirmDescription: 'This will send an inquiry to the vendor:',
    category: 'vendors',
  },
  searchSponsors: {
    icon: Handshake,
    executingLabel: 'Searching Sponsors',
    confirmLabel: 'Search Sponsors',
    confirmDescription: 'Searching for potential sponsors.',
    category: 'sponsors',
  },
  addSponsorToEvent: {
    icon: Handshake,
    executingLabel: 'Adding Sponsor',
    confirmLabel: 'Add Sponsor to Event',
    confirmDescription: 'This will create a sponsorship inquiry:',
    category: 'sponsors',
  },
  getUserProfile: {
    icon: User,
    executingLabel: 'Getting Profile',
    confirmLabel: 'Get User Profile',
    confirmDescription: 'Retrieving your profile information.',
    category: 'profile',
  },
}

/**
 * Get tool configuration with fallback for unknown tools
 */
export function getToolConfig(toolName: string): ToolConfig {
  return (
    TOOL_CONFIG[toolName as ToolName] ?? {
      icon: Wrench,
      executingLabel: toolName,
      confirmLabel: toolName,
      confirmDescription: 'Are you sure you want to proceed?',
      category: 'events' as const,
    }
  )
}

/**
 * Get the icon for a tool
 */
export function getToolIcon(toolName: string): PhosphorIcon {
  return getToolConfig(toolName).icon
}

/**
 * Get the executing label for a tool
 */
export function getToolExecutingLabel(toolName: string): string {
  return getToolConfig(toolName).executingLabel
}

/**
 * Get the confirmation label for a tool
 */
export function getToolConfirmLabel(toolName: string): string {
  return getToolConfig(toolName).confirmLabel
}
