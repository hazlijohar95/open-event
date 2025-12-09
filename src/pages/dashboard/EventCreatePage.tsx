import { useNavigate } from 'react-router-dom'
import { AgenticChatV2 } from '@/components/agentic'

export function EventCreatePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <AgenticChatV2
        title="Open Event AI"
        subtitle="What would you like to create?"
        placeholder="Describe your event - include details like type, date, location, and expected attendees..."
        onComplete={(eventId) => {
          navigate(`/dashboard/events/${eventId}`)
        }}
      />
    </div>
  )
}
