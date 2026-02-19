# Video Courses Mobile (Expo)

React Native + Expo mobile app for playback of purchased Video Courses content.

Version: `0.1.9`

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

Create `.env`:

```dotenv
EXPO_PUBLIC_API_BASE_URL=https://your-installation.example.com
```

## Run

```bash
bun run start
bun run ios
bun run android
```

## Scope (v1)

- Email/password login against `/api/v1/mobile/auth/login`
- My Courses library
- Course lesson list
- Lesson playback + heartbeat progress updates
- Resource download handoff through signed URLs
- Account (find courses + receipts) / logout from header
- Orientation: phones portrait-only, tablets portrait + landscape

## Security Notes

- Tokens are stored with `expo-secure-store`.
- Entitlement checks are enforced server-side.
- Resource file URLs are short-lived and signed.

## QA Checklist

1. Login with an entitled account.
2. Open a course and start playback.
3. Leave and return; confirm progress updates persist.
4. Open lesson resources; confirm signed URL access works.
5. Logout and confirm protected routes are inaccessible.
