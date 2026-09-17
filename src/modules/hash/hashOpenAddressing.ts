import type { TranslationKey } from '../../i18n/translations';
import type { AnimationStep, HighlightEntry } from '../../types/animation';

export type HashOpenAddressingOperationId = 'insert' | 'search' | 'delete';
export type HashOpenAddressingAction =
  | 'initial'
  | 'hash'
  | 'collision'
  | 'probe'
  | 'insert'
  | 'scan'
  | 'found'
  | 'remove'
  | 'completed';
export type HashOpenAddressingOutcome = 'ongoing' | 'completed';

export type HashOpenAddressingStep = AnimationStep & {
  action: HashOpenAddressingAction;
  tableSize: number;
  slots: Array<number | null>;
  tombstoneIndices: number[];
  operation: HashOpenAddressingOperationId;
  activeIndex: number | null;
  homeIndex: number | null;
  activeKey: number | null;
  targetKey: number;
  probeSequence: number[];
  loadFactor: number;
  found: boolean | null;
  outcome: HashOpenAddressingOutcome;
};

export type HashOpenAddressingOperationConfig = {
  operation: HashOpenAddressingOperationId;
  titleKey: TranslationKey;
  summaryKey: TranslationKey;
  keys: number[];
  targetKey: number;
};

const TABLE_SIZE = 7;
const INSERT_KEYS = [10, 17, 24, 31];
const BASE_KEYS = [10, 17, 24, 31];
const SEARCH_TARGET = 24;
const DELETE_TARGET = 17;

const OPERATION_CONFIG: Record<HashOpenAddressingOperationId, HashOpenAddressingOperationConfig> = {
  insert: {
    operation: 'insert',
    titleKey: 'module.h02.operation.insert',
    summaryKey: 'module.h02.operation.insertSummary',
    keys: INSERT_KEYS,
    targetKey: INSERT_KEYS.at(-1) ?? 0,
  },
  search: {
    operation: 'search',
    titleKey: 'module.h02.operation.search',
    summaryKey: 'module.h02.operation.searchSummary',
    keys: BASE_KEYS,
    targetKey: SEARCH_TARGET,
  },
  delete: {
    operation: 'delete',
    titleKey: 'module.h02.operation.delete',
    summaryKey: 'module.h02.operation.deleteSummary',
    keys: BASE_KEYS,
    targetKey: DELETE_TARGET,
  },
};

export function getHashOpenAddressingOperationIds(): HashOpenAddressingOperationId[] {
  return ['insert', 'search', 'delete'];
}

export function getHashOpenAddressingOperationConfig(
  operation: HashOpenAddressingOperationId,
): HashOpenAddressingOperationConfig {
  return OPERATION_CONFIG[operation];
}

export function getOpenAddressingIndex(key: number, tableSize = TABLE_SIZE): number {
  return ((key % tableSize) + tableSize) % tableSize;
}

export function createOpenAddressingSlots(keys: number[], tableSize = TABLE_SIZE): Array<number | null> {
  const slots = Array.from({ length: tableSize }, () => null as number | null);

  keys.forEach((key) => {
    let index = getOpenAddressingIndex(key, tableSize);
    while (slots[index] !== null) {
      index = (index + 1) % tableSize;
    }
    slots[index] = key;
  });

  return slots;
}

function cloneSlots(slots: Array<number | null>): Array<number | null> {
  return [...slots];
}

function createHighlights(activeIndex: number | null): HighlightEntry[] {
  if (activeIndex === null) {
    return [];
  }

  return [{ index: activeIndex, type: 'visiting' }];
}

function countEntries(slots: Array<number | null>): number {
  return slots.filter((value) => value !== null).length;
}

function createStep(
  slots: Array<number | null>,
  tombstoneIndices: number[],
  operation: HashOpenAddressingOperationId,
  action: HashOpenAddressingAction,
  codeLines: number[],
  targetKey: number,
  activeIndex: number | null,
  homeIndex: number | null,
  activeKey: number | null,
  probeSequence: number[],
  found: boolean | null,
  outcome: HashOpenAddressingOutcome,
): HashOpenAddressingStep {
  return {
    action,
    description: action,
    codeLines: [...codeLines],
    highlights: createHighlights(activeIndex),
    tableSize: TABLE_SIZE,
    slots: cloneSlots(slots),
    tombstoneIndices: [...tombstoneIndices],
    operation,
    activeIndex,
    homeIndex,
    activeKey,
    targetKey,
    probeSequence: [...probeSequence],
    loadFactor: countEntries(slots) / TABLE_SIZE,
    found,
    outcome,
  };
}

