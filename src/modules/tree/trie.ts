import type { AnimationStep, HighlightEntry } from '../../types/animation';

export type TriePhase = 'insert' | 'search';
export type TrieOutcome = 'ongoing' | 'inserted' | 'found' | 'notFound' | 'duplicate';

export type TrieNodeSnapshot = {
  id: number;
  char: string;
  parent: number | null;
  children: number[];
  terminal: boolean;
  word: string | null;
  depth: number;
};

export type TrieStep = AnimationStep & {
  nodes: TrieNodeSnapshot[];
  rootId: number;
  action:
    | 'initial'
    | 'insertVisit'
    | 'insertCreate'
    | 'insertReuse'
    | 'markTerminal'
    | 'searchStart'
    | 'searchVisit'
    | 'searchHit'
    | 'searchMiss'
    | 'completed';
  phase: TriePhase;
  seedWords: string[];
  insertWord: string;
  queryWord: string;
  currentId: number | null;
  activeChar: string | null;
  activeCharIndex: number | null;
  pathIds: number[];
  createdNodeId: number | null;
  matchedWord: string | null;
  outcome: TrieOutcome;
};

type MutableTrieNode = {
  id: number;
  char: string;
  parent: number | null;
  children: Map<string, number>;
  terminal: boolean;
  word: string | null;
};

type MutableTrie = {
  rootId: number;
  nextId: number;
  nodes: Map<number, MutableTrieNode>;
};

function createTrie(): MutableTrie {
  const rootNode: MutableTrieNode = {
    id: 0,
    char: '',
    parent: null,
    children: new Map<string, number>(),
    terminal: false,
    word: null,
  };

  return {
    rootId: rootNode.id,
    nextId: 1,
    nodes: new Map<number, MutableTrieNode>([[rootNode.id, rootNode]]),
  };
}

function cloneHighlights(highlights: HighlightEntry[]): HighlightEntry[] {
  return highlights.map((entry) => ({ ...entry }));
}

function normalizeWord(word: string): string {
  return word.trim().toLowerCase();
}

function getNode(trie: MutableTrie, nodeId: number): MutableTrieNode {
  const node = trie.nodes.get(nodeId);
  if (!node) {
    throw new Error(`Missing trie node ${nodeId}.`);
  }
  return node;
}

function createNode(trie: MutableTrie, parentId: number, char: string): number {
  const parent = getNode(trie, parentId);
  const node: MutableTrieNode = {
    id: trie.nextId,
    char,
    parent: parentId,
    children: new Map<string, number>(),
    terminal: false,
    word: null,
  };

  trie.nodes.set(node.id, node);
  trie.nextId += 1;
  parent.children.set(char, node.id);
  return node.id;
}

function snapshotTrie(trie: MutableTrie): TrieNodeSnapshot[] {
  const depthCache = new Map<number, number>();

  const getDepth = (nodeId: number): number => {
    const cached = depthCache.get(nodeId);
    if (cached !== undefined) {
      return cached;
    }

    const node = getNode(trie, nodeId);
    const depth = node.parent === null ? 0 : getDepth(node.parent) + 1;
    depthCache.set(nodeId, depth);
    return depth;
  };

  return [...trie.nodes.values()]
    .sort((left, right) => left.id - right.id)
    .map((node) => ({
      id: node.id,
      char: node.char,
      parent: node.parent,
      children: [...node.children.entries()]
        .sort((left, right) => left[0].localeCompare(right[0]))
        .map(([, childId]) => childId),
      terminal: node.terminal,
      word: node.word,
      depth: getDepth(node.id),
    }));
}

