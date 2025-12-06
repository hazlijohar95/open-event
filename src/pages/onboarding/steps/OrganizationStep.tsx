import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OnboardingChat, OptionCard } from '@/components/onboarding'
import {
  Buildings,
  Heart,
  Bank,
  Users,
  ArrowRight,
  ArrowLeft,
} from '@phosphor-icons/react'
import type { StepProps, OrganizationType } from '@/types/onboarding'

const orgTypes: { value: OrganizationType; label: string; icon: typeof Buildings }[] = [
  { value: 'company', label: 'Company', icon: Buildings },
  { value: 'nonprofit', label: 'Non-profit', icon: Heart },
  { value: 'government', label: 'Government', icon: Bank },
  { value: 'community', label: 'Community / Indie', icon: Users },
]

export function OrganizationStep({ onNext, onBack, currentData }: StepProps) {
  const [name, setName] = useState(currentData.organizationName || '')
  const [type, setType] = useState<OrganizationType | undefined>(currentData.organizationType)

  const canContinue = name.trim().length > 0 && type

  return (
    <div className="space-y-8">
      <OnboardingChat
        message="Great! Tell me about your organization."
        subMessage="This helps us tailor the experience for you."
      />

      <div className="space-y-6">
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Label htmlFor="org-name">Organization Name</Label>
          <Input
            id="org-name"
            placeholder="Acme Inc."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-base"
          />
        </div>

        <div className="space-y-3">
          <Label>Organization Type</Label>
          <div className="grid grid-cols-2 gap-3">
            {orgTypes.map((org, index) => (
              <OptionCard
                key={org.value}
                label={org.label}
                icon={org.icon}
                isSelected={type === org.value}
                onClick={() => setType(org.value)}
                delay={(index + 1) * 100}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" size="lg">
          <ArrowLeft size={18} weight="duotone" className="mr-2" />
          Back
        </Button>
        <Button
          onClick={() => onNext({ organizationName: name, organizationType: type })}
          disabled={!canContinue}
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
