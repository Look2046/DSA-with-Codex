import type { TimelineFrame } from '../../engine/timeline/types';
import type { AnimationStep, HighlightEntry } from '../../types/animation';

export type HuffmanAction =
  | 'initial'
  | 'select'
  | 'lift'
  | 'attach'
  | 'return'
  | 'code'
  | 'completed';
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
export type HuffmanCodeEntry = { label: string; weight: number; code: string; pathLength: number };
export type HuffmanPathEdge = { fromId: string; toId: string; bit: '0' | '1' };
export type HuffmanDetailMode = 'codes' | 'wpl';
export type HuffmanDetailStep = {
  mode: HuffmanDetailMode;
  description: string;
  codeLines: number[];
  leafLabel: string;
  currentCode: string;
  pathNodeIds: string[];
  pathEdges: HuffmanPathEdge[];
  factorText: string | null;
  runningTotal: number | null;
  finalTotal: number | null;
};
export type HuffmanStep = AnimationStep & {
  action: HuffmanAction;
  nodes: HuffmanNode[];
  forestRoots: string[];
  displayRoots: string[];
  selectedIds: string[];
  mergedId: string | null;
  round: number;
  codes: HuffmanCodeEntry[];
  sourceItems: HuffmanInputItem[];
};
export type HuffmanTimelineFrame = TimelineFrame<HuffmanStep>;

function getNodeMap(step: Pick<HuffmanStep, 'nodes'>): Map<string, HuffmanNode> {
  return new Map(step.nodes.map((node) => [node.id, node]));
}

function cloneNodes(nodes: Map<string, HuffmanNode>): HuffmanNode[] {
  return Array.from(nodes.values()).map((node) => ({ ...node }));
}

