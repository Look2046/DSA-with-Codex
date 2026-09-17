export type GraphConceptDensity = 'sparse' | 'medium' | 'dense';
export type GraphConceptScenario =
  | 'general'
  | 'connected'
  | 'disconnected'
  | 'stronglyConnected'
  | 'notStronglyConnected'
  | 'complete';

export type GraphConceptNode = {
  id: string;
  x: number;
  y: number;
};

export type GraphConceptEdge = {
  id: string;
  from: number;
  to: number;
  weight: number | null;
};

export type GraphConceptGraph = {
  directed: boolean;
  weighted: boolean;
  density: GraphConceptDensity;
  scenario: GraphConceptScenario;
  nodes: GraphConceptNode[];
  edges: GraphConceptEdge[];
};

export type GraphConceptConfig = {
  directed: boolean;
  weighted: boolean;
  density: GraphConceptDensity;
  scenario: GraphConceptScenario;
  vertexCount: number;
};

type IndexedEdge = {
  from: number;
  to: number;
};

function createNodeId(index: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (index < alphabet.length) {
    return alphabet[index];
  }

  const letter = alphabet[index % alphabet.length];
  const suffix = Math.floor(index / alphabet.length);
  return `${letter}${suffix}`;
}

function randomWeight() {
  return Math.floor(Math.random() * 9) + 1;
}

function getMaxEdgeCount(vertexCount: number, directed: boolean) {
  if (vertexCount <= 1) {
    return 0;
  }
  return directed ? vertexCount * (vertexCount - 1) : (vertexCount * (vertexCount - 1)) / 2;
}

function getTargetEdgeCount(vertexCount: number, density: GraphConceptDensity, directed: boolean) {
  const ratio = density === 'sparse' ? 0.2 : density === 'medium' ? 0.5 : 0.7;
  const maxEdges = getMaxEdgeCount(vertexCount, directed);
  return Math.max(1, Math.min(maxEdges, Math.round(maxEdges * ratio)));
}

function buildNodeLayout(vertexCount: number): GraphConceptNode[] {
  const radiusX = vertexCount >= 10 ? 34 : 31;
  const radiusY = vertexCount >= 10 ? 32 : 28;

  return Array.from({ length: vertexCount }, (_, index) => {
    const angle = (Math.PI * 2 * index) / vertexCount - Math.PI / 2;
    const wave = (index % 2 === 0 ? 1 : -1) * (vertexCount >= 10 ? 2.4 : 1.5);

    return {
      id: createNodeId(index),
      x: 50 + Math.cos(angle) * radiusX + Math.sin(angle * 2) * wave,
      y: 50 + Math.sin(angle) * radiusY + Math.cos(angle * 2) * wave * 0.7,
    };
  });
}

function createCandidateEdges(vertexCount: number, directed: boolean): IndexedEdge[] {
  const edges: IndexedEdge[] = [];

  for (let from = 0; from < vertexCount; from += 1) {
    for (let to = 0; to < vertexCount; to += 1) {
      if (from === to) {
        continue;
      }
      if (!directed && to <= from) {
        continue;
      }
      edges.push({ from, to });
    }
  }

  for (let index = edges.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = edges[index];
    edges[index] = edges[swapIndex];
    edges[swapIndex] = current;
  }

  return edges;
}

function makeEdgeKey(from: number, to: number, directed: boolean) {
  if (directed) {
    return `${from}->${to}`;
  }
  return from < to ? `${from}-${to}` : `${to}-${from}`;
}

function buildGraphFromIndexedEdges(config: GraphConceptConfig, indexedEdges: IndexedEdge[]): GraphConceptGraph {
  const nodes = buildNodeLayout(config.vertexCount);

  return {
    directed: config.directed,
    weighted: config.weighted,
    density: config.density,
    scenario: config.scenario,
    nodes,
    edges: indexedEdges.map((edge) => ({
      id: makeEdgeKey(edge.from, edge.to, config.directed),
      from: edge.from,
      to: edge.to,
      weight: config.weighted ? randomWeight() : null,
    })),
  };
}

function ensureAtLeastOneEdge(vertexCount: number, directed: boolean, edges: IndexedEdge[]) {
  if (edges.length > 0 || vertexCount < 2) {
    return edges;
  }

  return [{ from: 0, to: 1 }, ...(directed ? [] : [])];
}

