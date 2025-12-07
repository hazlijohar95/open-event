import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Table } from '@phosphor-icons/react'
import { AgenticChat } from '@/components/agentic'

export function EventCreatePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Minimal Header */}
      <div className="flex items-center justify-between mb-2">
        <Link
          to="/dashboard/events"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} weight="bold" />
          Back to Events
        </Link>

        <Link
          to="/dashboard/events/new/form"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Table size={16} weight="bold" />
          Use form instead
        </Link>
      </div>

      {/* Agentic Chat Interface */}
      <AgenticChat
        title="Open Event AI"
        subtitle="What would you like to create?"
        placeholder="Describe your event - include details like type, date, location, and expected attendees..."
        suggestions={[
          { label: 'Tech Conference', prompt: 'I want to create a tech conference for 200 developers in San Francisco next month' },
          { label: 'Product Launch', prompt: 'Help me plan a product launch event with press coverage and demo stations' },
          { label: 'Company Retreat', prompt: 'I need to organize a company retreat for 50 people with team building activities' },
          { label: 'Wedding Reception', prompt: 'I\'m planning a wedding reception for 150 guests in an outdoor venue' },
        ]}
        quickActions={[
          {
            label: 'Start from scratch',
            onClick: () => navigate('/dashboard/events/new/form'),
          },
        ]}
        onComplete={(eventId) => {
          navigate(`/dashboard/events/${eventId}`)
        }}
      />
    </div>
  )
}
