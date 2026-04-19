import { describe, expect, it } from 'vitest';
import { generateRabinKarpSteps } from './rabinKarp';

describe('rabinKarp', () => {
  it('finds all classic matches and records collision verification steps', () => {
    const steps = generateRabinKarpSteps('classic');
    const finalStep = steps.at(-1);

    expect(finalStep?.matches).toEqual([0, 9, 12]);
    expect(steps.some((step) => step.action === 'matchFound')).toBe(true);
    expect(steps.some((step) => step.action === 'verifyChar' && step.collision)).toBe(true);
    expect(steps.some((step) => step.action === 'shiftWindow')).toBe(true);
  });

  it('keeps the dedicated collision preset deterministic', () => {
    const steps = generateRabinKarpSteps('collision');
    const collisionVerifyStep = steps.find((step) => step.action === 'verifyChar' && step.collision);
    const finalStep = steps.at(-1);

    expect(collisionVerifyStep?.windowStart).toBe(0);
    expect(finalStep?.matches).toEqual([4]);
  });
});
