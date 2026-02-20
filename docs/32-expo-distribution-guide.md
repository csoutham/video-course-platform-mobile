# 32. Expo Distribution Guide (iOS First, Android Later)

## Objective

Ship this app through Expo EAS with your current setup:

- Apple Developer account available now.
- No Google Play developer account yet.

## Prerequisites

1. Install dependencies:

```bash
bun install
```

2. Install/login to EAS:

```bash
bunx eas --version
bunx eas login
```

3. Ensure app identifiers are correct for this installation:

- iOS bundle id: `expo.ios.bundleIdentifier`
- Android package id: `expo.android.package`

## Build Profiles

This repo includes `eas.json` with:

- `preview`: internal distribution.
- `production`: store-ready builds with auto version increment.

## Environment for Per-Installation Builds

Each installation should have its own environment values:

```dotenv
EXPO_PUBLIC_API_BASE_URL=https://your-installation.example.com
EXPO_PUBLIC_SSL_PINNING_ENABLED=false
EXPO_PUBLIC_SSL_PINNING_HOST=your-installation.example.com
EXPO_PUBLIC_SSL_PINNING_PUBLIC_KEYS=base64sha256pin1,base64sha256pin2
EXPO_PROJECT_ID=00000000-0000-0000-0000-000000000000
EXPO_UPDATES_URL=https://u.expo.dev/00000000-0000-0000-0000-000000000000
```

Set these in local `.env` and in EAS secrets/env configuration before cloud builds.

Note:

1. `EXPO_PROJECT_ID` maps to `expo.extra.eas.projectId` via `app.config.ts`.
2. `EXPO_UPDATES_URL` maps to `expo.updates.url` via `app.config.ts`.
3. These are not hardcoded in source to keep the repo open-source safe.

## iOS Distribution (Available Now)

### Internal testing (quickest)

```bash
bunx eas build -p ios --profile preview
```

Use the install link/QR in Expo build output to distribute to test devices.

### TestFlight / App Store Connect

```bash
bunx eas build -p ios --profile production
bunx eas submit -p ios --profile production
```

Use TestFlight for staged rollout before App Store release.

## Android Distribution (No Play Account Yet)

### Internal testing without Play Console

```bash
bunx eas build -p android --profile preview
```

Share the generated installable build (internal distribution) for direct testing.

### When ready for Play Store release

1. Create Google Play Console developer account.
2. Complete identity/payment setup.
3. Build and submit production artifact:

```bash
bunx eas build -p android --profile production
bunx eas submit -p android --profile production
```

## Suggested Rollout

1. Ship iOS preview builds to a small tester group.
2. Move iOS to TestFlight.
3. Run Android preview distribution while Play account is pending.
4. Publish Android to Play once account setup is complete.

## Operational Notes

1. Keep one app binary per installation/project (compile-time base URL).
2. Verify login, playback, progress, and receipts before each promotion.
3. Enable SSL pinning only after validating production certificate pins.

## References

- Expo EAS Build: [https://docs.expo.dev/build/introduction/](https://docs.expo.dev/build/introduction/)
- Expo App Distribution: [https://docs.expo.dev/distribution/introduction/](https://docs.expo.dev/distribution/introduction/)
- Expo Submit: [https://docs.expo.dev/submit/introduction/](https://docs.expo.dev/submit/introduction/)
- Apple Developer Program: [https://developer.apple.com/programs/](https://developer.apple.com/programs/)
- Google Play Console setup: [https://support.google.com/googleplay/android-developer/answer/6112435](https://support.google.com/googleplay/android-developer/answer/6112435)
