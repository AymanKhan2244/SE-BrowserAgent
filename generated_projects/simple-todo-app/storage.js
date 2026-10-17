// storage.js
// Provides functions to load, save, and manipulate todo items using browser localStorage.
// The module uses ES6 exports and JSDoc for type annotations.

// Key used in localStorage
const STORAGE_KEY = 'todos';

/**
 * @typedef {Object} Todo
 * @property {string} id - Unique identifier (UUID).
 * @property {string} text - The todo description.
 * @property {boolean} completed - Completion status.
 * @property {number} createdAt - Unix timestamp (ms) when the todo was created.
 */

/**
 * Safely parse JSON, returning fallback on error.
 * @param {string|null} raw
 * @param {any} fallback
 * @returns {any}
 */
function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse stored todos, resetting storage.', e);
    return fallback;
  }
}

/**
 * Load the todo list from localStorage.
 * @returns {Todo[]}
 */
export function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const todos = /** @type {Todo[]} */ (safeParse(raw, []));
  if (!Array.isArray(todos)) return [];
  return todos.filter(
    (t) =>
      typeof t.id === 'string' &&
      typeof t.text === 'string' &&
      typeof t.completed === 'boolean' &&
      typeof t.createdAt === 'number'
  );
}

/**
 * Persist the todo list to localStorage.
 * @param {Todo[]} todos
 */
export function saveTodos(todos) {
  try {
    const payload = JSON.stringify(todos);
    localStorage.setItem(STORAGE_KEY, payload);
  } catch (e) {
    console.error('Failed to save todos to localStorage.', e);
  }
}

/**
 * Generate a UUID for a new todo.
 * Uses crypto.randomUUID when available; falls back to a simple random string.
 * @returns {string}
 */
function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: 16‑character alphanumeric string
  return 'xxxxxxxxyxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Add a new todo item.
 * @param {string} text - The description of the todo.
 * @returns {Todo} The newly created todo.
 */
export function addTodo(text) {
  const todos = loadTodos();
  const newTodo = {
    id: generateId(),
    text: text.trim(),
    completed: false,
    createdAt: Date.now(),
  };
  todos.push(newTodo);
  saveTodos(todos);
  return newTodo;
}

/**
 * Update an existing todo.
 * @param {string} id - Identifier of the todo to update.
 * @param {Partial<Todo>} updates - Fields to update.
 * @returns {Todo|null} Updated todo, or null if not found.
 */
export function updateTodo(id, updates) {
  const todos = loadTodos();
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const existing = todos[index];
  const updated = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
  };
  todos[index] = updated;
  saveTodos(todos);
  return updated;
}

/**
 * Delete a todo by its id.
 * @param {string} id
 * @returns {boolean} True if a todo was removed, false otherwise.
 */
export function deleteTodo(id) {
  const todos = loadTodos();
  const filtered = todos.filter((t) => t.id !== id);
  if (filtered.length === todos.length) return false;
  saveTodos(filtered);
  return true;
}

/**
 * Toggle the completion status of a todo.
 * @param {string} id
 * @returns {Todo|null} The todo after toggling, or null if not found.
 */
export function toggleTodoComplete(id) {
  const todos = loadTodos();
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const todo = todos[index];
  todo.completed = !todo.completed;
  saveTodos(todos);
  return todo;
}

/**
 * Clear all completed todos.
 * @returns {number} Number of todos removed.
 */
export function clearCompleted() {
  const todos = loadTodos();
  const active = todos.filter((t) => !t.completed);
  const removedCount = todos.length - active.length;
  if (removedCount > 0) {
    saveTodos(active);
  }
  return removedCount;
}