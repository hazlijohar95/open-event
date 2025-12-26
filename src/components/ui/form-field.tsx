import { forwardRef, type ComponentType, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Label } from './label'
import { Input } from './input'

/**
 * Icon component type (e.g., from @phosphor-icons/react)
 */
type IconComponent = ComponentType<{
  size?: number
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
  className?: string
}>

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Field label text */
  label: string
  /** Optional icon component to display before input */
  icon?: IconComponent
  /** Error message to display */
  error?: string
  /** Helper text to display below input */
  helperText?: string
  /** Container className */
  containerClassName?: string
  /** Label className */
  labelClassName?: string
  /** Additional content after the label (e.g., optional badge) */
  labelAddon?: ReactNode
}

/**
 * Reusable form field component with label, icon, and error handling.
 *
 * @example
 * <FormField
 *   label="Email"
 *   id="email"
 *   type="email"
 *   icon={Envelope}
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   error={errors.email}
 *   required
 * />
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      icon: Icon,
      error,
      helperText,
      containerClassName,
      labelClassName,
      labelAddon,
      className,
      id,
      required,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('space-y-1.5', containerClassName)}>
        <div className="flex items-center justify-between">
          <Label htmlFor={id} className={cn('text-sm font-medium', labelClassName)}>
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </Label>
          {labelAddon}
        </div>
        <div className="relative">
          {Icon && (
            <Icon
              size={16}
              weight="duotone"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          )}
          <Input
            ref={ref}
            id={id}
            className={cn(
              Icon && 'pl-10',
              'h-10 rounded-xl text-sm',
              error && 'border-red-500 focus-visible:ring-red-500',
              className
            )}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${id}-error`} className="text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${id}-helper`} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

// ============================================================================
// FORM TEXTAREA
// ============================================================================

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Field label text */
  label: string
  /** Error message to display */
  error?: string
  /** Helper text to display below input */
  helperText?: string
  /** Container className */
  containerClassName?: string
  /** Label className */
  labelClassName?: string
  /** Additional content after the label */
  labelAddon?: ReactNode
}

/**
 * Reusable textarea field component with label and error handling.
 *
 * @example
 * <FormTextarea
 *   label="Description"
 *   id="description"
 *   value={description}
 *   onChange={(e) => setDescription(e.target.value)}
 *   rows={4}
 * />
 */
export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      error,
      helperText,
      containerClassName,
      labelClassName,
      labelAddon,
      className,
      id,
      required,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('space-y-1.5', containerClassName)}>
        <div className="flex items-center justify-between">
          <Label htmlFor={id} className={cn('text-sm font-medium', labelClassName)}>
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </Label>
          {labelAddon}
        </div>
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${id}-helper`} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

FormTextarea.displayName = 'FormTextarea'

// ============================================================================
// FORM SELECT
// ============================================================================

interface FormSelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  /** Field label text */
  label: string
  /** Select options */
  options: FormSelectOption[]
  /** Placeholder option text */
  placeholder?: string
  /** Error message to display */
  error?: string
  /** Helper text to display below input */
  helperText?: string
  /** Container className */
  containerClassName?: string
  /** Label className */
  labelClassName?: string
  /** Additional content after the label */
  labelAddon?: ReactNode
}

/**
 * Reusable select field component with label and error handling.
 *
 * @example
 * <FormSelect
 *   label="Category"
 *   id="category"
 *   value={category}
 *   onChange={(e) => setCategory(e.target.value)}
 *   options={[
 *     { value: 'catering', label: 'Catering' },
 *     { value: 'venue', label: 'Venue' },
 *   ]}
 *   placeholder="Select a category"
 * />
 */
export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      options,
      placeholder,
      error,
      helperText,
      containerClassName,
      labelClassName,
      labelAddon,
      className,
      id,
      required,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('space-y-1.5', containerClassName)}>
        <div className="flex items-center justify-between">
          <Label htmlFor={id} className={cn('text-sm font-medium', labelClassName)}>
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </Label>
          {labelAddon}
        </div>
        <select
          ref={ref}
          id={id}
          className={cn(
            'flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={`${id}-error`} className="text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${id}-helper`} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

FormSelect.displayName = 'FormSelect'
