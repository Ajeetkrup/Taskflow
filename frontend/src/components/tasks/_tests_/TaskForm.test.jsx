import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import TaskForm from '../TaskForm';

// Mock components
vi.mock('../common/Button', () => ({
  default: ({ children, ...props }) => (
    <button {...props}>
      {children}
    </button>
  ),
}));

vi.mock('../common/Input', () => ({
  default: (props) => <input {...props} />,
}));

describe('TaskForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders create task form by default', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByPlaceholderText('Task title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Task description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Task' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  test('renders update task form when task is provided', () => {
    const task = {
      title: 'Test Task',
      description: 'Test Description',
      category: 'Work',
      priority: 'high',
      status: 'in-progress',
      due_date: '2024-12-25T10:00:00Z'
    };
    
    render(
      <TaskForm 
        task={task} 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Work')).toBeInTheDocument();
    expect(screen.getByDisplayValue('High')).toBeInTheDocument();
    expect(screen.getByDisplayValue('In Progress')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-12-25')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update Task' })).toBeInTheDocument();
  });

  test('updates form data on input change', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const titleInput = screen.getByPlaceholderText('Task title');
    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    
    expect(titleInput.value).toBe('New Task');
  });

  test('calls onSubmit with form data on form submission', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    fireEvent.change(screen.getByPlaceholderText('Task title'), {
      target: { value: 'Test Task' }
    });
    fireEvent.change(screen.getByPlaceholderText('Task description'), {
      target: { value: 'Test Description' }
    });
    fireEvent.change(screen.getByPlaceholderText('Category'), {
      target: { value: 'Work' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }));
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'Test Task',
      description: 'Test Description',
      category: 'Work',
      priority: 'medium',
      status: 'pending',
      due_date: ''
    });
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('handles priority selection', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const prioritySelect = screen.getByDisplayValue('Medium');
    fireEvent.change(prioritySelect, { target: { value: 'high' } });
    
    expect(prioritySelect.value).toBe('high');
  });

  test('handles status selection', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const statusSelect = screen.getByDisplayValue('Pending');
    fireEvent.change(statusSelect, { target: { value: 'completed' } });
    
    expect(statusSelect.value).toBe('completed');
  });
});