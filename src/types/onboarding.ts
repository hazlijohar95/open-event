export type UserRole = 'organizer' | 'sponsor' | 'vendor' | 'exploring'
export type OrganizationType = 'company' | 'nonprofit' | 'government' | 'community'
export type EventScale = 'small' | 'medium' | 'large' | 'enterprise'
export type ExperienceLevel = 'first-time' | '1-5' | '5-20' | '20+'

export interface OnboardingAnswers {
  role?: UserRole
  organizationName?: string
  organizationType?: OrganizationType
  eventTypes?: string[]
  eventScale?: EventScale
  goals?: string[]
  experienceLevel?: ExperienceLevel
  referralSource?: string
}

export interface OnboardingState {
  currentStep: number
  totalSteps: number
  answers: OnboardingAnswers
  isComplete: boolean
}

export interface StepProps {
  onNext: (data: Partial<OnboardingAnswers>) => void
  onBack: () => void
  onSkip?: () => void
  currentData: OnboardingAnswers
}

export const EVENT_TYPES = [
  'Conferences',
  'Hackathons',
  'Workshops',
  'Meetups',
  'Corporate Events',
  'Community Events',
  'Government/Public',
] as const

export const GOALS = [
  'Find sponsors',
  'Manage vendors',
  'Coordinate volunteers',
  'Streamline logistics',
  'Generate reports',
  'All of the above',
] as const

export const REFERRAL_SOURCES = [
  'Search engine',
  'Social media',
  'Friend/Colleague',
  'Conference/Event',
  'GitHub',
  'Other',
] as const
