import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/logo'
import {
  GithubLogo,
  ChatCircle,
  XLogo,
  EnvelopeSimple,
} from '@phosphor-icons/react'

const socialLinks = [
  { icon: GithubLogo, label: 'GitHub', href: 'https://github.com/hazlijohar95/open-event' },
  { icon: XLogo, label: 'Twitter', href: '#' },
  { icon: ChatCircle, label: 'Discord', href: '#' },
]

const productLinks = [
  { label: 'Features', href: '#' },
  { label: 'Pricing', href: '#' },
  { label: 'Documentation', href: '#' },
  { label: 'API Reference', href: '#' },
  { label: 'Changelog', href: '#' },
]

const companyLinks = [
  { label: 'About', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'Careers', href: '#' },
  { label: 'Contact', href: '#' },
]

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Cookie Policy', href: '#' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-2">
            <Logo size="lg" showTagline className="mb-4" />
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              The open-source event operations platform. Connect with sponsors,
              manage vendors, and run seamless events.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  aria-label={label}
                >
                  <Icon size={18} weight="duotone" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-mono font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-3">
              {productLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-mono font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-mono font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map(({ label, href }) => (
                <li key={label}>
                  {href.startsWith('/') ? (
                    <Link
                      to={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {label}
                    </Link>
                  ) : (
                    <a
                      href={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} Open Event. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Open Source</span>
              <span className="text-border">|</span>
              <span>MIT License</span>
              <span className="text-border">|</span>
              <span>Built with love</span>
            </div>
          </div>
        </div>

        {/* Newsletter (Optional) */}
        <div className="mt-8 p-6 rounded-xl bg-card border border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-mono font-semibold mb-1">Stay updated</h4>
              <p className="text-sm text-muted-foreground">
                Get notified about new features and updates.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <EnvelopeSimple
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
