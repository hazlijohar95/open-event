import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Rocket, Star, BookOpen } from '@phosphor-icons/react'

export function CallToAction() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section className="py-24 sm:py-32 px-6">
      <div
        ref={ref}
        className={cn(
          'max-w-4xl mx-auto text-center space-y-8 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        {/* Decorative gradient background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* Title */}
        <h2 className="font-mono text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          Start running events the modern way.
        </h2>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl text-muted-foreground">
          Open-source. Fast. AI-native. Built for organizers.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Button size="lg" className="w-full sm:w-auto group">
            <Rocket className="mr-2 group-hover:animate-bounce" size={18} weight="duotone" />
            Launch Open-Event
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            <Star className="mr-2" size={18} weight="duotone" />
            Star on GitHub
          </Button>
          <Button size="lg" variant="ghost" className="w-full sm:w-auto">
            <BookOpen className="mr-2" size={18} weight="duotone" />
            Read the Docs
          </Button>
        </div>
      </div>
    </section>
  )
}
