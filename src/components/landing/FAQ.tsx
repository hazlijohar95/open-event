import { useState } from 'react'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'
import { CaretDown } from '@phosphor-icons/react'

const faqs = [
  {
    question: 'Is Open-Event really free?',
    answer: 'The core platform is open-source and free to self-host. We also offer managed hosting plans with premium features like advanced analytics, priority support, and custom integrations.',
  },
  {
    question: 'How do sponsors measure ROI?',
    answer: 'Sponsors can track booth visits via QR codes, lead captures, brand impressions, and post-event surveys. All metrics are compiled into automated ROI reports that sponsors can share with their teams.',
  },
  {
    question: 'What vendor categories are supported?',
    answer: 'We support all major event vendor categories: Catering & F&B, AV & Tech, Venues, Printing & Signage, Merchandise & Swag, Photography & Video, Security, Transportation, and more. Custom categories can be added.',
  },
  {
    question: 'Can I import my existing vendor list?',
    answer: 'Yes! You can import vendors via CSV or sync through our API. We also offer migration assistance for teams moving from spreadsheets or other platforms.',
  },
  {
    question: 'How does AI matching work?',
    answer: 'Our AI analyzes event requirements (type, audience, budget, location) against sponsor/vendor profiles (industry, past performance, pricing, availability) to suggest best-fit partners with a match score and reasoning.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. Open-Event is open-source so you can audit the code. For managed hosting, we use encrypted connections, regular backups, and follow industry best practices. Self-hosting gives you complete data control.',
  },
]

export function FAQ() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section className="py-24 sm:py-32 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div
          ref={ref}
          className={cn(
            'text-center mb-12 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <h2 className="font-mono text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Questions?
          </h2>
          <p className="text-lg text-muted-foreground mt-4">
            Common questions about Open-Event.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} {...faq} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQItem({
  question,
  answer,
  index,
}: {
  question: string
  answer: string
  index: number
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div
      ref={ref}
      className={cn(
        'border border-border rounded-xl overflow-hidden bg-card',
        'transition-all duration-500',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors cursor-pointer"
      >
        <span className="font-medium text-sm sm:text-base pr-4">{question}</span>
        <CaretDown
          size={20}
          weight="bold"
          className={cn(
            'text-muted-foreground shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="p-5 pt-0 text-sm text-muted-foreground leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  )
}
