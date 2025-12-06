import { useNavigate } from 'react-router-dom'
import { AuthLayout } from './AuthLayout'
import { SignUpForm } from '@/components/auth'

export function SignUp() {
  const navigate = useNavigate()

  const handleSubmit = (data: { name: string; email: string; password: string }) => {
    // TODO: Backend engineer will implement actual auth logic
    console.log('Sign up:', data)
    // After sign up, navigate to onboarding
    navigate('/onboarding')
  }

  const handleGoogleSignUp = () => {
    // TODO: Backend engineer will implement Google OAuth
    console.log('Google sign up')
    navigate('/onboarding')
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start managing events today"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkTo="/sign-in"
    >
      <SignUpForm
        onSubmit={handleSubmit}
        onGoogleSignUp={handleGoogleSignUp}
      />
    </AuthLayout>
  )
}
