# simple-todo-app

A minimal web‑based Todo List application built with pure HTML, CSS, and JavaScript. All data is stored locally in the browser using `localStorage`, so no server‑side code or database is required.

## Features
- Add new tasks
- Edit existing tasks
- Mark tasks as complete / incomplete
- Delete tasks
- Persistent storage via `localStorage`
- Responsive layout for desktop and mobile devices
- No external dependencies or build tools

## Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari, etc.)
- Python 3 (only for serving the static files locally; any static file server will work)

## Installation
1. Clone the repository or download the source files.

   ```bash
   git clone https://github.com/yourusername/simple-todo-app.git
   cd simple-todo-app
   ```

2. No additional packages need to be installed. The project consists solely of static files.

## Running the Application
Serve the files with Python’s built‑in HTTP server:

```bash
python -m http.server 8000
```

Open your browser and navigate to `http://localhost:8000`. The Todo app will load automatically.

*If you prefer another static server (e.g., `live-server`, `http-server`, or a Docker container), feel free to use it – just point it at the project root.*

## Project Structure

```
simple-todo-app/
├─ index.html      # Entry point – loads CSS & JS, defines UI layout
├─ style.css       # Responsive styling
├─ storage.js      # localStorage CRUD helpers
├─ ui.js           # DOM rendering and UI updates
├─ app.js          # Application bootstrap and event wiring
├─ README.md       # This file
└─ .gitignore      # Git ignore rules
```

## Development Notes
- All JavaScript modules use ES6 module syntax (`type="module"` in `index.html`).
- The app state is kept in an in‑memory array of objects; changes are synced to `localStorage` after each operation.
- Error handling is performed in each module to avoid uncaught exceptions that could break the UI.
- The CSS is mobile‑first and uses flexbox for layout, ensuring the app works well on small screens.

## Contributing
Feel free to open issues or submit pull requests. When contributing:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes with clear messages.
4. Push to your fork and open a pull request.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.