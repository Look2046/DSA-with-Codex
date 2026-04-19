import type { AnimationStep } from '../../types/animation';

export type BacktrackingPresetId = 'n4' | 'n5';
export type BacktrackingConflictReason = 'column' | 'diag' | 'antiDiag' | null;

export type BacktrackingPreset = {
  presetId: BacktrackingPresetId;
  size: number;
  maxSolutions: number;
};

export type BacktrackingAction = 'initial' | 'tryCell' | 'conflict' | 'placeQueen' | 'backtrack' | 'solution' | 'completed';

export type BacktrackingStep = AnimationStep & {
  presetId: BacktrackingPresetId;
  size: number;
  queens: number[];
  action: BacktrackingAction;
  activeRow: number | null;
  activeCol: number | null;
  conflictReason: BacktrackingConflictReason;
  solutionCount: number;
  solutions: number[][];
};

const BACKTRACKING_PRESETS: Record<BacktrackingPresetId, BacktrackingPreset> = {
  n4: {
    presetId: 'n4',
    size: 4,
    maxSolutions: 2,
  },
  n5: {
    presetId: 'n5',
    size: 5,
    maxSolutions: 3,
  },
};

function cloneQueens(queens: number[]): number[] {
  return [...queens];
}

function cloneSolutions(solutions: number[][]): number[][] {
  return solutions.map((solution) => [...solution]);
}

function createStep(
  preset: BacktrackingPreset,
  queens: number[],
  action: BacktrackingAction,
  codeLines: number[],
  activeRow: number | null,
  activeCol: number | null,
  conflictReason: BacktrackingConflictReason,
  solutions: number[][],
): BacktrackingStep {
  return {
    description: '',
    codeLines: [...codeLines],
    highlights: [],
    presetId: preset.presetId,
    size: preset.size,
    queens: cloneQueens(queens),
    action,
    activeRow,
    activeCol,
    conflictReason,
    solutionCount: solutions.length,
    solutions: cloneSolutions(solutions),
  };
}

function getConflictReason(queens: number[], row: number, col: number): BacktrackingConflictReason {
  for (let previousRow = 0; previousRow < row; previousRow += 1) {
    const previousCol = queens[previousRow];
    if (previousCol === col) {
      return 'column';
    }
    if (previousCol - previousRow === col - row) {
      return 'diag';
    }
    if (previousCol + previousRow === col + row) {
      return 'antiDiag';
    }
  }
  return null;
}

export function getBacktrackingPresetIds(): BacktrackingPresetId[] {
  return Object.keys(BACKTRACKING_PRESETS) as BacktrackingPresetId[];
}

export function getBacktrackingPreset(presetId: BacktrackingPresetId): BacktrackingPreset {
  return { ...BACKTRACKING_PRESETS[presetId] };
}

export function generateBacktrackingSteps(presetId: BacktrackingPresetId): BacktrackingStep[] {
  const preset = getBacktrackingPreset(presetId);
  const queens = Array.from({ length: preset.size }, () => -1);
  const solutions: number[][] = [];
  const steps: BacktrackingStep[] = [];
  let shouldStop = false;

  steps.push(createStep(preset, queens, 'initial', [1], null, null, null, solutions));

  function solve(row: number): void {
    if (shouldStop) {
      return;
    }

    if (row === preset.size) {
      solutions.push([...queens]);
      steps.push(createStep(preset, queens, 'solution', [5], row - 1, queens[row - 1] ?? null, null, solutions));
      if (solutions.length >= preset.maxSolutions) {
        shouldStop = true;
      }
      return;
    }

    for (let col = 0; col < preset.size; col += 1) {
      if (shouldStop) {
        return;
      }

      steps.push(createStep(preset, queens, 'tryCell', [2], row, col, null, solutions));
      const conflictReason = getConflictReason(queens, row, col);
      if (conflictReason) {
        steps.push(createStep(preset, queens, 'conflict', [3], row, col, conflictReason, solutions));
        continue;
      }

      queens[row] = col;
      steps.push(createStep(preset, queens, 'placeQueen', [4], row, col, null, solutions));
      solve(row + 1);

      if (shouldStop) {
        return;
      }

      queens[row] = -1;
      steps.push(createStep(preset, queens, 'backtrack', [4], row, col, null, solutions));
    }
  }

  solve(0);
  steps.push(createStep(preset, queens, 'completed', [6], null, null, null, solutions));
  return steps;
}
