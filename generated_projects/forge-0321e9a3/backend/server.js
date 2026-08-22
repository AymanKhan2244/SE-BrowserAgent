<think>
Here's a thinking process:

1.  **Analyze User Input:**
   - **Role:** Senior Full-Stack Engineer
   - **Task:** Write complete source code for `backend/server.js`
   - **Project:** basic-todo-app (React frontend, Node.js/Express backend, in-memory storage)
   - **Entrypoint:** `backend/server.js`
   - **Run Command:** `cd backend && npm start`
   - **File Responsibility:** Express server entry point that configures middleware, routes, and serves the frontend in production mode
   - **May import from:** `backend/routes/tasks.js`, `backend/models/tasks.js`
   - **Strict Rules:**
     - Return ONLY raw source code (no markdown fences, no explanations)
     - Complete and runnable
     - Use type hints/types, proper docstrings/comments, error handling
     - Handle CORS
     - CRITICAL: Explicitly import and register all routes
     - Ensure exact naming consistency

2.  **Determine Requirements for `backend/server.js`:**
   - Import `express`, `cors`, `path`
   - Initialize Express app
   - Configure middleware: `cors()`, `express.json()`, `express.urlencoded({ extended: true })`
   - Import and register routes: `const taskRoutes = require('./routes/tasks'); app.use('/api/tasks', taskRoutes);`
   - Handle production mode: Serve static files from `frontend/build` if `process.env.NODE_ENV === 'production'`
   - Set up error handling middleware
   - Start server on a port (default 5000 or 3000, let's use 5000 to avoid conflict with React dev server, or 3000 with a fallback)
   - Add proper comments/docstrings
   - Ensure it's production-ready

3.  **Draft the Code (Mental Refinement):**
   ```javascript
   /**
    * backend/server.js
    * Express server entry point for the basic-todo-app.
    * Configures middleware, registers routes, and serves the frontend in production.
    */

   const express = require('express');
   const cors = require('cors');
   const path = require('path');
   const taskRoutes = require('./routes/tasks');

   const app = express();
   const PORT = process.env.PORT || 5000;

   // Middleware configuration
   app.use(cors());
   app.use(express.json());
   app.use(express.urlencoded({ extended: true }));

   // Register API routes
   app.use('/api/tasks', taskRoutes);

   // Serve frontend in production mode
   if (process.env.NODE_ENV === 'production') {
     app.use(express.static(path.join(__dirname, '../frontend/build')));

     // Handle React routing: return all requests to React app
     app.get('*', (req, res) => {
       res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
     });
   }

   // Global error handling middleware
   app.use((err, req, res, next) => {
     console.error(err.stack);
     res.status(err.status || 500).json({
       success: false,
       message: err.message || 'Internal Server Error',
     });
   });

   // Start server
   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });

   module.exports = app;
   ```

4.  **Check Against Constraints:**
   - *Return ONLY raw source code*: Yes, I will output just the code.
   - *Complete and runnable*: Yes, includes all necessary imports, middleware, route registration, static file serving, error handling, and server startup.
   - *Type hints/types*: JavaScript doesn't have built-in types, but I can add JSDoc comments for types if needed. The prompt says "Use type hints/types, proper docstrings/comments". I'll add JSDoc for clarity.
   - *Error handling*: Included global error middleware.
   - *CORS*: Handled with `cors()`.
   - *CRITICAL: Explicitly import and register routes*: `app.use('/api/tasks', taskRoutes);` does this.
   - *Naming consistency*: Uses standard Express patterns. Matches expected structure.
   - *Production mode*: Serves frontend build correctly.
   - *No markdown fences*: I will output raw text only.

   Let's refine with JSDoc and ensure it strictly matches the prompt's requirements. I'll also make sure the path to frontend build is correct relative to `backend/server.js`. The prompt says `frontend/build` is standard for Create React App. I'll use `path.join(__dirname, '../frontend/build')`.

   One minor thing: The prompt says "May import from: backend/routes/tasks.js, backend/models/tasks.js". The server doesn't strictly need to import the model directly if the routes/controllers handle it, but I'll stick to importing routes. The model is used internally by routes/controllers.

   I'll add JSDoc for types as requested.
   I'll ensure the code is exactly as required.

   Draft:
   ```javascript
   /**
    * @file Express server entry point for the basic-todo-app.
    * @description Configures middleware, registers API routes, and serves the React frontend in production mode.
    */

   const express = require('express');
   const cors = require('cors');
   const path = require('path');
   const taskRoutes = require('./routes/tasks');

   /** @type {import('express').Application} */
   const app = express();
   const PORT = process.env.PORT || 5000;

   // Configure middleware
   app.use(cors());
   app.use(express.json());
   app.use(express.urlencoded({ extended: true }));

   // Register API routes
   app.use('/api/tasks', taskRoutes);

   // Serve frontend static assets in production
   if (process.env.NODE_ENV === 'production') {
     const buildPath = path.join(__dirname, '../frontend/build');
     app.use(express.static(buildPath));

     // Handle client-side routing for React
     app.get('*', (req, res) => {
       res.sendFile(path.resolve(buildPath, 'index.html'));
     });
   }

   // Global error handling middleware
   app.use((err, req, res, next) => {
     console.error(`[ERROR] ${err.message}\n${err.stack}`);
     const statusCode = err.status || 500;
     res.status(statusCode).json({
       success: false,
       message: err.message || 'Internal Server Error',
     });
   });

   // Start the server
   app.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}`);
   });

   module.exports = app;
   ```

   Check constraints:
   - "Return ONLY the raw source code - no markdown fences (no backtick blocks), no explanations." -> I will output exactly the code without backticks.
   - "Use type hints/types, proper docstrings/comments, and error handling." -> Added JSDoc types and comments.
   - "CRITICAL: The entrypoint file MUST explicitly import and register all routes..." -> Done.
   - "Ensure cross-origin requests (CORS) are properly handled..." -> Done.
   - "If no database was requested, DO NOT use a database..." -> Not relevant to server.js, but consistent.
   - All good.

   One thing: The prompt says "May import from: backend/routes/tasks.js, backend/models/tasks.js". I'm importing `./routes/tasks`. That's correct.
   I will output the raw code now.
   I'll make sure there are absolutely no markdown formatting characters around the code block. Just the raw text.
   Ready.✅
   Output matches the draft.✅
   Proceeds. 
   Self-Correction/Verification during thought:
   - Should I include `process.env.NODE_ENV` check? Yes, standard for full-stack apps.
   - Should I export `app`? Yes, good practice for testing, and doesn't hurt.
   - The prompt says "no markdown fences". I will strictly output only the code text.
   - I'll ensure the code is exactly as drafted.
   - All constraints met.
   Output generation. 
   [Output Generation] -> *Proceeds*
   *(Note: I will carefully strip any markdown formatting from the final output as requested.)*
   Code:
   /**
    * @file Express server entry point for the basic-todo-app.
    * @description Configures middleware, registers API routes, and serves the React frontend in production mode.
    */

   const express = require('express');
   const cors = require('cors');
   const path = require('path');
   const taskRoutes = require('./routes/tasks');

   /** @type {import('express').Application} */
   const app = express();
   const PORT = process.env.PORT || 5000;

   // Configure middleware
   app.use(cors());
   app.use(express.json());
   app.use(express.urlencoded({ extended: true }));

   // Register API routes
   app.use('/api/tasks', taskRoutes);

   // Serve frontend static assets in production
   if (process.env.NODE_ENV === 'production') {
     const buildPath