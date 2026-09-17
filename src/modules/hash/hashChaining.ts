import type { TranslationKey } from '../../i18n/translations';
import type { AnimationStep, HighlightEntry } from '../../types/animation';

export type HashChainingOperationId = 'insert' | 'search' | 'delete';
export type HashChainingAction = 'initial' | 'hash' | 'collision' | 'insert' | 'scan' | 'found' | 'remove' | 'completed';
export type HashChainingOutcome = 'ongoing' | 'completed';

export type HashChainingStep = AnimationStep & {
  action: HashChainingAction;
  tableSize: number;
  buckets: number[][];
  operation: HashChainingOperationId;
  activeBucketIndex: number | null;
  activeChainIndex: number | null;
  activeKey: number | null;
  targetKey: number;
  inspectedKeys: number[];
  loadFactor: number;
  found: boolean | null;
  outcome: HashChainingOutcome;
};

export type HashChainingOperationConfig = {
  operation: HashChainingOperationId;
  titleKey: TranslationKey;
  summaryKey: TranslationKey;
  keys: number[];
  targetKey: number;
};

const TABLE_SIZE = 5;
const INSERT_KEYS = [12, 17, 22, 5];
const BASE_KEYS = [12, 17, 22, 5];
const SEARCH_TARGET = 22;
const DELETE_TARGET = 17;

const OPERATION_CONFIG: Record<HashChainingOperationId, HashChainingOperationConfig> = {
  insert: {
    operation: 'insert',
    titleKey: 'module.h01.operation.insert',
    summaryKey: 'module.h01.operation.insertSummary',
    keys: INSERT_KEYS,
    targetKey: INSERT_KEYS.at(-1) ?? 0,
  },
  search: {
    operation: 'search',
    titleKey: 'module.h01.operation.search',
    summaryKey: 'module.h01.operation.searchSummary',
    keys: BASE_KEYS,
    targetKey: SEARCH_TARGET,
  },
  delete: {
    operation: 'delete',
    titleKey: 'module.h01.operation.delete',
    summaryKey: 'module.h01.operation.deleteSummary',
    keys: BASE_KEYS,
    targetKey: DELETE_TARGET,
  },
};

export function getHashChainingOperationIds(): HashChainingOperationId[] {
  return ['insert', 'search', 'delete'];
}

export function getHashChainingOperationConfig(
  operation: HashChainingOperationId,
): HashChainingOperationConfig {
  return OPERATION_CONFIG[operation];
}

export function getHashTableIndex(key: number, tableSize = TABLE_SIZE): number {
  return ((key % tableSize) + tableSize) % tableSize;
}

export function createChainingBuckets(keys: number[], tableSize = TABLE_SIZE): number[][] {
  const buckets = Array.from({ length: tableSize }, () => [] as number[]);

  keys.forEach((key) => {
    buckets[getHashTableIndex(key, tableSize)]?.push(key);
  });

  return buckets;
}

function cloneBuckets(buckets: number[][]): number[][] {
  return buckets.map((bucket) => [...bucket]);
}

function countEntries(buckets: number[][]): number {
  return buckets.reduce((sum, bucket) => sum + bucket.length, 0);
}

function createHighlights(activeBucketIndex: number | null): HighlightEntry[] {
  if (activeBucketIndex === null) {
    return [];
  }

  return [{ index: activeBucketIndex, type: 'visiting' }];
}

function createStep(
  buckets: number[][],
  operation: HashChainingOperationId,
  action: HashChainingAction,
  codeLines: number[],
  targetKey: number,
  activeBucketIndex: number | null,
  activeChainIndex: number | null,
  activeKey: number | null,
  inspectedKeys: number[],
  found: boolean | null,
  outcome: HashChainingOutcome,
): HashChainingStep {
  return {
    action,
    description: action,
    codeLines: [...codeLines],
    highlights: createHighlights(activeBucketIndex),
    tableSize: TABLE_SIZE,
    buckets: cloneBuckets(buckets),
    operation,
    activeBucketIndex,
    activeChainIndex,
    activeKey,
    targetKey,
    inspectedKeys: [...inspectedKeys],
    loadFactor: countEntries(buckets) / TABLE_SIZE,
    found,
    outcome,
  };
}

