import { describe, expect, it } from 'vitest';
import type { TranslationKey } from '../../i18n/translations';
import { generateStackSteps } from '../../modules/linear/stackOps';
import type { StackStep } from '../../modules/linear/stackOps';
import {
  createInitialStackPageState,
  getStackPseudocodeActiveLines,
  getLinkedStackLayoutMode,
  getSequentialTopPointerTarget,
  getStackWorkspaceConfig,
  getHighlightLabel,
  getStatusLabel,
  getStepDescription,
  parseNumberArrayAllowEmpty,
  resolveStackConfig,
  resolveStackConfigFromJson,
  serializeStackConfigAsJson,
} from './stackPageUtils';

const t = (key: TranslationKey): string => key;

function createStep(action: StackStep['action']): StackStep {
  return {
    description: '',
    codeLines: [],
    highlights: [],
    stackState: [3, 8, 1],
    action,
    indices: [2],
    poppedValue: 1,
    peekValue: 1,
  };
}

describe('stackPageUtils', () => {
  it('parses number arrays and handles empty input', () => {
    expect(parseNumberArrayAllowEmpty('')).toEqual([]);
    expect(parseNumberArrayAllowEmpty('1, 2, 3')).toEqual([1, 2, 3]);
    expect(parseNumberArrayAllowEmpty('1, x, 3')).toBeNull();
  });

  it('validates stack operation input', () => {
    expect(resolveStackConfig('', 'push', '9', t)).toEqual({
      config: { stack: [], operation: { type: 'push', value: 9 } },
      error: '',
    });
    expect(resolveStackConfig('1,2', 'push', 'x', t)).toEqual({
      config: null,
      error: 'module.l04.error.value',
    });
    expect(resolveStackConfig('', 'pop', '', t)).toEqual({
      config: { stack: [], operation: { type: 'pop' } },
      error: 'module.l04.error.popEmpty',
    });
  });

  it('keeps push-full input playable for the sequence-vs-linked comparison', () => {
    expect(resolveStackConfig('0, 1, 2, 3, 4, 5, 6, 7, 8, 9', 'push', '11', t)).toEqual({
      config: {
        stack: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        operation: { type: 'push', value: 11 },
      },
      error: 'module.l04.error.pushFull',
    });
  });

  it('maps playback status and step/highlight labels', () => {
    expect(getStatusLabel('idle', t)).toBe('playback.status.idle');
    expect(getStepDescription(createStep('initial'), t)).toBe('module.l04.step.initial');
    expect(getStepDescription(createStep('push'), t)).toBe('module.l04.step.push 1');
    expect(getStepDescription(createStep('pop'), t)).toBe('module.l04.step.pop 1');
    expect(getStepDescription(createStep('peek'), t)).toBe('module.l04.step.peek 1');
    expect(getStepDescription(createStep('completed'), t)).toBe('module.l04.step.completed');
    expect(getHighlightLabel('new-node', t)).toBe('module.l04.highlight.pushed');
    expect(getHighlightLabel('moving', t)).toBe('module.l04.highlight.popped');
    expect(getHighlightLabel('matched', t)).toBe('module.l04.highlight.peeked');
  });

  it('uses the compact L-04 workspace configuration without json controls', () => {
    expect(getStackWorkspaceConfig()).toEqual({
      pageClassName: 'array-page tree-page linear-adaptive linear-adaptive-viewport-lock',
      controlsPanelClassName: 'workspace-drawer-scroll array-controls-drawer stack-controls-drawer',
      controlsPanelSize: { width: 1080, height: 380 },
      controlsPanelAutoAvoid: false,
      controlsPanelOverflowMargin: 0,
      stepPanelAutoAvoid: false,
      stepPanelOverflowMargin: 0,
      contextPanelSize: { width: 760, height: 380 },
      stageClassName: 'workspace-stage-array workspace-stage-stack',
      stageBodyClassName: 'workspace-stage-body-array workspace-stage-body-stack',
      shellClassName: 'stack-workspace-shell',
      floatingPanelsEnabledMinHeight: 0,
      showJsonControls: false,
    });
  });

  it('maps comparison steps to separate sequential and linked pseudocode lines', () => {
    expect(getStackPseudocodeActiveLines({ action: 'preparePush', codeLines: [2, 3] }, 'sequential')).toEqual([2, 3]);
    expect(getStackPseudocodeActiveLines({ action: 'linkPush', codeLines: [2, 4] }, 'sequential')).toEqual([2, 3]);
    expect(getStackPseudocodeActiveLines({ action: 'overflow', codeLines: [2, 5] }, 'sequential')).toEqual([3]);
    expect(getStackPseudocodeActiveLines({ action: 'completed', codeLines: [5] }, 'sequential')).toEqual([4]);
    expect(getStackPseudocodeActiveLines({ action: 'linkPush', codeLines: [2, 4] }, 'linked')).toEqual([3]);
    expect(getStackPseudocodeActiveLines({ action: 'overflow', codeLines: [2, 5] }, 'linked')).toEqual([4]);
    expect(getStackPseudocodeActiveLines({ action: 'completed', codeLines: [6] }, 'linked')).toEqual([6, 7]);
    expect(getStackPseudocodeActiveLines({ action: 'completed', codeLines: [7] }, 'linked')).toEqual([8]);
  });

  it('switches the linked-stack into denser layouts as more nodes must stay visible', () => {
    expect(getLinkedStackLayoutMode(7)).toBe('regular');
    expect(getLinkedStackLayoutMode(8)).toBe('compact');
    expect(getLinkedStackLayoutMode(10)).toBe('dense');
    expect(getLinkedStackLayoutMode(11)).toBe('dense');
  });

  it('points the sequential-stack top to the next writable slot', () => {
    expect(getSequentialTopPointerTarget(0)).toEqual({ kind: 'cell', index: 0 });
    expect(getSequentialTopPointerTarget(3)).toEqual({ kind: 'cell', index: 3 });
    expect(getSequentialTopPointerTarget(10)).toEqual({ kind: 'null' });
  });

  it('provides the default page state that Reset should restore', () => {
    expect(createInitialStackPageState()).toEqual({
      stackInput: '3, 8, 1',
      operationType: 'push',
      valueInput: '9',
      error: '',
      hasValidConfig: true,
      activeBases: {
        sequential: [3, 8, 1],
        linked: [3, 8, 1],
      },
      comparisonSource: {
        sequential: [3, 8, 1],
        linked: [3, 8, 1],
        operation: { type: 'push', value: 9 },
      },
    });
  });

  it('serializes and resolves stack JSON config', () => {
    const serialized = serializeStackConfigAsJson({ stack: [3, 8, 1], operation: { type: 'push', value: 9 } });
    expect(resolveStackConfigFromJson(serialized, t)).toEqual({
      config: { stack: [3, 8, 1], operation: { type: 'push', value: 9 } },
      error: '',
    });
  });

  it('rejects invalid stack JSON and schema', () => {
    expect(resolveStackConfigFromJson('{oops}', t)).toEqual({
      config: null,
      error: 'module.l04.json.error.parse',
    });
    expect(resolveStackConfigFromJson('{"stack":[1,2],"operation":{"kind":"push"}}', t)).toEqual({
      config: null,
      error: 'module.l04.json.error.schema',
    });
  });

  it('keeps replay deterministic after stack export/import round-trip', () => {
    const raw = serializeStackConfigAsJson({ stack: [3, 8, 1], operation: { type: 'push', value: 9 } });
    const resolved = resolveStackConfigFromJson(raw, t);
    expect(resolved.config).not.toBeNull();

    const direct = generateStackSteps([3, 8, 1], { type: 'push', value: 9 });
    const replay = generateStackSteps(
      resolved.config?.stack ?? [],
      resolved.config?.operation ?? { type: 'push', value: 0 },
    );
    expect(replay).toEqual(direct);
  });
});
