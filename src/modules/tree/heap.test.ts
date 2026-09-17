import { describe, expect, it } from 'vitest';
import { buildMaxHeapArray, generateHeapSteps, type HeapStep } from './heap';

function finalStep(steps: HeapStep[]): HeapStep | undefined {
  return steps.at(-1);
}

function isMaxHeap(values: number[]): boolean {
  for (let index = 0; index < values.length; index += 1) {
    const leftIndex = index * 2 + 1;
    const rightIndex = index * 2 + 2;

    if (leftIndex < values.length && values[index] < values[leftIndex]) {
      return false;
    }

    if (rightIndex < values.length && values[index] < values[rightIndex]) {
      return false;
    }
  }

  return true;
}

describe('heap step generation', () => {
  it('builds a deterministic max-heap from the same input', () => {
    const first = generateHeapSteps([30, 10, 50, 20, 40, 35], 'build');
    const second = generateHeapSteps([30, 10, 50, 20, 40, 35], 'build');

    expect(first).toEqual(second);
    expect(finalStep(first)?.arrayState).toEqual([50, 40, 35, 20, 10, 30]);
    expect(finalStep(first)?.outcome).toBe('heapBuilt');
    expect(isMaxHeap(finalStep(first)?.arrayState ?? [])).toBe(true);
  });

  it('starts the build flow without pre-highlighting the root', () => {
    const [initialStep] = generateHeapSteps([30, 10, 50, 20, 40, 35], 'build');

    expect(initialStep?.activeIndex).toBeNull();
    expect(initialStep?.pathIndices).toEqual([]);
    expect(initialStep?.highlights).toEqual([]);
  });

  it('keeps silent heap building deterministic for page previews', () => {
    expect(buildMaxHeapArray([30, 10, 50, 20, 40, 35])).toEqual([50, 40, 35, 20, 10, 30]);
  });

  it('inserts by append + sift-up and preserves max-heap order', () => {
    const steps = generateHeapSteps([40, 25, 35, 10, 15], 'insert', 50);

    expect(steps.some((step) => step.action === 'append')).toBe(true);
    expect(steps.filter((step) => step.action === 'swap')).toHaveLength(2);
    expect(finalStep(steps)?.arrayState).toEqual([50, 25, 40, 10, 15, 35]);
    expect(finalStep(steps)?.outcome).toBe('inserted');
    expect(isMaxHeap(finalStep(steps)?.arrayState ?? [])).toBe(true);
  });

  it('keeps stable item identities aligned with swap steps for animation replay', () => {
    const steps = generateHeapSteps([30, 10, 50, 20, 40, 35], 'build');
    const firstSwap = steps.find((step) => step.action === 'swap');

    expect(firstSwap?.arrayState).toEqual([30, 40, 50, 20, 10, 35]);
    expect(firstSwap?.itemIds).toEqual(['seed-0', 'seed-4', 'seed-2', 'seed-3', 'seed-1', 'seed-5']);
  });

  it('extracts the root and restores the max-heap with sift-down', () => {
    const steps = generateHeapSteps([40, 25, 35, 10, 15, 30], 'extractRoot');

    expect(steps.some((step) => step.action === 'extractRoot')).toBe(true);
    expect(steps.some((step) => step.action === 'removeLast')).toBe(true);
    expect(finalStep(steps)?.arrayState).toEqual([35, 25, 30, 10, 15]);
    expect(finalStep(steps)?.extractedValue).toBe(40);
    expect(finalStep(steps)?.outcome).toBe('extracted');
    expect(isMaxHeap(finalStep(steps)?.arrayState ?? [])).toBe(true);
  });

  it('extracts a single-node heap cleanly', () => {
    const steps = generateHeapSteps([42], 'extractRoot');

    expect(finalStep(steps)?.arrayState).toEqual([]);
    expect(finalStep(steps)?.extractedValue).toBe(42);
    expect(finalStep(steps)?.outcome).toBe('extracted');
  });
});
