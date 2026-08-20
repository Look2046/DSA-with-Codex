import type { TimelineFrame } from '../../engine/timeline/types';
import type { AnimationStep, HighlightEntry } from '../../types/animation';

export type HuffmanAction = 'initial' | 'select' | 'merge' | 'code' | 'completed';
export type HuffmanInputItem = { label: string; weight: number };
export type HuffmanNode = {
  id: string;
  label: string;
  weight: number;
  leftId: string | null;
  rightId: string | null;
  parentId: string | null;
  leaf: boolean;
};
export type HuffmanCodeEntry = { label: string; weight: number; code: string };
export type HuffmanStep = AnimationStep & {
  action: HuffmanAction;
  nodes: HuffmanNode[];
  forestRoots: string[];
  selectedIds: string[];
  mergedId: string | null;
  round: number;
  codes: HuffmanCodeEntry[];
};
export type HuffmanTimelineFrame = TimelineFrame<HuffmanStep>;

function cloneNodes(nodes: Map<string, HuffmanNode>): HuffmanNode[] {
  return Array.from(nodes.values()).map((node) => ({ ...node }));
}

function createHighlights(selectedIds: string[], mergedId: string | null, nodes: Map<string, HuffmanNode>): HighlightEntry[] {
  const indexById = new Map(Array.from(nodes.keys()).map((id, index) => [id, index]));
  const highlights: HighlightEntry[] = selectedIds
    .map((id) => indexById.get(id))
    .filter((index): index is number => index !== undefined)
    .map((index) => ({ index, type: 'comparing' as const }));

  if (mergedId) {
    const mergedIndex = indexById.get(mergedId);
    if (mergedIndex !== undefined) {
      highlights.push({ index: mergedIndex, type: 'new-node' });
    }
  }
  return highlights;
}

function createStep(
  nodes: Map<string, HuffmanNode>,
  forestRoots: string[],
  action: HuffmanAction,
  round: number,
  selectedIds: string[],
  mergedId: string | null,
  codeLines: number[],
  codes: HuffmanCodeEntry[] = [],
): HuffmanStep {
  return {
    description: action,
    action,
    nodes: cloneNodes(nodes),
    forestRoots: [...forestRoots],
    selectedIds: [...selectedIds],
    mergedId,
    round,
    codes: codes.map((entry) => ({ ...entry })),
    codeLines,
    highlights: createHighlights(selectedIds, mergedId, nodes),
  };
}

function sortRootIds(rootIds: string[], nodes: Map<string, HuffmanNode>): string[] {
  return [...rootIds].sort((leftId, rightId) => {
    const left = nodes.get(leftId);
    const right = nodes.get(rightId);
    if (!left || !right) {
      return leftId.localeCompare(rightId);
    }
    const weightGap = left.weight - right.weight;
    if (weightGap !== 0) {
      return weightGap;
    }
    return left.label.localeCompare(right.label);
  });
}

function collectCodes(nodes: Map<string, HuffmanNode>, rootId: string): HuffmanCodeEntry[] {
  const result: HuffmanCodeEntry[] = [];

  const visit = (nodeId: string, prefix: string) => {
    const node = nodes.get(nodeId);
    if (!node) {
      return;
    }
    if (node.leaf) {
      result.push({ label: node.label, weight: node.weight, code: prefix || '0' });
      return;
    }
    if (node.leftId) {
      visit(node.leftId, `${prefix}0`);
    }
    if (node.rightId) {
      visit(node.rightId, `${prefix}1`);
    }
  };

  visit(rootId, '');
  return result.sort((left, right) => left.label.localeCompare(right.label));
}

export function normalizeHuffmanItems(items: readonly HuffmanInputItem[]): HuffmanInputItem[] {
  const seen = new Set<string>();
  return items
    .map((item) => ({
      label: item.label.trim().slice(0, 3).toUpperCase(),
      weight: Math.max(1, Math.min(99, Math.floor(item.weight))),
    }))
    .filter((item) => {
      if (!item.label || seen.has(item.label)) {
        return false;
      }
      seen.add(item.label);
      return true;
    })
    .slice(0, 8);
}

export function parseHuffmanInput(labelsText: string, weightsText: string): HuffmanInputItem[] {
  const labels = labelsText
    .split(/[\s,，;；]+/)
    .map((label) => label.trim())
    .filter(Boolean);
  const weights = weightsText
    .split(/[\s,，;；]+/)
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));

  const length = Math.min(labels.length, weights.length);
  return normalizeHuffmanItems(
    Array.from({ length }, (_, index) => ({ label: labels[index], weight: weights[index] })),
  );
}

export function buildHuffmanTimeline(items: readonly HuffmanInputItem[]): HuffmanTimelineFrame[] {
  const normalized = normalizeHuffmanItems(items);
  if (normalized.length < 2) {
    return [];
  }

  const nodes = new Map<string, HuffmanNode>();
  let forestRoots: string[] = [];
  normalized.forEach((item, index) => {
    const id = `leaf-${item.label}-${index}`;
    nodes.set(id, {
      id,
      label: item.label,
      weight: item.weight,
      leftId: null,
      rightId: null,
      parentId: null,
      leaf: true,
    });
    forestRoots.push(id);
  });

  forestRoots = sortRootIds(forestRoots, nodes);
  const steps: HuffmanStep[] = [createStep(nodes, forestRoots, 'initial', 0, [], null, [1])];

  let round = 1;
  while (forestRoots.length > 1) {
    forestRoots = sortRootIds(forestRoots, nodes);
    const [leftId, rightId] = forestRoots;
    const left = nodes.get(leftId);
    const right = nodes.get(rightId);
    if (!left || !right) {
      break;
    }

    steps.push(createStep(nodes, forestRoots, 'select', round, [leftId, rightId], null, [2, 3]));

    const parentId = `internal-${round}`;
    nodes.set(leftId, { ...left, parentId });
    nodes.set(rightId, { ...right, parentId });
    nodes.set(parentId, {
      id: parentId,
      label: `${left.weight + right.weight}`,
      weight: left.weight + right.weight,
      leftId,
      rightId,
      parentId: null,
      leaf: false,
    });

    forestRoots = sortRootIds([parentId, ...forestRoots.slice(2)], nodes);
    steps.push(createStep(nodes, forestRoots, 'merge', round, [leftId, rightId], parentId, [4, 5, 6]));
    round += 1;
  }

  const rootId = forestRoots[0];
  const codes = rootId ? collectCodes(nodes, rootId) : [];
  steps.push(createStep(nodes, forestRoots, 'code', round, [], rootId ?? null, [7], codes));
  steps.push(createStep(nodes, forestRoots, 'completed', round, [], rootId ?? null, [7], codes));

  return steps.map((step, index) => ({ index, payload: step, logicalStepIndex: index }));
}
