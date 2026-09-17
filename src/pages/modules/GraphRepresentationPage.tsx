import { useMemo, useState } from 'react';
import { StaticWorkbenchShell } from '../../components/StaticWorkbenchShell';
import { useI18n } from '../../i18n/useI18n';
import {
  findConnectedComponents,
  findStronglyConnectedComponents,
  generateGraphConceptGraph,
  getComponentIndex,
  getDensityRatio,
  getInDegree,
  getIncomingNeighbors,
  getMaximumEdgeCount,
  getOutDegree,
  getOutgoingNeighbors,
  getTotalDegree,
  isCompleteConceptGraph,
  type GraphConceptConfig,
  type GraphConceptDensity,
  type GraphConceptEdge,
  type GraphConceptGraph,
  type GraphConceptPath,
  type GraphConceptScenario,
} from '../../modules/graph/graphConcepts';

type GraphConceptTab = 'basics' | 'connectivity' | 'special';
type GraphConceptDemoKind = 'path' | 'simplePath' | 'cycle' | 'simpleCycle';
type TeachingRecipe = {
  vertexCount: number;
  mainVertexCount: number;
  pathNodeIndices: number[];
  branchParents: number[];
  layout: 'path' | 'cycle';
  family: number;
};

type LanguageCopy = {
  intro: string;
  toolbarTitle: string;
  tabs: Record<GraphConceptTab, string>;
  graphKinds: {
    directed: string;
    undirected: string;
    weighted: string;
    unweighted: string;
  };
  densities: Record<GraphConceptDensity, string>;
  scenarios: Record<GraphConceptScenario, string>;
  labels: {
    directed: string;
    weighted: string;
    density: string;
    scenario: string;
    vertexCount: string;
    regenerate: string;
    generateCycle: string;
    generatePath: string;
    generateSimpleCycle: string;
    generateSimplePath: string;
    reset: string;
    stage: string;
    clickHint: string;
    selectedNode: string;
    neighbors: string;
    selectedEdge: string;
    outgoingNeighbors: string;
    incomingNeighbors: string;
    degree: string;
    inDegree: string;
    outDegree: string;
    simplePath: string;
    simpleCycle: string;
    path: string;
    cycle: string;
    edgeLength: string;
    weightedLength: string;
    edgeCount: string;
    maxEdgeCount: string;
    densityRatio: string;
    connectivity: string;
    connected: string;
    disconnected: string;
    weakComponents: string;
    strongConnectivity: string;
    stronglyConnected: string;
    notStronglyConnected: string;
    strongComponents: string;
    completeGraph: string;
    completeDigraph: string;
    expectedEdges: string;
    actualEdges: string;
    formulas: string;
    noPath: string;
    noCycle: string;
    none: string;
    summary: string;
    component: string;
    componentGuide: string;
    specialGuide: string;
    graphType: string;
  };
  descriptions: Record<GraphConceptTab, string>;
};

const COPY: Record<'zh' | 'en', LanguageCopy> = {
  zh: {
    intro:
      '图的基本定义演示台：不讲算法过程，只通过随机图、点击高亮和说明卡来观察顶点、边、路径、连通性与特殊图定义。',
    toolbarTitle: '图形样本控制',
    tabs: {
      basics: '基础术语',
      connectivity: '连通性',
      special: '特殊图',
    },
    graphKinds: {
      directed: '有向图',
      undirected: '无向图',
      weighted: '带权图',
      unweighted: '不带权图',
    },
    densities: {
      sparse: '稀疏',
      medium: '中等',
      dense: '稠密',
    },
    scenarios: {
      general: '一般随机',
      connected: '连通图',
      disconnected: '非连通图',
      stronglyConnected: '强连通图',
      notStronglyConnected: '非强连通图',
      complete: '完全图',
    },
    labels: {
      directed: '方向',
      weighted: '权值',
      density: '边密度',
      scenario: '样本约束',
      vertexCount: '顶点数',
      regenerate: '生成图',
      generateCycle: '生成回路',
      generatePath: '生成路径',
      generateSimpleCycle: '生成简单回路',
      generateSimplePath: '生成简单路径',
      reset: '重置',
      stage: '图定义主画布',
      clickHint: '单击顶点查看邻接点与度；路径与回路按钮会重新构造一张更清晰的新图并标注示例；单击边可查看边定义。',
      selectedNode: '当前顶点',
      neighbors: '邻接点',
      selectedEdge: '当前边',
      outgoingNeighbors: '邻接点 / 出边终点',
      incomingNeighbors: '逆邻接点 / 入边起点',
      degree: '度',
      inDegree: '入度',
      outDegree: '出度',
      simplePath: '简单路径示例',
      simpleCycle: '简单回路示例',
      path: '路径示例',
      cycle: '回路示例',
      edgeLength: '边数长度',
      weightedLength: '权值长度',
      edgeCount: '边数',
      maxEdgeCount: '最大边数',
      densityRatio: '密度比例',
      connectivity: '连通性',
      connected: '连通图',
      disconnected: '非连通图',
      weakComponents: '连通分量数',
      strongConnectivity: '强连通性',
      stronglyConnected: '强连通图',
      notStronglyConnected: '非强连通图',
      strongComponents: '强连通分量数',
      completeGraph: '完全图',
      completeDigraph: '有向完全图',
      expectedEdges: '公式边数',
      actualEdges: '实际边数',
      formulas: '结果卡',
      noPath: '当前图中没有找到符合要求的路径示例。',
      noCycle: '当前图中没有找到符合要求的回路示例。',
      none: '未选择',
      summary: '概念摘要',
      component: '所属分量',
      componentGuide: '无向图看连通分量；有向图只看强连通结果。',
      specialGuide: '完全图 / 有向完全图直接给出公式边数与实际边数对照。',
      graphType: '图类型',
    },
    descriptions: {
      basics: '点击顶点和边，直接看定义，不播放过程。',
      connectivity: '颜色分组直接说明连通与强连通，不引入算法步骤。',
      special: '用结果卡说明完全图、边数公式和稀疏/稠密差别。',
    },
  },
  en: {
    intro:
      'A concept-first graph workbench: no algorithm playback, only random graph samples, click-based highlighting, and direct explanation cards for vertices, edges, paths, connectivity, and special graph types.',
    toolbarTitle: 'Graph Sample Controls',
    tabs: {
      basics: 'Basic Terms',
      connectivity: 'Connectivity',
      special: 'Special Graphs',
    },
    graphKinds: {
      directed: 'Directed',
      undirected: 'Undirected',
      weighted: 'Weighted',
      unweighted: 'Unweighted',
    },
    densities: {
      sparse: 'Sparse',
      medium: 'Medium',
      dense: 'Dense',
    },
    scenarios: {
      general: 'General Random',
      connected: 'Connected',
      disconnected: 'Disconnected',
      stronglyConnected: 'Strongly Connected',
      notStronglyConnected: 'Not Strongly Connected',
      complete: 'Complete',
    },
    labels: {
      directed: 'Direction',
      weighted: 'Weights',
      density: 'Density',
      scenario: 'Sample Constraint',
      vertexCount: 'Vertices',
      regenerate: 'Generate Graph',
      generateCycle: 'Generate Cycle',
      generatePath: 'Generate Path',
      generateSimpleCycle: 'Generate Simple Cycle',
      generateSimplePath: 'Generate Simple Path',
      reset: 'Reset',
      stage: 'Graph concept stage',
      clickHint: 'Click a vertex to inspect adjacency and degree. The path and cycle buttons rebuild a cleaner teaching graph and mark the example directly. Click an edge to inspect the relation directly.',
      selectedNode: 'Selected vertex',
      neighbors: 'Neighbors',
      selectedEdge: 'Selected edge',
      outgoingNeighbors: 'Neighbors / outgoing endpoints',
      incomingNeighbors: 'Reverse neighbors / incoming sources',
      degree: 'Degree',
      inDegree: 'In-degree',
      outDegree: 'Out-degree',
      simplePath: 'Simple path example',
      simpleCycle: 'Simple cycle example',
      path: 'Path example',
      cycle: 'Cycle example',
      edgeLength: 'Edge-count length',
      weightedLength: 'Weight-sum length',
      edgeCount: 'Edges',
      maxEdgeCount: 'Max edges',
      densityRatio: 'Density ratio',
      connectivity: 'Connectivity',
      connected: 'Connected',
      disconnected: 'Disconnected',
      weakComponents: 'Connected components',
      strongConnectivity: 'Strong connectivity',
      stronglyConnected: 'Strongly connected',
      notStronglyConnected: 'Not strongly connected',
      strongComponents: 'Strong components',
      completeGraph: 'Complete graph',
      completeDigraph: 'Complete digraph',
      expectedEdges: 'Formula edge count',
      actualEdges: 'Actual edge count',
      formulas: 'Result card',
      noPath: 'No qualifying path example was found in the current graph.',
      noCycle: 'No qualifying cycle example was found in the current graph.',
      none: 'None',
      summary: 'Concept summary',
      component: 'Component',
      componentGuide: 'Undirected graphs show connected components; directed graphs show only strong connectivity results.',
      specialGuide: 'Complete graphs and complete digraphs show both the formula edge count and the current actual edge count side by side.',
      graphType: 'Graph type',
    },
    descriptions: {
      basics: 'Click vertices and edges to inspect definitions directly, without timeline playback.',
      connectivity: 'Use component coloring to explain connected and strongly connected ideas without algorithm steps.',
      special: 'Use result cards to explain complete graphs, edge-count formulas, and sparse-vs-dense contrast.',
    },
  },
};

