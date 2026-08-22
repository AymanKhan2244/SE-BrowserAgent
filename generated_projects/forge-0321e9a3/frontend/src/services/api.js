<think>
The user wants me to write the complete source code for `frontend/src/services/api.js`.
This file is responsible for encapsulating all HTTP requests to the backend API.
It's a React frontend service file that will make fetch calls to the Express backend.
Since it's a basic todo app, I need to implement CRUD operations for tasks:
- GET /api/tasks - fetch all tasks
- POST /api/tasks - create a new task
- PUT /api/tasks/:id - update a task (toggle completion)
- DELETE /api/tasks/:id - delete a task

I'll use the native `fetch` API since it's standard in modern browsers and doesn't require extra dependencies.
I should handle errors properly and return promises.
The backend runs on a different port typically (e.g., 5000 or 3001), so I'll use a base URL that can be configured via environment variables or defaults to localhost:5000.

Let's structure the api.js file:
- Define base URL
- Export functions for each CRUD operation
- Handle errors and parse JSON responses
- Add comments/docstrings

I'll make sure it's production-ready, handles CORS implicitly (by relying on backend CORS setup), and follows best practices.

Code structure:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchTasks = async () => { ... };
export const createTask = async (task) => { ... };
export const updateTask = async (id, task) => { ... };
export const deleteTask = async (id) => { ... };
```

I'll add proper error handling, try-catch blocks, and return structured responses or throw errors appropriately.
Since it's a service layer, it's common to throw errors or return { data, error } objects. I'll go with throwing errors for simplicity and standard React patterns, but I'll make sure to parse errors properly.

Let's write it out carefully.
No markdown fences, just raw code.
I'll include JSDoc comments for type hints and documentation.
I'll use fetch with proper headers and methods.
I'll handle JSON parsing and HTTP error status codes.
Ready.✅
</think>

/**
 * API Service Module
 * Encapsulates all HTTP requests to the backend API for task management.
 * Uses the native Fetch API with proper error handling and JSON parsing.
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Fetches all tasks from the backend.
 * @returns {Promise<Array>} A promise that resolves to an array of task objects.
 */
export const fetchTasks = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    throw error;
  }
};

/**
 * Creates a new task on the backend.
 * @param {Object} task - The task object containing at least a 'title' property.
 * @returns {Promise<Object>} A promise that resolves to the created task object.
 */
export const createTask = async (task) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to create task:', error);
    throw error;
  }
};

/**
 * Updates an existing task on the backend.
 * @param {string} id - The unique identifier of the task to update.
 * @param {Object} updates - The fields to update (e.g., { completed: true }).
 * @returns {Promise<Object>} A promise that resolves to the updated task object.
 */
export const updateTask = async (id, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to update task:', error);
    throw error;
  }
};

/**
 * Deletes a task from the backend.
 * @param {string} id - The unique identifier of the task to delete.
 * @returns {Promise<void>} A promise that resolves when the deletion is successful.
 */
export const deleteTask = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to delete task:', error);
    throw error;
  }
};