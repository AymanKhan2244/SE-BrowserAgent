/**
 * app.js
 * Entry point for the Simple Todo App.
 * Initializes the application, wires UI events, and coordinates
 * persistence via localStorage.
 *
 * @module app
 */

'use strict';

// Import storage utilities
import { loadTodos, saveTodos } from './storage.js';

// Import UI utilities
import {
  init as initUI,
  renderTodos,
  getNewTodoText,
  clearNewTodoInput,
  setAddTodoHandler,
  setEditTodoHandler,
  setToggleTodoHandler,
  setDeleteTodoHandler,
} from './ui.js';

/**
 * @typedef {Object} TodoItem
 * @property {string} id - Unique identifier (UUID).
 * @property {string} text - Task description.
 * @property {boolean} completed - Completion status.
 */

/**
 * Application state: in‑memory list of todos.
 * @type {TodoItem[]}
 */
let todos = [];

/**
 * Generates a new unique ID for a todo item.
 * Uses the Web Crypto API when available; otherwise falls back to a simple random string.
 *
 * @returns {string}
 */
function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: 16‑character alphanumeric string
  return 'xxxxxxxxxxxxxxx'.replace(/[x]/g, () =>
    Math.floor(Math.random() * 16).toString(16)
  );
}

/**
 * Persists the current todo list to localStorage.
 */
function persist() {
  try {
    saveTodos(todos);
  } catch (err) {
    console.error('Failed to save todos:', err);
  }
}

/**
 * Adds a new todo item.
 *
 * @param {string} text - The todo description.
 */
function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return;
  }
  const newTodo = {
    id: generateId(),
    text: trimmed,
    completed: false,
  };
  todos.push(newTodo);
  persist();
  renderTodos(todos);
}

/**
 * Edits an existing todo item.
 *
 * @param {string} id - Identifier of the todo to edit.
 * @param {string} newText - New description.
 */
function editTodo(id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) {
    return;
  }
  const todo = todos.find((t) => t.id === id);
  if (!todo) {
    console.warn(`Todo with id ${id} not found for edit.`);
    return;
  }
  todo.text = trimmed;
  persist();
  renderTodos(todos);
}

/**
 * Toggles the completion status of a todo item.
 *
 * @param {string} id - Identifier of the todo to toggle.
 */
function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) {
    console.warn(`Todo with id ${id} not found for toggle.`);
    return;
  }
  todo.completed = !todo.completed;
  persist();
  renderTodos(todos);
}

/**
 * Deletes a todo item.
 *
 * @param {string} id - Identifier of the todo to delete.
 */
function deleteTodo(id) {
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) {
    console.warn(`Todo with id ${id} not found for deletion.`);
    return;
  }
  todos.splice(index, 1);
  persist();
  renderTodos(todos);
}

/**
 * Sets up UI event handlers and renders the initial state.
 */
function bootstrap() {
  // Initialise UI components (cache DOM nodes, etc.)
  initUI();

  // Load persisted todos (if any)
  try {
    const stored = loadTodos();
    if (Array.isArray(stored)) {
      // Ensure stored items conform to our TodoItem shape
      todos = stored.map((t) => ({
        id: String(t.id),
        text: String(t.text),
        completed: Boolean(t.completed),
      }));
    }
  } catch (err) {
    console.error('Failed to load todos from storage:', err);
    todos = [];
  }

  // Render the current list
  renderTodos(todos);

  // Register UI callbacks
  setAddTodoHandler(() => {
    const text = getNewTodoText();
    addTodo(text);
    clearNewTodoInput();
  });

  setEditTodoHandler((id, newText) => {
    editTodo(id, newText);
  });

  setToggleTodoHandler((id) => {
    toggleTodo(id);
  });

  setDeleteTodoHandler((id) => {
    deleteTodo(id);
  });
}

// Initialise the app once the DOM is ready
document.addEventListener('DOMContentLoaded', bootstrap);