export function generateHashOpenAddressingSteps(
  operation: HashOpenAddressingOperationId,
): HashOpenAddressingStep[] {
  const config = getHashOpenAddressingOperationConfig(operation);
  const steps: HashOpenAddressingStep[] = [];

  if (operation === 'insert') {
    const slots = Array.from({ length: TABLE_SIZE }, () => null as number | null);
    const tombstoneIndices: number[] = [];
    let lastInsertIndex: number | null = null;
    let lastHomeIndex: number | null = null;
    let lastProbeSequence: number[] = [];

    steps.push(createStep(slots, tombstoneIndices, operation, 'initial', [1], config.targetKey, null, null, null, [], null, 'ongoing'));

    config.keys.forEach((key) => {
      const homeIndex = getOpenAddressingIndex(key, TABLE_SIZE);
      const probeSequence = [homeIndex];
      let index = homeIndex;

      steps.push(createStep(slots, tombstoneIndices, operation, 'hash', [1, 2], key, index, homeIndex, key, probeSequence, null, 'ongoing'));

      while (slots[index] !== null) {
        steps.push(
          createStep(
            slots,
            tombstoneIndices,
            operation,
            'collision',
            [3],
            key,
            index,
            homeIndex,
            key,
            probeSequence,
            null,
            'ongoing',
          ),
        );

        index = (index + 1) % TABLE_SIZE;
        probeSequence.push(index);
        steps.push(
          createStep(
            slots,
            tombstoneIndices,
            operation,
            'probe',
            [4],
            key,
            index,
            homeIndex,
            key,
            probeSequence,
            null,
            'ongoing',
          ),
        );
      }

      slots[index] = key;
      lastInsertIndex = index;
      lastHomeIndex = homeIndex;
      lastProbeSequence = [...probeSequence];
      steps.push(
        createStep(
          slots,
          tombstoneIndices,
          operation,
          'insert',
          [5],
          key,
          index,
          homeIndex,
          key,
          probeSequence,
          null,
          'ongoing',
        ),
      );
    });

    steps.push(
      createStep(
        slots,
        tombstoneIndices,
        operation,
        'completed',
        [6],
        config.targetKey,
        lastInsertIndex,
        lastHomeIndex,
        config.targetKey,
        lastProbeSequence,
        null,
        'completed',
      ),
    );

    return steps;
  }

  const slots = createOpenAddressingSlots(config.keys, TABLE_SIZE);
  const tombstoneIndices: number[] = [];
  const homeIndex = getOpenAddressingIndex(config.targetKey, TABLE_SIZE);
  const probeSequence = [homeIndex];
  let index = homeIndex;

  steps.push(createStep(slots, tombstoneIndices, operation, 'initial', [1], config.targetKey, null, null, null, [], null, 'ongoing'));
  steps.push(
    createStep(
      slots,
      tombstoneIndices,
      operation,
      'hash',
      [1, 2],
      config.targetKey,
      index,
      homeIndex,
      config.targetKey,
      probeSequence,
      null,
      'ongoing',
    ),
  );

  while (slots[index] !== null) {
    if (slots[index] === config.targetKey) {
      if (operation === 'search') {
        steps.push(
          createStep(
            slots,
            tombstoneIndices,
            operation,
            'found',
            [3, 5],
            config.targetKey,
            index,
            homeIndex,
            slots[index],
            probeSequence,
            true,
            'ongoing',
          ),
        );
      } else {
        slots[index] = null;
        tombstoneIndices.push(index);
        steps.push(
          createStep(
            slots,
            tombstoneIndices,
            operation,
            'remove',
            [3, 5, 6],
            config.targetKey,
            index,
            homeIndex,
            config.targetKey,
            probeSequence,
            true,
            'ongoing',
          ),
        );
      }
      break;
    }

    steps.push(
      createStep(
        slots,
        tombstoneIndices,
        operation,
        'scan',
        [3],
        config.targetKey,
        index,
        homeIndex,
        slots[index],
        probeSequence,
        null,
        'ongoing',
      ),
    );

    index = (index + 1) % TABLE_SIZE;
    probeSequence.push(index);

    steps.push(
      createStep(
        slots,
        tombstoneIndices,
        operation,
        'probe',
        [4],
        config.targetKey,
        index,
        homeIndex,
        config.targetKey,
        probeSequence,
        null,
        'ongoing',
      ),
    );
  }

  steps.push(
    createStep(
      slots,
      tombstoneIndices,
      operation,
      'completed',
      [7],
      config.targetKey,
      index,
      homeIndex,
      config.targetKey,
      probeSequence,
      true,
      'completed',
    ),
  );

  return steps;
}
