import { describe, expect, it } from 'vitest';
import { generateSortingRaceSteps } from './sortingRace';

describe('sortingRace', () => {
  it('keeps a shared dataset and ranks algorithms by progress and finish frame', () => {
    const steps = generateSortingRaceSteps('classic');
    const finalStep = steps.at(-1);

    expect(finalStep?.lanes).toHaveLength(4);
    expect(finalStep?.lanes.every((lane) => lane.arrayState.join(',') === '9,17,23,42,51,68,75')).toBe(true);
    expect(finalStep?.ranking[0]).toBeDefined();
    expect(finalStep?.leaderIds.length).toBeGreaterThan(0);
  });
});
