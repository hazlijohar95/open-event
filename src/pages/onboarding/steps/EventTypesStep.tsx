import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { OnboardingChat, MultiSelect } from '@/components/onboarding'
import { ArrowRight, ArrowLeft } from '@phosphor-icons/react'
import type { StepProps } from '@/types/onboarding'
import { EVENT_TYPES } from '@/types/onboarding'

const eventTypeOptions = EVENT_TYPES.map((type) => ({
  value: type.toLowerCase().replace(/[^a-z]/g, '-'),
  label: type,
}))

export function EventTypesStep({ onNext, onBack, currentData }: StepProps) {
  const [selected, setSelected] = useState<string[]>(currentData.eventTypes || [])

  return (
    <div className="space-y-8">
      <OnboardingChat
        message="What type of events do you typically organize?"
        subMessage="Select all that apply"
      />

      <MultiSelect
        options={eventTypeOptions}
        selected={selected}
        onChange={setSelected}
      />

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" size="lg">
          <ArrowLeft size={18} weight="duotone" className="mr-2" />
          Back
        </Button>
        <Button
          onClick={() => onNext({ eventTypes: selected })}
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
