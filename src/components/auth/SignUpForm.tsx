import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from './PasswordInput'
import { SocialAuthButtons } from './SocialAuthButtons'
import { Separator } from '@/components/ui/separator'
import { UserPlus } from '@phosphor-icons/react'
import { isValidEmail, validatePasswordStrength } from '@/lib/validation'

interface SignUpFormProps {
  onSubmit?: (data: { name: string; email: string; password: string }) => void
  onGoogleSignUp?: () => void
  isLoading?: boolean
}

export function SignUpForm({ onSubmit, onGoogleSignUp, isLoading }: SignUpFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({})

  const validate = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else {
      const passwordValidation = validatePasswordStrength(password)
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0]
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit?.({ name, email, password })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={errors.name ? 'border-destructive' : ''}
            disabled={isLoading}
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            aria-required
          />
          {errors.name && (
            <p id="name-error" role="alert" className="text-sm text-destructive">
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? 'border-destructive' : ''}
            disabled={isLoading}
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'signup-email-error' : undefined}
            aria-required
          />
          {errors.email && (
            <p id="signup-email-error" role="alert" className="text-sm text-destructive">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <PasswordInput
            id="signup-password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={isLoading}
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'signup-password-error' : 'password-requirements'}
            aria-required
          />
          {errors.password && (
            <p id="signup-password-error" role="alert" className="text-sm text-destructive">
              {errors.password}
            </p>
          )}
          <p id="password-requirements" className="text-xs text-muted-foreground">
            Min 12 characters with uppercase, lowercase, number, and special character
          </p>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        Create Account
        <UserPlus size={18} weight="duotone" className="ml-2" />
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <SocialAuthButtons onGoogleClick={onGoogleSignUp} isLoading={isLoading} />
    </form>
  )
}
