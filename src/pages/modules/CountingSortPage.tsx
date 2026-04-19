import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import {
  getCountingSortPresetIds,
  type CountingSortAction,
  type CountingSortPhase,
  type CountingSortPresetId,
  type CountingSortStep,
} from '../../modules/sorting/countingSort';
import { buildCountingSortTimelineFromPreset } from '../../modules/sorting/countingTimelineAdapter';
import {
  DEFAULT_SPEED_OPTIONS,
  formatOptionalNumberArray,
  getPlaybackStatusLabel,
  getTimelineProgressWidth,
} from './modulePageHelpers';

const DEFAULT_PRESET: CountingSortPresetId = 'classic';

const PAGE_COPY = {
  en: {
    title: 'S-08 Counting Sort',
    body: 'Counting sort demo with frequency counting, prefix accumulation, and stable placement into the output array.',
    stage: 'Counting sort stage',
    preset: 'Preset',
    presets: {
      classic: 'Classic duplicates',
      dense: 'Dense 0~5 range',
    },
    phase: {
      count: 'Count frequencies',
      prefix: 'Accumulate prefix sums',
      place: 'Place values stably',
      completed: 'Completed',
    } satisfies Record<CountingSortPhase, string>,
    step: {
      initial: 'Load the input array and create empty count/output arrays.',
      count: 'Count the current value into its frequency slot.',
      accumulate: 'Convert frequencies into prefix positions.',
      place: 'Place the current value into the correct output index from right to left.',
      completed: 'Counting sort is complete.',
    } satisfies Record<CountingSortAction, string>,
    meta: {
      phase: 'Phase',
      activeValue: 'Active value',
      processed: 'Counted items',
      placed: 'Placed items',
      output: 'Current output',
      range: 'Range',
    },
    views: {
      input: 'Input array',
      inputHint: 'The source array stays fixed while counts and output change.',
      count: 'Count array',
      countHint: 'Each slot tracks how many numbers map to that key value.',
      output: 'Output array',
      outputHint: 'Stable placement walks the input from right to left.',
    },
    codeTitle: 'Counting sort pseudocode',
    code: [
      'initialize count[range] and output[n]',
      'for each value: count[value - min] += 1',
      'for i in [1..range-1]: count[i] += count[i - 1]',
      'scan input from right to left and place each value into output[count[key]-1]',
      'output is now sorted',
    ],
  },
  zh: {
    title: 'S-08 计数排序',
    body: '通过“统计频次 -> 前缀累加 -> 稳定回填输出数组”的顺序展示计数排序。',
    stage: '计数排序画布',
    preset: '预设',
    presets: {
      classic: '经典重复值样例',
      dense: '0~5 密集范围',
    },
    phase: {
      count: '统计频次',
      prefix: '前缀累加',
      place: '稳定回填',
      completed: '已完成',
    } satisfies Record<CountingSortPhase, string>,
    step: {
      initial: '加载输入数组，并创建空的 count/output 数组。',
      count: '把当前值累计到对应的频次数组槽位。',
      accumulate: '把频次转换成前缀位置。',
      place: '从右向左稳定地把当前值放入输出数组。',
      completed: '计数排序完成。',
    } satisfies Record<CountingSortAction, string>,
    meta: {
      phase: '阶段',
      activeValue: '当前值',
      processed: '已统计元素',
      placed: '已放置元素',
      output: '当前输出',
      range: '值域',
    },
    views: {
      input: '输入数组',
      inputHint: '源数组保持不变，count 与 output 会持续更新。',
      count: '计数数组',
      countHint: '每个槽位记录对应键值出现了多少次。',
      output: '输出数组',
      outputHint: '稳定回填时会从右向左扫描输入数组。',
    },
    codeTitle: '计数排序伪代码',
    code: [
      '初始化 count[range] 与 output[n]',
      '遍历输入：count[value - min] += 1',
      '遍历 count：count[i] += count[i - 1]',
      '从右向左扫描输入，把元素放到 output[count[key]-1]',
      '输出数组即为有序结果',
    ],
  },
} as const;

type PageCopy = (typeof PAGE_COPY)[keyof typeof PAGE_COPY];

function getAlgoCellClass({
  active = false,
  success = false,
  muted = false,
}: {
  active?: boolean;
  success?: boolean;
  muted?: boolean;
}): string {
  const classes = ['algo-cell'];
  if (active) {
    classes.push('algo-cell-active');
  }
  if (success) {
    classes.push('algo-cell-success');
  }
  if (muted) {
    classes.push('algo-cell-muted');
  }
  return classes.join(' ');
}

function getStepDescription(step: CountingSortStep | undefined, copy: PageCopy): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'count' && step.activeValue !== null) {
    return `${copy.step.count} (${step.activeValue})`;
  }
  if (step.action === 'accumulate' && step.activeValue !== null) {
    return `${copy.step.accumulate} (${step.activeValue})`;
  }
  if (step.action === 'place' && step.activeValue !== null && step.activeOutputIndex !== null) {
    return `${copy.step.place} (${step.activeValue} -> #${step.activeOutputIndex})`;
  }
  return copy.step[step.action];
}

