# Multi-task selection and bulk editing

## 1. Context and objective

This feature targets the frontend application only. The current UI supports selecting a single task at a time and editing its fields individually. That makes it inconvenient when the user wants to apply the same change to several tasks at once, such as updating their priority, status, or category.

The objective of this feature is to allow multiple tasks to be selected simultaneously and to support a differentiated editing model depending on how many tasks are selected:
- if exactly one task is selected: all editable attributes except the task name can be modified;
- if multiple tasks are selected: only category, priority, and status can be edited, and the same value is applied to all selected tasks.

This feature solves the problem of repetitive manual editing when users need to update several tasks in the same way.

---

## 2. Business rules and edge cases

### Selection rules
- The user must be able to select multiple tasks in the task list using a modifier-based interaction such as click + Control/Cmd.
- The UI should clearly indicate which tasks are selected through a simple visual highlight, such as a blue background on the task item.
- Selecting a task should not change or delete the content of other selected tasks.
- Selection state must be maintained consistently across UI interactions and updates.

### Single-selection editing rules
When exactly one task is selected:
- the user may edit all task attributes except the task name;
- the task name should remain unchanged during direct editing;
- the form must reflect the values of the selected task.

### Multi-selection editing rules
When more than one task is selected:
- the user may only edit category, priority, and status;
- changes to category, priority, and status are staged in the form and must not modify tasks until the user clicks Save;
- when Save is clicked, the staged values are applied to every selected task;
- the description and alarm fields must not be editable in bulk mode;
- the task name must remain unchanged for all selected tasks;
- the bulk-edit form should show a neutral blank state and a small message indicating that multiple tasks are being edited at once.

### Save behavior
- Bulk field changes remain pending in the form until the user clicks Save; changing a field alone must not modify the selected tasks.
- On Save, apply the staged category, priority, and status values to every selected task, then reflect the updates in the task list.
- Keep the selection state valid after saving, and retain the selected tasks so the user can continue editing them.
- Clearing or changing the selection before saving discards pending bulk changes and resets the form for the new selection.

### Edge cases
- Zero tasks selected: the form should be in a neutral state and no editing should be applied.
- One task selected: only non-name fields should be editable.
- Two or more tasks selected: the form should hide or disable unsupported fields (description, alarms, and name editing).
- Mixed selection state after a bulk update: all selected tasks should receive the same value.
- User clears selection after editing: the app should reset the editing form to a neutral state.
- If the user tries to change a name while multiple tasks are selected, the operation must be blocked.
- If some selected tasks already have different values in the same field, the bulk edit should still apply a single chosen value to all selected tasks.

### Interaction rules
- Selection mode should support both single and multi-selection without breaking the existing board/task flow.
- The app should provide a clear visual distinction between single-selection editing and bulk-editing states.
- It should be possible to deselect all tasks if the user wants to return to a neutral state.

---

## 3. Acceptance criteria

### Functional acceptance criteria
1. The user can select more than one task at the same time using the browser interaction defined for multi-selection.
2. When exactly one task is selected, the app exposes all editable fields except the name field.
3. When multiple tasks are selected, the app exposes only category, priority, and status fields for editing.
4. Changing category, priority, or status while multiple tasks are selected stages the values in the form; clicking Save applies those values to all selected tasks.
5. Changing description, alarm data, or name while multiple tasks are selected is not allowed.
6. When only one task is selected, the name field remains read-only or otherwise excluded from editing.
7. The app updates the task list visually after bulk edits are applied.
8. The user can clear or change the selection after performing an edit without leaving the UI in an invalid state.
9. An empty selection does not allow applying edits to a task list.
10. After a bulk edit, the same tasks remain selected so the user can continue editing them.

### UI acceptance criteria
1. Selected tasks are visually highlighted with a blue background or equivalent selection indicator.
2. The editing form adjusts dynamically based on selection count.
3. Unsupported fields are disabled or hidden in bulk-edit mode.
4. A small message indicates when the user is editing several tasks at once.
5. The editing flow remains understandable for both single-selection and multi-selection scenarios.

---

## 4. Impacts

This feature affects several existing frontend behaviors and may require refactoring in the selection and form-update flow.

### Functional impacts
- The current single-task selection logic will need to support a selection array or collection instead of a single selected task reference.
- The form state must react dynamically to the number of selected tasks.
- Save and update logic must branch between single-task edit mode and bulk-edit mode.
- Validation rules must block unsupported edits during multi-selection.

### UI impacts
- The task list needs a multi-select interaction pattern.
- The editor panel must update its fields based on selection count.
- Bulk mode should clearly communicate that only some fields are editable.
- The app should avoid confusing states where the form appears editable but applies no valid update.

### Risk areas
- Existing single-task interactions may break if the selection model is not refactored carefully.
- A bulk update may accidentally mutate only part of the selection if the code iterates incorrectly.
- One task selected and multiple tasks selected need different validation rules, which must be handled explicitly.
- Mixed states such as “some tasks selected, form still bound to old selection” should be avoided.

---

## 5. Scope

### In scope
- Multi-select task behavior in the frontend UI.
- Dynamic form editing rules for one selected task vs many selected tasks.
- Bulk update of category, priority, and status across selected tasks.
- Validation and UI disabling of unsupported fields in bulk mode.

### Out of scope
- Backend or database persistence changes.
- Editing task names in bulk mode.
- Editing description or alarm fields for multiple tasks at once.
- Cross-board bulk editing.
- Global drag-and-drop or advanced selection features beyond simple multi-selection.

---

## 6. Finalized decisions

These decisions are now fixed for implementation:
- Multi-selection is performed with click + Control/Cmd interactions.
- Selected tasks receive a simple blue highlight to indicate active selection.
- When multiple tasks are selected, the form shows a neutral blank state and indicates that multiple tasks are being edited.
- Bulk edits to category, priority, and status are applied to all selected tasks only when the user clicks Save.
- After applying a bulk update, the same tasks remain selected so the user can continue editing them.
- The feature is frontend-only and does not affect the Java CLI project.
