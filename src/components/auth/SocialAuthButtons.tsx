import { Button } from '@/components/ui/button'
import { GoogleLogo, GithubLogo } from '@phosphor-icons/react'

interface SocialAuthButtonsProps {
  onGoogleClick?: () => void
  onGithubClick?: () => void
  isLoading?: boolean
}

export function SocialAuthButtons({
  onGoogleClick,
  onGithubClick,
  isLoading,
}: SocialAuthButtonsProps) {
  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onGoogleClick}
        disabled={isLoading}
      >
        <GoogleLogo size={18} weight="duotone" className="mr-2" />
        Continue with Google
      </Button>
      {onGithubClick && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onGithubClick}
          disabled={isLoading}
        >
          <GithubLogo size={18} weight="duotone" className="mr-2" />
          Continue with GitHub
        </Button>
      )}
    </div>
  )
}
