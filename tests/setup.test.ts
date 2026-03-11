import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Basic setup test to verify testing framework is working
 */
describe('Testing Framework Setup', () => {
  it('should have Vitest working', () => {
    expect(true).toBe(true);
  });

  it('should have fast-check working', () => {
    const result = fc.check(
      fc.property(fc.integer(), (n) => {
        return n === n;
      })
    );
    expect(result.failed).toBe(false);
  });
});
