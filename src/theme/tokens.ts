export const colors = {
  surface: {
    page: '#f8fafc',
    card: '#ffffff',
    muted: '#e2e8f0',
    overlay: 'rgba(2, 6, 23, 0.8)',
    input: '#ffffff',
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    subtle: '#64748b',
    inverse: '#f8fafc',
    accent: '#1e40af',
  },
  border: {
    default: '#cbd5e1',
    strong: '#94a3b8',
    inverse: '#334155',
  },
  brand: {
    primary: '#1d4ed8',
    primaryMuted: '#1e3a8a',
    primarySoft: '#dbeafe',
  },
  dark: {
    background: '#020617',
    panel: '#0f172a',
    panelMuted: '#1e293b',
    border: '#334155',
    borderStrong: '#1e293b',
    text: '#f8fafc',
    textSecondary: '#e2e8f0',
    textMuted: '#94a3b8',
    accent: '#60a5fa',
    accentSoft: '#bfdbfe',
    videoBackground: '#000000',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  pill: 999,
} as const;

export const type = {
  display: 28,
  title: 24,
  heading: 18,
  subheading: 16,
  bodyLarge: 14,
  body: 13,
  label: 12,
} as const;
