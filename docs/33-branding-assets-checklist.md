# 33. Branding Assets Checklist

## Objective

Replace placeholder assets with final branded icon and launch visuals for iOS + Android.

## Current Asset Paths

- App icon: `assets/branding/icon.png`
- Android adaptive foreground: `assets/branding/adaptive-icon.png`
- Splash mark: `assets/branding/splash-icon.png`
- Web/dev favicon: `assets/branding/favicon.png`

## Required Final Assets

1. App icon (`icon.png`)
   - Size: `1024x1024`
   - Format: PNG, square, no transparency-dependent edges.
   - Rule: no tiny text, no detailed gradients that blur at small sizes.

2. Android adaptive foreground (`adaptive-icon.png`)
   - Size: `1024x1024`
   - Format: PNG with transparent background allowed.
   - Rule: keep critical logo content centered and away from edges.

3. Splash mark (`splash-icon.png`)
   - Size: `1024x1024` (or larger square PNG)
   - Format: PNG
   - Rule: simple centered mark on brand color background.

4. Favicon (`favicon.png`)
   - Size: `48x48`
   - Format: PNG

## Visual Guidance

1. Keep icon and splash mark aligned to same symbol language.
2. Use one primary brand color + one dark background for high contrast.
3. Avoid text inside icon/splash mark.
4. Test legibility at tiny sizes (29px, 40px, 60px equivalents).

## Update Flow

1. Replace files in `assets/branding/` with final exports.
2. Run local check:

```bash
bunx expo config --type public
```

3. Build preview:

```bash
bunx eas build -p ios --profile preview
```

4. Verify on device:
   - Home screen icon legibility
   - Splash background/color fidelity
   - Adaptive icon crop on Android launchers

## Optional Next Step

Add a dedicated branded launch animation inside app shell after native splash if you want stronger brand expression.