function createStep(
  trie: MutableTrie,
  action: TrieStep['action'],
  phase: TriePhase,
  codeLines: number[],
  highlights: HighlightEntry[],
  seedWords: string[],
  insertWord: string,
  queryWord: string,
  currentId: number | null,
  activeChar: string | null,
  activeCharIndex: number | null,
  pathIds: number[],
  createdNodeId: number | null,
  matchedWord: string | null,
  outcome: TrieOutcome,
): TrieStep {
  return {
    description: '',
    codeLines,
    highlights: cloneHighlights(highlights),
    nodes: snapshotTrie(trie),
    rootId: trie.rootId,
    action,
    phase,
    seedWords: [...seedWords],
    insertWord,
    queryWord,
    currentId,
    activeChar,
    activeCharIndex,
    pathIds: [...pathIds],
    createdNodeId,
    matchedWord,
    outcome,
  };
}

function buildPathToNode(trie: MutableTrie, nodeId: number): number[] {
  const path: number[] = [];
  let currentId: number | null = nodeId;

  while (currentId !== null) {
    path.push(currentId);
    currentId = getNode(trie, currentId).parent;
  }

  return path.reverse();
}

function createPathHighlights(
  pathIds: number[],
  currentId: number | null,
  createdNodeId: number | null = null,
): HighlightEntry[] {
  const entries: HighlightEntry[] = pathIds
    .filter((nodeId) => nodeId !== currentId && nodeId !== createdNodeId)
    .map((nodeId) => ({ index: nodeId, type: 'visiting' as const }));

  if (currentId !== null) {
    entries.push({ index: currentId, type: 'comparing' });
  }
  if (createdNodeId !== null) {
    entries.push({ index: createdNodeId, type: 'new-node' });
  }

  return entries;
}

function insertSilent(trie: MutableTrie, word: string): void {
  let currentId = trie.rootId;

  for (const char of word) {
    const currentNode = getNode(trie, currentId);
    const existingChild = currentNode.children.get(char);
    currentId = existingChild ?? createNode(trie, currentId, char);
  }

  const currentNode = getNode(trie, currentId);
  currentNode.terminal = true;
  currentNode.word = word;
}

function buildTrieFromWords(words: readonly string[]): MutableTrie {
  const trie = createTrie();
  words.map(normalizeWord).filter(Boolean).forEach((word) => insertSilent(trie, word));
  return trie;
}

function finalTerminalWord(node: MutableTrieNode, fallback: string): string {
  return node.word ?? fallback;
}

