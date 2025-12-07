import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../../convex/_generated/api'
import { cn } from '@/lib/utils'
import {
  Handshake,
  Buildings,
  Phone,
  Envelope,
  Globe,
  CaretLeft,
  CaretRight,
  CheckCircle,
  CircleNotch,
  CurrencyDollar,
  Info,
  Target,
  Medal,
} from '@phosphor-icons/react'

type Step = 'company' | 'sponsorship' | 'experience' | 'contact'

const STEPS: { id: Step; label: string; icon: typeof Buildings }[] = [
  { id: 'company', label: 'Company Info', icon: Buildings },
  { id: 'sponsorship', label: 'Sponsorship', icon: Medal },
  { id: 'experience', label: 'Experience', icon: Handshake },
  { id: 'contact', label: 'Contact', icon: Phone },
]

const EVENT_TYPES = [
  'Conference',
  'Trade Show',
  'Festival',
  'Concert',
  'Sports Event',
  'Charity Gala',
  'Corporate Event',
  'Community Event',
  'Workshop/Seminar',
  'Other',
]

export function SponsorApplicationPage() {
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
    industry: '',
    sponsorshipTiers: [] as string[],
    budgetMin: '',
    budgetMax: '',
    targetEventTypes: [] as string[],
    targetAudience: '',
    pastExperience: '',
    additionalNotes: '',
    referralSource: '',
  })

  const formOptions = useQuery(api.publicApplications.getFormOptions)
  const submitApplication = useMutation(api.publicApplications.submitSponsorApplication)

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
      case 'sponsorship':
        if (!formData.industry) {
          setError('Please select an industry')
          return false
        }
        break
      case 'contact':
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
        industry: formData.industry,
        sponsorshipTiers: formData.sponsorshipTiers.length > 0 ? formData.sponsorshipTiers : undefined,
        budgetMin: formData.budgetMin ? parseInt(formData.budgetMin) : undefined,
        budgetMax: formData.budgetMax ? parseInt(formData.budgetMax) : undefined,
        targetEventTypes: formData.targetEventTypes.length > 0 ? formData.targetEventTypes : undefined,
        targetAudience: formData.targetAudience || undefined,
        pastExperience: formData.pastExperience || undefined,
        additionalNotes: formData.additionalNotes || undefined,
        referralSource: formData.referralSource || undefined,
      })

      navigate('/apply/success?type=sponsor')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTier = (tier: string) => {
    const newTiers = formData.sponsorshipTiers.includes(tier)
      ? formData.sponsorshipTiers.filter((t) => t !== tier)
      : [...formData.sponsorshipTiers, tier]
    updateField('sponsorshipTiers', newTiers)
  }

  const toggleEventType = (eventType: string) => {
    const newTypes = formData.targetEventTypes.includes(eventType)
      ? formData.targetEventTypes.filter((t) => t !== eventType)
      : [...formData.targetEventTypes, eventType]
    updateField('targetEventTypes', newTypes)
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
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10 mb-4">
            <Handshake size={24} weight="duotone" className="text-purple-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Become a Sponsor</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Connect with event organizers and grow your brand. Fill out this application and our
            team will review it within 2-3 business days.
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
                  placeholder="Your company or brand name"
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg border border-border bg-background',
                    'text-sm placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20'
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Industry <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => updateField('industry', e.target.value)}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg border border-border bg-background',
                    'text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'
                  )}
                >
                  <option value="">Select an industry</option>
                  {formOptions?.sponsorIndustries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind.charAt(0).toUpperCase() + ind.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Tell us about your company and your sponsorship goals..."
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

          {/* Step: Sponsorship */}
          {currentStep === 'sponsorship' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Medal size={16} weight="duotone" className="inline mr-1" />
                  Sponsorship Tiers of Interest
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Select all tiers you might be interested in
                </p>
                <div className="flex flex-wrap gap-2">
                  {formOptions?.sponsorshipTiers.map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => toggleTier(tier)}
                      className={cn(
                        'px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                        formData.sponsorshipTiers.includes(tier)
                          ? 'border-purple-500 bg-purple-500/10 text-purple-600'
                          : 'border-border hover:border-purple-500/50'
                      )}
                    >
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <CurrencyDollar size={16} weight="duotone" className="inline mr-1" />
                  Budget Range (USD)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      value={formData.budgetMin}
                      onChange={(e) => updateField('budgetMin', e.target.value)}
                      placeholder="Minimum"
                      min="0"
                      className={cn(
                        'w-full px-4 py-2.5 rounded-lg border border-border bg-background',
                        'text-sm placeholder:text-muted-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-primary/20'
                      )}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={formData.budgetMax}
                      onChange={(e) => updateField('budgetMax', e.target.value)}
                      placeholder="Maximum"
                      min="0"
                      className={cn(
                        'w-full px-4 py-2.5 rounded-lg border border-border bg-background',
                        'text-sm placeholder:text-muted-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-primary/20'
                      )}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Target size={16} weight="duotone" className="inline mr-1" />
                  Target Event Types
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  What types of events are you interested in sponsoring?
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EVENT_TYPES.map((eventType) => (
                    <button
                      key={eventType}
                      type="button"
                      onClick={() => toggleEventType(eventType)}
                      className={cn(
                        'px-3 py-2 rounded-lg border text-sm transition-colors text-left',
                        formData.targetEventTypes.includes(eventType)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      {eventType}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Audience</label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => updateField('targetAudience', e.target.value)}
                  placeholder="e.g., Young professionals, Tech enthusiasts, Families"
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg border border-border bg-background',
                    'text-sm placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20'
                  )}
                />
              </div>
            </div>
          )}

          {/* Step: Experience */}
          {currentStep === 'experience' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Past Sponsorship Experience</label>
                <p className="text-xs text-muted-foreground mb-3">
                  Tell us about events you&apos;ve sponsored before
                </p>
                <textarea
                  value={formData.pastExperience}
                  onChange={(e) => updateField('pastExperience', e.target.value)}
                  placeholder="Describe your past sponsorship experience, notable events, outcomes, etc..."
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
                  placeholder="Any other information you'd like to share about your sponsorship preferences..."
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
                  <li>We may reach out to discuss sponsorship opportunities</li>
                  <li>Once approved, you&apos;ll be able to browse and apply to sponsor events</li>
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
