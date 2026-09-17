import { describe, expect, it } from 'vitest';
import {
  GENERALIZED_LIST_DEFAULT_CONFIG,
  createSeededRandom,
  generateGeneralizedListProblem,
  sanitizeGeneralizedListConfig,
  stringifyGeneralizedList,
} from './generalizedListHeadTail';

describe('generalizedListHeadTail', () => {
  it('clamps config into the supported limits', () => {
    expect(
      sanitizeGeneralizedListConfig({
        atomTypeCount: 9,
        maxWidth: 0,
        maxDepth: 8,
        operationMode: 'mixed',
        operationDepth: -2,
      }),
    ).toEqual({
      atomTypeCount: 4,
      maxWidth: 1,
      maxDepth: 4,
      operationMode: 'mixed',
      operationDepth: 1,
    });
  });

  it('generates a non-empty generalized list and a legal operation chain', () => {
    const problem = generateGeneralizedListProblem(
      GENERALIZED_LIST_DEFAULT_CONFIG,
      createSeededRandom(7),
    );

    expect(problem.list.kind).toBe('list');
    expect(problem.list.items.length).toBeGreaterThan(0);
    expect(problem.operations).toHaveLength(2);
    expect(problem.steps).toHaveLength(2);
    expect(problem.expressionText).toMatch(/^(head|tail)\((head|tail)\(L\)\)$/);
  });

  it('supports head-only and tail-only generation modes', () => {
    const headOnly = generateGeneralizedListProblem(
      {
        atomTypeCount: 2,
        maxWidth: 3,
        maxDepth: 3,
        operationMode: 'head-only',
        operationDepth: 1,
      },
      createSeededRandom(11),
    );
    const tailOnly = generateGeneralizedListProblem(
      {
        atomTypeCount: 3,
        maxWidth: 4,
        maxDepth: 3,
        operationMode: 'tail-only',
        operationDepth: 1,
      },
      createSeededRandom(17),
    );

    expect(headOnly.operations).toEqual(['head']);
    expect(tailOnly.operations).toEqual(['tail']);
  });

  it('produces step-by-step reductions that end at the final result', () => {
    const problem = generateGeneralizedListProblem(
      {
        atomTypeCount: 2,
        maxWidth: 3,
        maxDepth: 3,
        operationMode: 'mixed',
        operationDepth: 3,
      },
      createSeededRandom(23),
    );

    expect(problem.steps).toHaveLength(3);
    const lastStep = problem.steps[problem.steps.length - 1];
    expect(lastStep.expressionAfter).toBe(lastStep.resultExpression);
    expect(stringifyGeneralizedList(problem.list)).toMatch(/^\(.+\)$/);
  });
});
