# Multi-Task Selection Implementation Plan

This plan implements `docs/features/selecionar_varias/spec.md` in the browser frontend only. The Java CLI remains unchanged. Multi-selection applies only within the currently selected board; changing boards clears task selection. A plain click selects one task, while Control-click on Windows/Linux or Command-click on macOS toggles a task in the selection. The task name remains non-editable, and bulk updates are limited to status, category, and priority.

Use the shared Playwright setup, server, and `npm test` command defined in `docs/plans/localstorage/plan.md`; do not add a second runner or test harness. Install dependencies with `npm ci` and Chromium with `npx playwright install chromium`. Add selection tests in `frontend/tests/multiselect.spec.js`. Focused checks can be run with `npm test -- frontend/tests/multiselect.spec.js --grep "test title"`.

## Tasks

### 1. [x] Replace the single-task reference with selection state

- **What:** Replace the single `tarefa_selecionada` value with a collection of selected task references. Add small helpers to set, toggle, clear, and count the current selection. Clear selection when switching boards or when selected tasks are deleted; keep references valid when the task list is re-rendered or regrouped.
- **Files:** Modify `frontend/main.js`; create `frontend/tests/multiselect.spec.js` with selection-state tests.
- **Done check:** Run `npm test -- frontend/tests/multiselect.spec.js --grep "selection state"`. Playwright selects tasks, changes display modes, switches boards, and deletes a selected task; assertions verify no stale selection remains and valid selection survives re-rendering.

### 2. [x] Add modifier-based selection and visual feedback

- **What:** Make task buttons support plain-click single selection and Control-click/Command-click add-or-remove selection. Apply a selected class or attribute to every rendered button whose task is selected, including after re-rendering. Keep selection scoped to the active board.
- **Files:** Modify `frontend/main.js` and `frontend/style.css`; extend `frontend/tests/multiselect.spec.js` with modifier-interaction and highlight checks.
- **Done check:** Run `npm test -- frontend/tests/multiselect.spec.js --grep "modifier selection"`. Playwright verifies plain-click selects only one task, modifier-click adds and toggles tasks, and all/only selected tasks have the blue highlight after changing display modes.

### 3. Make the editor reflect zero, one, and multiple selections

- **What:** Define editor state for each selection count. With no selection, clear/reset the editor and prevent task updates. With one selected task, populate its fields and keep its name read-only or otherwise excluded from editing. With multiple tasks, show neutral values and a concise multi-edit message; disable or hide name, description, alarm, and alarm-creation controls while leaving status, category, and priority available.
- **Files:** Modify `frontend/main.js` and `frontend/index.html`; extend `frontend/tests/multiselect.spec.js` with editor-mode checks.
- **Done check:** Run `npm test -- frontend/tests/multiselect.spec.js --grep "editor modes"`. Playwright checks zero, one, and multiple selections, verifies fields and messaging for each state, ensures prior single-task values are cleared in bulk mode, and confirms task names cannot be changed.

### 4. Apply bulk edits immediately and guard single-task actions

- **What:** In multi-selection mode, apply category, priority, or status changes immediately to every selected task, re-render, and retain selection. Ensure bulk handling cannot modify name, description, or alarms, including through programmatic field changes. Preserve the explicit Save flow for one selected task; restrict deletion to one selected task unless the UI explicitly defines otherwise.
- **Files:** Modify `frontend/main.js` and, if needed, `frontend/index.html`; extend `frontend/tests/multiselect.spec.js` with bulk-edit and single-edit tests.
- **Done check:** Run `npm test -- frontend/tests/multiselect.spec.js --grep "bulk editing"`. Playwright starts with mixed selected-task values, changes each supported field, and verifies all selected tasks update immediately and remain selected. It verifies unsupported fields do not mutate tasks and single-task Save affects only that task.

### 5. Verify selection clearing and regression behavior

- **What:** Add automated regression coverage for clearing selection and for task creation, single-task editing, deletion, and status/priority/category display modes. Keep tests in the shared Playwright suite; do not rely on a manual-only browser pass.
- **Files:** Extend `frontend/tests/multiselect.spec.js`; fix any discovered frontend issues only in `frontend/main.js`, `frontend/index.html`, or `frontend/style.css`.
- **Done check:** Run `npm test -- frontend/tests/multiselect.spec.js` and then `npm test`. Tests cover empty selection, plain click, Control/Cmd toggling, selection clearing, single-task edit, bulk edit, unsupported-field blocking, selection retention, board switching, deletion, and each display mode. The full shared suite passes with no uncaught page errors.
