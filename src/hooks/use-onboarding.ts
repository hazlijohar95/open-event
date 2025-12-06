import { useState, useCallback } from 'react'
import type { OnboardingState, OnboardingAnswers } from '@/types/onboarding'

const TOTAL_STEPS = 7

const initialState: OnboardingState = {
  currentStep: 1,
  totalSteps: TOTAL_STEPS,
  answers: {},
  isComplete: false,
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(initialState)

  const goToStep = useCallback((step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(1, Math.min(step, TOTAL_STEPS)),
    }))
  }, [])

  const nextStep = useCallback((data?: Partial<OnboardingAnswers>) => {
    setState((prev) => {
      const newAnswers = data ? { ...prev.answers, ...data } : prev.answers
      const nextStepNum = prev.currentStep + 1

      if (nextStepNum > TOTAL_STEPS) {
        return {
          ...prev,
          answers: newAnswers,
          isComplete: true,
        }
      }

      return {
        ...prev,
        currentStep: nextStepNum,
        answers: newAnswers,
      }
    })
  }, [])

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1),
    }))
  }, [])

  const skipOnboarding = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isComplete: true,
    }))
  }, [])

  const updateAnswers = useCallback((data: Partial<OnboardingAnswers>) => {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, ...data },
    }))
  }, [])

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
