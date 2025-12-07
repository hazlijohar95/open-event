import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  ClipboardText,
  Storefront,
  Handshake,
  CheckCircle,
  XCircle,
  Eye,
  ArrowRight,
  MagnifyingGlass,
  Clock,
  X,
  CircleNotch,
  EnvelopeSimple,
  Buildings,
} from '@phosphor-icons/react'

type ApplicationStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'converted'
type ApplicationType = 'vendor' | 'sponsor'

const statusTabs: { value: ApplicationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'submitted', label: 'New' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'converted', label: 'Converted' },
]

const statusColors: Record<ApplicationStatus, { bg: string; text: string; label: string }> = {
  submitted: { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'New' },
  under_review: { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Under Review' },
  approved: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Approved' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-600', label: 'Rejected' },
  converted: { bg: 'bg-purple-500/10', text: 'text-purple-600', label: 'Converted' },
}

export function AdminPublicApplications() {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('submitted')
  const [typeFilter, setTypeFilter] = useState<ApplicationType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedApplication, setSelectedApplication] = useState<Id<'publicApplications'> | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [isConverting, setIsConverting] = useState(false)

  const applications = useQuery(api.publicApplications.listForAdmin, {
    status: statusFilter === 'all' ? undefined : statusFilter,
    type: typeFilter === 'all' ? undefined : typeFilter,
  })

  const pendingCounts = useQuery(api.publicApplications.getPendingCounts)
  const applicationDetail = useQuery(
    api.publicApplications.get,
    selectedApplication ? { applicationId: selectedApplication } : 'skip'
  )

  const updateStatus = useMutation(api.publicApplications.updateStatus)
  const convertToVendor = useMutation(api.publicApplications.convertToVendor)
  const convertToSponsor = useMutation(api.publicApplications.convertToSponsor)

  const filteredApplications = applications?.filter((app) => {
    if (!searchQuery.trim()) return true
    const search = searchQuery.toLowerCase()
    return (
      app.companyName.toLowerCase().includes(search) ||
      app.contactEmail.toLowerCase().includes(search) ||
      app.contactName.toLowerCase().includes(search)
    )
  })

  const handleMarkUnderReview = async (appId: Id<'publicApplications'>) => {
    try {
      await updateStatus({ applicationId: appId, status: 'under_review' })
      toast.success('Application marked as under review')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    }
  }

  const handleReject = async () => {
    if (!selectedApplication || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      await updateStatus({
        applicationId: selectedApplication,
        status: 'rejected',
        rejectionReason: rejectReason,
      })
      toast.success('Application rejected')
      setShowRejectModal(false)
      setShowDetailModal(false)
      setSelectedApplication(null)
      setRejectReason('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject application')
    }
  }

  const handleConvert = async (autoApprove: boolean) => {
    if (!selectedApplication || !applicationDetail) return

    setIsConverting(true)
    try {
      if (applicationDetail.applicationType === 'vendor') {
        await convertToVendor({
          applicationId: selectedApplication,
          autoApprove,
        })
      } else {
        await convertToSponsor({
          applicationId: selectedApplication,
          autoApprove,
        })
      }
      toast.success(
        autoApprove
          ? `${applicationDetail.applicationType === 'vendor' ? 'Vendor' : 'Sponsor'} created and approved`
          : `${applicationDetail.applicationType === 'vendor' ? 'Vendor' : 'Sponsor'} created (pending approval)`
      )
      setShowDetailModal(false)
      setSelectedApplication(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to convert application')
    } finally {
      setIsConverting(false)
    }
  }

  const openDetailModal = (appId: Id<'publicApplications'>) => {
    setSelectedApplication(appId)
    setShowDetailModal(true)
  }

  const openRejectModal = () => {
    setRejectReason('')
    setShowRejectModal(true)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Public Applications</h1>
          <p className="text-muted-foreground">
            Review vendor and sponsor applications from the public form
          </p>
        </div>
        {pendingCounts && pendingCounts.total > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-600">
            <Clock size={18} weight="duotone" />
            <span className="font-medium">{pendingCounts.total} pending</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Status Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                statusFilter === tab.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setTypeFilter('all')}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
              typeFilter === 'all'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            All Types
          </button>
          <button
            onClick={() => setTypeFilter('vendor')}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
              typeFilter === 'vendor'
                ? 'border-orange-500 bg-orange-500/10 text-orange-600'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <Storefront size={16} weight="duotone" />
            Vendors
          </button>
          <button
            onClick={() => setTypeFilter('sponsor')}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
              typeFilter === 'sponsor'
                ? 'border-purple-500 bg-purple-500/10 text-purple-600'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <Handshake size={16} weight="duotone" />
            Sponsors
          </button>
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
            placeholder="Search by company or email..."
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

      {/* Applications List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {!applications ? (
          <div className="p-8 text-center text-muted-foreground">Loading applications...</div>
        ) : filteredApplications?.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardText
              size={48}
              weight="duotone"
              className="mx-auto mb-4 text-muted-foreground/50"
            />
            <p className="text-muted-foreground">No applications found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredApplications?.map((app) => {
              const status = statusColors[app.status]
              const isVendor = app.applicationType === 'vendor'
              const TypeIcon = isVendor ? Storefront : Handshake
              const typeColor = isVendor ? 'text-orange-500' : 'text-purple-500'
              const typeBg = isVendor ? 'bg-orange-500/10' : 'bg-purple-500/10'

              return (
                <div
                  key={app._id}
                  className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => openDetailModal(app._id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Application Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                            typeBg
                          )}
                        >
                          <TypeIcon size={20} weight="duotone" className={typeColor} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{app.companyName}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="capitalize">{app.applicationType}</span>
                            <span>•</span>
                            <span>{app.contactName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <EnvelopeSimple size={14} weight="duotone" />
                          {app.contactEmail}
                        </span>
                        {isVendor && app.vendorCategory && (
                          <span className="capitalize">{app.vendorCategory}</span>
                        )}
                        {!isVendor && app.sponsorIndustry && (
                          <span className="capitalize">
                            {app.sponsorIndustry.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col items-end gap-2">
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
                        {formatDate(app.createdAt)}
                      </p>

                      {app.status === 'submitted' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkUnderReview(app._id)
                          }}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
                            'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors'
                          )}
                        >
                          <Eye size={14} weight="bold" />
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && applicationDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDetailModal(false)}
          />
          <div className="relative bg-background rounded-xl border border-border w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    applicationDetail.applicationType === 'vendor'
                      ? 'bg-orange-500/10'
                      : 'bg-purple-500/10'
                  )}
                >
                  {applicationDetail.applicationType === 'vendor' ? (
                    <Storefront size={20} weight="duotone" className="text-orange-500" />
                  ) : (
                    <Handshake size={20} weight="duotone" className="text-purple-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{applicationDetail.companyName}</h2>
                  <p className="text-sm text-muted-foreground capitalize">
                    {applicationDetail.applicationType} Application
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'px-3 py-1 text-sm font-medium rounded-full',
                    statusColors[applicationDetail.status].bg,
                    statusColors[applicationDetail.status].text
                  )}
                >
                  {statusColors[applicationDetail.status].label}
                </span>
                <span className="text-sm text-muted-foreground">
                  Submitted {formatDate(applicationDetail.createdAt)}
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Buildings size={16} weight="duotone" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>{' '}
                    {applicationDetail.contactName}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>{' '}
                    {applicationDetail.contactEmail}
                  </div>
                  {applicationDetail.contactPhone && (
                    <div>
                      <span className="text-muted-foreground">Phone:</span>{' '}
                      {applicationDetail.contactPhone}
                    </div>
                  )}
                  {applicationDetail.website && (
                    <div>
                      <span className="text-muted-foreground">Website:</span>{' '}
                      <a
                        href={applicationDetail.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {applicationDetail.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {applicationDetail.description && (
                <div className="space-y-2">
                  <h3 className="font-medium">Description</h3>
                  <p className="text-sm text-muted-foreground">{applicationDetail.description}</p>
                </div>
              )}

              {/* Vendor-specific */}
              {applicationDetail.applicationType === 'vendor' && (
                <div className="space-y-3">
                  <h3 className="font-medium">Vendor Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {applicationDetail.vendorCategory && (
                      <div>
                        <span className="text-muted-foreground">Category:</span>{' '}
                        <span className="capitalize">{applicationDetail.vendorCategory}</span>
                      </div>
                    )}
                    {applicationDetail.vendorLocation && (
                      <div>
                        <span className="text-muted-foreground">Location:</span>{' '}
                        {applicationDetail.vendorLocation}
                      </div>
                    )}
                    {applicationDetail.vendorPriceRange && (
                      <div>
                        <span className="text-muted-foreground">Price Range:</span>{' '}
                        <span className="capitalize">{applicationDetail.vendorPriceRange}</span>
                      </div>
                    )}
                  </div>
                  {applicationDetail.vendorServices &&
                    applicationDetail.vendorServices.length > 0 && (
                      <div>
                        <span className="text-muted-foreground text-sm">Services:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {applicationDetail.vendorServices.map((service) => (
                            <span
                              key={service}
                              className="px-2 py-0.5 text-xs bg-muted rounded-md"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Sponsor-specific */}
              {applicationDetail.applicationType === 'sponsor' && (
                <div className="space-y-3">
                  <h3 className="font-medium">Sponsor Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {applicationDetail.sponsorIndustry && (
                      <div>
                        <span className="text-muted-foreground">Industry:</span>{' '}
                        <span className="capitalize">
                          {applicationDetail.sponsorIndustry.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                    {(applicationDetail.sponsorBudgetMin || applicationDetail.sponsorBudgetMax) && (
                      <div>
                        <span className="text-muted-foreground">Budget:</span>{' '}
                        {applicationDetail.sponsorBudgetMin &&
                          `$${applicationDetail.sponsorBudgetMin.toLocaleString()}`}
                        {applicationDetail.sponsorBudgetMin &&
                          applicationDetail.sponsorBudgetMax &&
                          ' - '}
                        {applicationDetail.sponsorBudgetMax &&
                          `$${applicationDetail.sponsorBudgetMax.toLocaleString()}`}
                      </div>
                    )}
                  </div>
                  {applicationDetail.sponsorTiers && applicationDetail.sponsorTiers.length > 0 && (
                    <div>
                      <span className="text-muted-foreground text-sm">Interested Tiers:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {applicationDetail.sponsorTiers.map((tier) => (
                          <span
                            key={tier}
                            className="px-2 py-0.5 text-xs bg-purple-500/10 text-purple-600 rounded-md capitalize"
                          >
                            {tier}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Past Experience */}
              {applicationDetail.pastExperience && (
                <div className="space-y-2">
                  <h3 className="font-medium">Past Experience</h3>
                  <p className="text-sm text-muted-foreground">
                    {applicationDetail.pastExperience}
                  </p>
                </div>
              )}

              {/* Additional Notes */}
              {applicationDetail.additionalNotes && (
                <div className="space-y-2">
                  <h3 className="font-medium">Additional Notes</h3>
                  <p className="text-sm text-muted-foreground">
                    {applicationDetail.additionalNotes}
                  </p>
                </div>
              )}

              {/* Rejection Reason */}
              {applicationDetail.status === 'rejected' && applicationDetail.rejectionReason && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <h3 className="font-medium text-red-600 mb-1">Rejection Reason</h3>
                  <p className="text-sm text-red-600">{applicationDetail.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {applicationDetail.status !== 'converted' &&
              applicationDetail.status !== 'rejected' && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <button
                    onClick={openRejectModal}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                      'text-red-600 hover:bg-red-500/10 transition-colors'
                    )}
                  >
                    <XCircle size={16} weight="bold" />
                    Reject
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleConvert(false)}
                      disabled={isConverting}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg border border-border',
                        'text-sm font-medium hover:bg-muted transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      <ArrowRight size={16} weight="bold" />
                      Convert to {applicationDetail.applicationType === 'vendor' ? 'Vendor' : 'Sponsor'}
                    </button>
                    <button
                      onClick={() => handleConvert(true)}
                      disabled={isConverting}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg',
                        'bg-green-500 text-white text-sm font-medium',
                        'hover:bg-green-600 transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      {isConverting ? (
                        <>
                          <CircleNotch size={16} weight="bold" className="animate-spin" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} weight="bold" />
                          Convert & Approve
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRejectModal(false)} />
          <div className="relative bg-background rounded-xl border border-border p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Reject Application</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please provide a reason for rejecting this application.
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
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
