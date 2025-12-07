import { useState, useCallback } from 'react'
import type { OnboardingState, OnboardingAnswers } from '@/types/onboarding'

/** Total number of onboarding steps */
const TOTAL_STEPS = 7

interface ExtendedOnboardingState extends OnboardingState {
  direction: 'forward' | 'backward'
}

const initialState: ExtendedOnboardingState = {
  currentStep: 1,
  totalSteps: TOTAL_STEPS,
  answers: {},
  isComplete: false,
  direction: 'forward',
}

/**
 * Hook for managing multi-step onboarding flow state.
 * Handles step navigation, answer collection, and completion tracking.
 *
 * @returns Onboarding state and navigation controls
 *
 * @example
 * ```tsx
 * const {
 *   currentStep,
 *   totalSteps,
 *   answers,
 *   isComplete,
 *   nextStep,
 *   prevStep,
 * } = useOnboarding()
 *
 * // Move to next step with data
 * nextStep({ role: 'organizer' })
 *
 * // Go back
 * prevStep()
 * ```
 */
export function useOnboarding() {
  const [state, setState] = useState<ExtendedOnboardingState>(initialState)

  /** Jump to a specific step (clamped to valid range) */
  const goToStep = useCallback((step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(1, Math.min(step, TOTAL_STEPS)),
      direction: step > prev.currentStep ? 'forward' : 'backward',
    }))
  }, [])

  /** Advance to next step, optionally saving answer data */
  const nextStep = useCallback((data?: Partial<OnboardingAnswers>) => {
    setState((prev) => {
      const newAnswers = data ? { ...prev.answers, ...data } : prev.answers
      const nextStepNum = prev.currentStep + 1

      if (nextStepNum > TOTAL_STEPS) {
        return {
          ...prev,
          answers: newAnswers,
          isComplete: true,
          direction: 'forward' as const,
        }
      }

      return {
        ...prev,
        currentStep: nextStepNum,
        answers: newAnswers,
        direction: 'forward' as const,
      }
    })
  }, [])

  /** Go back to previous step */
  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1),
      direction: 'backward' as const,
    }))
  }, [])

  /** Skip remaining steps and mark as complete */
  const skipOnboarding = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isComplete: true,
    }))
  }, [])

  /** Update answers without changing step */
  const updateAnswers = useCallback((data: Partial<OnboardingAnswers>) => {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, ...data },
    }))
  }, [])

  /** Reset to initial state */
  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  return {
    ...state,
    goToStep,
    nextStep,
    prevStep,
    skipOnboarding,
    updateAnswers,
    reset,
  }
}
