import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { MagnifyingGlass, FunnelSimple, Storefront, Star, CheckCircle, MapPin } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const defaultCategories = [
  'All',
  'Catering',
  'AV Equipment',
  'Photography',
  'Decoration',
  'Security',
  'Transportation',
]

export function VendorsPage() {
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')

  const vendors = useQuery(api.vendors.list, {
    category: category === 'All' ? undefined : category.toLowerCase(),
    search: search || undefined,
  })

  const categories = useQuery(api.vendors.getCategories)
  const displayCategories = categories?.length ? ['All', ...categories] : defaultCategories

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-mono">Vendor Marketplace</h1>
        <p className="text-muted-foreground mt-1">Find and connect with trusted event vendors</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={18}
            weight="bold"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors..."
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'text-sm placeholder:text-muted-foreground'
            )}
          />
        </div>
        <button className={cn(
          'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg',
          'border border-border text-sm font-medium',
          'hover:bg-muted transition-colors cursor-pointer'
        )}>
          <FunnelSimple size={18} weight="bold" />
          Filters
        </button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {displayCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer capitalize',
              category === cat
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Vendors List or Empty State */}
      {vendors === undefined ? (
        // Loading state
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
              <div className="h-12 w-12 bg-muted rounded-lg mb-4" />
              <div className="h-5 bg-muted rounded w-2/3 mb-2" />
              <div className="h-4 bg-muted rounded w-full" />
            </div>
          ))}
        </div>
      ) : vendors.length === 0 ? (
        // Empty State
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Storefront size={64} weight="duotone" className="mx-auto text-muted-foreground/30 mb-6" />
          <h3 className="text-lg font-semibold mb-2">
            {search ? 'No vendors found' : 'Vendor marketplace coming soon'}
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {search
              ? `No vendors matching "${search}". Try a different search term.`
              : "We're building a curated marketplace of trusted vendors. Check back soon!"}
          </p>
        </div>
      ) : (
        // Vendors Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((vendor) => (
            <div
              key={vendor._id}
              className="rounded-xl border border-border bg-card p-5 hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Storefront size={24} weight="duotone" className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{vendor.name}</h3>
                    {vendor.verified && (
                      <CheckCircle size={16} weight="fill" className="text-blue-500 shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">{vendor.category}</span>
                </div>
              </div>

              {/* Description */}
              {vendor.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {vendor.description}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  {vendor.rating && vendor.rating > 0 ? (
                    <>
                      <Star size={14} weight="fill" className="text-amber-500" />
                      <span>{vendor.rating.toFixed(1)}</span>
                      <span className="text-xs">({vendor.reviewCount})</span>
                    </>
                  ) : (
                    <span className="text-xs">No reviews yet</span>
                  )}
                </div>
                {vendor.location && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin size={14} weight="bold" />
                    <span className="text-xs truncate max-w-[100px]">{vendor.location}</span>
                  </div>
                )}
              </div>

              {/* Price Range */}
              {vendor.priceRange && (
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-xs font-medium text-muted-foreground">
                    {vendor.priceRange}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
