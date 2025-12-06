import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ArrowLeft } from '@phosphor-icons/react'

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-12 max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="font-mono text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Last updated: December 6, 2024
          </p>

          <section className="space-y-6">
            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Open Event ("we," "our," or "us"). We respect your privacy and are committed
                to protecting your personal data. This privacy policy explains how we collect, use,
                and safeguard your information when you use our platform.
              </p>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Account information (name, email, profile picture)</li>
                <li>Organization details for event organizers</li>
                <li>Event data you create or manage</li>
                <li>Communications with sponsors and vendors</li>
                <li>Usage data and analytics</li>
              </ul>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use your information to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Connect event organizers with sponsors and vendors</li>
                <li>Send technical notices, updates, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Monitor and analyze trends, usage, and activities</li>
              </ul>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">4. Information Sharing</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell your personal information. We may share your information with third
                parties only in the following circumstances: with your consent, to comply with laws,
                to protect rights and safety, with service providers who assist our operations, or
                in connection with a business transfer.
              </p>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">5. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational measures to protect your
                personal data against unauthorized access, alteration, disclosure, or destruction.
                However, no method of transmission over the Internet is 100% secure.
              </p>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Depending on your location, you may have the right to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">7. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to collect and track information
                about your activity on our platform. You can control cookies through your browser
                settings and other tools.
              </p>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">8. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not directed to children under 13. We do not knowingly collect
                personal information from children under 13. If you believe we have collected
                information from a child, please contact us.
              </p>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">9. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any
                changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">10. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@open-event.io" className="text-primary hover:underline">
                  privacy@open-event.io
                </a>
              </p>
            </div>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="px-6 py-8 max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Open Event. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
