import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { OnboardingChat, OptionCard } from '@/components/onboarding'
import {
  Baby,
  Leaf,
  Tree,
  Mountains,
  ArrowRight,
  ArrowLeft,
} from '@phosphor-icons/react'
import type { StepProps, ExperienceLevel } from '@/types/onboarding'

const levels: { value: ExperienceLevel; label: string; description: string; icon: typeof Baby }[] = [
  {
    value: 'first-time',
    label: 'First-time organizer',
    description: 'Planning my first event',
    icon: Baby,
  },
  {
    value: '1-5',
    label: '1-5 events',
    description: 'Getting the hang of it',
    icon: Leaf,
  },
  {
    value: '5-20',
    label: '5-20 events',
    description: 'Experienced organizer',
    icon: Tree,
  },
  {
    value: '20+',
    label: '20+ events',
    description: 'Seasoned veteran',
    icon: Mountains,
  },
]

export function ExperienceStep({ onNext, onBack, currentData }: StepProps) {
  const [selected, setSelected] = useState<ExperienceLevel | undefined>(
    currentData.experienceLevel
  )

  return (
    <div className="space-y-8">
      <OnboardingChat
        message="How experienced are you with event management?"
        subMessage="This helps us customize your dashboard"
      />

      <div className="space-y-3">
        {levels.map((level, index) => (
          <OptionCard
            key={level.value}
            label={level.label}
            description={level.description}
            icon={level.icon}
            isSelected={selected === level.value}
            onClick={() => setSelected(level.value)}
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
          onClick={() => onNext({ experienceLevel: selected })}
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