function generateCompleteEdges(vertexCount: number, directed: boolean): IndexedEdge[] {
  return createCandidateEdges(vertexCount, directed);
}

function generateConnectedUndirectedEdges(config: GraphConceptConfig): IndexedEdge[] {
  const target = Math.max(config.vertexCount - 1, getTargetEdgeCount(config.vertexCount, config.density, false));
  const edgeSet = new Set<string>();
  const edges: IndexedEdge[] = [];

  for (let index = 1; index < config.vertexCount; index += 1) {
    const parent = Math.floor(Math.random() * index);
    const key = makeEdgeKey(index, parent, false);
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push({ from: index, to: parent });
    }
  }

  for (const edge of createCandidateEdges(config.vertexCount, false)) {
    if (edges.length >= target) {
      break;
    }

    const key = makeEdgeKey(edge.from, edge.to, false);
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push(edge);
    }
  }

  return edges;
}

function generateDisconnectedUndirectedEdges(config: GraphConceptConfig): IndexedEdge[] {
  const cut = Math.max(2, Math.min(config.vertexCount - 2, Math.floor(config.vertexCount * 0.5)));
  const groups = [
    Array.from({ length: cut }, (_, index) => index),
    Array.from({ length: config.vertexCount - cut }, (_, index) => index + cut),
  ].filter((group) => group.length > 0);

  const edges: IndexedEdge[] = [];
  const edgeSet = new Set<string>();

  groups.forEach((group) => {
    for (let index = 1; index < group.length; index += 1) {
      const current = group[index];
      const parent = group[Math.floor(Math.random() * index)];
      const key = makeEdgeKey(current, parent, false);
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push({ from: current, to: parent });
      }
    }
  });

  const target = Math.max(groups.reduce((sum, group) => sum + Math.max(0, group.length - 1), 0), Math.round(getTargetEdgeCount(config.vertexCount, config.density, false) * 0.7));
  for (const group of groups) {
    const candidates = createCandidateEdges(group.length, false).map((edge) => ({
      from: group[edge.from],
      to: group[edge.to],
    }));

    for (const edge of candidates) {
      if (edges.length >= target) {
        break;
      }

      const key = makeEdgeKey(edge.from, edge.to, false);
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push(edge);
      }
    }
  }

  return ensureAtLeastOneEdge(config.vertexCount, false, edges);
}

function generateDirectedCycleEdges(vertexCount: number): IndexedEdge[] {
  return Array.from({ length: vertexCount }, (_, index) => ({
    from: index,
    to: (index + 1) % vertexCount,
  }));
}

function generateStronglyConnectedDirectedEdges(config: GraphConceptConfig): IndexedEdge[] {
  const target = Math.max(config.vertexCount, getTargetEdgeCount(config.vertexCount, config.density, true));
  const edges = generateDirectedCycleEdges(config.vertexCount);
  const edgeSet = new Set(edges.map((edge) => makeEdgeKey(edge.from, edge.to, true)));

  for (const edge of createCandidateEdges(config.vertexCount, true)) {
    if (edges.length >= target) {
      break;
    }

    const key = makeEdgeKey(edge.from, edge.to, true);
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push(edge);
    }
  }

  return edges;
}

