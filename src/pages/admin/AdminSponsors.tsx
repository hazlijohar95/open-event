import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Handshake,
  CheckCircle,
  XCircle,
  MagnifyingGlass,
  Plus,
  EnvelopeSimple,
  Globe,
  User,
  CurrencyDollar,
} from '@phosphor-icons/react'

type SponsorStatus = 'pending' | 'approved' | 'rejected'

const statusTabs: { value: SponsorStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const statusColors: Record<SponsorStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Pending Review' },
  approved: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Approved' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-600', label: 'Rejected' },
}

export function AdminSponsors() {
  const [statusFilter, setStatusFilter] = useState<SponsorStatus | 'all'>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSponsor, setSelectedSponsor] = useState<Id<'sponsors'> | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  const sponsors = useQuery(api.sponsors.listForAdmin, {
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const approveSponsor = useMutation(api.sponsors.approve)
  const rejectSponsor = useMutation(api.sponsors.reject)

  const filteredSponsors = sponsors?.filter((s) => {
    if (!searchQuery.trim()) return true
    const search = searchQuery.toLowerCase()
    return (
      s.name.toLowerCase().includes(search) ||
      s.industry.toLowerCase().includes(search) ||
      s.contactEmail?.toLowerCase().includes(search) ||
      s.contactName?.toLowerCase().includes(search)
    )
  })

  const handleApprove = async (sponsorId: Id<'sponsors'>) => {
    try {
      await approveSponsor({ sponsorId })
      toast.success('Sponsor approved successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve sponsor')
    }
  }

  const handleReject = async () => {
    if (!selectedSponsor || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      await rejectSponsor({ sponsorId: selectedSponsor, reason: rejectReason })
      toast.success('Sponsor rejected')
      setShowRejectModal(false)
      setSelectedSponsor(null)
      setRejectReason('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject sponsor')
    }
  }

  const openRejectModal = (sponsorId: Id<'sponsors'>) => {
    setSelectedSponsor(sponsorId)
    setRejectReason('')
    setShowRejectModal(true)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return null
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    }
    if (min) return `From $${min.toLocaleString()}`
    if (max) return `Up to $${max.toLocaleString()}`
    return null
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sponsor Management</h1>
          <p className="text-muted-foreground">
            Review and manage sponsor applications
          </p>
        </div>
        <button
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            'bg-primary text-primary-foreground font-medium text-sm',
            'hover:bg-primary/90 transition-colors'
          )}
        >
          <Plus size={18} weight="bold" />
          Add Sponsor
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Status Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                statusFilter === tab.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass
            size={18}
            weight="bold"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search sponsors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background',
              'text-sm placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary/20'
            )}
          />
        </div>
      </div>

      {/* Sponsors List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {!sponsors ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading sponsors...
          </div>
        ) : filteredSponsors?.length === 0 ? (
          <div className="p-8 text-center">
            <Handshake size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No sponsors found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredSponsors?.map((sponsor) => {
              const status = statusColors[sponsor.status]
              const budgetRange = formatBudget(sponsor.budgetMin, sponsor.budgetMax)

              return (
                <div
                  key={sponsor._id}
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Sponsor Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                          {sponsor.logoUrl ? (
                            <img
                              src={sponsor.logoUrl}
                              alt={sponsor.name}
                              className="w-full h-full rounded-lg object-cover"
                            />
                          ) : (
                            <Handshake size={20} weight="duotone" className="text-purple-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{sponsor.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="capitalize">{sponsor.industry}</span>
                            {sponsor.sponsorshipTiers && sponsor.sponsorshipTiers.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="capitalize">
                                  {sponsor.sponsorshipTiers.join(', ')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {sponsor.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {sponsor.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {budgetRange && (
                          <span className="flex items-center gap-1">
                            <CurrencyDollar size={14} weight="duotone" />
                            {budgetRange}
                          </span>
                        )}
                        {sponsor.contactName && (
                          <span className="flex items-center gap-1">
                            <User size={14} weight="duotone" />
                            {sponsor.contactName}
                          </span>
                        )}
                        {sponsor.contactEmail && (
                          <span className="flex items-center gap-1">
                            <EnvelopeSimple size={14} weight="duotone" />
                            {sponsor.contactEmail}
                          </span>
                        )}
                        {sponsor.website && (
                          <a
                            href={sponsor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-foreground"
                          >
                            <Globe size={14} weight="duotone" />
                            Website
                          </a>
                        )}
                      </div>

                      {sponsor.targetEventTypes && sponsor.targetEventTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {sponsor.targetEventTypes.map((type) => (
                            <span
                              key={type}
                              className="px-2 py-0.5 text-xs bg-muted rounded-md"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <span
                        className={cn(
                          'px-3 py-1 text-xs font-medium rounded-full',
                          status.bg,
                          status.text
                        )}
                      >
                        {status.label}
                      </span>

                      <p className="text-xs text-muted-foreground">
                        Applied {formatDate(sponsor.createdAt)}
                      </p>

                      {sponsor.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(sponsor._id)}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
                              'bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors'
                            )}
                          >
                            <CheckCircle size={16} weight="bold" />
                            Approve
                          </button>
                          <button
                            onClick={() => openRejectModal(sponsor._id)}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
                              'bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors'
                            )}
                          >
                            <XCircle size={16} weight="bold" />
                            Reject
                          </button>
                        </div>
                      )}

                      {sponsor.status === 'rejected' && sponsor.rejectionReason && (
                        <p className="text-xs text-red-500 max-w-[200px] text-right">
                          Reason: {sponsor.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowRejectModal(false)}
          />
          <div className="relative bg-background rounded-xl border border-border p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Reject Sponsor</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please provide a reason for rejecting this sponsor application.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Rejection reason..."
              rows={4}
              className={cn(
                'w-full px-3 py-2 rounded-lg border border-border bg-background',
                'text-sm placeholder:text-muted-foreground resize-none',
                'focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium',
                  'bg-red-500 text-white hover:bg-red-600 transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                Reject Sponsor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