export function generateTrieSteps(
  seedWordsInput: readonly string[],
  insertWordInput: string,
  queryWordInput: string,
): TrieStep[] {
  const seedWords = seedWordsInput.map(normalizeWord).filter(Boolean);
  const insertWord = normalizeWord(insertWordInput);
  const queryWord = normalizeWord(queryWordInput);
  const trie = buildTrieFromWords(seedWords);
  const steps: TrieStep[] = [];

  steps.push(
    createStep(
      trie,
      'initial',
      'insert',
      [1],
      [{ index: trie.rootId, type: 'visiting' }],
      seedWords,
      insertWord,
      queryWord,
      trie.rootId,
      null,
      null,
      [trie.rootId],
      null,
      null,
      'ongoing',
    ),
  );

  let currentId = trie.rootId;
  let insertedOutcome: TrieOutcome = 'ongoing';

  for (const [index, char] of [...insertWord].entries()) {
    const currentNode = getNode(trie, currentId);
    const existingChild = currentNode.children.get(char);

    if (existingChild !== undefined) {
      currentId = existingChild;
      const pathIds = buildPathToNode(trie, currentId);
      steps.push(
        createStep(
          trie,
          'insertReuse',
          'insert',
          [2, 3],
          createPathHighlights(pathIds, currentId),
          seedWords,
          insertWord,
          queryWord,
          currentId,
          char,
          index,
          pathIds,
          null,
          null,
          'ongoing',
        ),
      );
      continue;
    }

    const createdNodeId = createNode(trie, currentId, char);
    currentId = createdNodeId;
    const pathIds = buildPathToNode(trie, currentId);
    steps.push(
      createStep(
        trie,
        'insertCreate',
        'insert',
        [4],
        createPathHighlights(pathIds, currentId, createdNodeId),
        seedWords,
        insertWord,
        queryWord,
        currentId,
        char,
        index,
        pathIds,
        createdNodeId,
        null,
        'ongoing',
      ),
    );
  }

  const insertNode = getNode(trie, currentId);
  if (insertNode.terminal) {
    insertedOutcome = 'duplicate';
    steps.push(
      createStep(
        trie,
        'markTerminal',
        'insert',
        [5],
        [{ index: currentId, type: 'matched' }],
        seedWords,
        insertWord,
        queryWord,
        currentId,
        null,
        insertWord.length - 1,
        buildPathToNode(trie, currentId),
        null,
        finalTerminalWord(insertNode, insertWord),
        'duplicate',
      ),
    );
  } else {
    insertNode.terminal = true;
    insertNode.word = insertWord;
    insertedOutcome = 'inserted';
    steps.push(
      createStep(
        trie,
        'markTerminal',
        'insert',
        [5],
        [
          { index: currentId, type: 'matched' },
          { index: currentId, type: 'new-node' },
        ],
        seedWords,
        insertWord,
        queryWord,
        currentId,
        null,
        insertWord.length - 1,
        buildPathToNode(trie, currentId),
        currentId,
        insertWord,
        'inserted',
      ),
    );
  }

  steps.push(
    createStep(
      trie,
      'searchStart',
      'search',
      [6],
      [{ index: trie.rootId, type: 'visiting' }],
      seedWords,
      insertWord,
      queryWord,
      trie.rootId,
      null,
      null,
      [trie.rootId],
      null,
      null,
      insertedOutcome === 'duplicate' ? 'duplicate' : 'ongoing',
    ),
  );

  currentId = trie.rootId;
  for (const [index, char] of [...queryWord].entries()) {
    const currentNode = getNode(trie, currentId);
    const nextNodeId = currentNode.children.get(char);

    if (nextNodeId === undefined) {
      steps.push(
        createStep(
          trie,
          'searchMiss',
          'search',
          [9],
          createPathHighlights(buildPathToNode(trie, currentId), currentId),
          seedWords,
          insertWord,
          queryWord,
          currentId,
          char,
          index,
          buildPathToNode(trie, currentId),
          null,
          null,
          'notFound',
        ),
      );
      steps.push(
        createStep(
          trie,
          'completed',
          'search',
          [10],
          createPathHighlights(buildPathToNode(trie, currentId), currentId),
          seedWords,
          insertWord,
          queryWord,
          currentId,
          char,
          index,
          buildPathToNode(trie, currentId),
          null,
          null,
          'notFound',
        ),
      );
      return steps;
    }

    currentId = nextNodeId;
    const pathIds = buildPathToNode(trie, currentId);
    steps.push(
      createStep(
        trie,
        'searchVisit',
        'search',
        [7],
        createPathHighlights(pathIds, currentId),
        seedWords,
        insertWord,
        queryWord,
        currentId,
        char,
        index,
        pathIds,
        null,
        null,
        'ongoing',
      ),
    );
  }

  const searchNode = getNode(trie, currentId);
  const finalOutcome: TrieOutcome = searchNode.terminal ? 'found' : 'notFound';
  const finalAction: TrieStep['action'] = searchNode.terminal ? 'searchHit' : 'searchMiss';

  steps.push(
    createStep(
      trie,
      finalAction,
      'search',
      [8],
      [{ index: currentId, type: searchNode.terminal ? 'matched' : 'comparing' }],
      seedWords,
      insertWord,
      queryWord,
      currentId,
      queryWord.at(-1) ?? null,
      Math.max(queryWord.length - 1, 0),
      buildPathToNode(trie, currentId),
      null,
      searchNode.word,
      finalOutcome,
    ),
  );
  steps.push(
    createStep(
      trie,
      'completed',
      'search',
      [10],
      [{ index: currentId, type: searchNode.terminal ? 'matched' : 'comparing' }],
      seedWords,
      insertWord,
      queryWord,
      currentId,
      queryWord.at(-1) ?? null,
      Math.max(queryWord.length - 1, 0),
      buildPathToNode(trie, currentId),
      null,
      searchNode.word,
      finalOutcome,
    ),
  );

  return steps;
}
