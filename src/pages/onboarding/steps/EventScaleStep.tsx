import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { OnboardingChat, OptionCard } from '@/components/onboarding'
import {
  UsersThree,
  UsersFour,
  Users,
  Buildings,
  ArrowRight,
  ArrowLeft,
} from '@phosphor-icons/react'
import type { StepProps, EventScale } from '@/types/onboarding'

const scales: { value: EventScale; label: string; description: string; icon: typeof UsersThree }[] = [
  {
    value: 'small',
    label: 'Small',
    description: 'Less than 100 attendees',
    icon: UsersThree,
  },
  {
    value: 'medium',
    label: 'Medium',
    description: '100-500 attendees',
    icon: UsersFour,
  },
  {
    value: 'large',
    label: 'Large',
    description: '500-2,000 attendees',
    icon: Users,
  },
  {
    value: 'enterprise',
    label: 'Enterprise',
    description: '2,000+ attendees',
    icon: Buildings,
  },
]

export function EventScaleStep({ onNext, onBack, currentData }: StepProps) {
  const [selected, setSelected] = useState<EventScale | undefined>(currentData.eventScale)

  return (
    <div className="space-y-8">
      <OnboardingChat
        message="How big are your typical events?"
        subMessage="This helps us suggest the right features"
      />

      <div className="space-y-3">
        {scales.map((scale, index) => (
          <OptionCard
            key={scale.value}
            label={scale.label}
            description={scale.description}
            icon={scale.icon}
            isSelected={selected === scale.value}
            onClick={() => setSelected(scale.value)}
            delay={index * 100}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" size="lg">
          <ArrowLeft size={18} weight="duotone" className="mr-2" />
          Back
        </Button>
        <Button
          onClick={() => onNext({ eventScale: selected })}
          disabled={!selected}
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
