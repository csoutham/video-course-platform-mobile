# Contributing to Video Courses Mobile

## Scope

This repository is the standalone React Native + Expo mobile app for Video Courses.

- Runtime: React Native / Expo
- Package manager: Bun
- Build/distribution: EAS (TestFlight / Play)

## Local Setup

1. Install dependencies:

```bash
bun install
```

2. Copy `.env.example` to `.env` and set required values:

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PROJECT_ID`
- `EXPO_UPDATES_URL`

3. Start the app:

```bash
bun run start
```

## Development Workflow

1. Branch from `main`.
2. Make focused changes.
3. Run local quality checks:

```bash
bunx tsc --noEmit
bun run lint
bun run test
```

4. Update docs in `/docs` when behavior, build, security, or distribution flow changes.
5. Open a PR with summary, rationale, and verification notes.

## Coding and Commit Standards

- Use conventional commits (e.g., `feat(ui): ...`, `fix(player): ...`, `docs(expo): ...`).
- Keep commits small and scoped.
- Preserve existing architecture patterns (screen components, typed API contracts, shared theme/UI primitives).
- Prefer explicit error handling for API/network flows.

## Versioning Rules

For each merged change set:

1. Bump `package.json` version.
2. Bump `app.json` version.
3. Update version line in `README.md`.

Use semver increments appropriate to change scope.

## Expo / EAS Notes

- `app.config.ts` applies environment-driven config for Expo/EAS.
- Keep installation-specific values in env, not hardcoded in repository templates.
- For cloud builds, configure env vars in EAS project environments (local `.env` is not enough).

## Documentation Expectations

When relevant, keep these docs aligned:

- `docs/32-expo-distribution-guide.md`
- `docs/33-branding-assets-checklist.md`
- `docs/30-mobile-security-hardening-roadmap.md`
- `docs/31-mobile-implementation-backlog.md`

## Pull Request Checklist

1. Change is scoped and reversible.
2. Types/lint/tests pass locally.
3. Docs updated for user-visible or workflow changes.
4. Version updates applied (`package.json`, `app.json`, `README.md`).
5. Any EAS/build implications are called out in the PR description.
