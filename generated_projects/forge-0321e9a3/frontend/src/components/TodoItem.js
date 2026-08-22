<think>
Here's a thinking process:

1.  **Analyze User Input:**
   - **Role:** Senior Full-Stack Engineer
   - **Task:** Write COMPLETE source code for `frontend/src/components/TodoItem.js`
   - **Project:** basic-todo-app (React frontend, Node/Express backend, in-memory storage)
   - **File Responsibility:** Displays a single task with toggle completion and delete functionality
   - **Imports:** May import from none (but typically React is needed)
   - **Strict Rules:** 
     - Raw source code only, no markdown fences
     - Complete and runnable, no placeholders
     - Use type hints/types, proper docstrings/comments, error handling
     - Cross-origin handled elsewhere (not relevant here)
     - Naming consistency expected
     - React component structure expected

2.  **Determine Component Requirements:**
   - It's a React functional component
   - Props expected: `task` (object with `id`, `text`, `completed`), `onToggle` (function), `onDelete` (function)
   - UI: Checkbox for completion, text display (strikethrough if completed), delete button
   - Styling: Inline or basic CSS classes (I'll use inline styles or simple class names for simplicity, but keep it clean)
   - Type hints: PropTypes or TypeScript? The prompt says "Use type hints/types", but it's a `.js` file. I'll use PropTypes for type checking in JS, or I could just use JSDoc comments for types. I'll stick to PropTypes as it's standard for React JS, or I can use JSDoc `@param` types. I'll use PropTypes for runtime type checking, which is common in React JS projects.
   - Error handling: Basic prop validation, safe rendering
   - Comments/Docstrings: Clear explanation of props and functionality

3.  **Draft the Code (Mental Refinement):**
   ```javascript
   import React from 'react';
   import PropTypes from 'prop-types';

   /**
    * TodoItem Component
    * Displays a single task with toggle completion and delete functionality.
    *
    * @param {Object} props - Component properties
    * @param {Object} props.task - The task object containing id, text, and completed status
    * @param {Function} props.onToggle - Callback to toggle task completion status
    * @param {Function} props.onDelete - Callback to delete the task
    */
   const TodoItem = ({ task, onToggle, onDelete }) => {
     if (!task) {
       return null;
     }

     const handleToggle = () => {
       if (typeof onToggle === 'function') {
         onToggle(task.id);
       }
     };

     const handleDelete = () => {
       if (typeof onDelete === 'function') {
         onDelete(task.id);
       }
     };

     return (
       <div style={{
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'space-between',
         padding: '10px',
         marginBottom: '8px',
         backgroundColor: '#f9f9f9',
         borderRadius: '4px',
         border: '1px solid #ddd'
       }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
           <input
             type="checkbox"
             checked={task.completed}
             onChange={handleToggle}
             aria-label={`Mark task "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`}
           />
           <span style={{
             textDecoration: task.completed ? 'line-through' : 'none',
             color: task.completed ? '#888' : '#333',
             fontSize: '16px'
           }}>
             {task.text}
           </span>
         </div>
         <button
           onClick={handleDelete}
           style={{
             backgroundColor: '#ff4d4d',
             color: 'white',
             border: 'none',
             padding: '6px 12px',
             borderRadius: '4px',
             cursor: 'pointer',
             fontSize: '14px'
           }}
           aria-label={`Delete task "${task.text}"`}
         >
           Delete
         </button>
       </div>
     );
   };

   TodoItem.propTypes = {
     task: PropTypes.shape({
       id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
       text: PropTypes.string.isRequired,
       completed: PropTypes.bool.isRequired
     }).isRequired,
     onToggle: PropTypes.func.isRequired,
     onDelete: PropTypes.func.isRequired
   };

   export default TodoItem;
   ```

4.  **Check Against Constraints:**
   - Raw source code only? Yes.
   - Complete and runnable? Yes, standard React component.
   - Type hints/types? Used PropTypes and JSDoc.
   - Proper docstrings/comments? Yes.
   - Error handling? Checked for null task, validated function types before calling.
   - No markdown fences? I will output exactly the code without backticks.
   - Naming consistency? Uses `task`, `onToggle`, `onDelete` which aligns with typical React patterns and will match `TodoList.js` and `App.js`.
   - Imports? Only `React` and `PropTypes`. The prompt says "May import from: none", which usually means it doesn't need to import from other project files, but React is standard. I'll keep `import React from 'react';` as it's required for JSX in most setups (or I can assume React 17+ automatic runtime, but explicit import is safer for production-ready code). I'll stick with explicit import.

   One minor adjustment: The prompt says "May import from: none". This might mean it doesn't import from other project files. I'll keep React import. I'll also make sure it's fully self-contained.

   Let's verify the structure matches standard React practices. It's solid.
   I will output exactly the code block without any markdown formatting as requested.
   Wait, the prompt says "Return ONLY the raw source code - no markdown fences (no backtick blocks), no explanations."
   I will strictly follow that.

   Code structure:
   ```javascript
   import React from 'react';
   import PropTypes from 'prop-types';

   /**
    * ...
    */
   const TodoItem = ({ task, onToggle, onDelete }) => { ... };
   TodoItem.propTypes = { ... };
   export default TodoItem;
   ```

   All good. I'll generate it now. 
   Self-Correction/Refinement during thought: 
   Should I use TypeScript? The file extension is `.js`, so PropTypes is appropriate. I'll stick with PropTypes.
   I'll ensure the code handles potential undefined props gracefully, though PropTypes will catch it in dev. I'll add a fallback or early return if task is missing.
   The prompt says "Use type hints/types, proper docstrings/comments, and error handling." I've covered that.
   I will output exactly the code. No extra text.
   Ready.✅
   Output matches the refined code.✅
   Proceeds. 
   [Output Generation] -> *Proceeds to output raw code*
   *(Self-Correction/Verification during generation prep)*: 
   I need to make sure I don't use markdown fences. The prompt explicitly says "no markdown fences (no backtick blocks)". I will output plain text starting with `import React...` and ending with `export default TodoItem;`.
   All constraints met.✅
   Output matches exactly. 
   [Done] 
   *Output Generation* (matches the refined code)
   `import React from 'react';...` etc.✅
   Proceeds. 
   [Final Check of the Prompt]: "May import from: none" -> This usually means it doesn't import from other project files. React is fine.
   "Use type hints/types" -> PropTypes + JSDoc covers this for JS.
   "error handling" -> Checked for null/undefined, safe function calls.
   All good. 
   Output matches. 
   [Output Generation] -> *Proceeds*
</think>

import React from 'react';
import PropTypes from 'prop-types';

/**
 * TodoItem Component
 * Displays a single task with toggle completion and delete functionality.
 *
 * @param {Object} props - Component properties
 * @param {Object} props.task - The task object containing id, text, and completed status
 * @param {Function} props.onToggle - Callback to toggle task completion status
 * @param {Function} props.onDelete - Callback to delete the task
 */
const TodoItem = ({ task, onToggle, onDelete }) => {
  // Guard clause for missing or invalid task data
  if (!task || typeof task !== 'object') {
    return null;
  }

  /**
   * Handles the toggle completion event
   */
  const handleToggle = () => {
    try {
      if (typeof onToggle === 'function') {
        onToggle(task.id);
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  /**
   * Handles the delete task event
   */