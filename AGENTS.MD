# AGENTS.MD

## Overview
This repository contains two separate task-management applications that share the same domain idea but are independent projects:

1. The Java application is a terminal-based TODO list manager for creating boards, managing tasks, tracking status, and saving work locally.
2. The JavaScript frontend is a standalone browser UI prototype for visualizing and interacting with task boards in the browser.

Java application capabilities:
- Create and switch between task boards
- Add, delete, and inspect tasks
- Set task status: TODO, DOING, DONE
- Set priority (1 to 5)
- Add category and description metadata
- View tasks grouped by status, priority, or category
- Create scheduled alarms for tasks
- Persist task data to local files on disk so boards remain available across runs

JavaScript frontend capabilities:
- Render task boards in the browser
- Create and switch between board views
- Add or edit task data through form controls
- Display tasks by status, priority, or category
- Manage task selection and visual updates in the UI
- Model the same task structure as the Java app without being a runtime dependency of it

The two applications are intentionally separate and should be treated as parallel implementations rather than a single layered system.

---

## Project Stack + Structure

### Stack
- Java application: Java source code, Gradle, and JUnit 5
- JavaScript frontend: HTML, CSS, and JavaScript, with Playwright for automated browser tests
- Both are independent application tracks with their own runtime model and entry points

### Repository structure
- Java application:
  - `src/main/java/org/henrique/Main.java` — Java entry point
  - `src/main/java/org/henrique/classes/` — domain model
    - `Tarefa.java` — task entity
    - `Quadro_de_tarefas.java` — task board entity
  - `src/main/java/org/henrique/terminal/` — command parsing and CLI flow
    - `Terminal.java`
    - `modo_term.java`
    - `modo_listagem.java`
  - `src/main/java/org/henrique/permanencia/` — persistence layer
    - `Permanencia.java`
  - `src/main/java/org/henrique/alarme/` — alarm logic
    - `Alarme.java`
  - `build.gradle` — Java app build configuration
  - `gradlew` / `gradlew.bat` — Gradle wrapper
  - `settings.gradle` — Gradle project settings

- JavaScript frontend:
  - `frontend/index.html` — browser page shell
  - `frontend/main.js` — browser-side behavior and task UI logic
  - `frontend/style.css` — browser styling

### Execution model
- Java app: runs via Gradle or an IDE Java launcher.
- JavaScript app: runs in a browser by opening `frontend/index.html` or serving the folder as static assets.
- Neither runtime is the dependency or backend of the other; they are two separate implementations of the same todo-board concept.

### Persistence model
The persistence layer stores each board and task as directory/file structures in a configured filesystem path. The main code defines a path in `Main.java`; that directory must exist or be created before runtime. Task records are saved as individual folders containing metadata files such as:
- `desc`
- `status`
- `categoria`
- `prioridade`
- `data_termino`
- `alarmes`

---

## How to run it

### Prerequisites
- Java JDK installed
- Gradle available, or use the included Gradle wrapper

### Run from terminal
1. Open the project root
2. Update the persistence path in `src/main/java/org/henrique/Main.java` to a valid local folder
3. Run:

```bash
./gradlew run -q --console=plain
```

Alternative:
- Open the project in IntelliJ IDEA
- Run `Main.java` with the IDE runner

### Run frontend browser tests
After the Playwright test setup is added, install JavaScript dependencies and the Chromium browser once:

```bash
npm ci
npx playwright install chromium
npm test
```

The Playwright suite covers the independent browser frontend; it does not run or depend on the Java application.

### Notes
- The Java app is the terminal-driven implementation and loads saved boards from the configured persistence path on startup.
- The JavaScript app is the browser-based implementation and can be opened directly or served as static files.
- `frontend/` is not a backend layer and is not required for the Java app to run.
- Both are valid project entry points, but they are independent.

---

## Conventions

### Naming conventions
The codebase follows a legacy naming style that mixes Portuguese and lower snake_case patterns.

Examples:
- `Quadro_de_tarefas`
- `Tarefa`
- `listar_tarefas()`
- `append_tarefa()`
- `data_termino`
- `prioridade`

Keep these naming patterns unless a task explicitly requires a refactor.

### Class and module structure
- Java app domain objects stay under `org.henrique.classes`
- Java CLI logic stays under `org.henrique.terminal`
- Java persistence logic stays under `org.henrique.permanencia`
- Java alarm logic stays under `org.henrique.alarme`
- Java entry point remains `org.henrique.Main`
- Browser app logic stays in `frontend/main.js` and the HTML/CSS files under `frontend/`

### Code style
- Prefer explicit, readable logic over abstraction
- Keep CLI command behavior compatible with the current Java terminal terminology (`novo`, `del`, `modo`, `ver`, `alarme`, etc.)
- Use simple Java structures and avoid unnecessary frameworks in the Java app
- Maintain compatibility with the existing Java file-based persistence system
- Keep status strings consistent: `TODO`, `DOING`, `DONE`
- Keep priority values within the supported range of `1` to `5`
- Keep JavaScript frontend changes isolated to the browser prototype and avoid assuming shared runtime wiring with the Java app

### Domain assumptions
- A task belongs to a board
- A board can contain multiple tasks
- A task has a name, description, category, priority, status, and optional alarms
- The app is designed as a simple local utility rather than a distributed or enterprise system

---

## Agent restrictions
- Treat the Java app and the `frontend/` app as separate projects with separate execution paths
- Do not assume a backend/frontend relationship or shared API between them unless a task explicitly introduces one
- Do not break the Java CLI command behavior unless a task explicitly requires it
- Do not change the Java persistence format without updating the related logic and documentation
- Do not edit generated files or build output under `build/` or `bin/`
- Keep Java changes compatible with Gradle and Java runtime expectations
- Keep JavaScript frontend changes limited to the browser prototype and its DOM/UI logic
- Avoid broad refactors that rename core domain classes or packages without explicit request
- Preserve the project’s existing legacy naming conventions and Portuguese command structure in the Java app
- Preserve the browser-side naming and UI structure in the frontend when updating JS behavior
- Prefer smallest targeted fixes over sweeping rewrites
- When updating either app, stay inside that app’s own folder and runtime boundaries

---

This file is meant to guide repository-aware agents and maintain the current project’s expectations, architecture, and behavior while minimizing accidental regressions.