const DENSITY_OPTIONS: GraphConceptDensity[] = ['sparse', 'medium', 'dense'];
const DEFAULT_CONFIG: GraphConceptConfig = {
  directed: false,
  weighted: false,
  density: 'medium',
  scenario: 'general',
  vertexCount: 8,
};

function getScenarioOptions(directed: boolean): GraphConceptScenario[] {
  return directed
    ? ['general', 'stronglyConnected', 'notStronglyConnected', 'complete']
    : ['general', 'connected', 'disconnected', 'complete'];
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function joinNodeLabels(graph: GraphConceptGraph, nodeIndices: number[]) {
  return nodeIndices.map((nodeIndex) => graph.nodes[nodeIndex]?.id ?? '?').join(', ');
}

function getPathLabel(graph: GraphConceptGraph, nodeIndices: number[]) {
  return nodeIndices.map((nodeIndex) => graph.nodes[nodeIndex]?.id ?? '?').join(graph.directed ? ' → ' : ' — ');
}

function getGraphTypeLabel(graph: GraphConceptGraph, copy: LanguageCopy) {
  const direction = graph.directed ? copy.graphKinds.directed : copy.graphKinds.undirected;
  const weighted = graph.weighted ? copy.graphKinds.weighted : copy.graphKinds.unweighted;
  return `${direction} / ${weighted}`;
}

function getEdgeIdBetween(graph: GraphConceptGraph, fromIndex: number, toIndex: number) {
  return (
    graph.edges.find((edge) =>
      graph.directed
        ? edge.from === fromIndex && edge.to === toIndex
        : (edge.from === fromIndex && edge.to === toIndex) || (edge.from === toIndex && edge.to === fromIndex),
    )?.id ?? null
  );
}

function buildConceptPath(graph: GraphConceptGraph, nodeIndices: number[]): GraphConceptPath | null {
  if (nodeIndices.length < 2) {
    return null;
  }

  const edgeIds: string[] = [];
  for (let index = 0; index < nodeIndices.length - 1; index += 1) {
    const edgeId = getEdgeIdBetween(graph, nodeIndices[index] ?? -1, nodeIndices[index + 1] ?? -1);
    if (!edgeId) {
      return null;
    }
    edgeIds.push(edgeId);
  }

  const weightLength =
    graph.weighted && edgeIds.length > 0
      ? edgeIds.reduce((sum, edgeId) => sum + (graph.edges.find((edge) => edge.id === edgeId)?.weight ?? 0), 0)
      : graph.weighted
        ? 0
        : null;

  return {
    nodeIndices,
    edgeIds,
    edgeLength: edgeIds.length,
    weightLength,
  };
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createTeachingNodeId(index: number) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return alphabet[index] ?? `V${index + 1}`;
}

function clampCoordinate(value: number) {
  return Math.max(12, Math.min(88, value));
}

function resolveNodeOverlap(nodes: Array<{ id: string; x: number; y: number }>, minDistance = 10.5) {
  const next = nodes.map((node) => ({ ...node }));

  for (let pass = 0; pass < 80; pass += 1) {
    let moved = false;

    for (let leftIndex = 0; leftIndex < next.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < next.length; rightIndex += 1) {
        const left = next[leftIndex];
        const right = next[rightIndex];
        const dx = right.x - left.x;
        const dy = right.y - left.y;
        const distance = Math.hypot(dx, dy);

        if (distance >= minDistance) {
          continue;
        }

        moved = true;
        const safeDistance = Math.max(distance, 0.01);
        const overlap = (minDistance - safeDistance) / 2;
        const unitX = dx / safeDistance;
        const unitY = dy / safeDistance;
        const nudgeX = distance < 0.01 ? (leftIndex % 2 === 0 ? 1 : -1) * overlap : unitX * overlap;
        const nudgeY = distance < 0.01 ? (rightIndex % 2 === 0 ? -1 : 1) * overlap : unitY * overlap;

        left.x = clampCoordinate(left.x - nudgeX);
        left.y = clampCoordinate(left.y - nudgeY);
        right.x = clampCoordinate(right.x + nudgeX);
        right.y = clampCoordinate(right.y + nudgeY);
      }
    }

    if (!moved) {
      break;
    }
  }

  return next;
}