function createHighlights(
  selectedIds: string[],
  mergedId: string | null,
  nodes: Map<string, HuffmanNode>,
): HighlightEntry[] {
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
  displayRoots: string[],
  sourceItems: HuffmanInputItem[],
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
    displayRoots: [...displayRoots],
    selectedIds: [...selectedIds],
    mergedId,
    round,
    codes: codes.map((entry) => ({ ...entry })),
    sourceItems: sourceItems.map((item) => ({ ...item })),
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
      result.push({
        label: node.label,
        weight: node.weight,
        code: prefix || '0',
        pathLength: prefix.length || 1,
      });
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

function getLeafPaths(step: HuffmanStep | undefined): Array<{
  leaf: HuffmanNode;
  code: string;
  pathNodeIds: string[];
  pathEdges: HuffmanPathEdge[];
}> {
  if (!step || step.forestRoots.length === 0) {
    return [];
  }

  const rootId = step.forestRoots[0];
  if (!rootId) {
    return [];
  }

  const nodeById = getNodeMap(step);
  const result: Array<{
    leaf: HuffmanNode;
    code: string;
    pathNodeIds: string[];
    pathEdges: HuffmanPathEdge[];
  }> = [];

  const visit = (
    nodeId: string,
    code: string,
    pathNodeIds: string[],
    pathEdges: HuffmanPathEdge[],
  ) => {
    const node = nodeById.get(nodeId);
    if (!node) {
      return;
    }

    const nextPathNodeIds = [...pathNodeIds, nodeId];
    if (node.leaf) {
      result.push({
        leaf: node,
        code: code || '0',
        pathNodeIds: nextPathNodeIds,
        pathEdges,
      });
      return;
    }

    if (node.leftId) {
      visit(node.leftId, `${code}0`, nextPathNodeIds, [
        ...pathEdges,
        { fromId: nodeId, toId: node.leftId, bit: '0' },
      ]);
    }

    if (node.rightId) {
      visit(node.rightId, `${code}1`, nextPathNodeIds, [
        ...pathEdges,
        { fromId: nodeId, toId: node.rightId, bit: '1' },
      ]);
    }
  };

  visit(rootId, '', [], []);
  return result.sort((left, right) => left.leaf.label.localeCompare(right.leaf.label));
}

export function buildHuffmanCodeDetailSteps(step: HuffmanStep | undefined): HuffmanDetailStep[] {
  const leafPaths = getLeafPaths(step);
  const detailSteps: HuffmanDetailStep[] = [];

  leafPaths.forEach(({ leaf, code, pathNodeIds, pathEdges }) => {
    pathEdges.forEach((_, index) => {
      detailSteps.push({
        mode: 'codes',
        description: `沿根到 ${leaf.label} 的路径继续读取编码`,
        codeLines: [2, 3, 4],
        leafLabel: leaf.label,
        currentCode: code.slice(0, index + 1),
        pathNodeIds: pathNodeIds.slice(0, index + 2),
        pathEdges: pathEdges.slice(0, index + 1),
        factorText: null,
        runningTotal: null,
        finalTotal: null,
      });
    });

    detailSteps.push({
      mode: 'codes',
      description: `得到 ${leaf.label} 的 Huffman 编码：${code}`,
      codeLines: [2, 5],
      leafLabel: leaf.label,
      currentCode: code,
      pathNodeIds,
      pathEdges,
      factorText: null,
      runningTotal: null,
      finalTotal: null,
    });
  });

  return detailSteps;
}

export function collectHuffmanCodesFromStep(step: HuffmanStep | undefined): HuffmanCodeEntry[] {
  return getLeafPaths(step).map(({ leaf, code }) => ({
    label: leaf.label,
    weight: leaf.weight,
    code,
    pathLength: code.length,
  }));
}

export function buildHuffmanWplDetailSteps(step: HuffmanStep | undefined): HuffmanDetailStep[] {
  const leafPaths = getLeafPaths(step);
  const detailSteps: HuffmanDetailStep[] = [];
  let runningTotal = 0;

  leafPaths.forEach(({ leaf, code, pathNodeIds, pathEdges }) => {
    pathEdges.forEach((_, index) => {
      detailSteps.push({
        mode: 'wpl',
        description: `沿根到 ${leaf.label} 的路径统计长度`,
        codeLines: [2, 3],
        leafLabel: leaf.label,
        currentCode: code.slice(0, index + 1),
        pathNodeIds: pathNodeIds.slice(0, index + 2),
        pathEdges: pathEdges.slice(0, index + 1),
        factorText: null,
        runningTotal,
        finalTotal: null,
      });
    });

    const contribution = leaf.weight * code.length;
    runningTotal += contribution;
    detailSteps.push({
      mode: 'wpl',
      description: `计算 ${leaf.label} 对 WPL 的贡献`,
      codeLines: [2, 4],
      leafLabel: leaf.label,
      currentCode: code,
      pathNodeIds,
      pathEdges,
      factorText: `${leaf.weight} × ${code.length} = ${contribution}`,
      runningTotal,
      finalTotal: null,
    });
  });

  if (detailSteps.length > 0) {
    detailSteps.push({
      mode: 'wpl',
      description: `所有叶子路径处理完成，得到最终 WPL = ${runningTotal}`,
      codeLines: [5],
      leafLabel: '',
      currentCode: '',
      pathNodeIds: [],
      pathEdges: [],
      factorText: null,
      runningTotal,
      finalTotal: runningTotal,
    });
  }

  return detailSteps;
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
    .slice(0, 10);
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

  const inputOrderRoots = [...forestRoots];
  forestRoots = sortRootIds(forestRoots, nodes);
  let displayRoots = [...inputOrderRoots];
  const steps: HuffmanStep[] = [
    createStep(nodes, forestRoots, displayRoots, normalized, 'initial', 0, [], null, [1]),
  ];

  let round = 1;
  while (forestRoots.length > 1) {
    forestRoots = sortRootIds(forestRoots, nodes);
    const [leftId, rightId] = forestRoots;
    const left = nodes.get(leftId);
    const right = nodes.get(rightId);
    if (!left || !right) {
      break;
    }

    steps.push(
      createStep(nodes, forestRoots, displayRoots, normalized, 'select', round, [leftId, rightId], null, [2, 3]),
    );
    steps.push(
      createStep(nodes, forestRoots, displayRoots, normalized, 'lift', round, [leftId, rightId], null, [2, 3]),
    );

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

    const selectedSet = new Set([leftId, rightId]);
    const mergedDisplayRoots = [...displayRoots.filter((id) => !selectedSet.has(id)), parentId];
    const attachForestRoots = forestRoots.length === 2 ? [parentId] : forestRoots;
    const attachDisplayRoots = forestRoots.length === 2 ? [] : mergedDisplayRoots;
    const finalAttachCodes = forestRoots.length === 2 ? collectCodes(nodes, parentId) : [];
    steps.push(
      createStep(
        nodes,
        attachForestRoots,
        attachDisplayRoots,
        normalized,
        'attach',
        round,
        [leftId, rightId],
        parentId,
        [4, 5],
        finalAttachCodes,
      ),
    );

    displayRoots = mergedDisplayRoots;
    if (displayRoots.length > 1) {
      steps.push(
        createStep(nodes, forestRoots, displayRoots, normalized, 'return', round, [leftId, rightId], parentId, [6]),
      );
    }
    forestRoots = sortRootIds([...forestRoots.slice(2), parentId], nodes);
    round += 1;
  }

  return steps.map((step, index) => ({ index, payload: step, logicalStepIndex: index }));
}
