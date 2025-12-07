import { useAuthActions } from '@convex-dev/auth/react'
import { useConvexAuth } from 'convex/react'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Logo } from '@/components/ui/logo'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Envelope,
  Lock,
  GoogleLogo,
  MagicWand,
  CircleNotch,
  ArrowRight,
  Calendar,
  Sparkle,
  Users,
  CheckCircle,
} from '@phosphor-icons/react'

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
  const [redirecting, setRedirecting] = useState(false)

  // Redirect if already authenticated (e.g., after OAuth callback)
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setRedirecting(true)
      navigate('/auth/redirect', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  // Show loading screen while checking auth or redirecting
  if (isLoading || redirecting) {
    return (
      <LoadingSpinner
        message={redirecting ? 'Signing you in...' : 'Loading...'}
        fullScreen
      />
    )
  }

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter email and password')
      return
    }
    setLoading(true)
    try {
      await signIn('password', { email, password, flow: 'signIn' })
      navigate('/auth/redirect')
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
      await signIn('google', { redirectTo: '/auth/redirect' })
    } catch {
      toast.error('Failed to sign in with Google')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-slate-50 dark:bg-slate-950/50">
        {/* Gradient background matching landing page */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-background to-slate-50 dark:from-slate-900 dark:via-background dark:to-slate-950" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-indigo-100/60 to-transparent dark:from-indigo-900/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-violet-100/40 to-transparent dark:from-violet-900/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-gradient-to-r from-amber-100/30 to-transparent dark:from-amber-900/10 rounded-full blur-3xl" />
        </div>

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <Logo />
          </Link>

          {/* Main content */}
          <div className="max-w-lg">
            <h2 className="text-4xl xl:text-5xl font-semibold tracking-tight leading-[1.1] mb-6">
              Welcome back to
              <br />
              <span className="relative inline-block mt-1">
                <span className="bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 dark:from-slate-200 dark:via-slate-400 dark:to-slate-200 bg-clip-text text-transparent">
                  open-event.
                </span>
                <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 200 10" preserveAspectRatio="none">
                  <path d="M0 8 Q50 0 100 8 T200 8" stroke="url(#signin-underline)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="signin-underline" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Sign in to manage your events, connect with partners, and streamline your operations.
            </p>

            {/* Feature highlights */}
            <div className="mt-10 space-y-4">
              {[
                { icon: Calendar, text: 'Manage unlimited events' },
                { icon: Users, text: 'Connect with vendors & sponsors' },
                { icon: Sparkle, text: 'AI-powered planning assistance' },
              ].map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.text} className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center">
                      <Icon size={16} weight="duotone" className="text-indigo-500" />
                    </div>
                    <span className="text-sm">{feature.text}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom social proof */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[
                'bg-gradient-to-br from-indigo-400 to-violet-500',
                'bg-gradient-to-br from-emerald-400 to-green-500',
                'bg-gradient-to-br from-amber-400 to-orange-500',
                'bg-gradient-to-br from-rose-400 to-pink-500',
              ].map((bg, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full ${bg} border-2 border-background shadow-sm flex items-center justify-center text-white text-xs font-medium`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Join <span className="font-medium text-foreground">500+</span> event organizers
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col bg-background relative">
        {/* Mobile gradient background */}
        <div className="lg:hidden absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-background to-background dark:from-slate-950/50 dark:via-background" />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-indigo-100/40 to-transparent dark:from-indigo-900/20 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 lg:px-12 safe-area-top">
          <Link to="/" className="lg:opacity-0 lg:pointer-events-none hover:opacity-80 transition-opacity">
            <Logo />
          </Link>
          <ThemeToggle />
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-8 lg:px-12">
          <div className="w-full max-w-md">
            {/* Card with glass effect */}
            <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl p-6 sm:p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold tracking-tight mb-2">Sign In</h1>
                <p className="text-muted-foreground text-sm">
                  Welcome back! Please sign in to continue.
                </p>
              </div>

              {/* Google OAuth Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 border border-border bg-background hover:bg-muted rounded-xl py-3 px-4 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6 group"
              >
                <GoogleLogo size={20} weight="bold" className="text-foreground" />
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Toggle between password and magic link */}
              <div className="flex rounded-xl border border-border bg-muted/30 p-1 mb-6">
                <button
                  onClick={() => setFlow('password')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    flow === 'password'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Lock size={16} weight={flow === 'password' ? 'duotone' : 'regular'} />
                  Password
                </button>
                <button
                  onClick={() => {
                    setFlow('magicLink')
                    setMagicLinkSent(false)
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    flow === 'magicLink'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <MagicWand size={16} weight={flow === 'magicLink' ? 'duotone' : 'regular'} />
                  Magic Link
                </button>
              </div>

              {flow === 'password' ? (
                <form onSubmit={handlePasswordSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <div className="relative">
                      <Envelope
                        size={18}
                        weight="duotone"
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-12 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Lock
                        size={18}
                        weight="duotone"
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 h-12 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-foreground hover:bg-foreground/90 text-background py-3.5 px-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl group"
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
                      <>
                        Sign In
                        <ArrowRight size={18} weight="bold" className="transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>
              ) : magicLinkSent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/50 dark:to-violet-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Envelope
                      size={32}
                      weight="duotone"
                      className="text-indigo-500"
                    />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Check your email</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    We sent a magic link to <strong className="text-foreground">{email}</strong>
                  </p>
                  <button
                    onClick={() => setMagicLinkSent(false)}
                    className="text-indigo-500 text-sm hover:underline font-medium"
                  >
                    Use a different email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email" className="text-sm font-medium">Email</Label>
                    <div className="relative">
                      <Envelope
                        size={18}
                        weight="duotone"
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        id="magic-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-12 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-foreground hover:bg-foreground/90 text-background py-3.5 px-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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
                  className="text-foreground hover:text-indigo-500 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle size={14} weight="fill" className="text-emerald-500" />
                Secure login
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle size={14} weight="fill" className="text-emerald-500" />
                No credit card
              </span>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 lg:px-12 text-center safe-area-bottom">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-foreground transition-colors">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </p>
        </footer>
      </div>
    </div>
  )
}
