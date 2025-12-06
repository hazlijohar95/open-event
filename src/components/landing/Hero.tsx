import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Github, ExternalLink, Code2 } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="font-mono text-lg font-semibold">open-event</div>
        <ThemeToggle />
      </nav>

      {/* Hero Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Headline */}
          <h1 className="font-mono text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            The open-source event operations system.
          </h1>

          {/* Sub-headline */}
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Logistics, vendors, sponsors, volunteers — one clean operational flow.
            <br className="hidden sm:block" />
            AI-powered. Open by default. Built for organizers who want clarity, speed, and control.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <Github className="mr-2 h-4 w-4" />
              View on GitHub
            </Button>
            <Button size="lg" variant="ghost" className="w-full sm:w-auto">
              <Code2 className="mr-2 h-4 w-4" />
              Open API
            </Button>
          </div>

          {/* Badge Row */}
          <div className="flex items-center justify-center gap-3 pt-8">
            <Badge variant="secondary" className="animate-float-slow">
              open-source
            </Badge>
            <span className="text-muted-foreground">·</span>
            <Badge variant="secondary" className="animate-float-medium">
              realtime
            </Badge>
            <span className="text-muted-foreground">·</span>
            <Badge variant="secondary" className="animate-float-fast">
              ai-native
            </Badge>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-muted-foreground/50 rounded-full mt-2" />
        </div>
      </div>
    </section>
  )
}
