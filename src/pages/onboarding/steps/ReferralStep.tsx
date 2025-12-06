import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { OnboardingChat, OptionCard } from '@/components/onboarding'
import {
  MagnifyingGlass,
  ChatCircle,
  UserCircle,
  Microphone,
  GithubLogo,
  DotsThree,
  ArrowRight,
  ArrowLeft,
} from '@phosphor-icons/react'
import type { StepProps } from '@/types/onboarding'

const sources = [
  { value: 'search', label: 'Search engine', icon: MagnifyingGlass },
  { value: 'social', label: 'Social media', icon: ChatCircle },
  { value: 'friend', label: 'Friend / Colleague', icon: UserCircle },
  { value: 'event', label: 'Conference / Event', icon: Microphone },
  { value: 'github', label: 'GitHub', icon: GithubLogo },
  { value: 'other', label: 'Other', icon: DotsThree },
]

export function ReferralStep({ onNext, onBack, onSkip, currentData }: StepProps) {
  const [selected, setSelected] = useState<string | undefined>(currentData.referralSource)

  return (
    <div className="space-y-8">
      <OnboardingChat
        message="One last thing - how did you discover Open-Event?"
        subMessage="This is optional, but helps us a lot!"
      />

      <div className="grid grid-cols-2 gap-3">
        {sources.map((source, index) => (
          <OptionCard
            key={source.value}
            label={source.label}
            icon={source.icon}
            isSelected={selected === source.value}
            onClick={() => setSelected(source.value)}
            delay={index * 75}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" size="lg">
          <ArrowLeft size={18} weight="duotone" className="mr-2" />
          Back
        </Button>
        <Button
          onClick={() => onNext({ referralSource: selected })}
          className="flex-1"
          size="lg"
        >
          {selected ? 'Finish' : 'Skip & Finish'}
          <ArrowRight size={18} weight="duotone" className="ml-2" />
        </Button>
      </div>

      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip onboarding entirely
        </button>
      )}
    </div>
  )
}
