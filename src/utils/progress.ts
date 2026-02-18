export function calculatePercent(positionSeconds: number, durationSeconds: number): number {
  if (durationSeconds <= 0) {
    return 0;
  }

  const raw = Math.floor((positionSeconds / durationSeconds) * 100);

  return Math.max(0, Math.min(100, raw));
}
