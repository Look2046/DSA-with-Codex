import { describe, expect, it } from 'vitest';
import { buildHuffmanTimeline, normalizeHuffmanItems, parseHuffmanInput, type HuffmanStep } from './huffman';

function payloads(items: Array<{ label: string; weight: number }>): HuffmanStep[] {
  return buildHuffmanTimeline(items).map((frame) => frame.payload);
}

function finalStep(steps: HuffmanStep[]): HuffmanStep | undefined {
  return steps.at(-1);
}

describe('huffman tree timeline generation', () => {
  it('is deterministic for the same weighted labels', () => {
    const input = [
      { label: 'A', weight: 7 },
      { label: 'B', weight: 5 },
      { label: 'C', weight: 2 },
      { label: 'D', weight: 4 },
    ];

    expect(buildHuffmanTimeline(input)).toEqual(buildHuffmanTimeline(input));
  });

  it('selects the two smallest roots before each merge', () => {
    const steps = payloads([
      { label: 'A', weight: 7 },
      { label: 'B', weight: 5 },
      { label: 'C', weight: 2 },
      { label: 'D', weight: 4 },
    ]);
    const firstSelect = steps.find((step) => step.action === 'select');

    expect(firstSelect?.selectedIds.map((id) => firstSelect.nodes.find((node) => node.id === id)?.label)).toEqual(['C', 'D']);
    expect(firstSelect?.round).toBe(1);
  });

  it('builds prefix codes for every leaf after construction', () => {
    const steps = payloads([
      { label: 'A', weight: 7 },
      { label: 'B', weight: 5 },
      { label: 'C', weight: 2 },
      { label: 'D', weight: 4 },
    ]);

    expect(finalStep(steps)?.codes).toEqual([
      { label: 'A', weight: 7, code: '0' },
      { label: 'B', weight: 5, code: '10' },
      { label: 'C', weight: 2, code: '110' },
      { label: 'D', weight: 4, code: '111' },
    ]);
    expect(finalStep(steps)?.action).toBe('completed');
  });

  it('normalizes labels, weights, duplicates, and maximum item count', () => {
    expect(
      normalizeHuffmanItems([
        { label: ' aa ', weight: 2.8 },
        { label: 'aa', weight: 9 },
        { label: 'bbbb', weight: 120 },
        { label: '', weight: 4 },
        { label: 'c', weight: -1 },
        { label: 'd', weight: 5 },
        { label: 'e', weight: 6 },
        { label: 'f', weight: 7 },
        { label: 'g', weight: 8 },
        { label: 'h', weight: 9 },
        { label: 'i', weight: 10 },
      ]),
    ).toEqual([
      { label: 'AA', weight: 2 },
      { label: 'BBB', weight: 99 },
      { label: 'C', weight: 1 },
      { label: 'D', weight: 5 },
      { label: 'E', weight: 6 },
      { label: 'F', weight: 7 },
      { label: 'G', weight: 8 },
      { label: 'H', weight: 9 },
    ]);
  });

  it('parses paired label and weight text', () => {
    expect(parseHuffmanInput('a, b c', '3, 5 8')).toEqual([
      { label: 'A', weight: 3 },
      { label: 'B', weight: 5 },
      { label: 'C', weight: 8 },
    ]);
  });

  it('returns no frames when fewer than two unique labels remain', () => {
    expect(buildHuffmanTimeline([{ label: 'A', weight: 1 }])).toEqual([]);
    expect(buildHuffmanTimeline([{ label: 'A', weight: 1 }, { label: 'A', weight: 2 }])).toEqual([]);
  });
});
