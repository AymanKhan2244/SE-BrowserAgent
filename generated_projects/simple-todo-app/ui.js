export type Todo = {
    /** Unique identifier for the todo item */
    id: string;
    /** Text description of the todo */
    text: string;
    /** Completion status */
    completed: boolean;
};

/* Callback placeholders – they will be set by the consumer (app.js) */
let addCallback: ((text: string) => void) | null = null;
let editCallback: ((id: string, newText: string) => void) | null = null;
let toggleCallback: ((id: string) => void) | null = null;
let deleteCallback: ((id: string) => void) | null = null;

/**
 * Initialise the UI by wiring up the static controls (input, add button).
 *
 * The HTML structure is defined in `index.html`; this function only attaches
 * event listeners to the existing elements.
 *
 * @throws {Error} If required DOM elements are missing.
 */
export function initUI(): void {
    const input = document.getElementById('new-todo-input') as HTMLInputElement | null;
    const addBtn = document.getElementById('add-todo-button') as HTMLButtonElement | null;

    if (!input) {
        throw new Error('Input element with id "new-todo-input" not found.');
    }
    if (!addBtn) {
        throw new Error('Button element with id "add-todo-button" not found.');
    }

    // Click handler
    addBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (text && addCallback) {
            addCallback(text);
        }
    });

    // Enter key handler
    input.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const text = input.value.trim();
            if (text && addCallback) {
                addCallback(text);
            }
        }
    });
}

/**
 * Render the entire todo list.
 *
 * @param todos - Array of todo objects to display.
 */
export function renderTodos(todos: Todo[]): void {
    const list = document.getElementById('todo-list');
    if (!list) {
        console.error('Todo list element with id "todo-list" not found.');
        return;
    }

    // Clear existing items
    list.innerHTML = '';

    // Append each todo item
    todos.forEach(todo => {
        const itemEl = createTodoItemElement(todo);
        list.appendChild(itemEl);
    });
}

/**
 * Retrieve the current text from the new‑todo input field.
 *
 * @returns The raw input value (may be empty string).
 */
export function getNewTodoText(): string {
    const input = document.getElementById('new-todo-input') as HTMLInputElement | null;
    return input ? input.value : '';
}

/**
 * Clear the new‑todo input field.
 */
export function clearNewTodoInput(): void {
    const input = document.getElementById('new-todo-input') as HTMLInputElement | null;
    if (input) {
        input.value = '';
    }
}

/**
 * Register a callback to be invoked when a new todo is added.
 *
 * @param cb - Function receiving the todo text.
 */
export function setAddTodoHandler(cb: (text: string) => void): void {
    addCallback = cb;
}

/**
 * Register a callback to be invoked when a todo is edited.
 *
 * @param cb - Function receiving the todo id and the new text.
 */
export function setEditTodoHandler(cb: (id: string, newText: string) => void): void {
    editCallback = cb;
}

/**
 * Register a callback to be invoked when a todo's completion status toggles.
 *
 * @param cb - Function receiving the todo id.
 */
export function setToggleTodoHandler(cb: (id: string) => void): void {
    toggleCallback = cb;
}

/**
 * Register a callback to be invoked when a todo is deleted.
 *
 * @param cb - Function receiving the todo id.
 */
export function setDeleteTodoHandler(cb: (id: string) => void): void {
    deleteCallback = cb;
}

/**
 * Create a DOM element representing a single todo item.
 *
 * @param todo - The todo data.
 * @returns The `<li>` element for the todo.
 */
function createTodoItemElement(todo: Todo): HTMLLIElement {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = todo.id;

    // Checkbox for completion toggle
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-toggle';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', 'Mark as completed');
    checkbox.addEventListener('change', () => {
        if (toggleCallback) {
            toggleCallback(todo.id);
        }
    });

    // Text container (span)
    const textSpan = document.createElement('span');
    textSpan.className = 'todo-text';
    textSpan.textContent = todo.text;
    if (todo.completed) {
        textSpan.classList.add('completed');
    }

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'todo-edit';
    editBtn.textContent = 'Edit';
    editBtn.setAttribute('aria-label', 'Edit todo');
    editBtn.addEventListener('click', () => handleEditClick(li, todo));

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'todo-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', 'Delete todo');
    deleteBtn.addEventListener('click', () => {
        if (deleteCallback) {
            deleteCallback(todo.id);
        }
    });

    // Assemble the item
    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    return li;
}

/**
 * Handle the edit button click – toggles between view and edit mode.
 *
 * @param li - The `<li>` element containing the todo.
 * @param todo - The original todo data.
 */
function handleEditClick(li: HTMLLIElement, todo: Todo): void {
    const isEditing = li.classList.contains('editing');
    const textSpan = li.querySelector<HTMLSpanElement>('.todo-text');
    const editBtn = li.querySelector<HTMLButtonElement>('.todo-edit');

    if (!textSpan || !editBtn) {
        console.error('Missing required child elements for editing.');
        return;
    }

    if (!isEditing) {
        // Switch to edit mode
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'todo-edit-input';
        input.value = todo.text;
        input.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });

        li.replaceChild(input, textSpan);
        editBtn.textContent = 'Save';
        li.classList.add('editing');
        input.focus();
    } else {
        // Save the edit
        saveEdit();
    }

    function saveEdit(): void {
        const input = li.querySelector<HTMLInputElement>('.todo-edit-input');
        if (!input) {
            console.error('Edit input not found.');
            return;
        }
        const newText = input.value.trim();
        if (newText && editCallback) {
            editCallback(todo.id, newText);
        }
        // Update UI regardless of callback outcome
        const newSpan = document.createElement('span');
        newSpan.className = 'todo-text';
        newSpan.textContent = newText || todo.text;
        if (todo.completed) {
            newSpan.classList.add('completed');
        }
        li.replaceChild(newSpan, input);
        editBtn.textContent = 'Edit';
        li.classList.remove('editing');
    }

    function cancelEdit(): void {
        const input = li.querySelector<HTMLInputElement>('.todo-edit-input');
        if (!input) {
            return;
        }
        const originalSpan = document.createElement('span');
        originalSpan.className = 'todo-text';
        originalSpan.textContent = todo.text;
        if (todo.completed) {
            originalSpan.classList.add('completed');
        }
        li.replaceChild(originalSpan, input);
        editBtn.textContent = 'Edit';
        li.classList.remove('editing');
    }
}