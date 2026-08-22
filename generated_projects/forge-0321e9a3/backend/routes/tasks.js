<think>
Here's a thinking process:

1.  **Analyze User Input:**
   - **Project:** basic-todo-app
   - **File to Write:** `backend/routes/tasks.js`
   - **Responsibility:** Defines REST API endpoints for task CRUD operations
   - **May import from:** `backend/controllers/tasks.js`
   - **Tech Stack:** Node.js with Express (backend), React (frontend), In-memory storage
   - **Strict Rules:** 
     - Return ONLY raw source code (no markdown, no explanations)
     - Complete and runnable
     - Use proper comments/docstrings
     - Handle CORS if needed (though usually handled in server.js, routes just define endpoints)
     - Ensure exact naming consistency
     - No placeholders/TODOs

2.  **Determine File Structure & Content:**
   - This is an Express router file.
   - It should import `express` and the task controller.
   - It should define routes for:
     - `GET /` - Get all tasks
     - `POST /` - Create a new task
     - `GET /:id` - Get a specific task
     - `PUT /:id` - Update a task
     - `DELETE /:id` - Delete a task
   - It should export the router.
   - Need to ensure it matches the controller functions expected in `backend/controllers/tasks.js`. Since I'm writing this file, I'll assume standard controller function names: `getAllTasks`, `createTask`, `getTaskById`, `updateTask`, `deleteTask`. I'll make sure the route handlers call these.

3.  **Draft the Code (Mental Refinement):**
   ```javascript
   const express = require('express');
   const router = express.Router();
   const taskController = require('../controllers/tasks');

   /**
    * @route   GET /api/tasks
    * @desc    Get all tasks
    * @access  Public
    */
   router.get('/', taskController.getAllTasks);

   /**
    * @route   POST /api/tasks
    * @desc    Create a new task
    * @access  Public
    */
   router.post('/', taskController.createTask);

   /**
    * @route   GET /api/tasks/:id
    * @desc    Get a task by ID
    * @access  Public
    */
   router.get('/:id', taskController.getTaskById);

   /**
    * @route   PUT /api/tasks/:id
    * @desc    Update a task
    * @access  Public
    */
   router.put('/:id', taskController.updateTask);

   /**
    * @route   DELETE /api/tasks/:id
    * @desc    Delete a task
    * @access  Public
    */
   router.delete('/:id', taskController.deleteTask);

   module.exports = router;
   ```

4.  **Check Against Constraints:**
   - Only raw source code? Yes.
   - Complete and runnable? Yes, standard Express router.
   - Proper comments? Yes, JSDoc style.
   - Matches controller imports? Yes, assumes standard names. I'll make sure the names are consistent with typical Express patterns. The prompt says "May import from: backend/controllers/tasks.js". I'll use `require('../controllers/tasks')`.
   - No markdown fences? I will output just the code.
   - Cross-origin? Handled in server.js typically, but routes don't need to do anything special.
   - Exact naming consistency? I'll stick to standard RESTful naming.

   One thing to consider: The prompt says "CRITICAL: The entrypoint file... MUST explicitly import and register all routes". That's for `server.js`, not this file. For this file, I just need to export the router.

   I'll add basic error handling/validation if needed, but typically that's in the controller. The route file just maps HTTP methods to controller functions. I'll keep it clean and standard.

   Let's verify the exact path: `backend/routes/tasks.js`
   Imports: `express`, `../controllers/tasks`
   Exports: `router`

   All good. I will generate the raw code now.
   I'll make sure there are absolutely no markdown backticks or extra text.
   I'll add a brief comment at the top if needed, but keep it strictly code.
   Ready.✅
   Output matches the draft.✅
   Proceeds. 
   Self-Correction/Refinement during thought: 
   Should I include any middleware in the route file? Usually not necessary for a basic todo app. The controller handles the logic. I'll stick to the standard router setup.
   I'll ensure the code is exactly as requested.
   Output generation. 
   [Code Generation] -> *Proceeds*
   *(Note: I will strictly output only the JavaScript code without any markdown formatting as requested.)*
   Wait, the prompt says "Return ONLY the raw source code - no markdown fences (no backtick blocks), no explanations." I will comply exactly.
   Let's produce it. 
   ```javascript
   const express = require('express');
   const router = express.Router();
   const taskController = require('../controllers/tasks');

   /**
    * @route   GET /api/tasks
    * @desc    Retrieve all tasks from in-memory storage
    * @access  Public
    */
   router.get('/', taskController.getAllTasks);

   /**
    * @route   POST /api/tasks
    * @desc    Create a new task
    * @access  Public
    */
   router.post('/', taskController.createTask);

   /**
    * @route   GET /api/tasks/:id
    * @desc    Retrieve a single task by its unique identifier
    * @access  Public
    */
   router.get('/:id', taskController.getTaskById);

   /**
    * @route   PUT /api/tasks/:id
    * @desc    Update an existing task's properties
    * @access  Public
    */
   router.put('/:id', taskController.updateTask);

   /**
    * @route   DELETE /api/tasks/:id
    * @desc    Remove a task from in-memory storage
    * @access  Public
    */
   router.delete('/:id', taskController.deleteTask);

   module.exports = router;
   ```
   This matches all requirements. I will output it exactly. No extra text. No markdown. Just the code.
   One minor thing: The prompt says "no markdown fences". I will literally just paste the code.
   Done. 
   Output matches exactly.✅
   Proceeds. 
   [Output Generation] -> *Outputs raw code*
   *(Self-Correction/Verification during generation prep)*: I need to make sure I don't accidentally include markdown. I will just output the raw text.
   All good. 
   Output matches the draft.✅
   [Final Check of the Prompt]: "Return ONLY the raw source code - no markdown fences (no backtick blocks), no explanations."
   I will strictly follow this.
   Code is ready.✅
   Proceeds. 
   [Output Generation] -> *Outputs code*
   *(Note: I'll make sure the formatting is exact.)*
   `const express = require('express');...` etc.
   Done. 
   [Output] -> *Proceeds*
</think>

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/tasks');

/**
 * @route   GET /api/tasks
 * @desc    Retrieve all tasks from in-memory storage
 * @access  Public
 */
router.get('/', taskController.getAllTasks);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Public
 */
router.post('/', taskController.createTask);

/**
 * @route   GET /api/tasks/:id
 * @desc    Retrieve a single task by its unique identifier
 * @access  Public
 */
router.get('/:id', taskController.getTaskById);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update an existing task's properties
 * @access  Public
 */
router.put('/:id', taskController.updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Remove a task from in-memory storage
 * @access  Public
 */
router.delete('/:id', taskController.deleteTask);

module.exports = router;