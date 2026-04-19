import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import {
  getBucketSortPresetIds,
  type BucketSortAction,
  type BucketSortPhase,
  type BucketSortPresetId,
  type BucketSortStep,
} from '../../modules/sorting/bucketSort';
import { buildBucketSortTimelineFromPreset } from '../../modules/sorting/bucketTimelineAdapter';
import { DEFAULT_SPEED_OPTIONS, getPlaybackStatusLabel, getTimelineProgressWidth } from './modulePageHelpers';

const DEFAULT_PRESET: BucketSortPresetId = 'classic';

const PAGE_COPY = {
  en: {
    title: 'S-10 Bucket Sort',
    body: 'Bucket sort demo with range-based scattering, per-bucket local sorting, and ordered merge back to the output array.',
    stage: 'Bucket sort stage',
    preset: 'Preset',
    presets: {
      classic: 'Classic bucket sample',
      clustered: 'Clustered range sample',
    },
    phase: {
      scatter: 'Scatter to buckets',
      sort: 'Sort each bucket',
      merge: 'Merge buckets back',
      completed: 'Completed',
    } satisfies Record<BucketSortPhase, string>,
    step: {
      initial: 'Prepare empty buckets and an empty output array.',
      scatter: 'Place the current value into its range bucket.',
      sortBucket: 'Sort one bucket locally before merging.',
      mergeBack: 'Append the next bucket value into the output array.',
      completed: 'Bucket sort is complete.',
    } satisfies Record<BucketSortAction, string>,
    meta: {
      phase: 'Phase',
      bucket: 'Bucket',
      activeValue: 'Active value',
      merged: 'Merged items',
      range: 'Bucket range',
    },
    views: {
      input: 'Input values',
      inputHint: 'Values first scatter into coarse buckets by range.',
      buckets: 'Buckets',
      bucketsHint: 'Each bucket covers one numeric interval.',
      output: 'Merged output',
      outputHint: 'After local sorting, buckets are concatenated from low range to high range.',
    },
    codeTitle: 'Bucket sort pseudocode',
    code: [
      'create k buckets for numeric ranges',
      'scatter each value into its bucket by range',
      'sort each bucket locally',
      'concatenate buckets from left to right',
      'the merged output is sorted',
    ],
  },
  zh: {
    title: 'S-10 桶排序',
    body: '通过“按范围分桶 -> 桶内局部排序 -> 顺序回收”的过程展示桶排序。',
    stage: '桶排序画布',
    preset: '预设',
    presets: {
      classic: '经典桶排序样例',
      clustered: '聚簇范围样例',
    },
    phase: {
      scatter: '分配到桶',
      sort: '桶内排序',
      merge: '顺序回收',
      completed: '已完成',
    } satisfies Record<BucketSortPhase, string>,
    step: {
      initial: '准备空桶与空输出数组。',
      scatter: '把当前值放入对应范围桶中。',
      sortBucket: '对某一个桶做局部排序。',
      mergeBack: '把桶中的下一个值回收到输出数组。',
      completed: '桶排序完成。',
    } satisfies Record<BucketSortAction, string>,
    meta: {
      phase: '阶段',
      bucket: '桶',
      activeValue: '当前值',
      merged: '已回收元素',
      range: '桶范围',
    },
    views: {
      input: '输入值',
      inputHint: '元素会先按区间粗分到不同桶中。',
      buckets: '桶',
      bucketsHint: '每个桶覆盖一个固定的数值区间。',
      output: '回收输出',
      outputHint: '桶内排序后，会按从低到高的顺序依次拼接。',
    },
    codeTitle: '桶排序伪代码',
    code: [
      '按数值范围创建 k 个桶',
      '根据区间把每个元素分配到对应桶',
      '分别对每个桶做局部排序',
      '按桶序从左到右拼接',
      '拼接结果即为有序输出',
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

function getStepDescription(step: BucketSortStep | undefined, copy: PageCopy): string {
  if (!step) {
    return '-';
  }

  if (step.activeValue !== null && step.action !== 'initial' && step.action !== 'completed') {
    return `${copy.step[step.action]} (${step.activeValue})`;
  }
  return copy.step[step.action];
}

function getBucketRangeText(step: BucketSortStep | undefined, bucketIndex: number): string {
  if (!step) {
    return '-';
  }
  const start = bucketIndex * step.bucketSize;
  const end = start + step.bucketSize - 1;
  return `${start}~${end}`;
}

export function BucketSortPage() {
  const { t, language } = useI18n();
  const copy = PAGE_COPY[language];
  const [presetId, setPresetId] = useState<BucketSortPresetId>(DEFAULT_PRESET);
  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildBucketSortTimelineFromPreset(presetId), [presetId]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const presetOptions = useMemo(() => getBucketSortPresetIds(), []);
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  const focusPoint = useMemo(() => {
    if (!currentSnapshot || currentSnapshot.activeBucket === null || currentSnapshot.bucketCount === 0) {
      return null;
    }

    return {
      x: ((currentSnapshot.activeBucket + 0.5) / currentSnapshot.bucketCount) * 100,
      y: 54,
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
            {copy.meta.phase}: {copy.phase[currentSnapshot?.phase ?? 'scatter']}
          </span>
          <span className="tree-workspace-pill">
            {copy.meta.merged}: {currentSnapshot?.mergedCount ?? 0}/{currentSnapshot?.values.length ?? 0}
          </span>
          <span className="tree-workspace-pill">
            {copy.meta.bucket}: {currentSnapshot?.activeBucket ?? '-'}
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
              {copy.views.output}: [{currentSnapshot?.outputArray.join(', ') || '-'}]
            </p>
          </div>

          <dl className="tree-workspace-kv">
            <div>
              <dt>{t('playback.status')}</dt>
              <dd>{getPlaybackStatusLabel(status, t)}</dd>
            </div>
            <div>
              <dt>{copy.meta.phase}</dt>
              <dd>{copy.phase[currentSnapshot?.phase ?? 'scatter']}</dd>
            </div>
            <div>
              <dt>{copy.meta.bucket}</dt>
              <dd>{currentSnapshot?.activeBucket ?? '-'}</dd>
            </div>
            <div>
              <dt>{copy.meta.range}</dt>
              <dd>
                {currentSnapshot?.activeBucket !== null
                  ? getBucketRangeText(currentSnapshot, currentSnapshot.activeBucket)
                  : '-'}
              </dd>
            </div>
            <div>
              <dt>{copy.meta.activeValue}</dt>
              <dd>{currentSnapshot?.activeValue ?? '-'}</dd>
            </div>
            <div>
              <dt>{copy.meta.merged}</dt>
              <dd>
                {currentSnapshot?.mergedCount ?? 0}/{currentSnapshot?.values.length ?? 0}
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
              <strong>{copy.views.input}</strong>
              <span>{copy.views.inputHint}</span>
            </div>
            <div className="algo-array-grid">
              {currentSnapshot?.values.map((value, index) => (
                <span
                  key={`input-${index}`}
                  className={getAlgoCellClass({
                    active:
                      currentSnapshot.activeValue === value &&
                      currentSnapshot.action === 'scatter' &&
                      currentSnapshot.outputArray.length === 0,
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
                  <span className="algo-bucket-label">
                    #{bucketIndex} · {getBucketRangeText(currentSnapshot, bucketIndex)}
                  </span>
                  <div className="algo-chip-row">
                    {bucket.length > 0 ? (
                      bucket.map((value, valueIndex) => (
                        <span
                          key={`${bucketIndex}-${value}-${valueIndex}`}
                          className={getAlgoCellClass({
                            active:
                              currentSnapshot.activeBucket === bucketIndex &&
                              currentSnapshot.activeValue === value,
                            success: currentSnapshot.sortedBucketIndices.includes(bucketIndex),
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
                    active: currentSnapshot.activeOutputIndex === index,
                    success: index < (currentSnapshot.mergedCount ?? 0),
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
            {copy.meta.phase}: {copy.phase[currentSnapshot?.phase ?? 'scatter']}
          </span>
          <span className="tree-workspace-transport-chip">
            {copy.meta.merged}: {currentSnapshot?.mergedCount ?? 0}
          </span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {copy.meta.bucket}: {currentSnapshot?.activeBucket ?? '-'}
          </span>
        </>
      }
    />
  );
}
