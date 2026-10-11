# LocalStorage persistence for task boards

## 1. Context and objective

This feature targets the frontend application only. Its goal is to make task-board state persist across browser sessions without requiring a backend or server.

Today, the frontend can create and manipulate boards and tasks in memory while the page is open. Once the page is refreshed or reopened, the current state is lost. This makes the app unreliable for real usage, especially when users expect their work to remain after a reload.

The objective of this feature is to:
- save the complete board state in browser localStorage;
- persist after each CRUD operation on a board and its child tasks;
- restore the saved state automatically when the page loads or reloads;
- keep the interface behavior consistent with the in-memory app logic, while making persistence transparent to the user.

This feature solves the problem of data loss during page refreshes, browser restarts, and temporary navigation away from the app.

---

## 2. Business rules and edge cases

### Core persistence behavior
- The application must save its state to localStorage after every successful create, update, delete, or rename action performed on a board or any task that belongs to it.
- The state must be restored from localStorage when the app initializes.
- If no saved state exists, the app should start with the default empty state.
- If localStorage contains malformed or partial data, the app must fail safely and recover to a valid empty/default state without breaking the UI.

### Data model expectations
- A board is the top-level persisted entity.
- A board contains zero or more tasks.
- A task belongs to one board and stores fields such as name, description, status, category, priority, and alarm metadata.
- The persisted representation must preserve task relationships and board membership.

### Save triggers
The state must be saved after any mutation, including:
- creating a new board;
- switching active board;
- renaming a board;
- deleting a board;
- creating a task;
- editing a task;
- deleting a task;
- changing task status, category, priority, description, or alarm data;
- any other operation that changes the visual or logical state of a board.

### Restore behavior
- On load, the app should read its saved state from localStorage.
- If the stored data is valid, the app should render the last valid saved board state.
- If the saved state is absent, invalid, or corrupted, the app should initialize a clean state and notify the user that the previous state could not be restored.
- The app should not restore a preselected board automatically after startup. Instead, it should open with no board selected and allow the user to choose a board manually.
- The persisted data should focus on board and task content only; transient UI state such as current selection or display mode is intentionally not persisted.

### Edge cases
- Empty state: no boards, no tasks, nothing stored in localStorage.
- Fresh session after a previous save: data is recovered automatically on page load.
- Partial corruption: localStorage contains an unexpected structure or a missing property; the app should warn the user and fall back to a safe empty/default state instead of crashing.
- Duplicate names: board and task names must be unique according to the app rules, and invalid duplicates must be rejected before persistence.
- Deletion scenarios: when a board or task is removed, the persisted state must also remove it immediately and not leave stale references behind.
- Repeated reload: the app should consistently preserve the last valid state and not duplicate or corrupt board entries across reloads.
- Schema mismatch: if version metadata indicates a different schema, the app should warn the user and avoid interpreting the old structure as valid.
- Browser restrictions: if localStorage is unavailable or blocked, the app should degrade gracefully and continue to function without persistence rather than crashing.

### Storage design rules
- Use a dedicated key for the app state, for example a single application-level key such as `todoAppState` or a namespaced structure.
- The stored payload should be a JSON-serializable snapshot of the current board/task state, plus a version field to detect incompatible schema changes.
- Example shape:

```json
{
  "version": 1,
  "boards": [
    {
      "id": "board-1",
      "name": "Trabalho",
      "tasks": []
    }
  ]
}
```

- The app should avoid persisting transient UI-only state that does not affect task data and expected behavior.
- If the saved payload version differs from the expected app version, the app should warn the user and recover gracefully instead of crashing or silently reading incompatible data.

---

## 3. Acceptance criteria

### Functional acceptance criteria
1. When the user creates a new board, the board is persisted immediately.
2. When the user updates task data, the updated value is persisted immediately.
3. When the user deletes a board or task, the state reflects the removal in localStorage.
4. When the page is refreshed, the last saved valid state is restored automatically.
5. When the page is opened for the first time, the app starts with a clean empty state if no saved state exists.
6. The app must not lose data after a normal reload or browser restart when the browser supports localStorage.
7. If stored JSON is invalid, the app warns the user and restores a safe empty/default state instead of crashing.
8. If the persisted schema version does not match the current app version, the app warns the user and handles the mismatch gracefully.
9. Duplicate board or task names are rejected according to the application rules and are not persisted as invalid duplicates.
10. The save and restore flow must be transparent to the user; no manual export/import step is required.

### UI acceptance criteria
1. The current board list and task list reflect the persisted state after reload.
2. On initial startup, no board is automatically selected; the user chooses a board manually.
3. The interface continues to work normally even when restoration occurs on startup.
4. Invalid persisted data results in a visible warning and a safe reset without breaking the interface.

### Technical acceptance criteria
1. The persistence layer should use browser localStorage as the storage mechanism.
2. Write operations should happen in response to actual state mutations, not on a timer that is too slow or too infrequent.
3. The app should serialize and deserialize the state in a deterministic format.
4. The implementation should be testable in the browser and resilient to malformed data.

---

## 4. Impacts

This change can affect multiple existing frontend behaviors and should be treated as a state-management improvement rather than a cosmetic enhancement.

### Functional impacts
- Board creation and deletion flows must trigger a save after each mutation.
- Task CRUD operations must trigger a save after the mutation completes successfully.
- The app load path must initialize from localStorage before rendering or display state.
- Board selection and task selection may need to be restored as part of the saved snapshot.
- Any logic that relies on in-memory state only may need to be refactored to read from a single canonical app state.

### UI impacts
- The page must load a saved snapshot instead of assuming a brand-new empty app each time.
- If a reload occurs while a task is being edited, the state should still be consistent after restoration.
- If the user deletes items while the app is rehydrating, the startup sequence should not re-insert stale data.

### Risk areas
- Duplicate names or invalid task metadata may be stored if the app persists state without validation.
- A partial save may leave the app with stale or inconsistent data.
- Over-saving on every minor interaction could have performance implications, although this is usually low for a small app.
- Persisting UI-only transient values could create noise and make restoration unpredictable.

---

## 5. Scope

### In scope
- Persisting board and task state in browser localStorage.
- Saving after CRUD operations.
- Restoring the app state on page load and reload.
- Handling empty and malformed stored data safely.
- Supporting the current frontend task-board flow without introducing a backend dependency.

### Out of scope
- Server-side persistence or database storage.
- Syncing data between multiple browsers or devices.
- Export/import to JSON files.
- Encryption or security-sensitive storage.
- Storing non-domain UI state that is not essential to the user’s task-board experience.
- Reworking the Java app or introducing cross-language data sharing.

---

## 6. Finalized decisions

These decisions are now confirmed for implementation:
- The feature is frontend-only and does not affect the Java CLI app.
- The app persists a single JSON object under one localStorage key, including a `version` field.
- The persisted payload includes board and task data only; currently selected UI state is intentionally not restored.
- Board and task names must be unique according to the application rules.
- Invalid or outdated storage data should trigger a warning and fall back to a safe empty/default state.
- On startup, the app should open without an automatic board selection; the user chooses a board manually.
- The app may serialize the state in a slightly normalized format as long as it preserves the user-visible board/task behavior.
