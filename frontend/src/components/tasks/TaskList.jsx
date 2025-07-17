import React, { useState, useEffect } from 'react';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { taskService } from '../../services/taskService';
import NotificationPopover from '../common/NotificationPopover';
import { INITIALNOTIFICATION, MESSAGES } from '../../utils/constants';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState({ ...INITIALNOTIFICATION });
  console.log("notification -- ", notification)
  useEffect(() => {
    fetchTasks();
  }, []);

  const resetNotification = () => {
    setNotification({ ...INITIALNOTIFICATION })
  }

  const setNotificationFn = (message = "", status = "") => {
    const notObj = { message, status }
    setNotification({ ...notObj })
  }

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const tasksData = await taskService.getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await taskService.createTask(taskData);
      setShowAddTask(false);
      fetchTasks();
      setNotificationFn(MESSAGES.SUCCESS.TASK_CREATE, "success")
      setTimeout(() => {
        resetNotification()
      }, 2 * 1000);
    } catch (error) {
      console.error('Error creating task:', error);
      setNotificationFn('Error creating task', "error")
      setTimeout(() => {
        resetNotification()
      }, 2 * 1000);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      await taskService.updateTask(editingTask.id, taskData);
      setShowAddTask(false);
      setEditingTask(null);
      fetchTasks();
      setNotificationFn(MESSAGES.SUCCESS.TASK_UPDATE, "success")
      setTimeout(() => {
        resetNotification()
      }, 2 * 1000);
    } catch (error) {
      console.error('Error updating task:', error);
      setNotificationFn('Error updating task', "error")
      setTimeout(() => {
        resetNotification()
      }, 2 * 1000);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        fetchTasks();
        setNotificationFn(MESSAGES.SUCCESS.TASK_DELETE, "success")
        setTimeout(() => {
          resetNotification()
        }, 2 * 1000);
      } catch (error) {
        console.error('Error deleting task:', error);
        setNotificationFn('Error deleting task', "error")
        setTimeout(() => {
          resetNotification()
        }, 2 * 1000);
      }
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const id = task.id;
    delete task.id;
    delete task.user_id;
    delete task.created_at;
    delete task.updated_at;
    try {
      await taskService.updateTask(id, { ...task, status: newStatus });
      fetchTasks();
      setNotificationFn(MESSAGES.SUCCESS.TASK_STATUS, "success")
      setTimeout(() => {
        resetNotification()
      }, 2 * 1000);
    } catch (error) {
      console.error('Error updating task status:', error);
      setNotificationFn('Error updating task status', "error")
      setTimeout(() => {
        resetNotification()
      }, 2 * 1000);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowAddTask(true);
  };

  const handleModalClose = () => {
    setShowAddTask(false);
    setEditingTask(null);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'overdue') {
      return task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
    }
    return true;
  });

  if (loading) return <Loader />;

  return (
    <div className="task-list">
      <NotificationPopover key={notification?.message} message={notification?.message} status={notification?.status} />
      {showAddTask ? <TaskForm
        task={editingTask}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        onCancel={handleModalClose}
      /> : <><div className="task-header">
        <h2>My Tasks</h2>
        <Button
          variant="primary"
          onClick={() => setShowAddTask(true)}
        >
          Add Task
        </Button>
      </div>

        <div className="task-filters">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({tasks.length})
          </button>
          <button
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending ({tasks.filter(t => t.status === 'pending').length})
          </button>
          <button
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed ({tasks.filter(t => t.status === 'completed').length})
          </button>
          <button
            className={filter === 'overdue' ? 'active' : ''}
            onClick={() => setFilter('overdue')}
          >
            Overdue ({tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length})
          </button>
        </div>

        <div className="tasks-container">
          {filteredTasks.length === 0 ? (
            <div className="no-tasks">
              <p>No tasks found. Create your first task!</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDeleteTask}
                onToggleStatus={handleToggleStatus}
              />
            ))
          )}
        </div></>}
    </div>
  );
};

export default TaskList;