function generateNotStronglyConnectedDirectedEdges(config: GraphConceptConfig): IndexedEdge[] {
  const target = Math.max(config.vertexCount - 1, Math.round(getTargetEdgeCount(config.vertexCount, config.density, true) * 0.8));
  const edges: IndexedEdge[] = [];
  const edgeSet = new Set<string>();
  const groupCount = config.vertexCount >= 9 ? 3 : 2;
  const baseSize = Math.floor(config.vertexCount / groupCount);
  const remainder = config.vertexCount % groupCount;
  const groups: number[][] = [];
  let cursor = 0;

  for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
    const size = baseSize + (groupIndex < remainder ? 1 : 0);
    const group = Array.from({ length: size }, () => cursor++);
    groups.push(group);
  }

  const addEdge = (from: number, to: number) => {
    const key = makeEdgeKey(from, to, true);
    if (edgeSet.has(key)) {
      return false;
    }
    edgeSet.add(key);
    edges.push({ from, to });
    return true;
  };

  groups.forEach((group) => {
    if (group.length <= 1) {
      return;
    }

    for (let index = 0; index < group.length; index += 1) {
      addEdge(group[index], group[(index + 1) % group.length]);
    }
  });

  const interGroupCandidates: IndexedEdge[] = [];
  for (let groupIndex = 0; groupIndex < groups.length - 1; groupIndex += 1) {
    const currentGroup = groups[groupIndex];
    const nextGroup = groups[groupIndex + 1];
    addEdge(currentGroup[currentGroup.length - 1], nextGroup[0]);

    currentGroup.forEach((from) => {
      nextGroup.forEach((to) => {
        interGroupCandidates.push({ from, to });
      });
    });
  }

  for (const group of groups) {
    const groupCandidates = createCandidateEdges(group.length, true).map((edge) => ({
      from: group[edge.from],
      to: group[edge.to],
    }));

    for (const edge of groupCandidates) {
      if (edges.length >= target) {
        break;
      }
      addEdge(edge.from, edge.to);
    }

    if (edges.length >= target) {
      break;
    }
  }

  for (const edge of interGroupCandidates) {
    if (edges.length >= target) {
      break;
    }

    addEdge(edge.from, edge.to);
  }

  return ensureAtLeastOneEdge(config.vertexCount, true, edges);
}

function generateGeneralDirectedEdges(config: GraphConceptConfig): IndexedEdge[] {
  const target = getTargetEdgeCount(config.vertexCount, config.density, true);
  const edges: IndexedEdge[] = [];
  const edgeSet = new Set<string>();

  for (const edge of createCandidateEdges(config.vertexCount, true)) {
    if (edges.length >= target) {
      break;
    }

    const key = makeEdgeKey(edge.from, edge.to, true);
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push(edge);
    }
  }

  return ensureAtLeastOneEdge(config.vertexCount, true, edges);
}

function generateGeneralUndirectedEdges(config: GraphConceptConfig): IndexedEdge[] {
  const target = Math.max(1, Math.round(getTargetEdgeCount(config.vertexCount, config.density, false) * 0.8));
  const edges = createCandidateEdges(config.vertexCount, false).slice(0, target);
  return ensureAtLeastOneEdge(config.vertexCount, false, edges);
}

export function generateGraphConceptGraph(config: GraphConceptConfig): GraphConceptGraph {
  let indexedEdges: IndexedEdge[];

  if (config.scenario === 'complete') {
    indexedEdges = generateCompleteEdges(config.vertexCount, config.directed);
  } else if (!config.directed && config.scenario === 'connected') {
    indexedEdges = generateConnectedUndirectedEdges(config);
  } else if (!config.directed && config.scenario === 'disconnected') {
    indexedEdges = generateDisconnectedUndirectedEdges(config);
  } else if (config.directed && config.scenario === 'stronglyConnected') {
    indexedEdges = generateStronglyConnectedDirectedEdges(config);
  } else if (config.directed && config.scenario === 'notStronglyConnected') {
    indexedEdges = generateNotStronglyConnectedDirectedEdges(config);
  } else if (config.directed) {
    indexedEdges = generateGeneralDirectedEdges(config);
  } else {
    indexedEdges = generateGeneralUndirectedEdges(config);
  }

  return buildGraphFromIndexedEdges(config, indexedEdges);
}

export function getOutgoingNeighbors(graph: GraphConceptGraph, nodeIndex: number): number[] {
  if (!graph.nodes[nodeIndex]) {
    return [];
  }

  const neighbors = new Set<number>();
  graph.edges.forEach((edge) => {
    if (edge.from === nodeIndex) {
      neighbors.add(edge.to);
    }
    if (!graph.directed && edge.to === nodeIndex) {
      neighbors.add(edge.from);
    }
  });

  return [...neighbors].sort((left, right) => left - right);
}

export function getIncomingNeighbors(graph: GraphConceptGraph, nodeIndex: number): number[] {
  if (!graph.nodes[nodeIndex]) {
    return [];
  }

  if (!graph.directed) {
    return getOutgoingNeighbors(graph, nodeIndex);
  }

  const neighbors = new Set<number>();
  graph.edges.forEach((edge) => {
    if (edge.to === nodeIndex) {
      neighbors.add(edge.from);
    }
  });

  return [...neighbors].sort((left, right) => left - right);
}

