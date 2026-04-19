import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import {
  getDivideConquerPresetIds,
  type DivideConquerAction,
  type DivideConquerPresetId,
  type DivideConquerStep,
} from '../../modules/paradigm/divideConquer';
import { buildDivideConquerTimelineFromPreset } from '../../modules/paradigm/divideConquerTimelineAdapter';
import { DEFAULT_SPEED_OPTIONS, getPlaybackStatusLabel, getTimelineProgressWidth } from './modulePageHelpers';

const DEFAULT_PRESET: DivideConquerPresetId = 'classic';

const PAGE_COPY = {
  en: {
    title: 'P-01 Divide & Conquer',
    body: 'Use recursive maximum search to illustrate how divide & conquer splits the range, solves subproblems, and combines partial answers.',
    stage: 'Divide and conquer stage',
    preset: 'Preset',
    presets: {
      classic: 'Classic maximum search',
      mixed: 'Mixed-value maximum search',
    },
    step: {
      initial: 'Prepare the full range as one recursive problem.',
      split: 'Split the current range into left and right subranges.',
      baseCase: 'Reach a single-element base case.',
      combine: 'Compare the left and right answers and keep the better one.',
      completed: 'The divide-and-conquer recursion is complete.',
    } satisfies Record<DivideConquerAction, string>,
    meta: {
      range: 'Active range',
      best: 'Current best',
      stack: 'Call stack depth',
      resolved: 'Resolved ranges',
    },
    views: {
      array: 'Array',
      arrayHint: 'The active range is the current recursive subproblem.',
      stack: 'Call stack',
      stackHint: 'Every chip is one recursive frame waiting to return.',
      resolved: 'Resolved segments',
      resolvedHint: 'Each resolved segment remembers the maximum value in that interval.',
    },
    codeTitle: 'Divide & conquer pseudocode',
    code: [
      'solve(range)',
      'split range into left and right halves',
      'if range has one element: return it',
      'combine left/right answers and keep the larger one',
      'return the final answer to the caller',
    ],
  },
  zh: {
    title: 'P-01 分治',
    body: '用“递归求区间最大值”的例子展示分治如何拆分问题、解决子问题并合并答案。',
    stage: '分治画布',
    preset: '预设',
    presets: {
      classic: '经典最大值查找',
      mixed: '混合值最大值查找',
    },
    step: {
      initial: '把整个区间作为一个递归问题。',
      split: '把当前区间拆成左右两个子区间。',
      baseCase: '到达单元素的基本情况。',
      combine: '比较左右子问题答案，保留更大的那个。',
      completed: '分治递归完成。',
    } satisfies Record<DivideConquerAction, string>,
    meta: {
      range: '当前区间',
      best: '当前最优',
      stack: '调用栈深度',
      resolved: '已解决区间',
    },
    views: {
      array: '数组',
      arrayHint: '高亮区间就是当前递归正在解决的子问题。',
      stack: '调用栈',
      stackHint: '每个 chip 表示一个等待返回的递归帧。',
      resolved: '已解决区间',
      resolvedHint: '每个已解决区间都会记录该区间里的最大值。',
    },
    codeTitle: '分治伪代码',
    code: [
      'solve(range)',
      '把区间拆成左右两半',
      '若区间只剩一个元素：直接返回',
      '合并左右答案并保留更大的那个',
      '把结果返回给上一层',
    ],
  },
} as const;

type PageCopy = (typeof PAGE_COPY)[keyof typeof PAGE_COPY];

function getAlgoCellClass({
  active = false,
  success = false,
}: {
  active?: boolean;
  success?: boolean;
}): string {
  const classes = ['algo-cell'];
  if (active) {
    classes.push('algo-cell-active');
  }
  if (success) {
    classes.push('algo-cell-success');
  }
  return classes.join(' ');
}

function formatRange(range: [number, number] | null): string {
  return range ? `[${range[0]}, ${range[1]}]` : '-';
}

function getStepDescription(step: DivideConquerStep | undefined, copy: PageCopy): string {
  if (!step) {
    return '-';
  }
  return copy.step[step.action];
}

