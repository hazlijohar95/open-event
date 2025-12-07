import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConvexAuth, useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { TypeformLayout, TypeformTransition } from '@/components/typeform'
import { useOnboarding } from '@/hooks/use-onboarding'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
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
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth()
  const saveProfile = useMutation(api.organizerProfiles.saveProfile)
  
  // Only query profile if authenticated
  const existingProfile = useQuery(
    api.organizerProfiles.getMyProfile,
    isAuthenticated ? {} : 'skip'
  )
  
  const hasSavedRef = useRef(false)

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

  // Redirect unauthenticated users to sign-in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/sign-in', { replace: true })
    }
  }, [authLoading, isAuthenticated, navigate])

  // Redirect users who already have a profile to dashboard
  useEffect(() => {
    if (existingProfile) {
      navigate('/dashboard', { replace: true })
    }
  }, [existingProfile, navigate])

  // Save onboarding data and navigate to completion when done
  useEffect(() => {
    if (isComplete && !hasSavedRef.current && isAuthenticated) {
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
  }, [isComplete, answers, saveProfile, navigate, isAuthenticated])

  const CurrentStepComponent = steps[currentStep - 1]

  // Show loading while checking auth state
  if (authLoading) {
    return <LoadingSpinner message="Loading..." fullScreen />
  }

  // Not authenticated - will redirect
  if (!isAuthenticated) {
    return <LoadingSpinner message="Redirecting..." fullScreen />
  }

  // Show loading while checking if user already completed onboarding
  if (existingProfile === undefined) {
    return <LoadingSpinner message="Setting up..." fullScreen />
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
