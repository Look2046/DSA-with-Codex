import { describe, expect, it } from 'vitest';
import { buildStackComparisonSteps } from './stackComparisonUtils';

describe('buildStackComparisonSteps', () => {
  it('splits linked-stack push into create-node, link-next, and top-update steps', () => {
    const result = buildStackComparisonSteps([3, 8, 1], [3, 8, 1], { type: 'push', value: 42 });

    expect(result.steps).toHaveLength(5);
    expect(result.steps[1]?.action).toBe('preparePush');
    expect(result.steps[1]?.linked.action).toBe('preparePush');
    expect(result.steps[1]?.linked.stackState).toEqual([3, 8, 1]);
    expect(result.steps[1]?.linked.incomingValue).toBe(42);
    expect(result.steps[1]?.linked.incomingNextIndex).toBeUndefined();
    expect(result.steps[2]?.action).toBe('linkPush');
    expect(result.steps[2]?.linked.action).toBe('linkPush');
    expect(result.steps[2]?.linked.incomingValue).toBe(42);
    expect(result.steps[2]?.linked.incomingNextIndex).toBe(2);
    expect(result.steps[2]?.linked.stackState).toEqual([3, 8, 1]);
    expect(result.steps[3]?.linked.action).toBe('push');
    expect(result.steps[3]?.linked.stackState).toEqual([3, 8, 1, 42]);
  });

  it('keeps the sequential stack marked full throughout a full-stack push comparison', () => {
    const fullStack = Array.from({ length: 10 }, (_, index) => index);
    const result = buildStackComparisonSteps(fullStack, fullStack, { type: 'push', value: 42 });

    expect(result.steps).toHaveLength(5);
    expect(result.steps[0]?.sequential.outcome).toBe('overflow');
    expect(result.steps[1]?.sequential.outcome).toBe('overflow');
    expect(result.steps[2]?.sequential.outcome).toBe('overflow');
    expect(result.steps[3]?.sequential.outcome).toBe('overflow');
    expect(result.steps[4]?.sequential.outcome).toBe('overflow');
    expect(result.steps[2]?.linked.action).toBe('linkPush');
    expect(result.steps[2]?.linked.incomingValue).toBe(42);
    expect(result.steps[3]?.sequential.stackState).toEqual(fullStack);
    expect(result.steps[3]?.linked.action).toBe('push');
    expect(result.steps[3]?.linked.stackState).toEqual([...fullStack, 42]);
    expect(result.completedSequential).toEqual(fullStack);
    expect(result.completedLinked).toEqual([...fullStack, 42]);
    expect(result.diverged).toBe(true);
  });

  it('applies pop independently after the two stacks diverge', () => {
    const result = buildStackComparisonSteps([0, 1, 2, 3], [0, 1, 2, 3, 99], { type: 'pop' });

    expect(result.steps[1]?.sequential.poppedValue).toBe(3);
    expect(result.steps[1]?.linked.poppedValue).toBe(99);
    expect(result.completedSequential).toEqual([0, 1, 2]);
    expect(result.completedLinked).toEqual([0, 1, 2, 3]);
    expect(result.diverged).toBe(true);
  });
});
