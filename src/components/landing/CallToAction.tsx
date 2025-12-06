import { Link } from 'react-router-dom'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Rocket, GithubLogo, BookOpen } from '@phosphor-icons/react'

export function CallToAction() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section className="relative py-24 sm:py-32 px-6 bg-muted/30 section-divider overflow-hidden">
      {/* Gradient accent background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern-subtle" />

      <div
        ref={ref}
        className={cn(
          'relative max-w-4xl mx-auto text-center space-y-8 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        {/* Title */}
        <h2 className="font-mono text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          Ready to simplify your event ops?
        </h2>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto">
          Join organizers, sponsors, and vendors who've ditched spreadsheets for good.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Button size="lg" className="w-full sm:w-auto group" asChild>
            <Link to="/sign-up">
              Get Started Free
              <Rocket className="ml-2 group-hover:translate-x-1 transition-transform" size={18} weight="duotone" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
            <a href="https://github.com/hazlijohar95/open-event" target="_blank" rel="noopener noreferrer">
              <GithubLogo className="mr-2" size={18} weight="duotone" />
              View on GitHub
            </a>
          </Button>
          <Button size="lg" variant="ghost" className="w-full sm:w-auto">
            <BookOpen className="mr-2" size={18} weight="duotone" />
            Read the Docs
          </Button>
        </div>

        {/* Trust note */}
        <p className="text-sm text-muted-foreground pt-4">
          Free and open-source. No credit card required.
        </p>
      </div>
    </section>
  )
}
