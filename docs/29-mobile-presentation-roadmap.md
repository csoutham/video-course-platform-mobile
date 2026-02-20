# 29. Mobile Presentation Roadmap

## Objective

Define a practical UI/UX improvement path for the standalone mobile app repo:

- Repo: `git@github.com:csoutham/video-course-platform-mobile.git`

## Design Principles

- Keep playback-first UX as the primary workflow.
- Prioritize readability and touch ergonomics over dense information.
- Keep tablet layouts intentionally different from phone layouts.
- Make loading/error/empty states explicit and actionable.

## Phase 1: Foundations (Quick Wins)

1. Introduce design tokens in a shared theme layer:
   - Colors
   - Spacing scale
   - Radius scale
   - Typography scale
2. Replace hardcoded style literals in current screens with token references.
3. Add shared UI primitives:
   - `ScreenContainer`
   - `Card`
   - `SectionHeading`
   - `PrimaryButton`
   - `SecondaryButton`
   - `InlineError`
   - `EmptyState`
4. Normalize spacing and header hierarchy across:
   - Login
   - Library
   - Course outline
   - Player
   - Account

## Phase 2: Interaction Polish

1. Add skeleton states for:
   - Library grid
   - Course lessons list
   - Player metadata pane
2. Improve failure states:
   - Inline retry actions
   - Clear explanatory copy
3. Improve lesson list readability:
   - Better active-state contrast
   - Clear completion indicator
   - Stronger row affordance
4. Add subtle motion:
   - Route transitions
   - Progress badge/value transitions
   - Button press feedback consistency

## Phase 3: Tablet and Playback Experience

1. Refine split-view behavior:
   - Keep lesson list persistent
   - Improve active lesson focus/contrast
   - Ensure smooth next/previous transitions
2. Tighten player presentation:
   - Keep true 16:9 constraints
   - Avoid clipping in all orientations
   - Keep metadata blocks visually balanced below player

## Accessibility Baseline

1. Ensure minimum 44x44 touch targets for interactive controls.
2. Add explicit accessibility labels for icon-only controls.
3. Ensure contrast compliance in dark player UI and light content screens.
4. Verify dynamic type resilience on key screens.

## Acceptance Criteria

1. No screen uses ad-hoc color literals for core UI primitives.
2. Loading and error states exist on every API-backed screen.
3. Lesson navigation and completion status are clear in both phone and tablet layouts.
4. Visual behavior is consistent between iOS and Android for core flows.
