import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ArrowLeft } from '@phosphor-icons/react'

export function TermsOfService() {
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
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Last updated: December 6, 2024
          </p>

          <section className="space-y-6">
            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Open Event ("the Service"), you agree to be bound by these
                Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Open Event is an open-source event operations platform that connects event organizers
                with sponsors and vendors. We provide tools for event management, partner discovery,
                and logistics coordination.
              </p>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To use certain features of the Service, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">4. User Conduct</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the rights of others</li>
                <li>Post false, misleading, or fraudulent content</li>
                <li>Interfere with the proper functioning of the Service</li>
                <li>Attempt to gain unauthorized access to any systems</li>
                <li>Use the Service for any illegal or unauthorized purpose</li>
              </ul>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">5. Content and Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                You retain ownership of content you submit to the Service. By submitting content,
                you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce,
                and display such content in connection with the Service. The Open Event platform,
                including its source code, is licensed under open-source terms as specified in our
                GitHub repository.
              </p>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">6. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service may contain links to or integrations with third-party services. We are
                not responsible for the content, privacy policies, or practices of third-party
                services. Your use of such services is at your own risk.
              </p>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">7. Payment Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you purchase premium features or services, you agree to pay all applicable fees.
                Fees are non-refundable except as required by law or as explicitly stated in our
                refund policy. We reserve the right to change pricing with reasonable notice.
              </p>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">8. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
                WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
                YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK.
              </p>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF
                THE SERVICE, REGARDLESS OF THE THEORY OF LIABILITY.
              </p>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">10. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify and hold harmless Open Event and its affiliates from any
                claims, damages, or expenses arising from your use of the Service or violation
                of these Terms.
              </p>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">11. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your access to the Service at any time, with or without
                cause, with or without notice. Upon termination, your right to use the Service will
                immediately cease.
              </p>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">12. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of
                material changes by posting the updated Terms on this page. Your continued use
                of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">13. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the
                jurisdiction in which Open Event operates, without regard to its conflict of law
                provisions.
              </p>
            </div>

            <div>
              <h2 className="font-mono text-xl font-semibold mt-8 mb-4">14. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us at{' '}
                <a href="mailto:legal@open-event.io" className="text-primary hover:underline">
                  legal@open-event.io
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
