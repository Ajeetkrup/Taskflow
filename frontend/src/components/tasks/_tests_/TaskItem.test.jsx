import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import TaskItem from '../TaskItem';

// Mock the Button component
vi.mock('../common/Button', () => ({
  default: ({ children, ...props }) => (
    <button {...props}>
      {children}
    </button>
  ),
}));

describe('TaskItem', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnToggleStatus = vi.fn();

  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    category: 'Work',
    priority: 'high',
    status: 'pending',
    due_date: '2024-12-25'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders task information correctly', () => {
    render(
      <TaskItem 
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('📁 Work')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  test('displays due date correctly', () => {
    render(
      <TaskItem 
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );
    
    expect(screen.getByText(/📅.*12\/25\/2024/)).toBeInTheDocument();
  });

  test('shows complete button for pending tasks', () => {
    render(
      <TaskItem 
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );
    
    expect(screen.getByRole('button', { name: 'Complete' })).toBeInTheDocument();
  });

  test('shows reopen button for completed tasks', () => {
    const completedTask = { ...mockTask, status: 'completed' };
    
    render(
      <TaskItem 
        task={completedTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );
    
    expect(screen.getByRole('button', { name: 'Reopen' })).toBeInTheDocument();
  });

  test('calls onEdit when edit button is clicked', () => {
    render(
      <TaskItem 
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  test('calls onDelete when delete button is clicked', () => {
    render(
      <TaskItem 
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(mockOnDelete).toHaveBeenCalledWith(mockTask.id);
  });

  test('calls onToggleStatus when complete/reopen button is clicked', () => {
    render(
      <TaskItem 
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: 'Complete' }));
    expect(mockOnToggleStatus).toHaveBeenCalledWith(mockTask);
  });

  test('applies correct priority classes', () => {
    const { container } = render(
      <TaskItem 
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );
    
    expect(container.querySelector('.priority-high')).toBeInTheDocument();
  });

  test('applies correct status classes', () => {
    const { container } = render(
      <TaskItem 
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );
    
    expect(container.querySelector('.status-pending')).toBeInTheDocument();
  });

  test('handles task without description', () => {
    const taskWithoutDesc = { ...mockTask, description: null };
    
    render(
      <TaskItem 
        task={taskWithoutDesc}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  test('handles task without category', () => {
    const taskWithoutCategory = { ...mockTask, category: null };
    
    render(
      <TaskItem 
        task={taskWithoutCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );
    
    expect(screen.queryByText(/📁/)).not.toBeInTheDocument();
  });

  test('shows overdue styling for past due dates', () => {
    // Mock current date to be after the task due date
    const pastDueTask = { 
      ...mockTask, 
      due_date: '2020-01-01',
      status: 'pending'
    };
    
    const { container } = render(
      <TaskItem 
        task={pastDueTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );
    
    expect(container.querySelector('.overdue')).toBeInTheDocument();
  });
});