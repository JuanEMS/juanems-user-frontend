import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskForm from './components/TaskForm';
import './css/styles.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks`);
      setTasks(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks. Please try again.');
    }
  };

  const addTask = async (task) => {
    try {
      const response = await axios.post(`${API_URL}/api/tasks`, task);
      setTasks([...tasks, response.data]);
      setError(null);
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task. Please try again.');
    }
  };

  const updateTask = async (id, updatedTask) => {
    try {
      const response = await axios.put(`${API_URL}/api/tasks/${id}`, updatedTask);
      setTasks(tasks.map((task) => (task._id === id ? response.data : task)));
      setEditingTask(null);
      setError(null);
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again!');
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
      setError(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    }
  };

  return (
    <div className="container">
      <h1 className="title">Task Manager</h1>
      {error && <div className="error">{error}</div>}
      <TaskForm
        addTask={addTask}
        updateTask={updateTask}
        editingTask={editingTask}
        setEditingTask={setEditingTask}
      />
      <div className="task-list">
        {tasks.map((task) => (
          <div key={task._id} className="task-item">
            <div>
              <h3 className={task.completed ? 'completed' : ''}>{task.title}</h3>
              <p>{task.description}</p>
            </div>
            <div className="task-actions">
              <button
                onClick={() => setEditingTask(task)}
                className="btn btn-edit"
              >
                Edit
              </button>
              <button
                onClick={() => deleteTask(task._id)}
                className="btn btn-delete"
              >
                Delete
              </button>
              <button
                onClick={() =>
                  updateTask(task._id, { ...task, completed: !task.completed })
                }
                className="btn btn-toggle"
              >
                {task.completed ? 'Undo' : 'Complete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;