function countUniqueValues(values: number[]) {
  return new Set(values).size;
}

function generateSimplePathWalk() {
  const uniqueCount = randomInt(5, 7);
  return Array.from({ length: uniqueCount }, (_, index) => index);
}

function generatePathWalk() {
  const uniqueCount = randomInt(6, 8);
  const pivot = randomInt(1, uniqueCount - 4);
  const detour = [pivot + 1, pivot + 2];
  const suffix = Array.from({ length: uniqueCount - (pivot + 3) }, (_, index) => pivot + 3 + index);

  return [...Array.from({ length: pivot + 1 }, (_, index) => index), ...detour, pivot, ...suffix];
}

function generateSimpleCycleWalk() {
  const uniqueCount = randomInt(5, 7);
  return [...Array.from({ length: uniqueCount }, (_, index) => index), 0];
}

function generateCycleWalk() {
  const uniqueCount = randomInt(6, 8);
  const pivot = randomInt(1, uniqueCount - 4);
  const detour = [pivot + 1, pivot + 2];
  const suffix = Array.from({ length: uniqueCount - (pivot + 3) }, (_, index) => pivot + 3 + index);

  return [...Array.from({ length: pivot + 1 }, (_, index) => index), ...detour, pivot, ...suffix, 0];
}

function createBranchParents(mainVertexCount: number, branchCount: number) {
  const parents: number[] = [];

  for (let branchIndex = 0; branchIndex < branchCount; branchIndex += 1) {
    if (branchIndex > 0 && Math.random() > 0.55) {
      parents.push(mainVertexCount + branchIndex - 1);
      continue;
    }

    parents.push(randomInt(1, Math.max(1, mainVertexCount - 2)));
  }

  return parents;
}

function createTeachingRecipe(kind: GraphConceptDemoKind): TeachingRecipe {
  if (kind === 'simplePath') {
    const pathNodeIndices = generateSimplePathWalk();
    const mainVertexCount = countUniqueValues(pathNodeIndices);
    const branchCount = randomInt(1, 2);
    return {
      vertexCount: mainVertexCount + branchCount,
      mainVertexCount,
      pathNodeIndices,
      branchParents: createBranchParents(mainVertexCount, branchCount),
      layout: 'path',
      family: randomInt(0, 3),
    };
  }

  if (kind === 'path') {
    const pathNodeIndices = generatePathWalk();
    const mainVertexCount = countUniqueValues(pathNodeIndices);
    const branchCount = randomInt(1, 2);

    return {
      vertexCount: mainVertexCount + branchCount,
      mainVertexCount,
      pathNodeIndices,
      branchParents: createBranchParents(mainVertexCount, branchCount),
      layout: 'path',
      family: randomInt(0, 3),
    };
  }

  if (kind === 'simpleCycle') {
    const pathNodeIndices = generateSimpleCycleWalk();
    const mainVertexCount = countUniqueValues(pathNodeIndices.slice(0, -1));
    const branchCount = randomInt(1, 2);
    return {
      vertexCount: mainVertexCount + branchCount,
      mainVertexCount,
      pathNodeIndices,
      branchParents: createBranchParents(mainVertexCount, branchCount),
      layout: 'cycle',
      family: randomInt(0, 3),
    };
  }

  const pathNodeIndices = generateCycleWalk();
  const mainVertexCount = countUniqueValues(pathNodeIndices.slice(0, -1));
  const branchCount = randomInt(1, 2);

  return {
    vertexCount: mainVertexCount + branchCount,
    mainVertexCount,
    pathNodeIndices,
    branchParents: createBranchParents(mainVertexCount, branchCount),
    layout: 'cycle',
    family: randomInt(0, 3),
  };
}

