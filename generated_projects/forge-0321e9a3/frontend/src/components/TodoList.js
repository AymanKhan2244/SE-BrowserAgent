<think>
Here's a thinking process:

1.  **Analyze User Input:**
   - **Role:** Senior Full-Stack Engineer
   - **Task:** Write COMPLETE source code for `frontend/src/components/TodoList.js`
   - **Project:** basic-todo-app (React frontend, Node/Express backend, in-memory storage)
   - **File Responsibility:** Renders the complete list of tasks by mapping over task data
   - **May import from:** `frontend/src/components/TodoItem.js`
   - **Strict Rules:** 
     - ONLY raw source code, no markdown fences, no explanations
     - Complete and runnable, no placeholders/TODOs/ellipsis
     - Use type hints/types, proper docstrings/comments, error handling
     - Ensure cross-origin requests handled (though this is frontend component, so not directly relevant here, but good to keep in mind)
     - Naming consistency across imports
     - React component structure expected

2.  **Determine Component Requirements:**
   - It's a React functional component.
   - Props: `tasks` (array of task objects), `onToggle` (function to toggle task completion), `onDelete` (function to delete a task)
   - Should map over `tasks` and render `TodoItem` for each.
   - Handle empty state gracefully.
   - Include proper comments/docstrings.
   - Use PropTypes or TypeScript? The prompt says "Use type hints/types", but it's a `.js` file. I'll use PropTypes for type checking in JS, or just JSDoc comments for types. I'll stick to JSDoc + PropTypes for clarity and standard React JS practices.
   - Error handling: Not much to handle in a pure presentational component, but I can add a fallback or check for invalid props.

3.  **Draft the Code (Mental):**
   ```javascript
   import React from 'react';
   import PropTypes from 'prop-types';
   import TodoItem from './TodoItem';

   /**
    * TodoList Component
    * Renders a list of tasks by mapping over the provided tasks array.
    * Displays an empty state message if no tasks are present.
    *
    * @param {Object} props
    * @param {Array<{id: string, text: string, completed: boolean}>} props.tasks - Array of task objects
    * @param {Function} props.onToggle - Callback to toggle task completion status
    * @param {Function} props.onDelete - Callback to delete a task by ID
    * @returns {JSX.Element}
    */
   const TodoList = ({ tasks, onToggle, onDelete }) => {
     if (!Array.isArray(tasks)) {
       console.error('TodoList: tasks prop must be an array');
       return null;
     }

     if (tasks.length === 0) {
       return (
         <div className="todo-list-empty" role="status">
           <p>No tasks yet. Add one above!</p>
         </div>
       );
     }

     return (
       <ul className="todo-list" role="list">
         {tasks.map((task) => (
           <TodoItem
             key={task.id}
             task={task}
             onToggle={onToggle}
             onDelete={onDelete}
           />
         ))}
       </ul>
     );
   };

   TodoList.propTypes = {
     tasks: PropTypes.arrayOf(
       PropTypes.shape({
         id: PropTypes.string.isRequired,
         text: PropTypes.string.isRequired,
         completed: PropTypes.bool.isRequired,
       })
     ).isRequired,
     onToggle: PropTypes.func.isRequired,
     onDelete: PropTypes.func.isRequired,
   };

   export default TodoList;
   ```

4.  **Check Against Constraints:**
   - ONLY raw source code? Yes.
   - No markdown fences? I will output just the code.
   - Complete and runnable? Yes.
   - Type hints/types? Used PropTypes and JSDoc.
   - Proper docstrings/comments? Yes.
   - Error handling? Added array check and console.error.
   - Imports `TodoItem.js`? Yes.
   - Naming consistency? Uses standard React patterns, expects `task.id`, `task.text`, `task.completed`. Matches typical todo app structure.
   - Cross-origin? Not applicable to this component.
   - Entrypoint rule? Not applicable here.
   - Strict rule: "Return ONLY the raw source code - no markdown fences (no backtick blocks), no explanations." -> I will strictly output just the code.

   One minor adjustment: The prompt says "Use type hints/types". In JS, PropTypes is standard, but I could also use JSDoc `@typedef` for better type hinting in IDEs. I'll stick with PropTypes + JSDoc as it's standard for `.js` React files. I'll make sure it's robust.

   Let's verify the exact path: `frontend/src/components/TodoList.js`
   The code looks solid. I will output it exactly as requested.

   One thing: The prompt says "May import from: frontend/src/components/TodoItem.js". I'll import it as `import TodoItem from './TodoItem';` which is correct for the relative path.

   I'll ensure no markdown formatting is used in the output. I will just paste the raw code.

   Final check of the code:
   - Imports React, PropTypes, TodoItem
   - JSDoc comment
   - Functional component
   - Props validation
   - Empty state handling
   - Mapping logic
   - Export default
   - Matches all constraints.

   Ready. Output matches exactly.✅
   I will generate the raw code now. 
   Note: I'll make sure there are absolutely no backticks or markdown. Just the code.
   I'll also add a small CSS class structure assumption but keep it minimal as requested. The component itself is pure UI.
   All good.✅
   Output generation. 
   [Proceeds]
   *Self-Correction/Refinement during thought*: 
   The prompt says "Use type hints/types". In modern JS, PropTypes is fine, but I'll also add JSDoc `@typedef` for better IDE support. I'll keep it clean.
   I will ensure the code is exactly as drafted.
   No extra text. Just the code.
   Let's output. 
   `import React from 'react';...` etc.
   Done. 
   Output matches response. 
   [Proceeds]
</think>

import React from 'react';
import PropTypes from 'prop-types';
import TodoItem from './TodoItem';

/**
 * @typedef {Object} Task
 * @property {string} id - Unique identifier for the task
 * @property {string} text - The task description
 * @property {boolean} completed - Completion status of the task
 */

/**
 * TodoList Component
 * Renders a complete list of tasks by mapping over the provided tasks array.
 * Handles empty states and delegates individual task rendering to TodoItem.
 *
 * @param {Object} props
 * @param {Task[]} props.tasks - Array of task objects to display
 * @param {Function} props.onToggle - Callback to toggle a task's completion status
 * @param {Function} props.onDelete - Callback to remove a task by its ID
 * @returns {JSX.Element}
 */
const TodoList = ({ tasks, onToggle, onDelete }) => {
  // Validate tasks prop to prevent runtime errors during mapping
  if (!Array.isArray(tasks)) {
    console.error('TodoList: Expected "tasks" prop to be an array.');
    return null;
  }

  // Render empty state when no tasks exist
  if (tasks.length === 0) {
    return (
      <div className="todo-list-empty" role="status" aria-live="polite">
        <p>No tasks yet. Add one above!</p>
      </div>
    );
  }

  // Render list of tasks
  return (
    <ul className="todo-list" role="list" aria-label="Task list">
      {tasks.map((task) => (
        <TodoItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

TodoList.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
    })
  ).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default TodoList;