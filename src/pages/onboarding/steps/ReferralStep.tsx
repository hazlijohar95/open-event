import { useState } from 'react'
import { TypeformQuestion, TypeformNavigation } from '@/components/typeform'
import { OptionCard } from '@/components/onboarding'
import {
  MagnifyingGlass,
  ChatCircle,
  UserCircle,
  Microphone,
  GithubLogo,
  DotsThree,
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
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <TypeformQuestion
        stepNumber={7}
        question="One last thing — how did you discover Open Event?"
        description="This is optional, but helps us a lot!"
      />

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {sources.map((source, index) => (
          <OptionCard
            key={source.value}
            label={source.label}
            icon={source.icon}
            isSelected={selected === source.value}
            onClick={() => setSelected(source.value)}
            delay={index * 50}
            compact
          />
        ))}
      </div>

      <div className="space-y-3 sm:space-y-4">
        <TypeformNavigation
          onPrevious={onBack}
          onNext={() => onNext({ referralSource: selected })}
          isLastStep
          showKeyboardHint={false}
        />

        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="w-full text-xs sm:text-sm text-muted-foreground/70 hover:text-foreground transition-colors py-2"
          >
            Skip onboarding entirely
          </button>
        )}
      </div>
    </div>
  )
}
