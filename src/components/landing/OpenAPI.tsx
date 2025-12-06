import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowRight } from '@phosphor-icons/react'

const apiEndpoints = [
  {
    id: 'events',
    method: 'GET',
    path: '/api/events',
    description: 'List all events with filtering and pagination',
    example: `// Response
{
  "events": [
    {
      "id": "evt_123",
      "name": "Tech Conference 2025",
      "status": "planning",
      "startDate": "2025-03-15",
      "organizer": "org_456"
    }
  ],
  "total": 42,
  "page": 1
}`,
  },
  {
    id: 'vendors',
    method: 'POST',
    path: '/api/vendors/apply',
    description: 'Submit a vendor application',
    example: `// Request
{
  "companyName": "Catering Co",
  "category": "food",
  "services": ["lunch", "dinner"],
  "priceRange": {
    "min": 500,
    "max": 5000
  }
}

// Response
{
  "applicationId": "app_789",
  "status": "pending_review"
}`,
  },
  {
    id: 'sponsors',
    method: 'POST',
    path: '/api/sponsors/apply',
    description: 'Submit a sponsor application',
    example: `// Request
{
  "companyName": "TechCorp",
  "tier": "gold",
  "budget": 10000,
  "interests": ["developer", "ai"]
}

// Response
{
  "applicationId": "spon_321",
  "status": "pending_review",
  "aiScore": 0.87
}`,
  },
  {
    id: 'ai-match',
    method: 'POST',
    path: '/api/ai/sponsor-match',
    description: 'AI-powered sponsor matching',
    example: `// Request
{
  "eventId": "evt_123",
  "requirements": {
    "budget": 15000,
    "industry": ["tech", "finance"]
  }
}

// Response
{
  "matches": [
    {
      "sponsorId": "spon_456",
      "score": 0.94,
      "reasoning": "Strong alignment..."
    }
  ]
}`,
  },
]

export function OpenAPI() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section className="py-24 sm:py-32 px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div
          ref={ref}
          className={cn(
            'space-y-6 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          {/* Header */}
          <h2 className="font-mono text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Built for developers. Flexible for everyone.
          </h2>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl">
            Every part of Open-Event can integrate with your stack — ticketing tools,
            CRM, payment providers, internal dashboards, and more.
          </p>
        </div>

        {/* API Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-background border border-border rounded-lg p-1">
              {apiEndpoints.map((endpoint) => (
                <TabsTrigger
                  key={endpoint.id}
                  value={endpoint.id}
                  className="font-mono text-sm whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span className={cn(
                    'mr-2 text-xs font-bold',
                    endpoint.method === 'GET' ? 'text-green-500' : 'text-blue-500',
                    'data-[state=active]:text-inherit'
                  )}>
                    {endpoint.method}
                  </span>
                  {endpoint.path.split('/').pop()}
                </TabsTrigger>
              ))}
            </TabsList>

            {apiEndpoints.map((endpoint) => (
              <TabsContent key={endpoint.id} value={endpoint.id} className="mt-6">
                <div className="rounded-lg border border-border bg-background overflow-hidden">
                  {/* Endpoint Header */}
                  <div className="px-4 py-3 border-b border-border bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-bold',
                        endpoint.method === 'GET'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-blue-500/10 text-blue-500'
                      )}>
                        {endpoint.method}
                      </span>
                      <code className="font-mono text-sm">{endpoint.path}</code>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{endpoint.description}</p>
                  </div>

                  {/* Code Block */}
                  <pre className="p-4 overflow-x-auto text-sm">
                    <code className="font-mono text-muted-foreground">{endpoint.example}</code>
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* CTA */}
        <div className="mt-8">
          <Button variant="outline" className="group">
            Read the Docs
            <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18} weight="duotone" />
          </Button>
        </div>
      </div>
    </section>
  )
}