export function getOutDegree(graph: GraphConceptGraph, nodeIndex: number) {
  return getOutgoingNeighbors(graph, nodeIndex).length;
}

export function getInDegree(graph: GraphConceptGraph, nodeIndex: number) {
  return getIncomingNeighbors(graph, nodeIndex).length;
}

export function getTotalDegree(graph: GraphConceptGraph, nodeIndex: number) {
  return graph.directed ? getInDegree(graph, nodeIndex) + getOutDegree(graph, nodeIndex) : getOutDegree(graph, nodeIndex);
}

function buildDirectedAdjacency(graph: GraphConceptGraph) {
  return graph.nodes.map((_, nodeIndex) => getOutgoingNeighbors(graph, nodeIndex));
}

function buildUndirectedAdjacency(graph: GraphConceptGraph) {
  return graph.nodes.map((_, nodeIndex) => {
    const neighbors = new Set<number>();
    graph.edges.forEach((edge) => {
      if (edge.from === nodeIndex) {
        neighbors.add(edge.to);
      }
      if (edge.to === nodeIndex) {
        neighbors.add(edge.from);
      }
    });
    return [...neighbors].sort((left, right) => left - right);
  });
}

export function findConnectedComponents(graph: GraphConceptGraph): number[][] {
  const adjacency = buildUndirectedAdjacency(graph);
  const visited = new Set<number>();
  const components: number[][] = [];

  adjacency.forEach((_neighbors, startIndex) => {
    if (visited.has(startIndex)) {
      return;
    }

    const stack = [startIndex];
    const component: number[] = [];
    visited.add(startIndex);

    while (stack.length > 0) {
      const current = stack.pop();
      if (current === undefined) {
        continue;
      }
      component.push(current);

      adjacency[current]?.forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          stack.push(neighbor);
        }
      });
    }

    components.push(component.sort((left, right) => left - right));
  });

  return components;
}

export function findStronglyConnectedComponents(graph: GraphConceptGraph): number[][] {
  if (!graph.directed) {
    return findConnectedComponents(graph);
  }

  const adjacency = buildDirectedAdjacency(graph);
  const reverseAdjacency = graph.nodes.map(() => [] as number[]);
  adjacency.forEach((neighbors, fromIndex) => {
    neighbors.forEach((toIndex) => reverseAdjacency[toIndex]?.push(fromIndex));
  });

  const order: number[] = [];
  const visited = new Set<number>();

  const fillOrder = (startIndex: number) => {
    const stack: Array<{ node: number; expanded: boolean }> = [{ node: startIndex, expanded: false }];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) {
        continue;
      }

      if (current.expanded) {
        order.push(current.node);
        continue;
      }

      if (visited.has(current.node)) {
        continue;
      }

      visited.add(current.node);
      stack.push({ node: current.node, expanded: true });
      [...(adjacency[current.node] ?? [])].reverse().forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          stack.push({ node: neighbor, expanded: false });
        }
      });
    }
  };

  graph.nodes.forEach((_node, index) => {
    if (!visited.has(index)) {
      fillOrder(index);
    }
  });

  const assigned = new Set<number>();
  const components: number[][] = [];

  for (let index = order.length - 1; index >= 0; index -= 1) {
    const startNode = order[index];
    if (assigned.has(startNode)) {
      continue;
    }

    const stack = [startNode];
    const component: number[] = [];
    assigned.add(startNode);

    while (stack.length > 0) {
      const current = stack.pop();
      if (current === undefined) {
        continue;
      }
      component.push(current);

      reverseAdjacency[current]?.forEach((neighbor) => {
        if (!assigned.has(neighbor)) {
          assigned.add(neighbor);
          stack.push(neighbor);
        }
      });
    }

    components.push(component.sort((left, right) => left - right));
  }

  return components;
}

function buildEdgeLookup(graph: GraphConceptGraph) {
  const lookup = new Map<string, GraphConceptEdge>();
  graph.edges.forEach((edge) => {
    lookup.set(edge.id, edge);
    if (!graph.directed) {
      lookup.set(makeEdgeKey(edge.to, edge.from, false), edge);
    }
  });
  return lookup;
}

