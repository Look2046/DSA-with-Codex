import { describe, expect, it } from 'vitest';
import type { TranslationKey } from '../../i18n/translations';
import { generateQueueSteps } from '../../modules/linear/queueOps';
import type { QueueStep } from '../../modules/linear/queueOps';
import {
  getHighlightLabel,
  getStatusLabel,
  getStepDescription,
  parseNumberArrayAllowEmpty,
  resolveQueueConfig,
  resolveQueueConfigFromJson,
  serializeQueueConfigAsJson,
} from './queuePageUtils';

const t = (key: TranslationKey): string => key;

function createStep(action: QueueStep['action']): QueueStep {
  return {
    description: '',
    codeLines: [],
    highlights: [],
    queueState: [3, 8, 1],
    bufferState: [3, 8, 1, ...Array.from({ length: 17 }, () => null)],
    frontIndex: 0,
    rearIndex: 2,
    size: 3,
    action,
    indices: [0, 2],
    dequeuedValue: 3,
    enqueuedValue: 9,
    frontValue: 3,
  };
}

describe('queuePageUtils', () => {
  it('parses number arrays and handles empty input', () => {
    expect(parseNumberArrayAllowEmpty('')).toEqual([]);
    expect(parseNumberArrayAllowEmpty('1, 2, 3')).toEqual([1, 2, 3]);
    expect(parseNumberArrayAllowEmpty('1, x, 3')).toBeNull();
  });

  it('validates queue operation input', () => {
    expect(resolveQueueConfig('', 'enqueue', '9', 'normal', t)).toEqual({
      config: { queue: [], operation: { type: 'enqueue', value: 9 } },
      error: '',
    });
    expect(resolveQueueConfig('1,2', 'enqueue', 'x', 'normal', t)).toEqual({
      config: null,
      error: 'module.l05.error.value',
    });
    expect(resolveQueueConfig('', 'dequeue', '', 'normal', t)).toEqual({
      config: { queue: [], operation: { type: 'dequeue' } },
      error: 'module.l05.error.dequeueEmpty',
    });
  });

  it('maps playback status and step/highlight labels', () => {
    expect(getStatusLabel('idle', t)).toBe('playback.status.idle');
    expect(getStepDescription(createStep('initial'), t)).toBe('module.l05.step.initial');
    expect(getStepDescription(createStep('enqueue'), t)).toBe('module.l05.step.enqueue 9');
    expect(getStepDescription(createStep('dequeue'), t)).toBe('module.l05.step.dequeue 3');
    expect(getStepDescription(createStep('front'), t)).toBe('module.l05.step.front 3');
    expect(getStepDescription(createStep('completed'), t)).toBe('module.l05.step.completed');
    expect(getHighlightLabel('new-node', t)).toBe('module.l05.highlight.enqueued');
    expect(getHighlightLabel('moving', t)).toBe('module.l05.highlight.dequeued');
    expect(getHighlightLabel('matched', t)).toBe('module.l05.highlight.front');
  });

  it('serializes and resolves queue JSON config', () => {
    const serialized = serializeQueueConfigAsJson({ queue: [3, 8, 1], operation: { type: 'enqueue', value: 9 } });
    expect(resolveQueueConfigFromJson(serialized, 'normal', t)).toEqual({
      config: { queue: [3, 8, 1], operation: { type: 'enqueue', value: 9 } },
      error: '',
    });
  });

  it('rejects invalid queue JSON and schema', () => {
    expect(resolveQueueConfigFromJson('{oops}', 'normal', t)).toEqual({
      config: null,
      error: 'module.l05.json.error.parse',
    });
    expect(resolveQueueConfigFromJson('{"queue":[1,2],"operation":{"kind":"enqueue"}}', 'normal', t)).toEqual({
      config: null,
      error: 'module.l05.json.error.schema',
    });
  });

  it('keeps replay deterministic after queue export/import round-trip', () => {
    const raw = serializeQueueConfigAsJson({ queue: [3, 8, 1], operation: { type: 'enqueue', value: 9 } });
    const resolved = resolveQueueConfigFromJson(raw, 'normal', t);
    expect(resolved.config).not.toBeNull();

    const direct = generateQueueSteps([3, 8, 1], { type: 'enqueue', value: 9 });
    const replay = generateQueueSteps(
      resolved.config?.queue ?? [],
      resolved.config?.operation ?? { type: 'enqueue', value: 0 },
    );
    expect(replay).toEqual(direct);
  });

  it('uses one-empty-slot full rule for circular queue', () => {
    expect(resolveQueueConfig(Array.from({ length: 19 }, (_, index) => index).join(','), 'enqueue', '9', 'circular', t)).toEqual({
      config: null,
      error: 'module.l05.error.circularFull',
    });
  });
});
