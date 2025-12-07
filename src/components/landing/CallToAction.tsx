import { Link } from 'react-router-dom'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'
import { ArrowRight, GithubLogo, CheckCircle } from '@phosphor-icons/react'

export function CallToAction() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section className="relative py-24 sm:py-32 px-6 overflow-hidden">
      {/* Beautiful gradient background - balanced tones */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-background to-amber-50/50 dark:from-indigo-950/30 dark:via-background dark:to-amber-950/15" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-indigo-200/25 to-transparent dark:from-indigo-800/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-amber-200/30 to-transparent dark:from-amber-800/15 rounded-full blur-3xl" />
      </div>

      <div
        ref={ref}
        className={cn(
          'relative max-w-4xl mx-auto text-center transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        {/* Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
          Ready to simplify your
          <br />
          <span className="bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
            event operations?
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mt-6">
          Join organizers, sponsors, and vendors who've ditched spreadsheets for good.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link
            to="/sign-up"
            className="group flex items-center gap-2 px-8 py-4 text-base font-medium bg-foreground text-background hover:bg-foreground/90 transition-all rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Get Started Free
            <ArrowRight
              size={18}
              weight="bold"
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>

          <a
            href="https://github.com/hazlijohar95/open-event"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-6 py-4 text-base font-medium text-foreground hover:bg-muted/50 transition-all rounded-xl border border-border/50 hover:border-border"
          >
            <GithubLogo size={20} weight="fill" />
            View on GitHub
          </a>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <CheckCircle size={16} weight="fill" className="text-emerald-500" />
            Free and open-source
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle size={16} weight="fill" className="text-emerald-500" />
            No credit card required
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle size={16} weight="fill" className="text-emerald-500" />
            Deploy anywhere
          </span>
        </div>
      </div>
    </section>
  )
}
