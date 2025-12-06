import { useState } from 'react'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'
import { CaretDown } from '@phosphor-icons/react'

const faqs = [
  {
    question: 'is this thing really free?',
    answer: 'yep. the core platform is open-source and free forever. self-host it, fork it, do whatever you want with it. we also have managed hosting if you\'d rather not deal with servers (we get it).',
  },
  {
    question: 'help, i need to talk to a human!',
    answer: 'send us an email at hello@open-event.io. we actually read those. wild, we know.',
  },
  {
    question: 'how do sponsors know their money isn\'t going into a black hole?',
    answer: 'real metrics, not vanity numbers. booth scans, lead captures, actual engagement data. we compile it into reports that don\'t require a PhD to understand. your CFO will thank you.',
  },
  {
    question: 'can i import my 47-tab vendor spreadsheet?',
    answer: 'we\'ve seen worse. CSV import, API sync, or just paste it in. we\'ll figure it out. no judgment on your spreadsheet organization skills (okay, maybe a little).',
  },
  {
    question: 'how does the AI matching actually work?',
    answer: 'it looks at your event requirements and vendor profiles, does some math that would make your head spin, and suggests partners that actually make sense. it\'s like a dating app, but for events. and less awkward.',
  },
  {
    question: 'is my data secure?',
    answer: 'we\'re open-source, so you can literally audit the code yourself. for managed hosting: encryption, backups, the works. or self-host and keep everything on your own servers. your paranoia, your choice.',
  },
  {
    question: 'will open-event make my events better?',
    answer: 'legally we cannot guarantee that, but... yes. obviously yes.',
  },
  {
    question: 'do you ship internationally?',
    answer: 'we\'re software, we ship everywhere the internet exists. if you\'re reading this from a submarine or the ISS, please let us know. that would be cool.',
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
            got questions?
          </h2>
          <p className="text-lg text-muted-foreground mt-4">
            we probably have answers. probably.
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
