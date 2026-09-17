import { describe, expect, it } from 'vitest';
import { generateShellSortSteps } from './shellSort';

describe('generateShellSortSteps', () => {
  it('returns deterministic steps for the same input', () => {
    const input = [23, 12, 1, 8, 34, 54, 2, 3];
    const run1 = generateShellSortSteps(input);
    const run2 = generateShellSortSteps(input);
    expect(run1).toEqual(run2);
  });

  it('sorts output array state in final step', () => {
    const input = [9, 3, 7, 1, 2];
    const steps = generateShellSortSteps(input);
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last.arrayState).toEqual([1, 2, 3, 7, 9]);
    expect(last.action).toBe('completed');
  });

  it('emits gap-change and shift steps for gap-based insertion passes', () => {
    const steps = generateShellSortSteps([23, 12, 1, 8, 34, 54, 2, 3]);
    const gapChanges = steps.filter((step) => step.action === 'gapChange').map((step) => step.gap);

    expect(gapChanges).toEqual([4, 2, 1]);
    expect(steps.some((step) => step.action === 'lift')).toBe(true);
    expect(steps.some((step) => step.action === 'shift')).toBe(true);
    expect(steps.some((step) => step.action === 'insert')).toBe(true);
    expect(steps.some((step) => step.action === 'groupMark')).toBe(true);
  });

  it('uses shift/insert highlight semantics instead of swap semantics', () => {
    const steps = generateShellSortSteps([23, 12, 1, 8, 34, 54, 2, 3]);
    const shiftStep = steps.find((step) => step.action === 'shift');
    const insertStep = steps.find((step) => step.action === 'insert');

    expect(shiftStep).toBeDefined();
    expect(insertStep).toBeDefined();
    if (!shiftStep || !insertStep) {
      return;
    }

    expect(shiftStep.highlights).toEqual([{ index: shiftStep.indices[1], type: 'moving' }]);
    expect(insertStep.highlights).toEqual([{ index: insertStep.indices[0], type: 'new-node' }]);
  });

  it('tracks hole index across select, lift, compare, shift, and insert steps', () => {
    const steps = generateShellSortSteps([23, 12, 1, 8, 34, 54, 2, 3]);
    const selectStep = steps.find((step) => step.action === 'selectCurrent');
    const liftStep = steps.find((step) => step.action === 'lift');
    const compareStep = steps.find((step) => step.action === 'compare' && step.holeIndex !== null);
    const shiftStep = steps.find((step) => step.action === 'shift');
    const insertStep = steps.find((step) => step.action === 'insert');

    expect(selectStep).toBeDefined();
    expect(liftStep).toBeDefined();
    expect(compareStep).toBeDefined();
    expect(shiftStep).toBeDefined();
    expect(insertStep).toBeDefined();
    if (!selectStep || !liftStep || !compareStep || !shiftStep || !insertStep) {
      return;
    }

    expect(selectStep.holeIndex).toBeNull();
    expect(liftStep.holeIndex).toBe(liftStep.indices[0]);
    expect(compareStep.holeIndex).toBe(compareStep.indices[1]);
    expect(shiftStep.holeIndex).toBe(shiftStep.indices[0]);
    expect(insertStep.holeIndex).toBeNull();
  });

  it('lifts current value before the first shift when j-gap is larger', () => {
    const steps = generateShellSortSteps([8, 3, 6, 2, 7, 1, 5, 4]);
    const firstShiftIndex = steps.findIndex((step) => step.action === 'shift');
    const firstLiftIndex = steps.findIndex((step) => step.action === 'lift');

    expect(firstLiftIndex).toBeGreaterThan(-1);
    expect(firstShiftIndex).toBeGreaterThan(-1);
    expect(firstLiftIndex).toBeLessThan(firstShiftIndex);
  });

  it('inserts temp immediately when no further j-gap predecessor exists', () => {
    const steps = generateShellSortSteps([5, 9, 4, 8]);
    const firstLiftIndex = steps.findIndex((step) => step.action === 'lift');
    expect(firstLiftIndex).toBeGreaterThan(-1);
    if (firstLiftIndex < 0) {
      return;
    }

    const actionWindow = steps.slice(firstLiftIndex, firstLiftIndex + 4).map((step) => step.action);
    expect(actionWindow[0]).toBe('lift');
    expect(actionWindow[1]).toBe('shift');
    expect(actionWindow[2]).toBe('insert');
  });

  it('re-compares temp with the next predecessor after each shift when predecessor exists', () => {
    const steps = generateShellSortSteps([9, 8, 7, 6, 5, 4, 3, 2]);
    const hasShiftThenCompare = steps.some(
      (step, index) => step.action === 'shift' && steps[index + 1]?.action === 'compare' && steps[index + 1]?.keyLifted,
    );

    expect(hasShiftThenCompare).toBe(true);
  });

  it('compares against j-gap only after hole appears', () => {
    const steps = generateShellSortSteps([23, 12, 1, 8, 34, 54, 2, 3]);
    const compareWithHole = steps.find((step) => step.action === 'compare' && step.holeIndex !== null);

    expect(compareWithHole).toBeDefined();
    if (!compareWithHole) {
      return;
    }

    expect(compareWithHole.highlights).toEqual([
      { index: compareWithHole.indices[0], type: 'comparing' },
      { index: compareWithHole.indices[1], type: 'comparing' },
    ]);
  });

  it('handles single-element arrays', () => {
    const steps = generateShellSortSteps([42]);
    expect(steps[0].arrayState).toEqual([42]);
    expect(steps[steps.length - 1].arrayState).toEqual([42]);
    expect(steps[steps.length - 1].action).toBe('completed');
  });
});