function createTeachingNodes(recipe: TeachingRecipe) {
  const nodes = new Array<{ id: string; x: number; y: number }>(recipe.vertexCount);
  const labelStart = randomInt(0, 9);

  if (recipe.layout === 'path') {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const leftX = randomInt(16, 22);
    const topY = randomInt(20, 28);
    const bottomY = randomInt(68, 80);
    const centerX = 50;
    const centerY = 50;

    for (let nodeIndex = 0; nodeIndex < recipe.mainVertexCount; nodeIndex += 1) {
      const progress = recipe.mainVertexCount === 1 ? 0 : nodeIndex / (recipe.mainVertexCount - 1);
      let x = centerX;
      let y = centerY;

      if (recipe.family === 0) {
        x = leftX + progress * randomInt(58, 64);
        y = progress < 0.5 ? topY + progress * 2 * (centerY - topY) : centerY + (progress - 0.5) * 2 * (bottomY - centerY);
        y += (nodeIndex % 2 === 0 ? -4 : 4) * direction;
      } else if (recipe.family === 1) {
        x = centerX + Math.cos((-0.9 + progress * 1.8) * Math.PI) * randomInt(22, 28);
        y = topY + progress * (bottomY - topY) + Math.sin(progress * Math.PI * 2) * 8 * direction;
      } else if (recipe.family === 2) {
        x = leftX + progress * randomInt(56, 62) + (progress < 0.34 ? -6 : progress > 0.68 ? 6 : 0);
        y =
          nodeIndex % 3 === 0
            ? topY + randomInt(-2, 3)
            : nodeIndex % 3 === 1
              ? centerY + randomInt(-5, 5)
              : bottomY + randomInt(-3, 2);
      } else {
        const fanAngle = (-0.78 + progress * 1.56) * Math.PI;
        x = centerX + Math.cos(fanAngle) * randomInt(24, 32);
        y = centerY + Math.sin(fanAngle) * randomInt(18, 28) * direction;
      }

      nodes[nodeIndex] = {
        id: createTeachingNodeId(labelStart + nodeIndex),
        x: clampCoordinate(x),
        y: clampCoordinate(y),
      };
    }

    recipe.branchParents.forEach((parentIndex, branchOffset) => {
      const nodeIndex = recipe.mainVertexCount + branchOffset;
      const parent = nodes[parentIndex] ?? nodes[Math.min(parentIndex, recipe.mainVertexCount - 1)];
      const branchDirection = branchOffset % 2 === 0 ? -direction : direction;
      const xOffset = randomInt(10, 18) * (Math.random() > 0.5 ? 1 : -1);
      const yOffset = randomInt(12, 22) * branchDirection;

      nodes[nodeIndex] = {
        id: createTeachingNodeId(labelStart + nodeIndex),
        x: clampCoordinate(parent.x + xOffset),
        y: clampCoordinate(parent.y + yOffset),
      };
    });

    return resolveNodeOverlap(nodes);
  }

  const centerX = 50;
  const centerY = 50;
  const radiusX = randomInt(24, 31);
  const radiusY = randomInt(20, 28);

  for (let orderIndex = 0; orderIndex < recipe.mainVertexCount; orderIndex += 1) {
    const nodeIndex = orderIndex;
    const progress = orderIndex / recipe.mainVertexCount;
    const angle = -Math.PI / 2 + Math.PI * 2 * progress;
    const x =
      recipe.family === 0
        ? centerX + Math.cos(angle) * radiusX
        : recipe.family === 1
          ? centerX + Math.cos(angle) * (radiusX - 3) + Math.sin(angle * 2) * 7
          : recipe.family === 2
            ? centerX + Math.cos(angle) * radiusX * (Math.sin(angle) > 0 ? 0.74 : 1.08)
            : centerX + Math.cos(angle) * (radiusX - 1) + (orderIndex % 2 === 0 ? -6 : 6);
    const y =
      recipe.family === 0
        ? centerY + Math.sin(angle) * radiusY
        : recipe.family === 1
          ? centerY + Math.sin(angle) * (radiusY + 2)
          : recipe.family === 2
          ? centerY + Math.sin(angle) * radiusY + (Math.cos(angle) > 0 ? -5 : 5)
            : centerY +
                Math.sin(angle) * (radiusY - 2) +
                (orderIndex === 0 ? -6 : orderIndex === recipe.mainVertexCount - 1 ? 6 : 0);

    nodes[nodeIndex] = {
      id: createTeachingNodeId(labelStart + nodeIndex),
      x: clampCoordinate(x),
      y: clampCoordinate(y),
    };
  }

  recipe.branchParents.forEach((parentIndex, branchOffset) => {
    const nodeIndex = recipe.mainVertexCount + branchOffset;
    const parent = nodes[parentIndex] ?? nodes[Math.min(parentIndex, recipe.mainVertexCount - 1)];
    const angle = Math.atan2(parent.y - centerY, parent.x - centerX) + (Math.random() - 0.5) * 0.65;
    const distance = randomInt(16, 22);

    nodes[nodeIndex] = {
      id: createTeachingNodeId(labelStart + nodeIndex),
      x: clampCoordinate(parent.x + Math.cos(angle) * distance),
      y: clampCoordinate(parent.y + Math.sin(angle) * distance),
    };
  });

  return resolveNodeOverlap(nodes);
}

function createTeachingGraph(
  kind: GraphConceptDemoKind,
  config: GraphConceptConfig,
): { graph: GraphConceptGraph; demoPath: GraphConceptPath | null } {
  const recipe = createTeachingRecipe(kind);
  const makeEdgeId = (from: number, to: number) => (config.directed ? `${from}->${to}` : from < to ? `${from}-${to}` : `${to}-${from}`);
  const edgeSpecs: Array<[number, number]> = [];
  const edgeSet = new Set<string>();
  const addEdge = (from: number, to: number) => {
    const key = makeEdgeId(from, to);
    if (edgeSet.has(key)) {
      return;
    }
    edgeSet.add(key);
    edgeSpecs.push([from, to]);
  };

  for (let index = 0; index < recipe.pathNodeIndices.length - 1; index += 1) {
    addEdge(recipe.pathNodeIndices[index] ?? -1, recipe.pathNodeIndices[index + 1] ?? -1);
  }

  recipe.branchParents.forEach((parentIndex, branchOffset) => {
    addEdge(parentIndex, recipe.mainVertexCount + branchOffset);
  });

  const nodes = createTeachingNodes(recipe);
  const graph: GraphConceptGraph = {
    directed: config.directed,
    weighted: config.weighted,
    density: 'medium',
    scenario: 'general',
    nodes,
    edges: edgeSpecs.map(([from, to], index) => ({
      id: makeEdgeId(from, to),
      from,
      to,
      weight: config.weighted ? 2 + ((index * 3 + Math.floor(Math.random() * 4)) % 8) : null,
    })),
  };

  return {
    graph,
    demoPath: buildConceptPath(graph, recipe.pathNodeIndices),
  };
}

function getComponentPalette(index: number) {
  const palette = ['#d05050', '#2f7b46', '#275f9a', '#986737', '#6e4ab4', '#0d7b77'];
  return palette[index % palette.length] ?? '#275f9a';
}

function getClippedSegment(
  start: { x: number; y: number },
  end: { x: number; y: number },
  trimStart: number,
  trimEnd: number,
) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const unitX = dx / length;
  const unitY = dy / length;

  return {
    start: {
      x: start.x + unitX * trimStart,
      y: start.y + unitY * trimStart,
    },
    end: {
      x: end.x - unitX * trimEnd,
      y: end.y - unitY * trimEnd,
    },
    length,
  };
}