export function CountingSortPage() {
  const { t, language } = useI18n();
  const copy = PAGE_COPY[language];
  const [presetId, setPresetId] = useState<CountingSortPresetId>(DEFAULT_PRESET);
  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildCountingSortTimelineFromPreset(presetId), [presetId]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const presetOptions = useMemo(() => getCountingSortPresetIds(), []);
  const codeLines = copy.code;
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  const focusPoint = useMemo(() => {
    if (!currentSnapshot || currentSnapshot.activeInputIndex === null || currentSnapshot.values.length === 0) {
      return null;
    }

    return {
      x: ((currentSnapshot.activeInputIndex + 0.5) / currentSnapshot.values.length) * 100,
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
            {copy.meta.phase}: {copy.phase[currentSnapshot?.phase ?? 'count']}
          </span>
          <span className="tree-workspace-pill">
            {copy.meta.processed}: {currentSnapshot?.processedInputCount ?? 0}/{currentSnapshot?.values.length ?? 0}
          </span>
          <span className="tree-workspace-pill">
            {copy.meta.placed}: {currentSnapshot?.placedCount ?? 0}/{currentSnapshot?.values.length ?? 0}
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
            <span>{copy.views.input}</span>
            <code>{currentSnapshot?.values.join(', ') ?? ''}</code>
          </div>
        </>
      }
      stepContent={
        <>
          <div className="tree-workspace-step-copy">
            <h3>{getStepDescription(currentSnapshot, copy)}</h3>
            <p>
              {copy.meta.output}: [{formatOptionalNumberArray(currentSnapshot?.outputArray ?? [])}]
            </p>
          </div>

          <dl className="tree-workspace-kv">
            <div>
              <dt>{t('playback.status')}</dt>
              <dd>{getPlaybackStatusLabel(status, t)}</dd>
            </div>
            <div>
              <dt>{copy.meta.phase}</dt>
              <dd>{copy.phase[currentSnapshot?.phase ?? 'count']}</dd>
            </div>
            <div>
              <dt>{copy.meta.range}</dt>
              <dd>
                {currentSnapshot?.rangeValues[0] ?? '-'} ~{' '}
                {currentSnapshot?.rangeValues.at(-1) ?? '-'}
              </dd>
            </div>
            <div>
              <dt>{copy.meta.activeValue}</dt>
              <dd>{currentSnapshot?.activeValue ?? '-'}</dd>
            </div>
            <div>
              <dt>{copy.meta.processed}</dt>
              <dd>
                {currentSnapshot?.processedInputCount ?? 0}/{currentSnapshot?.values.length ?? 0}
              </dd>
            </div>
            <div>
              <dt>{copy.meta.placed}</dt>
              <dd>
                {currentSnapshot?.placedCount ?? 0}/{currentSnapshot?.values.length ?? 0}
              </dd>
            </div>
            <div>
              <dt>{copy.meta.output}</dt>
              <dd>[{formatOptionalNumberArray(currentSnapshot?.outputArray ?? [])}]</dd>
            </div>
          </dl>

          <div className="tree-workspace-code-block">
            <span className="tree-workspace-code-title">{copy.codeTitle}</span>
            <ol className="tree-workspace-code-list">
              {codeLines.map((line, index) => {
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
              <strong>{copy.views.input}</strong>
              <span>{copy.views.inputHint}</span>
            </div>
            <div className="algo-array-grid">
              {currentSnapshot?.values.map((value, index) => (
                <span
                  key={`input-${index}`}
                  className={getAlgoCellClass({
                    active: currentSnapshot.activeInputIndex === index,
                    success:
                      currentSnapshot.action === 'place' &&
                      currentSnapshot.activeValue === value &&
                      currentSnapshot.activeInputIndex === index,
                  })}
                >
                  {value}
                </span>
              ))}
            </div>
          </section>

          <section className="string-stage-card">
            <div className="string-stage-head">
              <strong>{copy.views.count}</strong>
              <span>{copy.views.countHint}</span>
            </div>
            <div className="algo-mini-table">
              {currentSnapshot?.rangeValues.map((value, index) => (
                <div key={`key-${value}`} className="algo-mini-table-column">
                  <span className="algo-mini-table-label">{value}</span>
                  <span
                    className={getAlgoCellClass({
                      active: currentSnapshot.activeCountIndex === index,
                      success:
                        currentSnapshot.phase === 'place' &&
                        (currentSnapshot.countArray[index] ?? 0) >= 0,
                    })}
                  >
                    {currentSnapshot.countArray[index]}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="string-stage-card">
            <div className="string-stage-head">
              <strong>{copy.views.output}</strong>
              <span>{copy.views.outputHint}</span>
            </div>
            <div className="algo-array-grid">
              {currentSnapshot?.outputArray.map((value, index) => (
                <span
                  key={`output-${index}`}
                  className={getAlgoCellClass({
                    active: currentSnapshot.activeOutputIndex === index,
                    success: value !== null,
                    muted: value === null,
                  })}
                >
                  {value ?? '·'}
                </span>
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
            {copy.meta.phase}: {copy.phase[currentSnapshot?.phase ?? 'count']}
          </span>
          <span className="tree-workspace-transport-chip">
            {copy.meta.placed}: {currentSnapshot?.placedCount ?? 0}
          </span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {copy.meta.activeValue}: {currentSnapshot?.activeValue ?? '-'}
          </span>
        </>
      }
    />
  );
}
