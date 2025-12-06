import { SignUp as ClerkSignUp } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function SignUp() {
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
              Start managing events today.
            </h2>
            <p className="text-white/70 text-lg">
              Join thousands of organizers who use Open-Event to find sponsors,
              manage vendors, and run seamless events.
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
            <p className="text-white/60 text-sm">
              Join 500+ event organizers
            </p>
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
            <ClerkSignUp
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl w-full',
                  headerTitle: 'font-mono text-2xl font-bold',
                  headerSubtitle: 'text-muted-foreground',
                  formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
                  formFieldInput: 'bg-background border-border',
                  footerActionLink: 'text-primary hover:text-primary/80',
                  dividerLine: 'bg-border',
                  dividerText: 'text-muted-foreground',
                  socialButtonsBlockButton: 'border-border bg-background hover:bg-muted',
                  socialButtonsBlockButtonText: 'text-foreground',
                  formFieldLabel: 'text-foreground',
                  identityPreviewText: 'text-foreground',
                  identityPreviewEditButton: 'text-primary',
                },
              }}
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              fallbackRedirectUrl="/onboarding"
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 lg:px-12 text-center lg:text-left">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-foreground">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
          </p>
        </footer>
      </div>
    </div>
  )
}
