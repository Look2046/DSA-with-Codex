import { describe, expect, it } from 'vitest';
import { generateTrieSteps, type TrieStep } from './trie';

function finalStep(steps: TrieStep[]): TrieStep | undefined {
  return steps.at(-1);
}

function finalWords(steps: TrieStep[]): string[] {
  return (finalStep(steps)?.nodes ?? [])
    .filter((node) => node.terminal && node.word)
    .map((node) => node.word as string)
    .sort((left, right) => left.localeCompare(right));
}

describe('trie step generation', () => {
  it('is deterministic for the same seed words and queries', () => {
    const first = generateTrieSteps(['to', 'tea', 'ted', 'ten'], 'team', 'tea');
    const second = generateTrieSteps(['to', 'tea', 'ted', 'ten'], 'team', 'tea');

    expect(first).toEqual(second);
  });

  it('creates missing nodes and then finds the query word', () => {
    const steps = generateTrieSteps(['to', 'tea', 'ted', 'ten'], 'team', 'team');

    expect(steps.some((step) => step.action === 'insertCreate')).toBe(true);
    expect(steps.some((step) => step.action === 'searchHit')).toBe(true);
    expect(finalStep(steps)?.outcome).toBe('found');
    expect(finalWords(steps)).toEqual(['tea', 'team', 'ted', 'ten', 'to']);
  });

  it('marks duplicate inserts without changing the terminal word set', () => {
    const steps = generateTrieSteps(['ape', 'apple', 'apt'], 'apt', 'apt');

    expect(steps.some((step) => step.outcome === 'duplicate')).toBe(true);
    expect(finalStep(steps)?.outcome).toBe('found');
    expect(finalWords(steps)).toEqual(['ape', 'apple', 'apt']);
  });

  it('finishes with notFound when the query path is missing', () => {
    const steps = generateTrieSteps(['ape', 'apple', 'apt'], 'bat', 'bad');

    expect(steps.some((step) => step.action === 'searchMiss')).toBe(true);
    expect(finalStep(steps)?.outcome).toBe('notFound');
    expect(finalWords(steps)).toEqual(['ape', 'apple', 'apt', 'bat']);
  });
});
