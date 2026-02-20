# 31. Mobile Implementation Backlog (Issue-Ready)

## Purpose

Provide issue-ready backlog entries for execution in:

- `git@github.com:csoutham/video-course-platform-mobile.git`

## Backlog Items

### MBL-01

- Title: `feat(ui): introduce design tokens and shared UI primitives`
- Size: `M`
- Scope:
  - Add `theme/tokens` and shared components for containers/cards/buttons/states.
  - Replace hardcoded styles in key screens.
- Acceptance:
  - All primary screens use tokens for colors, spacing, and typography.

### MBL-02

- Title: `feat(ui): add skeleton, empty, and error states`
- Size: `M`
- Scope:
  - Introduce reusable skeleton and error-state components.
  - Apply to library, course, player, and account.
- Acceptance:
  - No API-backed screen relies on plain loading text only.

### MBL-03

- Title: `feat(a11y): baseline accessibility pass`
- Size: `S`
- Scope:
  - Touch targets, labels, and contrast improvements.
- Acceptance:
  - Core navigation and playback controls are screen-reader friendly.

### MBL-04

- Title: `feat(auth): centralize 401 handling and session reset`
- Size: `S`
- Scope:
  - Global auth interceptor behavior for invalid tokens.
- Acceptance:
  - 401 transitions to a clean login state with token removed.

### MBL-05

- Title: `feat(security): validate API base URL at app startup`
- Size: `S`
- Scope:
  - Enforce valid https base URL before network calls.
- Acceptance:
  - Invalid URL shows deterministic config error screen.

### MBL-06

- Title: `feat(security): expose session controls for logout-all`
- Size: `S`
- Scope:
  - Ensure account surface supports current-token logout and logout-all workflows.
- Acceptance:
  - Session revocation is user-accessible and reliable.

### MBL-07

- Title: `feat(security): harden progress endpoint behavior`
- Size: `M`
- Scope (mobile + backend coordination):
  - Add rate/validation rules for progress writes.
  - Handle server rejection cleanly in client.
- Acceptance:
  - Impossible progress jumps are rejected and logged.

### MBL-08

- Title: `feat(security): tighten signed URL TTL and playback checks`
- Size: `M`
- Scope (backend heavy):
  - Reduce TTL defaults and confirm entitlement on access.
- Acceptance:
  - Expired URLs cannot be reused; authorized flows remain stable.

### MBL-09

- Title: `feat(security): add SSL pinning for production`
- Size: `L`
- Scope:
  - Add certificate/public-key pin validation in production profiles.
- Acceptance:
  - Pinned domains enforced; mismatch handling is explicit.

### MBL-10

- Title: `feat(tablet): refine split-view lesson/player interaction`
- Size: `M`
- Scope:
  - Improve tablet lesson column behavior and navigation transitions.
- Acceptance:
  - Smooth, deterministic lesson switching in split layout.

## Suggested Execution Order

1. `MBL-01`
2. `MBL-02`
3. `MBL-04`
4. `MBL-05`
5. `MBL-03`
6. `MBL-10`
7. `MBL-07`
8. `MBL-08`
9. `MBL-06`
10. `MBL-09`
