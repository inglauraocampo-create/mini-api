import { describe, expect, it } from 'vitest';
import { sum } from './index.js';

describe('sum', () => {
  it('suma dos números', () => {
    expect(sum(2, 3)).toBe(5);
  });
});
