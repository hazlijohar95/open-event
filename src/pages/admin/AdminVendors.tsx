import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Storefront,
  CheckCircle,
  XCircle,
  MagnifyingGlass,
  Plus,
  EnvelopeSimple,
  Phone,
  Globe,
  MapPin,
} from '@phosphor-icons/react'
import { AddVendorModal } from '@/components/admin'

type VendorStatus = 'pending' | 'approved' | 'rejected'

const statusTabs: { value: VendorStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const statusColors: Record<VendorStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Pending Review' },
  approved: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Approved' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-600', label: 'Rejected' },
}

export function AdminVendors() {
  const [statusFilter, setStatusFilter] = useState<VendorStatus | 'all'>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVendor, setSelectedVendor] = useState<Id<'vendors'> | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const vendors = useQuery(api.vendors.listForAdmin, {
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const approveVendor = useMutation(api.vendors.approve)
  const rejectVendor = useMutation(api.vendors.reject)

  const filteredVendors = vendors?.filter((v) => {
    if (!searchQuery.trim()) return true
    const search = searchQuery.toLowerCase()
    return (
      v.name.toLowerCase().includes(search) ||
      v.category.toLowerCase().includes(search) ||
      v.contactEmail?.toLowerCase().includes(search)
    )
  })

  const handleApprove = async (vendorId: Id<'vendors'>) => {
    try {
      await approveVendor({ vendorId })
      toast.success('Vendor approved successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve vendor')
    }
  }

  const handleReject = async () => {
    if (!selectedVendor || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      await rejectVendor({ vendorId: selectedVendor, reason: rejectReason })
      toast.success('Vendor rejected')
      setShowRejectModal(false)
      setSelectedVendor(null)
      setRejectReason('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject vendor')
    }
  }

  const openRejectModal = (vendorId: Id<'vendors'>) => {
    setSelectedVendor(vendorId)
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendor Management</h1>
          <p className="text-muted-foreground">
            Review and manage vendor applications
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            'bg-primary text-primary-foreground font-medium text-sm',
            'hover:bg-primary/90 transition-colors'
          )}
        >
          <Plus size={18} weight="bold" />
          Add Vendor
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
            placeholder="Search vendors..."
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

      {/* Vendors List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {!vendors ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading vendors...
          </div>
        ) : filteredVendors?.length === 0 ? (
          <div className="p-8 text-center">
            <Storefront size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No vendors found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredVendors?.map((vendor) => {
              const status = statusColors[vendor.status]
              return (
                <div
                  key={vendor._id}
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Vendor Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                          <Storefront size={20} weight="duotone" className="text-orange-500" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{vendor.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="capitalize">{vendor.category}</span>
                            {vendor.priceRange && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{vendor.priceRange}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {vendor.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {vendor.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {vendor.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} weight="duotone" />
                            {vendor.location}
                          </span>
                        )}
                        {vendor.contactEmail && (
                          <span className="flex items-center gap-1">
                            <EnvelopeSimple size={14} weight="duotone" />
                            {vendor.contactEmail}
                          </span>
                        )}
                        {vendor.contactPhone && (
                          <span className="flex items-center gap-1">
                            <Phone size={14} weight="duotone" />
                            {vendor.contactPhone}
                          </span>
                        )}
                        {vendor.website && (
                          <a
                            href={vendor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-foreground"
                          >
                            <Globe size={14} weight="duotone" />
                            Website
                          </a>
                        )}
                      </div>
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
                        Applied {formatDate(vendor.createdAt)}
                      </p>

                      {vendor.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(vendor._id)}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
                              'bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors'
                            )}
                          >
                            <CheckCircle size={16} weight="bold" />
                            Approve
                          </button>
                          <button
                            onClick={() => openRejectModal(vendor._id)}
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

                      {vendor.status === 'rejected' && vendor.rejectionReason && (
                        <p className="text-xs text-red-500 max-w-[200px] text-right">
                          Reason: {vendor.rejectionReason}
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
            <h3 className="text-lg font-semibold mb-4">Reject Vendor</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please provide a reason for rejecting this vendor application.
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
                Reject Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      <AddVendorModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  )
}
