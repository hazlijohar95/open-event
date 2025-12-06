import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { OnboardingChat, OptionCard } from '@/components/onboarding'
import {
  CalendarBlank,
  Handshake,
  Truck,
  Compass,
  ArrowRight,
} from '@phosphor-icons/react'
import type { StepProps, UserRole } from '@/types/onboarding'

const roles: { value: UserRole; label: string; description: string; icon: typeof CalendarBlank }[] = [
  {
    value: 'organizer',
    label: 'Event Organizer',
    description: 'I plan and run events',
    icon: CalendarBlank,
  },
  {
    value: 'sponsor',
    label: 'Sponsor',
    description: 'I sponsor events for brand visibility',
    icon: Handshake,
  },
  {
    value: 'vendor',
    label: 'Vendor',
    description: 'I provide services to events',
    icon: Truck,
  },
  {
    value: 'exploring',
    label: 'Just exploring',
    description: "I'm checking out the platform",
    icon: Compass,
  },
]

export function RoleStep({ onNext, currentData }: StepProps) {
  const [selected, setSelected] = useState<UserRole | undefined>(currentData.role)

  return (
    <div className="space-y-8">
      <OnboardingChat
        message="Let's personalize your experience!"
        subMessage="First, tell me about your role:"
      />

      <div className="space-y-3">
        {roles.map((role, index) => (
          <OptionCard
            key={role.value}
            label={role.label}
            description={role.description}
            icon={role.icon}
            isSelected={selected === role.value}
            onClick={() => setSelected(role.value)}
            delay={index * 100}
          />
        ))}
      </div>

      <Button
        onClick={() => onNext({ role: selected })}
        disabled={!selected}
        className="w-full"
        size="lg"
      >
        Continue
        <ArrowRight size={18} weight="duotone" className="ml-2" />
      </Button>
    </div>
  )
}
