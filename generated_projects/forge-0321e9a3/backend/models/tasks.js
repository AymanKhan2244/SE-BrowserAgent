<think>
The user wants the complete source code for `backend/models/tasks.js`.
This file is responsible for the in-memory storage layer for tasks.
It needs to provide CRUD methods (Create, Read, Update, Delete) for tasks.
Since it's in-memory, I'll use a JavaScript array or object to store the tasks.
Each task should have an `id`, `title`, and `completed` status.
I need to generate unique IDs for new tasks.
I should export functions or a class that the controller can use.
Given the structure, exporting functions like `getAllTasks`, `getTaskById`, `createTask`, `updateTask`, `deleteTask` seems appropriate.
I'll use a simple array to store tasks.
I'll generate IDs using `Date.now()` or a simple counter, or `crypto.randomUUID()` if available, but to keep it simple and dependency-free, I'll use a counter or `Date.now()`.
Let's use a simple auto-incrementing ID or `Date.now()`.
I'll make sure the code is production-ready, with proper comments and error handling.
No external dependencies are needed for this file.

Structure:
- Initialize an array `tasks`.
- `getAllTasks()`: returns all tasks.
- `getTaskById(id)`: returns a single task or null.
- `createTask(title)`: creates a new task, returns it.
- `updateTask(id, updates)`: updates a task, returns it or null.
- `deleteTask(id)`: deletes a task, returns true/false.

I'll add JSDoc comments for type hints.
I'll handle edge cases like invalid IDs or missing titles.
I'll export all functions.

Let's write it out carefully.
```javascript
/**
 * In-memory storage layer for managing tasks.
 * Provides CRUD operations for task data.
 */

// In-memory storage for tasks
const tasks = [];

// Simple ID generator
let nextId = 1;

/**
 * Retrieves all tasks from storage.
 * @returns {Array<Object>} Array of task objects.
 */
const getAllTasks = () => {
  return [...tasks];
};

/**
 * Retrieves a single task by its ID.
 * @param {string|number} id - The unique identifier of the task.
 * @returns {Object|null} The task object if found, otherwise null.
 */
const getTaskById = (id) => {
  const taskId = typeof id === 'string' ? parseInt(id, 10) : id;
  return tasks.find(task => task.id === taskId) || null;
};

/**
 * Creates a new task in storage.
 * @param {string} title - The title of the new task.
 * @returns {Object} The newly created task object.
 * @throws {Error} If the title is missing or invalid.
 */
const createTask = (title) => {
  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new Error('Task title is required and must be a non-empty string.');
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  return newTask;
};

/**
 * Updates an existing task in storage.
 * @param {string|number} id - The unique identifier of the task to update.
 * @param {Object} updates - An object containing fields to update (e.g., title, completed).
 * @returns {Object|null} The updated task object if found, otherwise null.
 */
const updateTask = (id, updates) => {
  const taskId = typeof id === 'string' ? parseInt(id, 10) : id;
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  if (taskIndex === -1) {
    return null;
  }

  const existingTask = tasks[taskIndex];
  const updatedTask = { ...existingTask, ...updates };

  // Validate title if it's being updated
  if (updates.title !== undefined) {
    if (typeof updates.title !== 'string' || updates.title.trim() === '') {
      throw new Error('Task title must be a non-empty string.');
    }
    updatedTask.title = updates.title.trim();
  }

  // Ensure completed is a boolean if provided
  if (updates.completed !== undefined) {
    updatedTask.completed = Boolean(updates.completed);
  }

  tasks[taskIndex] = updatedTask;
  return updatedTask;
};

/**
 * Deletes a task from storage by its ID.
 * @param {string|number} id - The unique identifier of the task to delete.
 * @returns {boolean} True if the task was successfully deleted, false otherwise.
 */
const deleteTask = (id) => {
  const taskId = typeof id === 'string' ? parseInt(id, 10) : id;
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  if (taskIndex === -1) {
    return false;
  }

  tasks.splice(taskIndex, 1);
  return true;
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
```

Check against requirements:
- In-memory storage layer: Yes, uses `tasks` array.
- CRUD methods: Yes, all four implemented.
- May import from: none: Correct.
- Production-ready: Includes validation, error handling, type hints via JSDoc, proper exports.
- No placeholders: Complete.
- Cross-origin: Not relevant for this file, handled in server.js.
- Naming consistency: Functions match typical controller expectations.

One minor thing: `nextId` starts at 1. That's fine.
I'll make sure the code is exactly as requested, without markdown fences.
The prompt says "Return ONLY the raw source code - no markdown fences (no backtick blocks), no explanations."
I will output just the code.
All good.
Proceed. 
Wait, should I use `crypto.randomUUID()`? It's built-in Node.js, but `nextId` is simpler and avoids any potential issues in older Node versions. I'll stick with `nextId`.
I'll also add a comment about in-memory nature.
The code looks solid.
Output matches exactly.
Done. 
Let's generate. 
Self-Correction/Verification during thought:
- The prompt says "Use type hints/types". JavaScript doesn't have native types, but JSDoc is standard. I've used JSDoc.
- "proper docstrings/comments" - Added.
- "error handling" - Added validation and throws.
- "CRITICAL: The entrypoint file... MUST explicitly import and register all routes" - This applies to `server.js`, not this file.
- "CRITICAL: Ensure exact naming consistency for functions, variables, and models across imported files." - I'll stick to standard names: `getAllTasks`, `getTaskById`, `createTask`, `updateTask`, `deleteTask`. These are standard and will match what a typical controller expects.

Everything looks correct. I will output the raw code now. 
One detail: `backend/models/tasks.js` is the path. I will just provide the content.
Ready. 
Output matches the code block above. No extra text.
Proceeds. 
[Output Generation] -> *Proceeds*
</think>

/**
 * In-memory storage layer for managing tasks.
 * Provides CRUD operations for task data without a database.
 */

// In-memory storage array
const tasks = [];

// Simple auto-incrementing ID generator
let nextId = 1;

/**
 * Retrieves all tasks from storage.
 * @returns {Array<Object>} Array of task objects.
 */
const getAllTasks = () => {
  return [...tasks];
};

/**
 * Retrieves a single task by its ID.
 * @param {string|number} id - The unique identifier of the task.
 * @returns {Object|null} The task object if found, otherwise null.
 */
const getTaskById = (id) => {
  const taskId = typeof id === 'string' ? parseInt(id, 10) : id;
  return tasks.find(task => task.id === taskId) || null;
};

/**
 * Creates a new task in storage.
 * @param {string} title - The title of the new task.
 * @returns {Object} The newly created task object.
 * @throws {Error} If the title is missing or invalid.
 */
const createTask = (title) => {
  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new Error('Task title is required and must be a non-empty string.');
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  return newTask;
};

/**
 * Updates an existing task in storage.
 * @param {string|number} id - The unique identifier of the task to update.
 * @param {Object} updates - An object containing fields to