import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import {
  getRadixSortPresetIds,
  type RadixSortAction,
  type RadixSortPresetId,
  type RadixSortStep,
} from '../../modules/sorting/radixSort';
import { buildRadixSortTimelineFromPreset } from '../../modules/sorting/radixTimelineAdapter';
import { DEFAULT_SPEED_OPTIONS, getPlaybackStatusLabel, getTimelineProgressWidth } from './modulePageHelpers';

const DEFAULT_PRESET: RadixSortPresetId = 'classic';

const PAGE_COPY = {
  en: {
    title: 'S-09 Radix Sort',
    body: 'Radix sort demo with LSD digit passes, bucket distribution, and per-pass collection back into the main array.',
    stage: 'Radix sort stage',
    preset: 'Preset',
    presets: {
      classic: 'Classic LSD sample',
      clustered: '3-digit clustered sample',
    },
    step: {
      initial: 'Prepare the array and empty digit buckets.',
      distribute: 'Read the current digit and push the value into that bucket.',
      collect: 'Collect bucket values back in digit order.',
      passComplete: 'One digit pass is finished; the array becomes the collected order.',
      completed: 'Radix sort is complete.',
    } satisfies Record<RadixSortAction, string>,
    meta: {
      place: 'Digit place',
      pass: 'Pass',
      activeValue: 'Active value',
      bucket: 'Bucket',
      collected: 'Collected items',
    },
    views: {
      array: 'Current array',
      arrayHint: 'Each pass reorders the array by one digit place.',
      buckets: 'Digit buckets',
      bucketsHint: 'Values with the same active digit wait in the same bucket.',
      output: 'Collected array',
      outputHint: 'Buckets are concatenated from 0 to 9 after each pass.',
    },
    codeTitle: 'Radix sort pseudocode',
    code: [
      'repeat for each digit place from LSD to MSD',
      'distribute every value into bucket[digit(value, place)]',
      'collect buckets from 0 to 9 back into the array',
      'move to the next digit place',
      'when the highest place is processed, the array is sorted',
    ],
  },
  zh: {
    title: 'S-09 基数排序',
    body: '通过“最低位优先分配桶 -> 按桶顺序回收”的多轮过程展示基数排序。',
    stage: '基数排序画布',
    preset: '预设',
    presets: {
      classic: '经典 LSD 样例',
      clustered: '三位数聚簇样例',
    },
    step: {
      initial: '准备数组与空的数字桶。',
      distribute: '读取当前位数字，并把元素放入对应桶中。',
      collect: '按 0 到 9 的顺序把桶内元素收回主数组。',
      passComplete: '当前位排序结束，主数组更新为本轮回收结果。',
      completed: '基数排序完成。',
    } satisfies Record<RadixSortAction, string>,
    meta: {
      place: '当前位',
      pass: '轮次',
      activeValue: '当前值',
      bucket: '桶',
      collected: '已回收元素',
    },
    views: {
      array: '当前数组',
      arrayHint: '每一轮都会按当前位重新排列数组。',
      buckets: '数字桶',
      bucketsHint: '当前位相同的元素会暂存在同一个桶里。',
      output: '回收数组',
      outputHint: '每轮结束时会按 0 到 9 的顺序拼接桶内容。',
    },
    codeTitle: '基数排序伪代码',
    code: [
      '从最低位开始，逐位重复处理',
      '把每个元素放入 bucket[digit(value, place)]',
      '按 0~9 的顺序回收所有桶到数组',
      '切换到更高一位',
      '最高位处理完成后，数组有序',
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

function getStepDescription(step: RadixSortStep | undefined, copy: PageCopy): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'distribute' && step.activeValue !== null && step.activeBucket !== null) {
    return `${copy.step.distribute} (${step.activeValue} -> ${step.activeBucket})`;
  }
  if (step.action === 'collect' && step.activeValue !== null) {
    return `${copy.step.collect} (${step.activeValue})`;
  }
  return copy.step[step.action];
}

export function RadixSortPage() {
  const { t, language } = useI18n();
  const copy = PAGE_COPY[language];
  const [presetId, setPresetId] = useState<RadixSortPresetId>(DEFAULT_PRESET);
  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildRadixSortTimelineFromPreset(presetId), [presetId]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const presetOptions = useMemo(() => getRadixSortPresetIds(), []);
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  const focusPoint = useMemo(() => {
    if (!currentSnapshot || currentSnapshot.activeInputIndex === null || currentSnapshot.arrayState.length === 0) {
      return null;
    }

    return {
      x: ((currentSnapshot.activeInputIndex + 0.5) / currentSnapshot.arrayState.length) * 100,
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
            {copy.meta.pass}: {currentSnapshot?.passIndex ?? 1}/{currentSnapshot?.maxDigits ?? 1}
          </span>
          <span className="tree-workspace-pill">
            {copy.meta.place}: {currentSnapshot?.place ?? 1}
          </span>
          <span className="tree-workspace-pill">
            {copy.meta.collected}: {currentSnapshot?.collectedCount ?? 0}/{currentSnapshot?.arrayState.length ?? 0}
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
            <code>{currentSnapshot?.arrayState.join(', ') ?? ''}</code>
          </div>
        </>
      }
      stepContent={
        <>
          <div className="tree-workspace-step-copy">
            <h3>{getStepDescription(currentSnapshot, copy)}</h3>
            <p>
              {copy.views.output}: [{currentSnapshot?.outputArray.join(', ') || '-'}]
            </p>
          </div>

          <dl className="tree-workspace-kv">
            <div>
              <dt>{t('playback.status')}</dt>
              <dd>{getPlaybackStatusLabel(status, t)}</dd>
            </div>
            <div>
              <dt>{copy.meta.pass}</dt>
              <dd>
                {currentSnapshot?.passIndex ?? 1}/{currentSnapshot?.maxDigits ?? 1}
              </dd>
            </div>
            <div>
              <dt>{copy.meta.place}</dt>
              <dd>{currentSnapshot?.place ?? 1}</dd>
            </div>
            <div>
              <dt>{copy.meta.activeValue}</dt>
              <dd>{currentSnapshot?.activeValue ?? '-'}</dd>
            </div>
            <div>
              <dt>{copy.meta.bucket}</dt>
              <dd>{currentSnapshot?.activeBucket ?? '-'}</dd>
            </div>
            <div>
              <dt>{copy.meta.collected}</dt>
              <dd>
                {currentSnapshot?.collectedCount ?? 0}/{currentSnapshot?.arrayState.length ?? 0}
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
              <strong>{copy.views.array}</strong>
              <span>{copy.views.arrayHint}</span>
            </div>
            <div className="algo-array-grid">
              {currentSnapshot?.arrayState.map((value, index) => (
                <span
                  key={`array-${index}`}
                  className={getAlgoCellClass({
                    active: currentSnapshot.activeInputIndex === index,
                  })}
                >
                  {value}
                </span>
              ))}
            </div>
          </section>

          <section className="string-stage-card">
            <div className="string-stage-head">
              <strong>{copy.views.buckets}</strong>
              <span>{copy.views.bucketsHint}</span>
            </div>
            <div className="algo-bucket-grid">
              {currentSnapshot?.buckets.map((bucket, bucketIndex) => (
                <div key={`bucket-${bucketIndex}`} className="algo-bucket-card">
                  <span className="algo-bucket-label">{bucketIndex}</span>
                  <div className="algo-chip-row">
                    {bucket.length > 0 ? (
                      bucket.map((value, valueIndex) => (
                        <span
                          key={`${bucketIndex}-${value}-${valueIndex}`}
                          className={getAlgoCellClass({
                            active:
                              currentSnapshot.activeBucket === bucketIndex &&
                              currentSnapshot.activeValue === value,
                          })}
                        >
                          {value}
                        </span>
                      ))
                    ) : (
                      <span className="algo-empty-copy">·</span>
                    )}
                  </div>
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
                    success: index < (currentSnapshot.collectedCount ?? 0),
                  })}
                >
                  {value}
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
            {copy.meta.pass}: {currentSnapshot?.passIndex ?? 1}
          </span>
          <span className="tree-workspace-transport-chip">
            {copy.meta.place}: {currentSnapshot?.place ?? 1}
          </span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {copy.meta.bucket}: {currentSnapshot?.activeBucket ?? '-'}
          </span>
        </>
      }
    />
  );
}
