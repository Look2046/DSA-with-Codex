import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import {
  getDynamicProgrammingPresetIds,
  type DynamicProgrammingAction,
  type DynamicProgrammingPresetId,
  type DynamicProgrammingStep,
} from '../../modules/paradigm/dynamicProgramming';
import { buildDynamicProgrammingTimelineFromPreset } from '../../modules/paradigm/dynamicProgrammingTimelineAdapter';
import { DEFAULT_SPEED_OPTIONS, getPlaybackStatusLabel, getTimelineProgressWidth } from './modulePageHelpers';

const DEFAULT_PRESET: DynamicProgrammingPresetId = 'classic';

const PAGE_COPY = {
  en: {
    title: 'P-02 Dynamic Programming',
    body: 'Use 0/1 knapsack to show how dynamic programming fills a table, reuses overlapping subproblems, and reconstructs the chosen items.',
    stage: 'Dynamic programming stage',
    preset: 'Preset',
    presets: {
      classic: 'Capacity 5 knapsack',
      compact: 'Compact 3-item knapsack',
    },
    step: {
      initial: 'Prepare an empty DP table.',
      inspectCell: 'Inspect whether skipping or taking the current item gives a better value.',
      writeCell: 'Write the best value into the current DP cell.',
      traceChoice: 'Trace back through the table to recover the chosen items.',
      completed: 'Dynamic programming table and chosen items are complete.',
    } satisfies Record<DynamicProgrammingAction, string>,
    meta: {
      row: 'Item row',
      col: 'Capacity col',
      skip: 'Skip value',
      take: 'Take value',
      best: 'Best value',
      chosen: 'Chosen items',
    },
    views: {
      items: 'Items',
      itemsHint: 'Each item can be taken at most once.',
      table: 'DP table',
      tableHint: 'Rows are items, columns are capacities.',
      chosen: 'Recovered solution',
      chosenHint: 'Backtracking from the bottom-right cell recovers the chosen items.',
    },
    codeTitle: 'Dynamic programming pseudocode',
    code: [
      'initialize dp[itemCount + 1][capacity + 1] with 0',
      'inspect skip/take choices for the current cell',
      'write the larger value into dp[i][c]',
      'trace backward to recover the chosen items',
      'the bottom-right cell is the optimal value',
    ],
  },
  zh: {
    title: 'P-02 动态规划',
    body: '用 0/1 背包展示动态规划如何填表、复用重叠子问题，并在最后回溯出选择方案。',
    stage: '动态规划画布',
    preset: '预设',
    presets: {
      classic: '容量 5 背包',
      compact: '紧凑 3 物品背包',
    },
    step: {
      initial: '准备一张空的 DP 表。',
      inspectCell: '比较“跳过当前物品”和“选择当前物品”哪一个更优。',
      writeCell: '把最优值写入当前 DP 单元。',
      traceChoice: '从表格右下角回溯，恢复被选择的物品。',
      completed: '动态规划表与选择方案都已完成。',
    } satisfies Record<DynamicProgrammingAction, string>,
    meta: {
      row: '物品行',
      col: '容量列',
      skip: '跳过值',
      take: '选择值',
      best: '最优值',
      chosen: '已选物品',
    },
    views: {
      items: '物品',
      itemsHint: '每个物品最多只能选一次。',
      table: 'DP 表',
      tableHint: '行表示物品，列表示容量。',
      chosen: '恢复方案',
      chosenHint: '从右下角回溯，就能找出最终被选择的物品。',
    },
    codeTitle: '动态规划伪代码',
    code: [
      '初始化 dp[itemCount + 1][capacity + 1] 为 0',
      '比较当前单元的 skip/take 两种选择',
      '把更大的值写入 dp[i][c]',
      '从表格末尾向前回溯选择方案',
      '右下角单元就是最优值',
    ],
  },
} as const;

type PageCopy = (typeof PAGE_COPY)[keyof typeof PAGE_COPY];

function getMatrixCellClass({
  active = false,
  success = false,
}: {
  active?: boolean;
  success?: boolean;
}): string {
  const classes = ['algo-matrix-cell'];
  if (active) {
    classes.push('algo-matrix-cell-active');
  }
  if (success) {
    classes.push('algo-matrix-cell-success');
  }
  return classes.join(' ');
}

function getStepDescription(step: DynamicProgrammingStep | undefined, copy: PageCopy): string {
  if (!step) {
    return '-';
  }
  return copy.step[step.action];
}

