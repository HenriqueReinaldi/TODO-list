# LocalStorage Implementation Plan

This plan implements the frontend-only feature in `docs/features/localstorage/spec.md`. The Java CLI and its persistence format remain unchanged. Persist board and task content under one versioned localStorage key; do not persist the active board, selected task, or display mode. Although the save-trigger list mentions switching boards, the finalized restore decisions explicitly make selection transient, so switching alone does not change persisted domain state and does not require a save.

The Playwright setup established in Task 1 is shared with `docs/plans/selecionar_varias/plan.md`. Run all browser tests with `npm test`; during development, run a focused spec with `npm test -- frontend/tests/localstorage.spec.js --grep "test title"`. Install dependencies with `npm ci` and install Chromium with `npx playwright install chromium`.

## Tasks

### 1. Set up shared Playwright browser testing

- **What:** Add the Playwright test runner, a repeatable npm test command, browser configuration, and a lightweight local static server so tests exercise the real frontend over HTTP. Add a smoke test that opens the app and confirms its core page loads. Keep test infrastructure shared with the multi-selection feature.
- **Files:** Create or modify `package.json`, `package-lock.json`, `playwright.config.js`, `frontend/tests/server.js`, and `frontend/tests/smoke.spec.js`.
- **Done check:** Run `npm ci`, `npx playwright install chromium`, and `npm test -- frontend/tests/smoke.spec.js`; the browser starts, loads `frontend/index.html` from the test server, and the smoke test passes.

### 2. Add the versioned persistence adapter

- **What:** Create a browser-side adapter that reads and writes a deterministic `{ version, boards }` JSON snapshot under one namespaced localStorage key. Validate the schema; distinguish missing data from malformed JSON and schema-version mismatch. Catch unavailable/blocked localStorage and serialization/write errors so they do not crash the app. Persist board/task content only.
- **Files:** Create `frontend/storage.js`; modify `frontend/index.html` to load it before `frontend/main.js`; create `frontend/tests/localstorage.spec.js` with storage-adapter behavior tests.
- **Done check:** Run `npm test -- frontend/tests/localstorage.spec.js --grep "storage payload"`. Automated browser tests verify valid round-trip serialization, missing-key behavior, malformed JSON, invalid structure, version mismatch, and storage exceptions; invalid/inaccessible data produces a safe result without an uncaught page error.

### 3. Establish canonical frontend state and startup restoration

- **What:** Replace board data stored only on DOM button properties with a canonical in-memory board collection. Load it through the adapter before rendering. Keep active-board, selected-task, and display-mode state transient, start with no board selected, and render restored boards for manual selection. Give boards and tasks stable IDs while preserving visible fields.
- **Files:** Modify `frontend/main.js`; extend `frontend/tests/localstorage.spec.js` with startup and reload tests.
- **Done check:** Run `npm test -- frontend/tests/localstorage.spec.js --grep "startup restores"`. Tests cover a clean empty first run and valid saved data after reload, assert that no board is auto-selected, and verify selection/display mode are not restored.

### 4. Persist board creation, rename, and deletion

- **What:** Save after successful board creation, rename, or deletion. Add minimal controls for rename/delete because these operations are required but not currently exposed. Reject blank and duplicate names before mutation or persistence using one documented normalization rule.
- **Files:** Modify `frontend/main.js` and `frontend/index.html`; extend `frontend/tests/localstorage.spec.js` with board CRUD tests.
- **Done check:** Run `npm test -- frontend/tests/localstorage.spec.js --grep "board CRUD"`. Tests perform each operation, inspect localStorage, reload to verify persistence, reject blank/duplicate names without changing state, and verify deleting the active board leaves no stale selection or task view.

### 5. Persist task creation, editing, and deletion

- **What:** Save the containing board snapshot after task creation, editing, or deletion. Reject blank and duplicate task names within a board. Preserve status, category, priority, description, and alarm data; do not add an alarm when the alarm checkbox is unchecked.
- **Files:** Modify `frontend/main.js`; extend `frontend/tests/localstorage.spec.js` with task CRUD tests.
- **Done check:** Run `npm test -- frontend/tests/localstorage.spec.js --grep "task CRUD"`. Tests create, edit, and delete tasks; verify each stored payload and reload result; reject blank/duplicate names; and assert unchecked alarm creation does not add an alarm.

### 6. Surface recovery and persistence warnings

- **What:** Show a visible, non-blocking warning when stored data is malformed, has an incompatible version, or cannot be accessed/saved. Continue with safe in-memory state and no uncaught errors. Do not warn when storage is simply empty on first visit.
- **Files:** Modify `frontend/index.html` and `frontend/main.js`; extend `frontend/tests/localstorage.spec.js` with recovery/failure tests.
- **Done check:** Run `npm test -- frontend/tests/localstorage.spec.js --grep "recovery warning"`. Tests seed corrupt and mismatched payloads and simulate blocked/throwing storage; they assert the warning is visible, the app remains usable, and the clean first-run state does not show a corruption warning.

### 7. Run the shared persistence regression suite

- **What:** Complete the Playwright coverage for the persistence acceptance criteria and ensure it runs alongside the multi-selection spec using the same configuration and server. Do not add a separate manual-only HTML test harness.
- **Files:** Update `frontend/tests/localstorage.spec.js` and shared test configuration only as needed.
- **Done check:** Run `npm test`. All local-storage and shared frontend browser tests pass, including CRUD persistence, reload restoration, no automatic board selection, duplicate rejection, malformed/version-mismatched payload recovery, and unavailable-storage behavior.
