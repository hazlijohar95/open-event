import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { TypeformLayout, TypeformTransition } from '@/components/typeform'
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
  const existingProfile = useQuery(api.organizerProfiles.getMyProfile)
  const hasSavedRef = useRef(false)
  const hasCheckedProfile = useRef(false)

  const {
    currentStep,
    totalSteps,
    answers,
    isComplete,
    direction,
    nextStep,
    prevStep,
    skipOnboarding,
  } = useOnboarding()

  // Check if user already completed onboarding - redirect to dashboard
  useEffect(() => {
    if (existingProfile && !hasCheckedProfile.current) {
      hasCheckedProfile.current = true
      navigate('/dashboard', { replace: true })
    }
  }, [existingProfile, navigate])

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
        .catch(() => {
          // Navigate anyway - we don't want to block the user
          navigate('/onboarding/complete', { replace: true })
        })
    }
  }, [isComplete, answers, saveProfile, navigate])

  const CurrentStepComponent = steps[currentStep - 1]

  // Show loading while checking if user already completed onboarding
  // existingProfile is undefined while loading, null if no profile exists
  if (existingProfile === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

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
    <TypeformLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      canGoNext={true}
      canGoPrevious={currentStep > 1}
    >
      <TypeformTransition transitionKey={currentStep} direction={direction}>
        <CurrentStepComponent
          onNext={handleNext}
          onBack={handleBack}
          onSkip={currentStep === totalSteps ? handleSkip : undefined}
          currentData={answers}
        />
      </TypeformTransition>
    </TypeformLayout>
  )
}
