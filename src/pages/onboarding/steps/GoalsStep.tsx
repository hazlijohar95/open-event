import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { OnboardingChat, MultiSelect } from '@/components/onboarding'
import { ArrowRight, ArrowLeft } from '@phosphor-icons/react'
import type { StepProps } from '@/types/onboarding'
import { GOALS } from '@/types/onboarding'

const goalOptions = GOALS.map((goal) => ({
  value: goal.toLowerCase().replace(/\s+/g, '-'),
  label: goal,
}))

export function GoalsStep({ onNext, onBack, currentData }: StepProps) {
  const [selected, setSelected] = useState<string[]>(currentData.goals || [])

  return (
    <div className="space-y-8">
      <OnboardingChat
        message="What are you hoping to achieve with Open-Event?"
        subMessage="Select all that apply"
      />

      <MultiSelect
        options={goalOptions}
        selected={selected}
        onChange={setSelected}
      />

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" size="lg">
          <ArrowLeft size={18} weight="duotone" className="mr-2" />
          Back
        </Button>
        <Button
          onClick={() => onNext({ goals: selected })}
          disabled={selected.length === 0}
          className="flex-1"
          size="lg"
        >
          Continue
          <ArrowRight size={18} weight="duotone" className="ml-2" />
        </Button>
      </div>
    </div>
  )
}
