import { describe, expect, it } from 'vitest';

import { calculatePercent } from '../src/utils/progress';

describe('calculatePercent', () => {
  it('returns 0 when duration is invalid', () => {
    expect(calculatePercent(10, 0)).toBe(0);
  });

  it('clamps percent to 100', () => {
    expect(calculatePercent(400, 300)).toBe(100);
  });

  it('calculates expected progress percent', () => {
    expect(calculatePercent(90, 300)).toBe(30);
  });
});
