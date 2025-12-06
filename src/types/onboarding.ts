/**
 * Onboarding Types
 *
 * Type definitions for the multi-step onboarding flow.
 * These types define the data collected during user onboarding
 * and are used by both frontend components and will be sent to Convex backend.
 */

/** User's primary role on the platform */
export type UserRole = 'organizer' | 'sponsor' | 'vendor' | 'exploring'

/** Type of organization the user belongs to */
export type OrganizationType = 'company' | 'nonprofit' | 'government' | 'community'

/** Typical size of events the user manages */
export type EventScale = 'small' | 'medium' | 'large' | 'enterprise'

/** User's experience level with event management */
export type ExperienceLevel = 'first-time' | '1-5' | '5-20' | '20+'

/**
 * Collected answers from all onboarding steps.
 * All fields are optional as they're populated progressively.
 */
export interface OnboardingAnswers {
  /** User's primary role (Step 1) */
  role?: UserRole
  /** Organization name (Step 2) */
  organizationName?: string
  /** Organization type (Step 2) */
  organizationType?: OrganizationType
  /** Types of events typically organized (Step 3) */
  eventTypes?: string[]
  /** Typical event size (Step 4) */
  eventScale?: EventScale
  /** User's goals with the platform (Step 5) */
  goals?: string[]
  /** Experience level (Step 6) */
  experienceLevel?: ExperienceLevel
  /** How user discovered the platform (Step 7) */
  referralSource?: string
}

/**
 * Complete onboarding state including navigation.
 */
export interface OnboardingState {
  /** Current step number (1-indexed) */
  currentStep: number
  /** Total number of steps */
  totalSteps: number
  /** Collected answers from completed steps */
  answers: OnboardingAnswers
  /** Whether onboarding is complete */
  isComplete: boolean
}

/**
 * Props passed to each onboarding step component.
 */
export interface StepProps {
  /** Callback to advance to next step with optional data */
  onNext: (data: Partial<OnboardingAnswers>) => void
  /** Callback to go back to previous step */
  onBack: () => void
  /** Optional callback to skip remaining steps */
  onSkip?: () => void
  /** Current collected data for pre-populating fields */
  currentData: OnboardingAnswers
}

/** Available event types for selection */
export const EVENT_TYPES = [
  'Conferences',
  'Hackathons',
  'Workshops',
  'Meetups',
  'Corporate Events',
  'Community Events',
  'Government/Public',
] as const

/** Available goals for selection */
export const GOALS = [
  'Find sponsors',
  'Manage vendors',
  'Coordinate volunteers',
  'Streamline logistics',
  'Generate reports',
  'All of the above',
] as const

/** Available referral sources for selection */
export const REFERRAL_SOURCES = [
  'Search engine',
  'Social media',
  'Friend/Colleague',
  'Conference/Event',
  'GitHub',
  'Other',
] as const