export function generateHashChainingSteps(operation: HashChainingOperationId): HashChainingStep[] {
  const config = getHashChainingOperationConfig(operation);
  const steps: HashChainingStep[] = [];

  if (operation === 'insert') {
    const buckets = Array.from({ length: TABLE_SIZE }, () => [] as number[]);

    steps.push(createStep(buckets, operation, 'initial', [1], config.targetKey, null, null, null, [], null, 'ongoing'));

    config.keys.forEach((key) => {
      const bucketIndex = getHashTableIndex(key, TABLE_SIZE);
      const existingKeys = [...(buckets[bucketIndex] ?? [])];

      steps.push(createStep(buckets, operation, 'hash', [1, 2], key, bucketIndex, null, key, [], null, 'ongoing'));

      if (existingKeys.length > 0) {
        steps.push(
          createStep(
            buckets,
            operation,
            'collision',
            [3, 4],
            key,
            bucketIndex,
            existingKeys.length - 1,
            key,
            existingKeys,
            null,
            'ongoing',
          ),
        );
      }

      buckets[bucketIndex]?.push(key);
      steps.push(
        createStep(
          buckets,
          operation,
          'insert',
          existingKeys.length > 0 ? [5] : [3],
          key,
          bucketIndex,
          (buckets[bucketIndex]?.length ?? 1) - 1,
          key,
          [...(buckets[bucketIndex] ?? [])],
          null,
          'ongoing',
        ),
      );
    });

    steps.push(
      createStep(
        buckets,
        operation,
        'completed',
        [6],
        config.targetKey,
        getHashTableIndex(config.targetKey, TABLE_SIZE),
        null,
        config.targetKey,
        [],
        null,
        'completed',
      ),
    );

    return steps;
  }

  const buckets = createChainingBuckets(config.keys, TABLE_SIZE);
  const bucketIndex = getHashTableIndex(config.targetKey, TABLE_SIZE);
  const chain = buckets[bucketIndex] ?? [];

  steps.push(createStep(buckets, operation, 'initial', [1], config.targetKey, null, null, null, [], null, 'ongoing'));
  steps.push(
    createStep(
      buckets,
      operation,
      'hash',
      [1, 2],
      config.targetKey,
      bucketIndex,
      null,
      config.targetKey,
      [],
      null,
      'ongoing',
    ),
  );

  chain.forEach((key, chainIndex) => {
    const inspectedKeys = chain.slice(0, chainIndex + 1);
    if (key === config.targetKey) {
      if (operation === 'search') {
        steps.push(
          createStep(
            buckets,
            operation,
            'found',
            [3, 4],
            config.targetKey,
            bucketIndex,
            chainIndex,
            key,
            inspectedKeys,
            true,
            'ongoing',
          ),
        );
      } else {
        chain.splice(chainIndex, 1);
        steps.push(
          createStep(
            buckets,
            operation,
            'remove',
            [3, 4, 5],
            config.targetKey,
            bucketIndex,
            chainIndex,
            key,
            inspectedKeys,
            true,
            'ongoing',
          ),
        );
      }
    } else {
      steps.push(
        createStep(
          buckets,
          operation,
          'scan',
          [3],
          config.targetKey,
          bucketIndex,
          chainIndex,
          key,
          inspectedKeys,
          null,
          'ongoing',
        ),
      );
    }
  });

  steps.push(
    createStep(
      buckets,
      operation,
      'completed',
      [6],
      config.targetKey,
      bucketIndex,
      null,
      config.targetKey,
      [...chain],
      true,
      'completed',
    ),
  );

  return steps;
}
