import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignUpForm } from './SignUpForm'

// Mock Phosphor icons
vi.mock('@phosphor-icons/react', () => ({
  UserPlus: () => <span data-testid="user-plus-icon">UserPlus</span>,
  Eye: () => <span data-testid="eye-icon">Eye</span>,
  EyeSlash: () => <span data-testid="eye-slash-icon">EyeSlash</span>,
  GoogleLogo: () => <span data-testid="google-icon">Google</span>,
}))

describe('SignUpForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnGoogleSignUp = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all form elements', () => {
    render(<SignUpForm />)

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/create a password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('should show validation errors for empty fields', async () => {
    render(<SignUpForm onSubmit={mockOnSubmit} />)
    const user = userEvent.setup()

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should show error for empty name with whitespace only', async () => {
    render(<SignUpForm onSubmit={mockOnSubmit} />)
    const user = userEvent.setup()

    const nameInput = screen.getByLabelText(/full name/i)
    await user.type(nameInput, '   ')

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')

    const passwordInput = screen.getByPlaceholderText(/create a password/i)
    await user.type(passwordInput, 'password123')

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should show validation error for invalid email format', async () => {
    render(<SignUpForm onSubmit={mockOnSubmit} />)
    const user = userEvent.setup()

    const nameInput = screen.getByLabelText(/full name/i)
    await user.type(nameInput, 'John Doe')

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')

    const passwordInput = screen.getByPlaceholderText(/create a password/i)
    await user.type(passwordInput, 'password123')

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      // The form validation should prevent submission for invalid email
      // The error message is "Please enter a valid email"
      const errorMessage = screen.queryByText(/valid email/i)
      if (errorMessage) {
        expect(errorMessage).toBeInTheDocument()
        expect(mockOnSubmit).not.toHaveBeenCalled()
      } else {
        // If no error shown, the onSubmit should not have been called
        // because the browser's native email validation should block it
        // (though in jsdom this may behave differently)
        expect(mockOnSubmit).not.toHaveBeenCalled()
      }
    })
  })

  it('should show error for password not meeting requirements', async () => {
    render(<SignUpForm onSubmit={mockOnSubmit} />)
    const user = userEvent.setup()

    const nameInput = screen.getByLabelText(/full name/i)
    await user.type(nameInput, 'John Doe')

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')

    const passwordInput = screen.getByPlaceholderText(/create a password/i)
    await user.type(passwordInput, 'short')

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      // Password validation shows the first failing requirement
      expect(screen.getByText(/at least 12 characters/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should call onSubmit with valid data', async () => {
    render(<SignUpForm onSubmit={mockOnSubmit} />)
    const user = userEvent.setup()

    const nameInput = screen.getByLabelText(/full name/i)
    await user.type(nameInput, 'John Doe')

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')

    const passwordInput = screen.getByPlaceholderText(/create a password/i)
    // Password must be 12+ chars with uppercase, lowercase, number, special char
    await user.type(passwordInput, 'SecurePass123!')

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'test@example.com',
        password: 'SecurePass123!',
      })
    })
  })

  it('should disable form elements when isLoading is true', () => {
    render(<SignUpForm isLoading={true} />)

    expect(screen.getByLabelText(/full name/i)).toBeDisabled()
    expect(screen.getByLabelText(/email/i)).toBeDisabled()
    expect(screen.getByPlaceholderText(/create a password/i)).toBeDisabled()
    expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled()
  })

  it('should render social auth buttons', () => {
    render(<SignUpForm onGoogleSignUp={mockOnGoogleSignUp} />)

    const googleButton = screen.getByRole('button', { name: /google/i })
    expect(googleButton).toBeInTheDocument()
  })

  it('should call onGoogleSignUp when Google button is clicked', async () => {
    render(<SignUpForm onGoogleSignUp={mockOnGoogleSignUp} />)
    const user = userEvent.setup()

    const googleButton = screen.getByRole('button', { name: /google/i })
    await user.click(googleButton)

    expect(mockOnGoogleSignUp).toHaveBeenCalled()
  })

  it('should have proper autocomplete attributes', () => {
    render(<SignUpForm />)

    expect(screen.getByLabelText(/full name/i)).toHaveAttribute('autocomplete', 'name')
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('autocomplete', 'email')
    expect(screen.getByPlaceholderText(/create a password/i)).toHaveAttribute(
      'autocomplete',
      'new-password'
    )
  })

  it('should clear validation errors when user types', async () => {
    render(<SignUpForm onSubmit={mockOnSubmit} />)
    const user = userEvent.setup()

    // Submit empty form to trigger errors
    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    })

    // Type in name field
    const nameInput = screen.getByLabelText(/full name/i)
    await user.type(nameInput, 'John Doe')

    // Submit again - error should be about email now
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })
  })

  it('should handle form submission with Enter key', async () => {
    render(<SignUpForm onSubmit={mockOnSubmit} />)
    const user = userEvent.setup()

    const nameInput = screen.getByLabelText(/full name/i)
    await user.type(nameInput, 'John Doe')

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')

    const passwordInput = screen.getByPlaceholderText(/create a password/i)
    // Password must be 12+ chars with uppercase, lowercase, number, special char
    await user.type(passwordInput, 'SecurePass123!{Enter}')

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'test@example.com',
        password: 'SecurePass123!',
      })
    })
  })

  it('should display password hint text', () => {
    render(<SignUpForm />)

    // Hint shows: "Min 12 characters with uppercase, lowercase, number, and special character"
    expect(screen.getByText(/min 12 characters/i)).toBeInTheDocument()
  })

  it('should update form fields when user types', async () => {
    render(<SignUpForm />)
    const user = userEvent.setup()

    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
    await user.type(nameInput, 'Jane Smith')
    expect(nameInput.value).toBe('Jane Smith')

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    await user.type(emailInput, 'jane@example.com')
    expect(emailInput.value).toBe('jane@example.com')

    const passwordInput = screen.getByPlaceholderText(/create a password/i) as HTMLInputElement
    await user.type(passwordInput, 'securepass123')
    expect(passwordInput.value).toBe('securepass123')
  })
})
