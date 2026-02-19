export function formatProgressLabel(percentComplete: number | null | undefined): string {
  const percent = Math.max(0, Math.floor(percentComplete ?? 0));

  if (percent >= 99) {
    return 'Completed';
  }

  return `${percent}%`;
}

export function formatLessonProgress(status: string | null | undefined, percentComplete: number | null | undefined): string {
  if (status === 'completed') {
    return 'Completed';
  }

  const percent = Math.max(0, Math.floor(percentComplete ?? 0));
  return `Progress: ${percent}%`;
}
