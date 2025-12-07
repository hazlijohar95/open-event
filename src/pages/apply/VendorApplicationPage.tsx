import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../../convex/_generated/api'
import { cn } from '@/lib/utils'
import {
  Storefront,
  Buildings,
  Phone,
  Envelope,
  Globe,
  MapPin,
  CaretLeft,
  CaretRight,
  CheckCircle,
  CircleNotch,
  Package,
  CurrencyDollar,
  Info,
} from '@phosphor-icons/react'

type Step = 'company' | 'services' | 'experience' | 'contact'

const STEPS: { id: Step; label: string; icon: typeof Buildings }[] = [
  { id: 'company', label: 'Company Info', icon: Buildings },
  { id: 'services', label: 'Services', icon: Package },
  { id: 'experience', label: 'Experience', icon: Storefront },
  { id: 'contact', label: 'Contact', icon: Phone },
]

export function VendorApplicationPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<Step>('company')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    category: '',
    services: [] as string[],
    location: '',
    priceRange: '',
    pastExperience: '',
    additionalNotes: '',
    referralSource: '',
  })

  const formOptions = useQuery(api.publicApplications.getFormOptions)
  const submitApplication = useMutation(api.publicApplications.submitVendorApplication)

  const updateField = (field: keyof typeof formData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep)

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 'company':
        if (!formData.companyName.trim()) {
          setError('Company name is required')
          return false
        }
        break
      case 'services':
        if (!formData.category) {
          setError('Please select a category')
          return false
        }
        break
      case 'contact': {
        if (!formData.contactName.trim()) {
          setError('Contact name is required')
          return false
        }
        if (!formData.contactEmail.trim()) {
          setError('Email is required')
          return false
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.contactEmail)) {
          setError('Please enter a valid email address')
          return false
        }
        break
      }
    }
    return true
  }

  const nextStep = () => {
    if (!validateStep()) return

    const nextIndex = currentStepIndex + 1
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id)
    }
  }

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    setIsSubmitting(true)
    setError(null)

    try {
      await submitApplication({
        companyName: formData.companyName,
        description: formData.description || undefined,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone || undefined,
        website: formData.website || undefined,
        category: formData.category,
        services: formData.services.length > 0 ? formData.services : undefined,
        location: formData.location || undefined,
        priceRange: formData.priceRange || undefined,
        pastExperience: formData.pastExperience || undefined,
        additionalNotes: formData.additionalNotes || undefined,
        referralSource: formData.referralSource || undefined,
      })

      navigate('/apply/success?type=vendor')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleService = (service: string) => {
    const newServices = formData.services.includes(service)
      ? formData.services.filter((s) => s !== service)
      : [...formData.services, service]
    updateField('services', newServices)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="font-mono text-lg font-bold">
              <span className="text-foreground">open</span>
              <span className="text-primary">-</span>
              <span className="text-foreground">event</span>
            </Link>
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 mb-4">
            <Storefront size={24} weight="duotone" className="text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Become a Vendor</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join our network of trusted event vendors. Fill out this application and our team
            will review it within 2-3 business days.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep
              const isCompleted = index < currentStepIndex
              const Icon = step.icon

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                        isActive && 'border-primary bg-primary text-primary-foreground',
                        isCompleted && 'border-green-500 bg-green-500 text-white',
                        !isActive && !isCompleted && 'border-border text-muted-foreground'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle size={20} weight="bold" />
                      ) : (
                        <Icon size={18} weight={isActive ? 'fill' : 'duotone'} />
                      )}
                    </div>
                    <span
                      className={cn(
                        'mt-2 text-xs font-medium hidden sm:block',
                        isActive && 'text-foreground',
                        !isActive && 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 mx-2',
                        index < currentStepIndex ? 'bg-green-500' : 'bg-border'
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-xl border border-border p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
              <Info size={18} weight="duotone" className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Step: Company Info */}
          {currentStep === 'company' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Company Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  placeholder="Your company or business name"
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg border border-border bg-background',
                    'text-sm placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20'
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Tell us about your company and what makes you unique..."
                  rows={4}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg border border-border bg-background',
                    'text-sm placeholder:text-muted-foreground resize-none',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20'
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Globe size={16} weight="duotone" className="inline mr-1" />
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://yourcompany.com"
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg border border-border bg-background',
                    'text-sm placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20'
                  )}
                />
              </div>
            </div>
          )}

          {/* Step: Services */}
          {currentStep === 'services' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg border border-border bg-background',
                    'text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'
                  )}
                >
                  <option value="">Select a category</option>
                  {formOptions?.vendorCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Services Offered</label>
                <p className="text-xs text-muted-foreground mb-3">
                  Select all services you provide
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Setup & Installation',
                    'On-site Support',
                    'Equipment Rental',
                    'Design Services',
                    'Consultation',
                    'Full Service',
                    'Delivery',
                    'Cleanup',
                    'Custom Solutions',
                  ].map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={cn(
                        'px-3 py-2 rounded-lg border text-sm transition-colors text-left',
                        formData.services.includes(service)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <MapPin size={16} weight="duotone" className="inline mr-1" />
                    Service Area / Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="e.g., New York, Nationwide"
                    className={cn(
                      'w-full px-4 py-2.5 rounded-lg border border-border bg-background',
                      'text-sm placeholder:text-muted-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-primary/20'
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <CurrencyDollar size={16} weight="duotone" className="inline mr-1" />
                    Price Range
                  </label>
                  <select
                    value={formData.priceRange}
                    onChange={(e) => updateField('priceRange', e.target.value)}
                    className={cn(
                      'w-full px-4 py-2.5 rounded-lg border border-border bg-background',
                      'text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'
                    )}
                  >
                    <option value="">Select price range</option>
                    {formOptions?.priceRanges.map((range) => (
                      <option key={range} value={range}>
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step: Experience */}
          {currentStep === 'experience' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Past Experience</label>
                <p className="text-xs text-muted-foreground mb-3">
                  Tell us about events you&apos;ve worked with before
                </p>
                <textarea
                  value={formData.pastExperience}
                  onChange={(e) => updateField('pastExperience', e.target.value)}
                  placeholder="Describe your experience working with events, notable clients, types of events, etc..."
                  rows={5}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg border border-border bg-background',
                    'text-sm placeholder:text-muted-foreground resize-none',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20'
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Additional Notes</label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => updateField('additionalNotes', e.target.value)}
                  placeholder="Any other information you'd like to share..."
                  rows={3}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg border border-border bg-background',
                    'text-sm placeholder:text-muted-foreground resize-none',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20'
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">How did you hear about us?</label>
                <select
                  value={formData.referralSource}
                  onChange={(e) => updateField('referralSource', e.target.value)}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg border border-border bg-background',
                    'text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'
                  )}
                >
                  <option value="">Select an option</option>
                  {formOptions?.referralSources.map((source) => (
                    <option key={source} value={source}>
                      {source.charAt(0).toUpperCase() + source.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step: Contact */}
          {currentStep === 'contact' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Contact Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => updateField('contactName', e.target.value)}
                  placeholder="Your full name"
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg border border-border bg-background',
                    'text-sm placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20'
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Envelope size={16} weight="duotone" className="inline mr-1" />
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                  placeholder="you@company.com"
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg border border-border bg-background',
                    'text-sm placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20'
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Phone size={16} weight="duotone" className="inline mr-1" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => updateField('contactPhone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg border border-border bg-background',
                    'text-sm placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20'
                  )}
                />
              </div>

              <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">What happens next?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Our team will review your application within 2-3 business days</li>
                  <li>We may reach out for additional information if needed</li>
                  <li>Once approved, you&apos;ll be able to browse and apply to events</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            {currentStepIndex > 0 ? (
              <button
                type="button"
                onClick={prevStep}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg border border-border',
                  'text-sm font-medium hover:bg-muted transition-colors'
                )}
              >
                <CaretLeft size={16} weight="bold" />
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStepIndex < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className={cn(
                  'flex items-center gap-2 px-6 py-2 rounded-lg',
                  'bg-primary text-primary-foreground text-sm font-medium',
                  'hover:bg-primary/90 transition-colors'
                )}
              >
                Continue
                <CaretRight size={16} weight="bold" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={cn(
                  'flex items-center gap-2 px-6 py-2 rounded-lg',
                  'bg-primary text-primary-foreground text-sm font-medium',
                  'hover:bg-primary/90 transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isSubmitting ? (
                  <>
                    <CircleNotch size={16} weight="bold" className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <CheckCircle size={16} weight="bold" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} open-event. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
