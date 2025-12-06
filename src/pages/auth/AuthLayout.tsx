import { Link } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  footerText: string
  footerLinkText: string
  footerLinkTo: string
}

export function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkTo,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <Link to="/" className="font-mono text-lg font-semibold hover:opacity-80 transition-opacity">
          open-event
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Title Section */}
          <div className="text-center space-y-2">
            <h1 className="font-mono text-3xl sm:text-4xl font-bold tracking-tight">
              {title}
            </h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>

          {/* Form Card */}
          <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
            {children}
          </div>

          {/* Footer Link */}
          <p className="text-center text-sm text-muted-foreground">
            {footerText}{' '}
            <Link
              to={footerLinkTo}
              className="text-primary hover:underline font-medium"
            >
              {footerLinkText}
            </Link>
          </p>
        </div>
      </main>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