function buildPathEdgeIds(graph: GraphConceptGraph, path: number[]) {
  const edgeLookup = buildEdgeLookup(graph);
  const edgeIds: string[] = [];

  for (let index = 0; index < path.length - 1; index += 1) {
    const edge = edgeLookup.get(makeEdgeKey(path[index], path[index + 1], graph.directed));
    if (edge) {
      edgeIds.push(edge.id);
    }
  }

  return edgeIds;
}

export type GraphConceptPath = {
  nodeIndices: number[];
  edgeIds: string[];
  edgeLength: number;
  weightLength: number | null;
};

export function findSimplePath(graph: GraphConceptGraph, startIndex: number, endIndex: number): GraphConceptPath | null {
  if (!graph.nodes[startIndex] || !graph.nodes[endIndex]) {
    return null;
  }

  const adjacency = buildDirectedAdjacency(graph);
  if (!graph.directed) {
    const undirectedAdjacency = buildUndirectedAdjacency(graph);
    undirectedAdjacency.forEach((neighbors, index) => {
      adjacency[index] = neighbors;
    });
  }

  const visited = new Set<number>();
  const path: number[] = [];

  const dfs = (nodeIndex: number): boolean => {
    visited.add(nodeIndex);
    path.push(nodeIndex);

    if (nodeIndex === endIndex) {
      return true;
    }

    for (const neighbor of adjacency[nodeIndex] ?? []) {
      if (visited.has(neighbor)) {
        continue;
      }

      if (dfs(neighbor)) {
        return true;
      }
    }

    path.pop();
    visited.delete(nodeIndex);
    return false;
  };

  if (!dfs(startIndex)) {
    return null;
  }

  const edgeIds = buildPathEdgeIds(graph, path);
  const weightLength =
    graph.weighted && edgeIds.length > 0
      ? edgeIds.reduce((sum, edgeId) => sum + (graph.edges.find((edge) => edge.id === edgeId)?.weight ?? 0), 0)
      : graph.weighted
        ? 0
        : null;

  return {
    nodeIndices: [...path],
    edgeIds,
    edgeLength: Math.max(0, path.length - 1),
    weightLength,
  };
}

export function findSimpleCycleThroughNode(graph: GraphConceptGraph, startIndex: number): GraphConceptPath | null {
  if (!graph.nodes[startIndex]) {
    return null;
  }

  const adjacency = graph.directed ? buildDirectedAdjacency(graph) : buildUndirectedAdjacency(graph);
  const visited = new Set<number>([startIndex]);
  const path = [startIndex];

  const dfs = (nodeIndex: number): number[] | null => {
    for (const neighbor of adjacency[nodeIndex] ?? []) {
      if (neighbor === startIndex && path.length >= 3) {
        return [...path, startIndex];
      }

      if (visited.has(neighbor)) {
        continue;
      }

      visited.add(neighbor);
      path.push(neighbor);
      const cycle = dfs(neighbor);
      if (cycle) {
        return cycle;
      }
      path.pop();
      visited.delete(neighbor);
    }

    return null;
  };

  const cycleNodes = dfs(startIndex);
  if (!cycleNodes) {
    return null;
  }

  const edgeIds = buildPathEdgeIds(graph, cycleNodes);
  const weightLength =
    graph.weighted && edgeIds.length > 0
      ? edgeIds.reduce((sum, edgeId) => sum + (graph.edges.find((edge) => edge.id === edgeId)?.weight ?? 0), 0)
      : graph.weighted
        ? 0
        : null;

  return {
    nodeIndices: cycleNodes,
    edgeIds,
    edgeLength: Math.max(0, cycleNodes.length - 1),
    weightLength,
  };
}

export function getMaximumEdgeCount(graph: GraphConceptGraph) {
  return getMaxEdgeCount(graph.nodes.length, graph.directed);
}

export function getDensityRatio(graph: GraphConceptGraph) {
  const maxEdges = getMaximumEdgeCount(graph);
  if (maxEdges === 0) {
    return 0;
  }
  return graph.edges.length / maxEdges;
}

export function isCompleteConceptGraph(graph: GraphConceptGraph) {
  return graph.edges.length === getMaximumEdgeCount(graph);
}

export function getComponentIndex(components: number[][], nodeIndex: number) {
  return components.findIndex((component) => component.includes(nodeIndex));
}
