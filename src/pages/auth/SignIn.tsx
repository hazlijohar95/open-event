import { useAuthActions } from '@convex-dev/auth/react'
import { useConvexAuth } from 'convex/react'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Envelope, Lock, GoogleLogo, MagicWand, CircleNotch } from '@phosphor-icons/react'

type AuthFlow = 'password' | 'magicLink'

export function SignIn() {
  const { signIn } = useAuthActions()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const navigate = useNavigate()
  const [flow, setFlow] = useState<AuthFlow>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  // Redirect if already authenticated (e.g., after OAuth callback)
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter email and password')
      return
    }
    setLoading(true)
    try {
      await signIn('password', { email, password, flow: 'signIn' })
      navigate('/dashboard')
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }
    setLoading(true)
    try {
      await signIn('resend', { email })
      setMagicLinkSent(true)
      toast.success('Check your email for the magic link!')
    } catch {
      toast.error('Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn('google', { redirectTo: '/dashboard' })
    } catch {
      toast.error('Failed to sign in with Google')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Image Background (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        {/* Background Image */}
        <img
          src="/auth-bg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60" />

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link
            to="/"
            className="font-mono text-2xl font-bold text-white hover:opacity-80 transition-opacity"
          >
            open-event
          </Link>

          {/* Tagline */}
          <div className="max-w-md">
            <h2 className="font-mono text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Welcome back.
            </h2>
            <p className="text-white/70 text-lg">
              Sign in to manage your events, connect with partners, and
              streamline your operations.
            </p>
          </div>

          {/* Bottom decoration */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 backdrop-blur-sm"
                />
              ))}
            </div>
            <p className="text-white/60 text-sm">Join 500+ event organizers</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col bg-background relative">
        {/* Mobile Background Image */}
        <div className="lg:hidden absolute inset-0 -z-10">
          <img
            src="/auth-bg.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-10"
          />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        </div>

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 lg:px-12">
          <Link
            to="/"
            className="font-mono text-lg font-semibold hover:opacity-80 transition-opacity lg:opacity-0 lg:pointer-events-none"
          >
            open-event
          </Link>
          <ThemeToggle />
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h1 className="font-mono text-2xl font-bold mb-2">Sign In</h1>
                <p className="text-muted-foreground">
                  Welcome back! Please sign in to continue.
                </p>
              </div>

              {/* Google OAuth Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 border border-border bg-background hover:bg-muted rounded-lg py-3 px-4 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
              >
                <GoogleLogo size={20} weight="bold" />
                Continue with Google
              </button>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Toggle between password and magic link */}
              <div className="flex rounded-lg border border-border p-1 mb-6">
                <button
                  onClick={() => setFlow('password')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    flow === 'password'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Lock size={16} weight="duotone" />
                  Password
                </button>
                <button
                  onClick={() => {
                    setFlow('magicLink')
                    setMagicLinkSent(false)
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    flow === 'magicLink'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <MagicWand size={16} weight="duotone" />
                  Magic Link
                </button>
              </div>

              {flow === 'password' ? (
                <form onSubmit={handlePasswordSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Envelope
                        size={18}
                        weight="duotone"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock
                        size={18}
                        weight="duotone"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <CircleNotch
                          size={18}
                          weight="bold"
                          className="animate-spin"
                        />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>
              ) : magicLinkSent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Envelope
                      size={32}
                      weight="duotone"
                      className="text-primary"
                    />
                  </div>
                  <h3 className="font-semibold mb-2">Check your email</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    We sent a magic link to <strong>{email}</strong>
                  </p>
                  <button
                    onClick={() => setMagicLinkSent(false)}
                    className="text-primary text-sm hover:underline"
                  >
                    Use a different email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email">Email</Label>
                    <div className="relative">
                      <Envelope
                        size={18}
                        weight="duotone"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        id="magic-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <CircleNotch
                          size={18}
                          weight="bold"
                          className="animate-spin"
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        <MagicWand size={18} weight="duotone" />
                        Send Magic Link
                      </>
                    )}
                  </button>
                </form>
              )}

              <p className="text-center text-sm text-muted-foreground mt-6">
                Don't have an account?{' '}
                <Link
                  to="/sign-up"
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 lg:px-12 text-center lg:text-left">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </footer>
      </div>
    </div>
  )
}
