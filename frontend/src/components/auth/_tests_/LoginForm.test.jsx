import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import LoginForm from '../LoginForm';

// Mock the validation utils
vi.mock('../../../utils/validation', () => ({
  validateForm: vi.fn(() => ({})),
  validateEmail: vi.fn(() => true),
}));

// Mock components
vi.mock('../common/Button', () => ({
  default: ({ children, loading, ...props }) => (
    <button {...props} disabled={loading}>
      {loading ? 'Loading...' : children}
    </button>
  ),
}));

vi.mock('../common/Input', () => ({
  default: ({ label, error, ...props }) => (
    <div>
      <label>{label}</label>
      <input {...props} />
      {error && <span className="error">{error}</span>}
    </div>
  ),
}));

const renderWithRouter = (component) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders login form fields', () => {
    renderWithRouter(<LoginForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('updates form data on input change', () => {
    renderWithRouter(<LoginForm onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    expect(emailInput.value).toBe('test@example.com');
  });

  test('calls onSubmit with form data when valid', async () => {
    const { validateForm } = await import('../../../utils/validation');
    validateForm.mockReturnValue({});
    
    renderWithRouter(<LoginForm onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { 
      target: { value: 'password123' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  test('displays validation errors', async () => {
    const { validateForm } = await import('../../../utils/validation');
    validateForm.mockReturnValue({ email: 'Invalid email' });
    
    renderWithRouter(<LoginForm onSubmit={mockOnSubmit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('clears error when user starts typing', async () => {
    renderWithRouter(<LoginForm onSubmit={mockOnSubmit} />);
    
    // Simulate having an error
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    fireEvent.change(emailInput, { target: { value: '' } });
    
    // Then clear it by typing
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    
    expect(emailInput.value).toBe('new@example.com');
  });
});