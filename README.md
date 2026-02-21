# Video Courses Mobile (Expo)

React Native + Expo mobile app for playback of purchased Video Courses content.

Version: `0.1.28`

## Build Target Model

This app is compiled per installation/project. Set `EXPO_PUBLIC_API_BASE_URL` to the target backend before building
binaries.

## Requirements

- Node 20+
- Bun 1.3+

## Setup

```bash
cd mobile
bun install
```

Create `.env` (copy from `.env.example`):

```dotenv
EXPO_PUBLIC_API_BASE_URL=https://your-installation.example.com
EXPO_PUBLIC_SSL_PINNING_ENABLED=false
EXPO_PUBLIC_SSL_PINNING_HOST=your-installation.example.com
EXPO_PUBLIC_SSL_PINNING_PUBLIC_KEYS=base64sha256pin1,base64sha256pin2
EXPO_PROJECT_ID=00000000-0000-0000-0000-000000000000
EXPO_UPDATES_URL=https://u.expo.dev/00000000-0000-0000-0000-000000000000
```

`EXPO_PROJECT_ID` and `EXPO_UPDATES_URL` are intentionally env-driven for open-source safety.
`app.config.ts` loads local `.env` automatically for local CLI commands.
For EAS cloud builds, configure the same variables in EAS environment settings.

## Run

```bash
bun run start
bun run ios
bun run android
```

## Distribution

- See `/docs/32-expo-distribution-guide.md` for iOS/TestFlight and Android distribution workflows with EAS.
- See `/docs/33-branding-assets-checklist.md` for icon/splash asset requirements and replacement workflow.

## Scope (v1)

- Email/password login against `/api/v1/mobile/auth/login`
- My Courses library
- Course lesson list
- Lesson playback + heartbeat progress updates
- Resource download handoff through signed URLs
- Account (receipts) / logout from header
- Orientation: phones portrait-only, tablets portrait + landscape

## Security Notes

- Tokens are stored with `expo-secure-store`.
- Entitlement checks are enforced server-side.
- Resource file URLs are short-lived and signed.
- Playback URL cache is short-lived and does not fall back to stale signed URLs.
- Progress writes are guarded client-side and API rejections are surfaced cleanly.
- Optional production SSL public-key pinning is available via env configuration.

## Expo Updates Note

- `expo-updates` powers OTA update compatibility and runtime versioning.
- This app uses `runtimeVersion` policy `appVersion` via `app.config.ts` to keep local and EAS runtime calculation aligned.

## QA Checklist

1. Login with an entitled account.
2. Open a course and start playback.
3. Leave and return; confirm progress updates persist.
4. Open lesson resources; confirm signed URL access works.
5. Logout and confirm protected routes are inaccessible.
