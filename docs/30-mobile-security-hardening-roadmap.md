# 30. Mobile Security Hardening Roadmap

## Objective

Define phased hardening for the standalone mobile app:

- Repo: `git@github.com:csoutham/video-course-platform-mobile.git`

and its API dependency in this backend repo.

## Threat-Focused Priorities

1. Stolen token reuse.
2. Misconfigured API base URL in distributed builds.
3. Replay/abuse on progress and playback endpoints.
4. Leaked or long-lived signed resource/playback URLs.
5. Device integrity risk (root/jailbreak).

## Phase 1: Config and Session Hygiene

1. Validate `EXPO_PUBLIC_API_BASE_URL` on startup:
   - Must be `https`
   - Must parse cleanly
   - Fail fast with user-facing configuration error state
2. Standardize auth failure handling:
   - On `401`, clear token and return to login
   - Avoid retry loops with invalid tokens
3. Surface session controls:
   - Keep `logout`
   - Keep `logout all devices` path

## Phase 2: API Abuse and Entitlement Hardening

1. Strengthen rate limits on:
   - `/playback`
   - `/progress`
   - `/resources`
2. Validate progress updates server-side:
   - Reject impossible jumps
   - Clamp out-of-range values
   - Track suspicious patterns for audit
3. Keep entitlement checks server-side on every protected endpoint (already required).

## Phase 3: Media URL Hardening

1. Reduce signed URL TTL defaults for playback and resources.
2. Ensure each URL revalidates entitlement at access time where possible.
3. Add stricter production defaults for stream signing behavior.

## Phase 4: Device and Transport Hardening

1. Add SSL pinning for API requests in production builds.
2. Add root/jailbreak detection policy:
   - Owner-configurable response (`warn` vs `block`)
3. Add secure telemetry for:
   - Token revocations
   - Repeated entitlement denials
   - Progress abuse anomalies

## Operational Requirements

1. Keep incident response runbook updated for token compromise events.
2. Ensure support can revoke individual or all user tokens quickly.
3. Keep mobile and API release notes aligned for security-relevant changes.

## Acceptance Criteria

1. Invalid API base URL cannot silently boot app networking.
2. Stale/invalid tokens are reliably purged on auth failure.
3. Progress abuse scenarios are rate-limited and validated server-side.
4. Signed URLs follow shortest practical TTL in production.
