// app.js
(() => {
    // Constants for DOM elements
    const todoInput = document.getElementById('new-todo');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todos');
    const itemsLeftSpan = document.getElementById('items-left');
    const clearCompletedBtn = document.getElementById('clear-completed');

    // Key for localStorage
    const STORAGE_KEY = 'simple-todo-items';

    // In‑memory list of todos
    /** @type {{id: number, text: string, completed: boolean}[]} */
    let todos = [];

    /** Load todos from localStorage */
    function loadTodos() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    todos = parsed;
                }
            }
        } catch (e) {
            console.error('Failed to load todos from localStorage:', e);
            todos = [];
        }
    }

    /** Save current todos to localStorage */
    function saveTodos() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
        } catch (e) {
            console.error('Failed to save todos to localStorage:', e);
        }
    }

    /** Update the "items left" counter */
    function updateItemsLeft() {
        const remaining = todos.filter(t => !t.completed).length;
        itemsLeftSpan.textContent = `${remaining} item${remaining !== 1 ? 's' : ''} left`;
    }

    /** Create a single <li> element for a todo */
    function createTodoElement(todo) {
        const li = document.createElement('li');
        li.dataset.id = String(todo.id);
        li.className = 'todo-item';
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.justifyContent = 'space-between';
        li.style.padding = '0.5rem 0';
        li.style.borderBottom = '1px solid #e0e0e0';

        const leftSpan = document.createElement('span');
        leftSpan.textContent = todo.text;
        leftSpan.style.flex = '1';
        leftSpan.style.cursor = 'pointer';
        if (todo.completed) {
            leftSpan.style.textDecoration = 'line-through';
            leftSpan.style.opacity = '0.6';
        }

        leftSpan.addEventListener('click', () => toggleTodo(todo.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '✕';
        deleteBtn.setAttribute('aria-label', 'Delete todo');
        deleteBtn.style.background = 'transparent';
        deleteBtn.style.border = 'none';
        deleteBtn.style.color = 'var(--danger-color)';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTodo(todo.id);
        });

        li.appendChild(leftSpan);
        li.appendChild(deleteBtn);
        return li;
    }

    /** Render the full todo list */
    function renderTodos() {
        // Clear existing list
        while (todoList.firstChild) {
            todoList.removeChild(todoList.firstChild);
        }

        // Append each todo
        todos.forEach(todo => {
            const li = createTodoElement(todo);
            todoList.appendChild(li);
        });

        updateItemsLeft();
    }

    /** Add a new todo */
    function addTodo(text) {
        const trimmed = text.trim();
        if (!trimmed) return;
        const newTodo = {
            id: Date.now(),
            text: trimmed,
            completed: false,
        };
        todos.push(newTodo);
        saveTodos();
        renderTodos();
    }

    /** Toggle completed state */
    function toggleTodo(id) {
        const idx = todos.findIndex(t => t.id === id);
        if (idx === -1) return;
        todos[idx].completed = !todos[idx].completed;
        saveTodos();
        renderTodos();
    }

    /** Delete a todo */
    function deleteTodo(id) {
        todos = todos.filter(t => t.id !== id);
        saveTodos();
        renderTodos();
    }

    /** Clear all completed todos */
    function clearCompleted() {
        const hasCompleted = todos.some(t => t.completed);
        if (!hasCompleted) return;
        todos = todos.filter(t => !t.completed);
        saveTodos();
        renderTodos();
    }

    /** Initialize event listeners */
    function initEventListeners() {
        addBtn.addEventListener('click', () => {
            addTodo(todoInput.value);
            todoInput.value = '';
            todoInput.focus();
        });

        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTodo(todoInput.value);
                todoInput.value = '';
            }
        });

        clearCompletedBtn.addEventListener('click', clearCompleted);
    }

    /** Initialize the app */
    function init() {
        loadTodos();
        renderTodos();
        initEventListeners();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();