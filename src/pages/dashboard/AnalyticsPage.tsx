import { ChartLine, Calendar, Storefront, Handshake } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const metrics = [
  { label: 'Total Events', value: '0', icon: Calendar, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { label: 'Active Vendors', value: '0', icon: Storefront, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  { label: 'Sponsors', value: '0', icon: Handshake, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
]

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-mono">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your event performance and metrics</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.label}
              className="p-5 rounded-xl border border-border bg-card"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', metric.bgColor)}>
                  <Icon size={20} weight="duotone" className={metric.color} />
                </div>
                <span className="text-sm text-muted-foreground">{metric.label}</span>
              </div>
              <p className="text-3xl font-bold font-mono">{metric.value}</p>
            </div>
          )
        })}
      </div>

      {/* Chart Placeholder */}
      <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
        <ChartLine size={64} weight="duotone" className="mx-auto text-muted-foreground/30 mb-6" />
        <h3 className="text-lg font-semibold mb-2">Analytics coming soon</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Create events and connect with vendors to start tracking your metrics.
        </p>
      </div>
    </div>
  )
}
