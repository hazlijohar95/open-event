import { useNavigate } from 'react-router-dom'
import { AuthLayout } from './AuthLayout'
import { SignInForm } from '@/components/auth'

export function SignIn() {
  const navigate = useNavigate()

  const handleSubmit = (data: { email: string; password: string }) => {
    // TODO: Backend engineer will implement actual auth logic
    console.log('Sign in:', data)
    // For now, navigate to onboarding after "sign in"
    navigate('/onboarding')
  }

  const handleGoogleSignIn = () => {
    // TODO: Backend engineer will implement Google OAuth
    console.log('Google sign in')
    navigate('/onboarding')
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account"
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkTo="/sign-up"
    >
      <SignInForm
        onSubmit={handleSubmit}
        onGoogleSignIn={handleGoogleSignIn}
      />
    </AuthLayout>
  )
}