function getArrowPath(end: { x: number; y: number }, from: { x: number; y: number }, size = 1.8) {
  const dx = end.x - from.x;
  const dy = end.y - from.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const unitX = dx / length;
  const unitY = dy / length;
  const backX = end.x - unitX * size;
  const backY = end.y - unitY * size;
  const normalX = -unitY * size * 0.72;
  const normalY = unitX * size * 0.72;

  const leftX = backX + normalX;
  const leftY = backY + normalY;
  const rightX = backX - normalX;
  const rightY = backY - normalY;

  return `M ${leftX} ${leftY} L ${end.x} ${end.y} L ${rightX} ${rightY}`;
}

function getEdgeGeometry(graph: GraphConceptGraph, edge: GraphConceptEdge) {
  const from = graph.nodes[edge.from];
  const to = graph.nodes[edge.to];
  if (!from || !to) {
    return { path: '', arrow: null as string | null };
  }

  const nodeTrim = graph.directed ? 4.3 : 3.7;

  if (!graph.directed) {
    const segment = getClippedSegment(from, to, nodeTrim, nodeTrim);
    return {
      path: `M ${segment.start.x} ${segment.start.y} L ${segment.end.x} ${segment.end.y}`,
      arrow: null,
    };
  }

  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const bend = 8;
  const normalX = (-dy / length) * bend;
  const normalY = (dx / length) * bend;
  const control = {
    x: midX + normalX,
    y: midY + normalY,
  };
  const clippedStart = getClippedSegment(from, control, nodeTrim, 0).start;
  const clippedEnd = getClippedSegment(control, to, 0, nodeTrim + 0.9).end;

  return {
    path: `M ${clippedStart.x} ${clippedStart.y} Q ${control.x} ${control.y} ${clippedEnd.x} ${clippedEnd.y}`,
    arrow: getArrowPath(clippedEnd, control),
  };
}

function getWeightPosition(graph: GraphConceptGraph, edge: GraphConceptEdge) {
  const from = graph.nodes[edge.from];
  const to = graph.nodes[edge.to];
  if (!from || !to) {
    return { x: 0, y: 0 };
  }

  if (!graph.directed) {
    return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 - 2.4 };
  }

  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.max(1, Math.hypot(dx, dy));

  return {
    x: midX + (-dy / length) * 6.5,
    y: midY + (dx / length) * 6.5,
  };
}

