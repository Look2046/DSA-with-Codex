import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import {
  getBacktrackingPresetIds,
  type BacktrackingAction,
  type BacktrackingConflictReason,
  type BacktrackingPresetId,
  type BacktrackingStep,
} from '../../modules/paradigm/backtracking';
import { buildBacktrackingTimelineFromPreset } from '../../modules/paradigm/backtrackingTimelineAdapter';
import { DEFAULT_SPEED_OPTIONS, getPlaybackStatusLabel, getTimelineProgressWidth } from './modulePageHelpers';

const DEFAULT_PRESET: BacktrackingPresetId = 'n4';

const PAGE_COPY = {
  en: {
    title: 'P-04 Backtracking',
    body: 'Use N-Queens to show backtracking trial, conflict detection, recursive placement, and undo when a branch fails.',
    stage: 'Backtracking stage',
    preset: 'Preset',
    presets: {
      n4: '4-Queens',
      n5: '5-Queens (first 3 solutions)',
    },
    step: {
      initial: 'Prepare an empty board and start from row 0.',
      tryCell: 'Try placing a queen into the next candidate cell.',
      conflict: 'This candidate conflicts with an existing queen, so the branch is pruned.',
      placeQueen: 'Place a queen and continue to the next row.',
      backtrack: 'Undo the last placement and try the next candidate.',
      solution: 'A full non-conflicting board is found.',
      completed: 'Backtracking exploration is complete.',
    } satisfies Record<BacktrackingAction, string>,
    conflict: {
      column: 'column conflict',
      diag: 'main diagonal conflict',
      antiDiag: 'anti-diagonal conflict',
      none: 'no conflict',
    } satisfies Record<Exclude<BacktrackingConflictReason, null>, string> & { none: string },
    meta: {
      row: 'Row',
      col: 'Column',
      solutions: 'Solutions',
      reason: 'Conflict reason',
    },
    views: {
      board: 'Board',
      boardHint: 'The active square is the candidate currently being explored.',
      placements: 'Current placements',
      placementsHint: 'Each chip maps one row to its queen column.',
      solutions: 'Found solutions',
      solutionsHint: 'Every solution is recorded as a row -> column sequence.',
    },
    codeTitle: 'Backtracking pseudocode',
    code: [
      'solve(row)',
      'try the next candidate column in this row',
      'if it conflicts with previous queens: skip it',
      'otherwise place the queen and recurse to the next row',
      'when row == n: record a solution',
      'if no candidate works, backtrack to the previous row',
    ],
  },
  zh: {
    title: 'P-04 回溯',
    body: '用 N 皇后展示回溯如何试探、检测冲突、递归深入，并在分支失败时撤销选择。',
    stage: '回溯画布',
    preset: '预设',
    presets: {
      n4: '4 皇后',
      n5: '5 皇后（前 3 个解）',
    },
    step: {
      initial: '准备空棋盘，并从第 0 行开始。',
      tryCell: '尝试把皇后放到下一个候选格子。',
      conflict: '该候选位置与已有皇后冲突，因此剪枝。',
      placeQueen: '放置皇后，并继续递归到下一行。',
      backtrack: '撤销上一次放置，改试下一个候选位置。',
      solution: '找到了一个完整且无冲突的棋盘。',
      completed: '回溯搜索完成。',
    } satisfies Record<BacktrackingAction, string>,
    conflict: {
      column: '同列冲突',
      diag: '主对角线冲突',
      antiDiag: '副对角线冲突',
      none: '无冲突',
    } satisfies Record<Exclude<BacktrackingConflictReason, null>, string> & { none: string },
    meta: {
      row: '行',
      col: '列',
      solutions: '解数量',
      reason: '冲突原因',
    },
    views: {
      board: '棋盘',
      boardHint: '高亮格子就是当前正在尝试的候选位置。',
      placements: '当前放置',
      placementsHint: '每个 chip 对应“第几行的皇后放在哪一列”。',
      solutions: '已找到解',
      solutionsHint: '每个解都会记录成“行 -> 列”的序列。',
    },
    codeTitle: '回溯伪代码',
    code: [
      'solve(row)',
      '尝试这一行的每一个候选列',
      '若与已有皇后冲突：跳过',
      '否则放置皇后并递归到下一行',
      '若 row == n：记录一个解',
      '若本行没有可行列：回溯到上一行',
    ],
  },
} as const;

type PageCopy = (typeof PAGE_COPY)[keyof typeof PAGE_COPY];

function getStepDescription(step: BacktrackingStep | undefined, copy: PageCopy): string {
  if (!step) {
    return '-';
  }
  return copy.step[step.action];
}