export function DynamicProgrammingPage() {
  const { t, language } = useI18n();
  const copy = PAGE_COPY[language];
  const [presetId, setPresetId] = useState<DynamicProgrammingPresetId>(DEFAULT_PRESET);
  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildDynamicProgrammingTimelineFromPreset(presetId), [presetId]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const presetOptions = useMemo(() => getDynamicProgrammingPresetIds(), []);
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

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
      stageMeta={
        <>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('playback.status')}: {getPlaybackStatusLabel(status, t)}
          </span>
          <span className="tree-workspace-pill">
            {copy.meta.row}: {currentSnapshot?.row ?? '-'}
          </span>
          <span className="tree-workspace-pill">
            {copy.meta.col}: {currentSnapshot?.col ?? '-'}
          </span>
          <span className="tree-workspace-pill">
            {copy.meta.best}: {currentSnapshot?.maxValue ?? 0}
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

          <div className="tree-workspace-sample-block">
            <span>{copy.views.items}</span>
            <code>
              {(currentSnapshot?.items ?? [])
                .map((item) => `${item.id}(w${item.weight},v${item.value})`)
                .join(', ')}
            </code>
          </div>
        </>
      }
      stepContent={
        <>
          <div className="tree-workspace-step-copy">
            <h3>{getStepDescription(currentSnapshot, copy)}</h3>
            <p>
              {copy.meta.chosen}:{' '}
              {(currentSnapshot?.selectedItemIndices ?? [])
                .map((itemIndex) => currentSnapshot?.items[itemIndex]?.id ?? itemIndex)
                .join(', ') || '-'}
            </p>
          </div>

          <dl className="tree-workspace-kv">
            <div>
              <dt>{t('playback.status')}</dt>
              <dd>{getPlaybackStatusLabel(status, t)}</dd>
            </div>
            <div>
              <dt>{copy.meta.row}</dt>
              <dd>{currentSnapshot?.row ?? '-'}</dd>
            </div>
            <div>
              <dt>{copy.meta.col}</dt>
              <dd>{currentSnapshot?.col ?? '-'}</dd>
            </div>
            <div>
              <dt>{copy.meta.skip}</dt>
              <dd>{currentSnapshot?.skipValue ?? '-'}</dd>
            </div>
            <div>
              <dt>{copy.meta.take}</dt>
              <dd>{currentSnapshot?.takeValue ?? '-'}</dd>
            </div>
            <div>
              <dt>{copy.meta.best}</dt>
              <dd>{currentSnapshot?.maxValue ?? 0}</dd>
            </div>
            <div>
              <dt>{copy.meta.chosen}</dt>
              <dd>
                {(currentSnapshot?.selectedItemIndices ?? [])
                  .map((itemIndex) => currentSnapshot?.items[itemIndex]?.id ?? itemIndex)
                  .join(', ') || '-'}
              </dd>
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
              <strong>{copy.views.items}</strong>
              <span>{copy.views.itemsHint}</span>
            </div>
            <div className="algo-chip-row">
              {currentSnapshot?.items.map((item, index) => (
                <span
                  key={item.id}
                  className={`algo-chip${
                    currentSnapshot.selectedItemIndices.includes(index) ? ' algo-chip-success' : ''
                  }`}
                >
                  {item.id}: w{item.weight}, v{item.value}
                </span>
              ))}
            </div>
          </section>

          <section className="string-stage-card">
            <div className="string-stage-head">
              <strong>{copy.views.table}</strong>
              <span>{copy.views.tableHint}</span>
            </div>
            <div
              className="algo-matrix"
              style={{
                gridTemplateColumns: `repeat(${(currentSnapshot?.capacity ?? 0) + 2}, minmax(36px, 1fr))`,
              }}
            >
              <span className="algo-matrix-header">i/c</span>
              {Array.from({ length: (currentSnapshot?.capacity ?? 0) + 1 }, (_, capacity) => (
                <span key={`cap-${capacity}`} className="algo-matrix-header">
                  {capacity}
                </span>
              ))}

              {currentSnapshot?.table.map((rowValues, rowIndex) => (
                <div
                  key={`row-${rowIndex}`}
                  className="algo-matrix-row"
                  style={{
                    display: 'contents',
                  }}
                >
                  <span className="algo-matrix-header">
                    {rowIndex === 0 ? '0' : currentSnapshot.items[rowIndex - 1]?.id ?? rowIndex}
                  </span>
                  {rowValues.map((value, colIndex) => (
                    <span
                      key={`cell-${rowIndex}-${colIndex}`}
                      className={getMatrixCellClass({
                        active: currentSnapshot.row === rowIndex && currentSnapshot.col === colIndex,
                        success:
                          currentSnapshot.action === 'traceChoice' &&
                          currentSnapshot.selectedItemIndices.includes(rowIndex - 1),
                      })}
                    >
                      {value}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section className="string-stage-card">
            <div className="string-stage-head">
              <strong>{copy.views.chosen}</strong>
              <span>{copy.views.chosenHint}</span>
            </div>
            <div className="algo-chip-row">
              {(currentSnapshot?.selectedItemIndices ?? []).length > 0 ? (
                currentSnapshot?.selectedItemIndices.map((itemIndex) => (
                  <span key={`chosen-${itemIndex}`} className="algo-chip algo-chip-success">
                    {currentSnapshot.items[itemIndex]?.id}
                  </span>
                ))
              ) : (
                <span className="algo-empty-copy">-</span>
              )}
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
            {copy.meta.row}: {currentSnapshot?.row ?? '-'}
          </span>
          <span className="tree-workspace-transport-chip">
            {copy.meta.col}: {currentSnapshot?.col ?? '-'}
          </span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {copy.meta.best}: {currentSnapshot?.maxValue ?? 0}
          </span>
        </>
      }
    />
  );
}
