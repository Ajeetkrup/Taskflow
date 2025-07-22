import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import RegisterForm from '../RegisterForm';

// Mock the validation utils
vi.mock('../../../utils/validation', () => ({
  validateForm: vi.fn(() => ({})),
  validateEmail: vi.fn(() => true),
  validatePassword: vi.fn(() => true),
  validateName: vi.fn(() => true),
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

describe('RegisterForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders all form fields', () => {
    renderWithRouter(<RegisterForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByRole('textbox', { name: /first name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /last name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
  });

  test('updates form data on input change', () => {
    renderWithRouter(<RegisterForm onSubmit={mockOnSubmit} />);
    
    const firstNameInput = screen.getByRole('textbox', { name: /first name/i });
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    
    expect(firstNameInput.value).toBe('John');
  });

  test('shows password mismatch error', async () => {
    const { validateForm } = await import('../../../utils/validation');
    validateForm.mockReturnValue({});
    
    renderWithRouter(<RegisterForm onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { 
      target: { value: 'password123' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { 
      target: { value: 'different' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  test('calls onSubmit with correct data when form is valid', async () => {
    const { validateForm } = await import('../../../utils/validation');
    validateForm.mockReturnValue({});
    
    renderWithRouter(<RegisterForm onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByRole('textbox', { name: /first name/i }), { 
      target: { value: 'John' } 
    });
    fireEvent.change(screen.getByRole('textbox', { name: /last name/i }), { 
      target: { value: 'Doe' } 
    });
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { 
      target: { value: 'john@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { 
      target: { value: 'password123' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { 
      target: { value: 'password123' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      });
    });
  });

  test('shows loading state', () => {
    renderWithRouter(<RegisterForm onSubmit={mockOnSubmit} loading={true} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});