function getConflictLabel(reason: BacktrackingConflictReason, copy: PageCopy): string {
  if (!reason) {
    return copy.conflict.none;
  }
  return copy.conflict[reason];
}

function getBoardCellClass({
  dark,
  active,
  queen,
  conflict,
}: {
  dark: boolean;
  active: boolean;
  queen: boolean;
  conflict: boolean;
}): string {
  const classes = ['algo-board-cell', dark ? 'algo-board-cell-dark' : 'algo-board-cell-light'];
  if (active) {
    classes.push('algo-board-cell-active');
  }
  if (queen) {
    classes.push('algo-board-cell-queen');
  }
  if (conflict) {
    classes.push('algo-board-cell-conflict');
  }
  return classes.join(' ');
}

export function BacktrackingPage() {
  const { t, language } = useI18n();
  const copy = PAGE_COPY[language];
  const [presetId, setPresetId] = useState<BacktrackingPresetId>(DEFAULT_PRESET);
  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildBacktrackingTimelineFromPreset(presetId), [presetId]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const presetOptions = useMemo(() => getBacktrackingPresetIds(), []);
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  const focusPoint = useMemo(() => {
    if (
      currentSnapshot?.activeCol === null ||
      currentSnapshot?.activeRow === null ||
      (currentSnapshot?.size ?? 0) === 0
    ) {
      return null;
    }

    return {
      x: ((currentSnapshot.activeCol + 0.5) / currentSnapshot.size) * 100,
      y: 24 + (currentSnapshot.activeRow / Math.max(currentSnapshot.size, 1)) * 50,
    };
  }, [currentSnapshot]);

  return (
    <WorkspaceShell
      pageClassName="array-page tree-page bst-page"
      title={copy.title}
      description={copy.body}
      stageAriaLabel={copy.stage}
      stageClassName="string-stage algo-stage"
      stageBodyClassName="workspace-stage-body-tree"
      controlsPanelClassName="workspace-drawer-xl workspace-drawer-scroll"
      stepPanelClassName="workspace-context-sheet-wide workspace-context-sheet-rich"
      defaultControlsPanelSize={{ width: 332, height: 560 }}
      defaultContextPanelSize={{ width: 320, height: 560 }}
      focusPoint={focusPoint}
      stageMeta={
        <>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('playback.status')}: {getPlaybackStatusLabel(status, t)}
          </span>
          <span className="tree-workspace-pill">
            {copy.meta.row}: {currentSnapshot?.activeRow ?? '-'}
          </span>
          <span className="tree-workspace-pill">
            {copy.meta.col}: {currentSnapshot?.activeCol ?? '-'}
          </span>
          <span className="tree-workspace-pill">
            {copy.meta.solutions}: {currentSnapshot?.solutionCount ?? 0}
          </span>
          <span className="tree-workspace-pill">{getStepDescription(currentSnapshot, copy)}</span>
        </>
      }
      controlsContent={
        <>
          <div className="tree-workspace-field">
            <span>{copy.preset}</span>
            <div className="tree-workspace-toggle-row">
              {presetOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`tree-workspace-toggle${presetId === option ? ' tree-workspace-toggle-active' : ''}`}
                  onClick={() => {
                    setPresetId(option);
                    reset();
                  }}
                >
                  {copy.presets[option]}
                </button>
              ))}
            </div>
          </div>

          <div className="tree-workspace-field">
            <span>{t('module.s01.speed')}</span>
            <div className="tree-workspace-toggle-row">
              {DEFAULT_SPEED_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`tree-workspace-toggle${speedMs === option.value ? ' tree-workspace-toggle-active' : ''}`}
                  onClick={() => setSpeed(option.value)}
                >
                  {t(option.key)}
                </button>
              ))}
            </div>
          </div>
        </>
      }
      stepContent={
        <>
          <div className="tree-workspace-step-copy">
            <h3>{getStepDescription(currentSnapshot, copy)}</h3>
            <p>
              {copy.meta.reason}: {getConflictLabel(currentSnapshot?.conflictReason ?? null, copy)}
            </p>
          </div>

          <dl className="tree-workspace-kv">
            <div>
              <dt>{t('playback.status')}</dt>
              <dd>{getPlaybackStatusLabel(status, t)}</dd>
            </div>
            <div>
              <dt>{copy.meta.row}</dt>
              <dd>{currentSnapshot?.activeRow ?? '-'}</dd>
            </div>
            <div>
              <dt>{copy.meta.col}</dt>
              <dd>{currentSnapshot?.activeCol ?? '-'}</dd>
            </div>
            <div>
              <dt>{copy.meta.reason}</dt>
              <dd>{getConflictLabel(currentSnapshot?.conflictReason ?? null, copy)}</dd>
            </div>
            <div>
              <dt>{copy.meta.solutions}</dt>
              <dd>{currentSnapshot?.solutionCount ?? 0}</dd>
            </div>
          </dl>

          <div className="tree-workspace-code-block">
            <span className="tree-workspace-code-title">{copy.codeTitle}</span>
            <ol className="tree-workspace-code-list">
              {copy.code.map((line, index) => {
                const lineNumber = index + 1;
                const isActive = currentSnapshot?.codeLines.includes(lineNumber) ?? false;
                return (
                  <li key={lineNumber} className={isActive ? 'code-active' : undefined}>
                    <code>{line}</code>
                  </li>
                );
              })}
            </ol>
          </div>
        </>
      }
      stageContent={
        <div className="algo-stage-scene">
          <section className="string-stage-card">
            <div className="string-stage-head">
              <strong>{copy.views.board}</strong>
              <span>{copy.views.boardHint}</span>
            </div>
            <div
              className="algo-board"
              style={{
                gridTemplateColumns: `repeat(${currentSnapshot?.size ?? 0}, minmax(42px, 1fr))`,
              }}
            >
              {Array.from({ length: currentSnapshot?.size ?? 0 }, (_, row) =>
                Array.from({ length: currentSnapshot?.size ?? 0 }, (_, col) => {
                  const queen = currentSnapshot?.queens[row] === col;
                  const active = currentSnapshot?.activeRow === row && currentSnapshot?.activeCol === col;
                  const conflict = active && currentSnapshot?.action === 'conflict';
                  return (
                    <span
                      key={`cell-${row}-${col}`}
                      className={getBoardCellClass({
                        dark: (row + col) % 2 === 1,
                        active,
                        queen,
                        conflict,
                      })}
                    >
                      {queen ? 'Q' : ''}
                    </span>
                  );
                }),
              )}
            </div>
          </section>

          <section className="string-stage-card">
            <div className="string-stage-head">
              <strong>{copy.views.placements}</strong>
              <span>{copy.views.placementsHint}</span>
            </div>
            <div className="algo-chip-row">
              {currentSnapshot?.queens.map((col, row) =>
                col >= 0 ? (
                  <span key={`placement-${row}`} className="algo-chip">
                    {`r${row} -> c${col}`}
                  </span>
                ) : null,
              )}
            </div>
          </section>

          <section className="string-stage-card">
            <div className="string-stage-head">
              <strong>{copy.views.solutions}</strong>
              <span>{copy.views.solutionsHint}</span>
            </div>
            <div className="algo-solution-grid">
              {(currentSnapshot?.solutions ?? []).map((solution, index) => (
                <div key={`solution-${index}`} className="algo-solution-card">
                  <strong>#{index + 1}</strong>
                  <span>{solution.map((col, row) => `r${row}->c${col}`).join(', ')}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      }
      transportLeft={
        <>
          <button type="button" className="tree-workspace-transport-btn" onClick={prev} disabled={steps.length === 0 || currentStep <= 0}>
            {t('playback.prev')}
          </button>
          <button
            type="button"
            className="tree-workspace-transport-btn tree-workspace-transport-btn-primary"
            onClick={status === 'playing' ? pause : play}
            disabled={steps.length === 0 || (status !== 'playing' && isAtLastFrame)}
          >
            {status === 'playing' ? t('playback.pause') : t('playback.play')}
          </button>
          <button type="button" className="tree-workspace-transport-btn" onClick={next} disabled={isAtLastFrame}>
            {t('playback.next')}
          </button>
          <button type="button" className="tree-workspace-transport-btn" onClick={reset} disabled={steps.length === 0}>
            {t('playback.reset')}
          </button>
          <div className="tree-workspace-transport-progress" aria-hidden="true">
            <span
              className="tree-workspace-transport-progress-fill"
              style={{ width: getTimelineProgressWidth(currentStep, steps.length) }}
            />
          </div>
          <span className="tree-workspace-transport-step">
            {currentStep}/{Math.max(steps.length - 1, 0)}
          </span>
        </>
      }
      transportRight={
        <>
          <span className="tree-workspace-transport-chip">
            {copy.meta.row}: {currentSnapshot?.activeRow ?? '-'}
          </span>
          <span className="tree-workspace-transport-chip">
            {copy.meta.col}: {currentSnapshot?.activeCol ?? '-'}
          </span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {copy.meta.solutions}: {currentSnapshot?.solutionCount ?? 0}
          </span>
        </>
      }
    />
  );
}