export function DivideConquerPage() {
  const { t, language } = useI18n();
  const copy = PAGE_COPY[language];
  const [presetId, setPresetId] = useState<DivideConquerPresetId>(DEFAULT_PRESET);
  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildDivideConquerTimelineFromPreset(presetId), [presetId]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const presetOptions = useMemo(() => getDivideConquerPresetIds(), []);
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  const focusPoint = useMemo(() => {
    if (!currentSnapshot?.activeRange || currentSnapshot.values.length === 0) {
      return null;
    }
    const center = (currentSnapshot.activeRange[0] + currentSnapshot.activeRange[1]) / 2;
    return {
      x: ((center + 0.5) / currentSnapshot.values.length) * 100,
      y: 24,
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
            {copy.meta.range}: {formatRange(currentSnapshot?.activeRange ?? null)}
          </span>
          <span className="tree-workspace-pill">
            {copy.meta.best}: {currentSnapshot?.currentBest?.maxValue ?? '-'}
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
            <span>{copy.views.array}</span>
            <code>{currentSnapshot?.values.join(', ') ?? ''}</code>
          </div>
        </>
      }
      stepContent={
        <>
          <div className="tree-workspace-step-copy">
            <h3>{getStepDescription(currentSnapshot, copy)}</h3>
            <p>
              {copy.meta.best}: {currentSnapshot?.currentBest?.maxValue ?? '-'}
            </p>
          </div>

          <dl className="tree-workspace-kv">
            <div>
              <dt>{t('playback.status')}</dt>
              <dd>{getPlaybackStatusLabel(status, t)}</dd>
            </div>
            <div>
              <dt>{copy.meta.range}</dt>
              <dd>{formatRange(currentSnapshot?.activeRange ?? null)}</dd>
            </div>
            <div>
              <dt>{copy.meta.best}</dt>
              <dd>
                {currentSnapshot?.currentBest
                  ? `${currentSnapshot.currentBest.maxValue} @ #${currentSnapshot.currentBest.maxIndex}`
                  : '-'}
              </dd>
            </div>
            <div>
              <dt>{copy.meta.stack}</dt>
              <dd>{currentSnapshot?.stack.length ?? 0}</dd>
            </div>
            <div>
              <dt>{copy.meta.resolved}</dt>
              <dd>{currentSnapshot?.resolved.length ?? 0}</dd>
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
              <strong>{copy.views.array}</strong>
              <span>{copy.views.arrayHint}</span>
            </div>
            <div className="algo-array-grid">
              {currentSnapshot?.values.map((value, index) => {
                const inActiveRange =
                  currentSnapshot.activeRange !== null &&
                  index >= currentSnapshot.activeRange[0] &&
                  index <= currentSnapshot.activeRange[1];
                const isBest = currentSnapshot.currentBest?.maxIndex === index;

                return (
                  <span
                    key={`value-${index}`}
                    className={getAlgoCellClass({ active: inActiveRange, success: isBest })}
                  >
                    {value}
                  </span>
                );
              })}
            </div>
          </section>

          <section className="string-stage-card">
            <div className="string-stage-head">
              <strong>{copy.views.stack}</strong>
              <span>{copy.views.stackHint}</span>
            </div>
            <div className="algo-chip-row">
              {(currentSnapshot?.stack ?? []).length > 0 ? (
                currentSnapshot?.stack.map((range, index) => (
                  <span key={`stack-${index}`} className="algo-chip">
                    {formatRange(range)}
                  </span>
                ))
              ) : (
                <span className="algo-empty-copy">-</span>
              )}
            </div>
          </section>

          <section className="string-stage-card">
            <div className="string-stage-head">
              <strong>{copy.views.resolved}</strong>
              <span>{copy.views.resolvedHint}</span>
            </div>
            <div className="algo-resolution-grid">
              {currentSnapshot?.resolved.map((entry, index) => (
                <div key={`resolved-${index}`} className="algo-resolution-card">
                  <strong>{formatRange([entry.start, entry.end])}</strong>
                  <span>
                    max = {entry.maxValue} @ #{entry.maxIndex}
                  </span>
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
            {copy.meta.range}: {formatRange(currentSnapshot?.activeRange ?? null)}
          </span>
          <span className="tree-workspace-transport-chip">
            {copy.meta.stack}: {currentSnapshot?.stack.length ?? 0}
          </span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {copy.meta.best}: {currentSnapshot?.currentBest?.maxValue ?? '-'}
          </span>
        </>
      }
    />
  );
}