export function GraphRepresentationPage() {
  const { language, t } = useI18n();
  const copy = COPY[language];
  const [tab, setTab] = useState<GraphConceptTab>('basics');
  const [config, setConfig] = useState<GraphConceptConfig>(DEFAULT_CONFIG);
  const [graph, setGraph] = useState<GraphConceptGraph>(() => generateGraphConceptGraph(DEFAULT_CONFIG));
  const [selectedNodes, setSelectedNodes] = useState<number[]>([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [demoKind, setDemoKind] = useState<GraphConceptDemoKind | null>(null);
  const [demoPath, setDemoPath] = useState<GraphConceptPath | null>(null);
  const [generationTick, setGenerationTick] = useState(0);

  const connectedComponents = useMemo(() => findConnectedComponents(graph), [graph]);
  const strongComponents = useMemo(() => findStronglyConnectedComponents(graph), [graph]);
  const selectedNodeIndex = selectedNodes[0] ?? null;
  const selectedNode = selectedNodeIndex !== null ? graph.nodes[selectedNodeIndex] ?? null : null;
  const activePath = demoKind === 'path' || demoKind === 'simplePath' ? demoPath : null;
  const activeCycle = demoKind === 'cycle' || demoKind === 'simpleCycle' ? demoPath : null;
  const shouldShowPathCard = activePath !== null || demoKind === 'path' || demoKind === 'simplePath';
  const shouldShowCycleCard = activeCycle !== null || demoKind === 'cycle' || demoKind === 'simpleCycle';

  const highlightedEdgeIds = useMemo(() => {
    const edgeIds = new Set<string>();

    if (selectedEdgeId) {
      edgeIds.add(selectedEdgeId);
    }

    if (selectedNodeIndex !== null) {
      graph.edges.forEach((edge) => {
        if (edge.from === selectedNodeIndex || edge.to === selectedNodeIndex) {
          edgeIds.add(edge.id);
        }
      });
    }

    activePath?.edgeIds.forEach((edgeId) => edgeIds.add(edgeId));
    activeCycle?.edgeIds.forEach((edgeId) => edgeIds.add(edgeId));

    if (tab === 'connectivity' && selectedNodeIndex !== null) {
      const componentSet = graph.directed ? strongComponents : connectedComponents;
      const componentIndex = getComponentIndex(componentSet, selectedNodeIndex);

      if (componentIndex >= 0) {
        const nodeSet = new Set(componentSet[componentIndex] ?? []);
        graph.edges.forEach((edge) => {
          if (nodeSet.has(edge.from) && nodeSet.has(edge.to)) {
            edgeIds.add(edge.id);
          }
        });
      }
    }

    return edgeIds;
  }, [
    connectedComponents,
    graph,
    activeCycle,
    activePath,
    selectedEdgeId,
    selectedNodeIndex,
    strongComponents,
    tab,
  ]);

  const regenerateGraph = (nextConfig: GraphConceptConfig = config) => {
    setGraph(generateGraphConceptGraph(nextConfig));
    setSelectedNodes([]);
    setSelectedEdgeId(null);
    setDemoKind(null);
    setDemoPath(null);
    setGenerationTick((previous) => previous + 1);
  };

  const resetSelection = () => {
    setSelectedNodes([]);
    setSelectedEdgeId(null);
    setDemoKind(null);
    setDemoPath(null);
  };

  const showDemoPath = (kind: GraphConceptDemoKind) => {
    const teaching = createTeachingGraph(kind, config);
    setSelectedNodes([]);
    setSelectedEdgeId(null);
    setDemoKind(kind);
    setGraph(teaching.graph);
    setDemoPath(teaching.demoPath);
    setConfig((previous) => ({
      ...previous,
      vertexCount: teaching.graph.nodes.length,
    }));
    setGenerationTick((previous) => previous + 1);
  };

  const updateConfig = (partial: Partial<GraphConceptConfig>) => {
    setConfig((previous) => {
      const next = { ...previous, ...partial };
      if (partial.directed !== undefined && partial.directed !== previous.directed) {
        const options = getScenarioOptions(partial.directed);
        if (!options.includes(next.scenario)) {
          next.scenario = options[0];
        }
      }
      return next;
    });
  };

  const activeScenarioOptions = getScenarioOptions(config.directed);
  const selectedWeakComponentIndex =
    selectedNodeIndex !== null ? getComponentIndex(connectedComponents, selectedNodeIndex) : -1;
  const selectedStrongComponentIndex =
    selectedNodeIndex !== null ? getComponentIndex(strongComponents, selectedNodeIndex) : -1;

  return (
    <StaticWorkbenchShell
      title={t('module.g01.title')}
      description={copy.intro}
      stageAriaLabel={copy.labels.stage}
      pageClassName="array-page tree-page graph-concept-page"
      shellClassName="graph-concept-workbench-shell"
      controlsContent={
        <div className="graph-concept-toolbar">
          <div className="graph-concept-control-grid">
            <label className="graph-concept-inline-input">
              <span>{copy.labels.summary}</span>
              <select value={tab} onChange={(event) => setTab(event.target.value as GraphConceptTab)}>
                {(['basics', 'connectivity', 'special'] as GraphConceptTab[]).map((tabKey) => (
                  <option key={tabKey} value={tabKey}>
                    {copy.tabs[tabKey]}
                  </option>
                ))}
              </select>
            </label>

            <label className="graph-concept-inline-input">
              <span>{copy.labels.directed}</span>
              <select
                value={config.directed ? 'directed' : 'undirected'}
                onChange={(event) => updateConfig({ directed: event.target.value === 'directed' })}
              >
                <option value="undirected">{copy.graphKinds.undirected}</option>
                <option value="directed">{copy.graphKinds.directed}</option>
              </select>
            </label>

            <label className="graph-concept-inline-input">
              <span>{copy.labels.weighted}</span>
              <select
                value={config.weighted ? 'weighted' : 'unweighted'}
                onChange={(event) => updateConfig({ weighted: event.target.value === 'weighted' })}
              >
                <option value="unweighted">{copy.graphKinds.unweighted}</option>
                <option value="weighted">{copy.graphKinds.weighted}</option>
              </select>
            </label>

            <label className="graph-concept-inline-input">
              <span>{copy.labels.density}</span>
              <select value={config.density} onChange={(event) => updateConfig({ density: event.target.value as GraphConceptDensity })}>
                {DENSITY_OPTIONS.map((density) => (
                  <option key={density} value={density}>
                    {copy.densities[density]}
                  </option>
                ))}
              </select>
            </label>

            <label className="graph-concept-inline-input">
              <span>{copy.labels.scenario}</span>
              <select value={config.scenario} onChange={(event) => updateConfig({ scenario: event.target.value as GraphConceptScenario })}>
                {activeScenarioOptions.map((scenario) => (
                  <option key={scenario} value={scenario}>
                    {copy.scenarios[scenario]}
                  </option>
                ))}
              </select>
            </label>

            <label className="graph-concept-inline-input">
              <span>{copy.labels.vertexCount}</span>
              <select
                value={config.vertexCount}
                onChange={(event) => updateConfig({ vertexCount: Number(event.target.value) })}
              >
                {Array.from({ length: 8 }, (_, index) => index + 5).map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </label>

            <div className="graph-concept-action-row">
              <button type="button" className="graph-concept-primary-btn" onClick={() => regenerateGraph()}>
                {copy.labels.regenerate}
              </button>
              <button type="button" className="graph-concept-secondary-btn" onClick={() => showDemoPath('cycle')}>
                {copy.labels.generateCycle}
              </button>
              <button type="button" className="graph-concept-secondary-btn" onClick={() => showDemoPath('path')}>
                {copy.labels.generatePath}
              </button>
              <button type="button" className="graph-concept-secondary-btn" onClick={() => showDemoPath('simpleCycle')}>
                {copy.labels.generateSimpleCycle}
              </button>
              <button type="button" className="graph-concept-secondary-btn" onClick={() => showDemoPath('simplePath')}>
                {copy.labels.generateSimplePath}
              </button>
              <button type="button" className="graph-concept-secondary-btn" onClick={resetSelection}>
                {copy.labels.reset}
              </button>
            </div>
          </div>
        </div>
      }
      stageContent={
        <div className="graph-concept-layout">
          <section className="graph-concept-stage" aria-label={copy.labels.stage}>
            <div className="graph-concept-stage-head">
              <span className="graph-concept-stage-badge">
                {copy.labels.graphType}: {getGraphTypeLabel(graph, copy)}
              </span>
              <span className="graph-concept-stage-badge">
                {copy.labels.edgeCount}: {graph.edges.length}/{getMaximumEdgeCount(graph)}
              </span>
              <span className="graph-concept-stage-badge">
                {copy.labels.densityRatio}: {formatPercent(getDensityRatio(graph))}
              </span>
            </div>

            <div key={`graph-${generationTick}`} className="graph-concept-canvas">
              <svg className="graph-concept-edge-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                </defs>

                {graph.edges.map((edge, index) => {
                  const componentSet = graph.directed ? strongComponents : connectedComponents;
                  const componentIndex =
                    tab === 'connectivity' ? getComponentIndex(componentSet, edge.from) : -1;
                  const geometry = getEdgeGeometry(graph, edge);
                  const incomingColor = '#2f7fb3';
                  const outgoingColor = '#c26a2e';
                  const componentColor = componentIndex >= 0 ? getComponentPalette(componentIndex) : null;
                  const selectedNodeRole =
                    graph.directed && selectedNodeIndex !== null
                      ? edge.from === selectedNodeIndex
                        ? 'outgoing'
                        : edge.to === selectedNodeIndex
                          ? 'incoming'
                          : null
                      : null;
                  const color =
                    selectedNodeRole === 'outgoing'
                      ? outgoingColor
                      : selectedNodeRole === 'incoming'
                        ? incomingColor
                        : componentColor ?? undefined;
                  const isHighlighted = highlightedEdgeIds.has(edge.id);
                  const isSelected = selectedEdgeId === edge.id;
                  const weightPosition = getWeightPosition(graph, edge);

                  return (
                    <g key={edge.id} className="graph-concept-edge-group">
                      <path
                        d={geometry.path}
                        style={{
                          stroke: 'transparent',
                          strokeWidth: 3.2,
                          fill: 'none',
                          pointerEvents: 'stroke',
                        }}
                        onClick={() => setSelectedEdgeId(edge.id)}
                      />
                      <path
                        d={geometry.path}
                        className={`graph-concept-edge${isHighlighted ? ' graph-concept-edge-highlighted' : ''}${
                          isSelected ? ' graph-concept-edge-selected' : ''
                        }`}
                        style={{
                          animationDelay: `${index * 36}ms`,
                          stroke: color,
                        }}
                        onClick={() => setSelectedEdgeId(edge.id)}
                      />
                      {geometry.arrow ? (
                        <path
                          d={geometry.arrow}
                          className={`graph-concept-arrow${isHighlighted ? ' graph-concept-arrow-highlighted' : ''}${
                            isSelected ? ' graph-concept-arrow-selected' : ''
                          }`}
                          style={{ stroke: color, pointerEvents: 'none' }}
                        />
                      ) : null}

                      {graph.weighted && edge.weight !== null ? (
                        <text
                          x={weightPosition.x}
                          y={weightPosition.y}
                          className={`graph-concept-edge-weight${
                            isHighlighted || isSelected ? ' graph-concept-edge-weight-highlighted' : ''
                          }`}
                          style={{ pointerEvents: 'none' }}
                        >
                          {edge.weight}
                        </text>
                      ) : null}
                    </g>
                  );
                })}
              </svg>

              <div className="graph-concept-node-layer">
                {graph.nodes.map((node, index) => {
                  const weakComponentIndex = getComponentIndex(connectedComponents, index);
                  const strongComponentIndex = getComponentIndex(strongComponents, index);
                  const componentColor =
                    tab === 'connectivity'
                      ? graph.directed
                        ? getComponentPalette(strongComponentIndex)
                        : getComponentPalette(weakComponentIndex)
                      : undefined;
                  const isSelected = selectedNodes.includes(index);
                  const isPathNode = activePath?.nodeIndices.includes(index) ?? false;
                  const isCycleNode = activeCycle?.nodeIndices.includes(index) ?? false;

                  return (
                    <button
                      key={node.id}
                      type="button"
                      className={`graph-concept-node${isSelected ? ' graph-concept-node-selected' : ''}${
                        isPathNode ? ' graph-concept-node-path' : ''
                      }${isCycleNode ? ' graph-concept-node-cycle' : ''}`}
                      style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        borderColor: componentColor,
                        boxShadow: componentColor ? `0 0 0 2px ${componentColor}22` : undefined,
                      }}
                      onClick={(event) => {
                        void event;
                        setDemoKind(null);
                        setDemoPath(null);
                        setSelectedEdgeId(null);
                        setSelectedNodes((previous) => {
                          if (previous.length === 0) {
                            return [index];
                          }
                          return previous[0] === index ? [] : [index];
                        });
                      }}
                    >
                      <span className="graph-concept-node-id">{node.id}</span>
                      <span className="graph-concept-node-index">v{index}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="graph-concept-stage-hint">{copy.labels.clickHint}</p>
          </section>

          <aside className="graph-concept-sidebar">
            <section className="graph-concept-card">
              <div className="graph-concept-card-head">
                <strong>{copy.labels.summary}</strong>
              </div>
              <dl className="graph-concept-kv">
                <div>
                  <dt>{copy.labels.graphType}</dt>
                  <dd>{getGraphTypeLabel(graph, copy)}</dd>
                </div>
                <div>
                  <dt>{copy.labels.edgeCount}</dt>
                  <dd>
                    {graph.edges.length} / {getMaximumEdgeCount(graph)}
                  </dd>
                </div>
                <div>
                  <dt>{copy.labels.densityRatio}</dt>
                  <dd>{formatPercent(getDensityRatio(graph))}</dd>
                </div>
                <div>
                  <dt>{copy.labels.scenario}</dt>
                  <dd>{copy.scenarios[graph.scenario]}</dd>
                </div>
              </dl>
            </section>

            {tab === 'basics' ? (
              <>
                {selectedNode ? (
                  <section className="graph-concept-card">
                    <div className="graph-concept-card-head">
                      <strong>{copy.labels.selectedNode}</strong>
                    </div>
                    <dl className="graph-concept-kv">
                      <div>
                        <dt>{copy.labels.selectedNode}</dt>
                        <dd>{selectedNode.id}</dd>
                      </div>
                      {graph.directed ? (
                        <>
                          <div>
                            <dt>{copy.labels.outgoingNeighbors}</dt>
                            <dd>{joinNodeLabels(graph, getOutgoingNeighbors(graph, selectedNodeIndex)) || copy.labels.none}</dd>
                          </div>
                          <div>
                            <dt>{copy.labels.incomingNeighbors}</dt>
                            <dd>{joinNodeLabels(graph, getIncomingNeighbors(graph, selectedNodeIndex)) || copy.labels.none}</dd>
                          </div>
                        </>
                      ) : (
                        <div>
                          <dt>{copy.labels.neighbors}</dt>
                          <dd>{joinNodeLabels(graph, getOutgoingNeighbors(graph, selectedNodeIndex)) || copy.labels.none}</dd>
                        </div>
                      )}
                      <div>
                        <dt>{copy.labels.degree}</dt>
                        <dd>{getTotalDegree(graph, selectedNodeIndex)}</dd>
                      </div>
                      {graph.directed ? (
                        <>
                          <div>
                            <dt>{copy.labels.outDegree}</dt>
                            <dd>{getOutDegree(graph, selectedNodeIndex)}</dd>
                          </div>
                          <div>
                            <dt>{copy.labels.inDegree}</dt>
                            <dd>{getInDegree(graph, selectedNodeIndex)}</dd>
                          </div>
                        </>
                      ) : null}
                    </dl>
                  </section>
                ) : null}

                {shouldShowPathCard ? (
                  <section className="graph-concept-card">
                    <div className="graph-concept-card-head">
                      <strong>{copy.labels.path}</strong>
                    </div>
                    {activePath ? (
                      <dl className="graph-concept-kv">
                        <div>
                          <dt>{copy.labels.path}</dt>
                          <dd>{getPathLabel(graph, activePath.nodeIndices)}</dd>
                        </div>
                        <div>
                          <dt>{copy.labels.edgeLength}</dt>
                          <dd>{activePath.edgeLength}</dd>
                        </div>
                        {graph.weighted ? (
                          <div>
                            <dt>{copy.labels.weightedLength}</dt>
                            <dd>{activePath.weightLength ?? 0}</dd>
                          </div>
                        ) : null}
                      </dl>
                    ) : (
                      <p className="graph-concept-empty">{copy.labels.noPath}</p>
                    )}
                  </section>
                ) : null}

                {shouldShowCycleCard ? (
                  <section className="graph-concept-card">
                    <div className="graph-concept-card-head">
                      <strong>{copy.labels.cycle}</strong>
                    </div>
                    <dl className="graph-concept-kv">
                      <div>
                        <dt>{copy.labels.cycle}</dt>
                        <dd>{activeCycle ? getPathLabel(graph, activeCycle.nodeIndices) : copy.labels.noCycle}</dd>
                      </div>
                      {activeCycle ? (
                        <div>
                          <dt>{copy.labels.edgeLength}</dt>
                          <dd>{activeCycle.edgeLength}</dd>
                        </div>
                      ) : null}
                      {graph.weighted && activeCycle ? (
                        <div>
                          <dt>{copy.labels.weightedLength}</dt>
                          <dd>{activeCycle.weightLength ?? 0}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </section>
                ) : null}
              </>
            ) : null}

            {tab === 'connectivity' ? (
              <>
                <section className="graph-concept-card">
                  <div className="graph-concept-card-head">
                    <strong>{copy.labels.connectivity}</strong>
                    <span>{copy.labels.componentGuide}</span>
                  </div>
                  <dl className="graph-concept-kv">
                    {graph.directed ? (
                      <>
                        <div>
                          <dt>{copy.labels.strongConnectivity}</dt>
                          <dd>{strongComponents.length === 1 ? copy.labels.stronglyConnected : copy.labels.notStronglyConnected}</dd>
                        </div>
                        <div>
                          <dt>{copy.labels.strongComponents}</dt>
                          <dd>{strongComponents.length}</dd>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <dt>{copy.labels.connectivity}</dt>
                          <dd>{connectedComponents.length === 1 ? copy.labels.connected : copy.labels.disconnected}</dd>
                        </div>
                        <div>
                          <dt>{copy.labels.weakComponents}</dt>
                          <dd>{connectedComponents.length}</dd>
                        </div>
                      </>
                    )}
                    {selectedNode ? (
                      <div>
                        <dt>{copy.labels.component}</dt>
                        <dd>
                          {graph.directed
                            ? `${copy.labels.strongComponents} #${selectedStrongComponentIndex + 1}`
                            : `${copy.labels.weakComponents} #${selectedWeakComponentIndex + 1}`}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </section>

                {graph.directed ? (
                  <section className="graph-concept-card">
                    <div className="graph-concept-card-head">
                      <strong>{copy.labels.strongComponents}</strong>
                      <span>{copy.labels.stronglyConnected}</span>
                    </div>
                    <div className="graph-concept-component-list">
                      {strongComponents.map((component, index) => (
                        <div key={`strong-${index}`} className="graph-concept-component-item">
                          <span
                            className="graph-concept-component-dot"
                            style={{ background: getComponentPalette(index) }}
                          />
                          <strong>#{index + 1}</strong>
                          <span>{joinNodeLabels(graph, component)}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : (
                  <section className="graph-concept-card">
                    <div className="graph-concept-card-head">
                      <strong>{copy.labels.weakComponents}</strong>
                      <span>{copy.labels.connected}</span>
                    </div>
                    <div className="graph-concept-component-list">
                      {connectedComponents.map((component, index) => (
                        <div key={`weak-${index}`} className="graph-concept-component-item">
                          <span
                            className="graph-concept-component-dot"
                            style={{ background: getComponentPalette(index) }}
                          />
                          <strong>#{index + 1}</strong>
                          <span>{joinNodeLabels(graph, component)}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : null}

            {tab === 'special' ? (
              <>
                <section className="graph-concept-card">
                  <div className="graph-concept-card-head">
                    <strong>{copy.labels.formulas}</strong>
                    <span>{copy.labels.specialGuide}</span>
                  </div>
                  <dl className="graph-concept-kv">
                    <div>
                      <dt>{graph.directed ? copy.labels.completeDigraph : copy.labels.completeGraph}</dt>
                      <dd>{isCompleteConceptGraph(graph) ? copy.labels.connected : copy.labels.none}</dd>
                    </div>
                    <div>
                      <dt>{copy.labels.expectedEdges}</dt>
                      <dd>{graph.directed ? `${graph.nodes.length}(${graph.nodes.length}-1)` : `${graph.nodes.length}(${graph.nodes.length}-1)/2`}</dd>
                    </div>
                    <div>
                      <dt>{copy.labels.maxEdgeCount}</dt>
                      <dd>{getMaximumEdgeCount(graph)}</dd>
                    </div>
                    <div>
                      <dt>{copy.labels.actualEdges}</dt>
                      <dd>{graph.edges.length}</dd>
                    </div>
                    <div>
                      <dt>{copy.labels.densityRatio}</dt>
                      <dd>{formatPercent(getDensityRatio(graph))}</dd>
                    </div>
                  </dl>
                </section>

                <section className="graph-concept-card">
                  <div className="graph-concept-card-head">
                    <strong>{copy.labels.summary}</strong>
                    <span>{copy.labels.specialGuide}</span>
                  </div>
                  <p className="graph-concept-paragraph">
                    {graph.directed
                      ? `n = ${graph.nodes.length} 时，有向完全图应包含 n(n-1) = ${getMaximumEdgeCount(graph)} 条有方向的边。`
                      : `n = ${graph.nodes.length} 时，无向完全图应包含 n(n-1)/2 = ${getMaximumEdgeCount(graph)} 条边。`}
                  </p>
                  <p className="graph-concept-paragraph">
                    当前样本属于“{copy.densities[graph.density]}”档，实际边数为 {graph.edges.length}，占理论最大边数的{' '}
                    {formatPercent(getDensityRatio(graph))}。
                  </p>
                </section>
              </>
            ) : null}
          </aside>
        </div>
      }
    />
  );
}
