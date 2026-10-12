---
name: feature-com-spec
description: Guide feature work through an approved specification, a small validated implementation plan, incremental implementation, and acceptance/regression testing. Use when a feature should be developed spec-first with reviewable commits.
---

# Feature Development with a Specification

## Objective

Implement a feature through a reviewed specification and an actionable plan before changing application code. Work incrementally, validate each task, preserve behavior outside the agreed scope, and finish by checking the acceptance criteria and regressions.

## Inputs

- A concise description of the requested feature and the problem it should solve.
- The target project or workspace, including its existing agent guidance, architecture, conventions, and test setup.
- Any known constraints, stakeholders, deadlines, or platform requirements.

Clarify ambiguous product behavior before writing the specification. Ask focused questions about users, workflows, business rules, edge cases, compatibility, and what is explicitly excluded. Do not invent decisions that materially change scope. Record confirmed decisions in the specification.

## Workflow

### 1. Explore the project and establish guidance

1. Inspect the repository structure, existing `AGENTS.md` (or equivalent instructions), relevant implementation, tests, and documentation. Start with the feature's likely ownership area and follow nearby project patterns.
2. If no root `AGENTS.md` exists and the task calls for one, create it from observed repository facts. Cover the application overview and existing capabilities, stack and directory structure, run and test commands, naming/style conventions, and boundaries or actions that require approval.
3. Review the guidance for accuracy. Correct assumptions against source files and executable project configuration; distinguish confirmed facts from unknowns. Preserve useful existing instructions instead of replacing them wholesale.
4. Identify the application boundary and likely impact areas. For a multi-application repository, determine which independent runtime(s) are in scope.

### 2. Write and approve the feature specification

1. Ask the user targeted questions when needed, then draft the specification in the project's established documentation location and format. If none exists, use `docs/features/<feature-name>/spec.md` or an equivalent clear path.
2. Include the context and objective, business rules and edge cases, acceptance criteria (preferably Given/When/Then), impacts on existing behavior, and explicit in-scope and out-of-scope boundaries.
3. Capture important finalized decisions, such as data ownership, persistence, compatibility, interaction behavior, and failure handling, where relevant.
4. Review the specification with the user. Resolve contradictions, vague acceptance criteria, and unaddressed edge cases before implementation.
5. Commit the approved specification before changing application code. If project policy or the user prohibits commits, ask how to proceed and record that exception.

**Do not write feature code before the specification is approved.** Documentation edits needed to clarify or approve the specification are allowed; implementation code is not.

### 3. Create and review the implementation plan

1. Read the approved specification and the repository guidance together. Propose a numbered sequence of small, independently verifiable tasks in the project's established plan location, for example `docs/plans/<feature-name>/plan.md`.
2. For each task, state:
   - What will be done and which requirement it advances.
   - Which files or components are expected to be created or changed.
   - The focused automated test or other concrete check that proves it is done.
3. Order tasks by dependency and risk. Separate oversized tasks until each has a clear boundary and a practical validation check. Include test setup only when the project lacks a suitable existing test mechanism and setup is necessary.
4. Review the plan with the user. Confirm that it covers every acceptance criterion without expanding scope, and adjust task size or order before coding.

### 4. Implement incrementally, one task at a time

For each numbered task, in order:

1. Mark only the current task in progress and reread its plan entry and related specification rules.
2. Inspect the current code and tests at the owning boundary. Make the smallest change that completes this task; do not bundle unrelated cleanup or later tasks.
3. Read the resulting diff and verify that each change matches the specification and stays within scope. Preserve pre-existing user changes.
4. Run the task's focused automated check first. Then run broader relevant tests or launch the application as appropriate. Fix failures in the current task before proceeding.
5. Mark the task complete in the plan only after its validation succeeds. Commit the completed task with a clear message. Do not combine multiple plan tasks into one commit.
6. Move to the next task only after the current task is reviewed, validated, recorded, and committed.

If implementation reveals that the specification is incomplete or incorrect, stop feature coding, update and review the specification first, and commit the approved specification change before resuming. Update the plan as needed so it remains consistent.

### 5. Validate acceptance and regressions

1. Run the automated tests for the feature using the project's existing test framework and conventions. For example, use Spock for Java only when it is the project's test framework; use the established JavaScript/browser framework for frontend work. Do not assume a framework exists or introduce a new one without need and agreement.
2. Check every acceptance criterion individually and report whether it passed, failed, or could not be verified. Link each criterion to a test or a specific manual check where practical.
3. Exercise relevant existing workflows manually in the running application, including the behaviors identified in the specification's impact section. For a task application, this may include listing, filtering, status changes, and alarms; choose checks appropriate to the actual project.
4. Run the broadest relevant regression suite available. Report commands and outcomes, including unavailable tests or environment limitations. Do not claim manual validation that was not performed.
5. Review the final diff and repository status to ensure the implementation, tests, documentation, and completed plan agree with the approved scope.

## Rules

- The approved specification is the contract for implementation. Resolve product ambiguity before coding.
- No feature code before specification approval.
- Implement one planned task at a time; validate, update the plan, and create one clear commit per completed task.
- If the specification needs to change, update and approve it before changing code to match.
- Do not alter existing behavior or files outside the feature's agreed scope without approval. Follow existing architecture and conventions.
- Never discard uncommitted or pre-existing user changes.
- Prefer focused automated checks first, followed by broader tests and relevant manual regression checks.
- Keep documentation paths and commands appropriate to the target project; examples in this skill are defaults, not requirements.

## Templates

### `spec.md`

```markdown
# <Feature name>

## Context and objective
- What problem exists today?
- Who is affected, and what outcome should the feature provide?

## Business rules and edge cases
- Rules:
- Invalid or boundary inputs:
- Failure, recovery, or compatibility behavior:
- Confirmed decisions:

## Acceptance criteria
- Given <initial context>, when <action>, then <observable result>.
- Given <edge case>, when <action>, then <expected result>.

## Impacts on existing behavior
- Affected features, interfaces, data, integrations, and regression risks:
- Existing behavior that must remain unchanged:

## Scope
### In scope
- ...

### Out of scope
- ...
```

### `plan.md`

```markdown
# <Feature name> Implementation Plan

Implements the approved specification at `<path-to-spec>`. Relevant project guidance: `<path-to-agent-guidance>`.

## Tasks

### 1. [ ] <Small, outcome-oriented task>
- **What:** <implementation outcome and linked requirement>
- **Files:** <files expected to change or be created>
- **Done check:** <focused test command and/or concrete manual observation>

### 2. [ ] <Next task>
- **What:** ...
- **Files:** ...
- **Done check:** ...
```