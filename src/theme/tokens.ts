export const colors = {
  surface: {
    page: '#f8fafc',
    card: '#ffffff',
    muted: '#e2e8f0',
    overlay: 'rgba(2, 6, 23, 0.8)',
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    subtle: '#64748b',
    inverse: '#f8fafc',
  },
  border: {
    default: '#cbd5e1',
  },
  brand: {
    primary: '#1d4ed8',
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
  md: 10,
  lg: 12,
  pill: 999,
} as const;

export const type = {
  title: 24,
  heading: 18,
  body: 13,
  label: 12,
} as const;
