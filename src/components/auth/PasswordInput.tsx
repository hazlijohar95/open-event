import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Eye, EyeSlash } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function PasswordInput({ className, error, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        className={cn(
          'pr-10',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? (
          <EyeSlash size={18} weight="duotone" />
        ) : (
          <Eye size={18} weight="duotone" />
        )}
      </button>
    </div>
  )
}
