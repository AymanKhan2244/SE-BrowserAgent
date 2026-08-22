<think>
Here's a thinking process:

1.  **Analyze User Input:**
   - **Project:** basic-todo-app
   - **Tech Stack:** Node.js/Express (backend), React (frontend), In-memory storage
   - **File to Write:** `backend/controllers/tasks.js`
   - **Responsibility:** Handles request/response logic for task CRUD operations
   - **May import from:** `backend/models/tasks.js`
   - **Rules:** Production-ready, complete, no markdown fences, proper error handling, type hints/comments, exact naming consistency, in-memory storage (no DB), CORS handled elsewhere (but controller should be robust).

2.  **Understand the Role of the Controller:**
   - In an MVC-like Express structure, the controller receives `req` and `res` objects.
   - It extracts data from `req.body`, `req.params`, etc.
   - It calls the model layer to perform CRUD operations.
   - It sends appropriate JSON responses with status codes.
   - It handles errors gracefully.

3.  **Determine Model Interface (based on typical in-memory task model):**
   - Since I'm writing the controller, I need to assume a reasonable interface for `backend/models/tasks.js`.
   - Typical methods: `getAll()`, `getById(id)`, `create(taskData)`, `update(id, taskData)`, `delete(id)`.
   - I'll design the controller to call these methods. I'll add JSDoc comments to clarify expected model methods.

4.  **Draft the Controller Code (Mental Refinement):**
   ```javascript
   const TaskModel = require('../models/tasks');

   /**
    * Get all tasks
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    */
   const getAllTasks = async (req, res) => {
     try {
       const tasks = await TaskModel.getAll();
       res.status(200).json(tasks);
     } catch (error) {
       res.status(500).json({ message: 'Error fetching tasks', error: error.message });
     }
   };

   /**
    * Get a single task by ID
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    */
   const getTaskById = async (req, res) => {
     try {
       const task = await TaskModel.getById(req.params.id);
       if (!task) {
         return res.status(404).json({ message: 'Task not found' });
       }
       res.status(200).json(task);
     } catch (error) {
       res.status(500).json({ message: 'Error fetching task', error: error.message });
     }
   };

   /**
    * Create a new task
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    */
   const createTask = async (req, res) => {
     try {
       const { title, completed } = req.body;
       if (!title || typeof title !== 'string' || title.trim() === '') {
         return res.status(400).json({ message: 'Title is required and must be a non-empty string' });
       }
       const newTask = await TaskModel.create({ title: title.trim(), completed: completed || false });
       res.status(201).json(newTask);
     } catch (error) {
       res.status(500).json({ message: 'Error creating task', error: error.message });
     }
   };

   /**
    * Update an existing task
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    */
   const updateTask = async (req, res) => {
     try {
       const { title, completed } = req.body;
       const updates = {};
       if (title !== undefined) {
         if (typeof title !== 'string' || title.trim() === '') {
           return res.status(400).json({ message: 'Title must be a non-empty string' });
         }
         updates.title = title.trim();
       }
       if (completed !== undefined) {
         if (typeof completed !== 'boolean') {
           return res.status(400).json({ message: 'Completed must be a boolean' });
         }
         updates.completed = completed;
       }

       const updatedTask = await TaskModel.update(req.params.id, updates);
       if (!updatedTask) {
         return res.status(404).json({ message: 'Task not found' });
       }
       res.status(200).json(updatedTask);
     } catch (error) {
       res.status(500).json({ message: 'Error updating task', error: error.message });
     }
   };

   /**
    * Delete a task
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    */
   const deleteTask = async (req, res) => {
     try {
       const deleted = await TaskModel.delete(req.params.id);
       if (!deleted) {
         return res.status(404).json({ message: 'Task not found' });
       }
       res.status(200).json({ message: 'Task deleted successfully' });
     } catch (error) {
       res.status(500).json({ message: 'Error deleting task', error: error.message });
     }
   };

   module.exports = {
     getAllTasks,
     getTaskById,
     createTask,
     updateTask,
     deleteTask
   };
   ```

5.  **Check Against Requirements:**
   - **Path:** `backend/controllers/tasks.js`
   - **Responsibility:** Handles request/response logic for task CRUD
   - **Imports:** `backend/models/tasks.js` (used as `../models/tasks`)
   - **Production-ready:** Yes, includes validation, error handling, proper status codes, JSDoc types.
   - **No markdown fences:** I will output raw code only.
   - **In-memory:** The controller doesn't care about storage, but it's designed to work with an in-memory model.
   - **CORS:** Handled in server.js, but controller is standard.
   - **Naming consistency:** Uses standard RESTful naming. I'll ensure the exported names match typical route definitions.
   - **Async/Await:** Used consistently. Even though in-memory is sync, using async/await in controllers is standard practice and allows easy DB migration later. I'll keep it async but note that the model can be sync or async. Actually, for simplicity and strict in-memory, I could make it sync, but async is fine. I'll stick with async/await as it's standard in Express.

   Let's refine the code to ensure it's strictly compliant and robust. I'll add proper JSDoc for Express types. I'll make sure validation is solid. I'll ensure the model interface is clearly documented in comments so the rest of the project aligns.

   One thing: The prompt says "May import from: backend/models/tasks.js". I'll use `const TaskModel = require('../models/tasks');`.

   I'll structure it cleanly.

   Check validation:
   - `createTask`: checks title
   - `updateTask`: checks title/completed types
   - `getTaskById`/`deleteTask`: checks existence
   - All catch errors and return 500 with message.

   This looks solid. I will output exactly the code block without markdown.

   Wait, the prompt says "Return ONLY the raw source code - no markdown fences (no backtick blocks), no explanations."
   I will strictly follow that.

   Let's write it out carefully.
   I'll add comments explaining the expected model interface for clarity.
   I'll use standard Express request/response types in JSDoc.
   I'll ensure no placeholders.

   Code structure:
   ```javascript
   const TaskModel = require('../models/tasks');

   /**
    * Retrieves all tasks from the in-memory store.
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    */
   const getAllTasks = async (req, res) => {
     try {
       const tasks = await TaskModel.getAll();
       res.status(200).json(tasks);
     } catch (error) {
       res.status(500).json({ message: 'Failed to retrieve tasks', error: error.message });
     }
   };

   /**
    * Retrieves a single task by its unique identifier.
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    */
   const getTaskById = async (req, res) => {
     try {
       const task = await TaskModel.getById(req.params.id);
       if (!task) {
         return res.status(404).json({ message: 'Task not found' });
       }
       res.status(200).json(task);