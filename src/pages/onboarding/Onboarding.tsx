import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { OnboardingProgress } from '@/components/onboarding'
import { useOnboarding } from '@/hooks/use-onboarding'
import {
  RoleStep,
  OrganizationStep,
  EventTypesStep,
  EventScaleStep,
  GoalsStep,
  ExperienceStep,
  ReferralStep,
} from './steps'
import type { OnboardingAnswers } from '@/types/onboarding'

const steps = [
  RoleStep,
  OrganizationStep,
  EventTypesStep,
  EventScaleStep,
  GoalsStep,
  ExperienceStep,
  ReferralStep,
]

export function Onboarding() {
  const navigate = useNavigate()
  const saveProfile = useMutation(api.organizerProfiles.saveProfile)
  const hasSavedRef = useRef(false)

  const {
    currentStep,
    totalSteps,
    answers,
    isComplete,
    nextStep,
    prevStep,
    skipOnboarding,
  } = useOnboarding()

  // Save onboarding data and navigate to completion when done
  useEffect(() => {
    if (isComplete && !hasSavedRef.current) {
      hasSavedRef.current = true

      // Save profile to Convex
      saveProfile({
        organizationName: answers.organizationName,
        organizationType: answers.organizationType,
        eventTypes: answers.eventTypes,
        eventScale: answers.eventScale,
        goals: answers.goals,
        experienceLevel: answers.experienceLevel,
        referralSource: answers.referralSource,
      })
        .then(() => {
          navigate('/onboarding/complete', { replace: true })
        })
        .catch((error) => {
          console.error('Failed to save onboarding data:', error)
          // Navigate anyway - we don't want to block the user
          navigate('/onboarding/complete', { replace: true })
        })
    }
  }, [isComplete, answers, saveProfile, navigate])

  const CurrentStepComponent = steps[currentStep - 1]

  const handleNext = (data: Partial<OnboardingAnswers>) => {
    nextStep(data)
  }

  const handleBack = () => {
    prevStep()
  }

  const handleSkip = () => {
    skipOnboarding()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <Link
          to="/"
          className="font-mono text-lg font-semibold hover:opacity-80 transition-opacity"
        >
          open-event
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Step {currentStep} of {totalSteps}
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Progress */}
      <div className="px-6 max-w-md mx-auto w-full">
        <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-start justify-center px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <CurrentStepComponent
            onNext={handleNext}
            onBack={handleBack}
            onSkip={currentStep === totalSteps ? handleSkip : undefined}
            currentData={answers}
          />
        </div>
      </main>

      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
