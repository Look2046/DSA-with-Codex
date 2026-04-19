import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import {
  getGreedyPresetIds,
  type GreedyAction,
  type GreedyPresetId,
  type GreedyStep,
} from '../../modules/paradigm/greedy';
import { buildGreedyTimelineFromPreset } from '../../modules/paradigm/greedyTimelineAdapter';
import { DEFAULT_SPEED_OPTIONS, getPlaybackStatusLabel, getTimelineProgressWidth } from './modulePageHelpers';

const DEFAULT_PRESET: GreedyPresetId = 'classic';

const PAGE_COPY = {
  en: {
    title: 'P-03 Greedy',
    body: 'Use activity selection to show how a greedy rule chooses the next locally optimal interval by earliest finish time.',
    stage: 'Greedy stage',
    preset: 'Preset',
    presets: {
      classic: 'Classic activity set',
      compact: 'Compact interval set',
    },
    step: {
      initial: 'Load the unsorted activities.',
      sort: 'Sort activities by finishing time.',
      inspect: 'Inspect the next earliest-finishing activity.',
      select: 'Select the activity because it does not overlap the current schedule.',
      skip: 'Skip the activity because it overlaps a chosen one.',
      completed: 'The greedy schedule is complete.',
    } satisfies Record<GreedyAction, string>,
    meta: {
      lastEnd: 'Current finish boundary',
      selected: 'Selected activities',
      inspected: 'Inspected count',
    },
    views: {
      sorted: 'Sorted activities',
      sortedHint: 'The greedy rule always looks at the earliest finishing activity next.',
      selected: 'Chosen schedule',
      selectedHint: 'Only non-overlapping activities survive into the final schedule.',
      inspected: 'Inspection trail',
      inspectedHint: 'This shows how the algorithm commits or skips each interval in order.',
    },
    laneState: {
      picked: 'picked',
      seen: 'seen',
      queued: 'queued',
    },
    codeTitle: 'Greedy pseudocode',
    code: [
      'sort activities by finishing time',
      'inspect the next earliest-finishing interval',
      'if it starts after the current finish boundary: select it',
      'otherwise skip it',
      'repeat until all intervals are processed',
      'the selected set is the greedy schedule',
    ],
  },
  zh: {
    title: 'P-03 贪心',
    body: '用活动选择问题展示贪心策略如何依据“最早结束时间”做出局部最优选择。',
    stage: '贪心画布',
    preset: '预设',
    presets: {
      classic: '经典活动集合',
      compact: '紧凑区间集合',
    },
    step: {
      initial: '加载尚未排序的活动。',
      sort: '按结束时间对活动排序。',
      inspect: '检查下一个最早结束的活动。',
      select: '该活动与当前安排不冲突，因此选择它。',
      skip: '该活动与已选活动冲突，因此跳过。',
      completed: '贪心安排完成。',
    } satisfies Record<GreedyAction, string>,
    meta: {
      lastEnd: '当前结束边界',
      selected: '已选活动',
      inspected: '已检查数量',
    },
    views: {
      sorted: '排序后活动',
      sortedHint: '贪心规则总是优先看最早结束的活动。',
      selected: '最终安排',
      selectedHint: '只有不重叠的活动会被保留下来。',
      inspected: '检查轨迹',
      inspectedHint: '这里展示算法按顺序对每个区间做出“选/跳过”的决定。',
    },
    laneState: {
      picked: '已选',
      seen: '已看',
      queued: '待检',
    },
    codeTitle: '贪心伪代码',
    code: [
      '按结束时间排序活动',
      '检查下一个最早结束的区间',
      '若开始时间不早于当前结束边界：选择它',
      '否则跳过它',
      '直到所有区间都处理完',
      '被选择的集合就是贪心安排',
    ],
  },
} as const;

type PageCopy = (typeof PAGE_COPY)[keyof typeof PAGE_COPY];

function getStepDescription(step: GreedyStep | undefined, copy: PageCopy): string {
  if (!step) {
    return '-';
  }
  return copy.step[step.action];
}

export function GreedyPage() {
  const { t, language } = useI18n();
  const copy = PAGE_COPY[language];
  const [presetId, setPresetId] = useState<GreedyPresetId>(DEFAULT_PRESET);
  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildGreedyTimelineFromPreset(presetId), [presetId]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const presetOptions = useMemo(() => getGreedyPresetIds(), []);
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  const focusPoint = useMemo(() => {
    if (currentSnapshot?.activeIndex === null || (currentSnapshot?.sortedActivities.length ?? 0) === 0) {
      return null;
    }
    return {
      x: ((currentSnapshot.activeIndex + 0.5) / Math.max(currentSnapshot.sortedActivities.length, 1)) * 100,
      y: 28,
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
            {copy.meta.lastEnd}: {Number.isFinite(currentSnapshot?.lastEnd ?? Number.NaN) ? currentSnapshot?.lastEnd : '-'}
          </span>
          <span className="tree-workspace-pill">
            {copy.meta.selected}: {(currentSnapshot?.selectedIds ?? []).join(', ') || '-'}
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
              {copy.meta.selected}: {(currentSnapshot?.selectedIds ?? []).join(', ') || '-'}
            </p>
          </div>

          <dl className="tree-workspace-kv">
            <div>
              <dt>{t('playback.status')}</dt>
              <dd>{getPlaybackStatusLabel(status, t)}</dd>
            </div>
            <div>
              <dt>{copy.meta.lastEnd}</dt>
              <dd>{Number.isFinite(currentSnapshot?.lastEnd ?? Number.NaN) ? currentSnapshot?.lastEnd : '-'}</dd>
            </div>
            <div>
              <dt>{copy.meta.selected}</dt>
              <dd>{(currentSnapshot?.selectedIds ?? []).join(', ') || '-'}</dd>
            </div>
            <div>
              <dt>{copy.meta.inspected}</dt>
              <dd>{currentSnapshot?.inspectedIds.length ?? 0}</dd>
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
              <strong>{copy.views.sorted}</strong>
              <span>{copy.views.sortedHint}</span>
            </div>
            <div className="algo-interval-grid">
              {currentSnapshot?.sortedActivities.map((activity, index) => {
                const selected = currentSnapshot.selectedIds.includes(activity.id);
                const inspected = currentSnapshot.inspectedIds.includes(activity.id);
                const active = currentSnapshot.activeIndex === index;
                return (
                  <div
                    key={activity.id}
                    className={`algo-interval-card${selected ? ' algo-interval-card-selected' : ''}${
                      active ? ' algo-interval-card-active' : ''
                    }`}
                  >
                    <strong>{activity.id}</strong>
                    <span className="algo-interval-time">
                      [{activity.start}, {activity.end}]
                    </span>
                    <span className="algo-interval-note">
                      {selected
                        ? copy.laneState.picked
                        : inspected
                          ? copy.laneState.seen
                          : copy.laneState.queued}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="string-stage-card">
            <div className="string-stage-head">
              <strong>{copy.views.selected}</strong>
              <span>{copy.views.selectedHint}</span>
            </div>
            <div className="algo-chip-row">
              {(currentSnapshot?.selectedIds ?? []).length > 0 ? (
                currentSnapshot?.selectedIds.map((activityId) => (
                  <span key={`selected-${activityId}`} className="algo-chip algo-chip-success">
                    {activityId}
                  </span>
                ))
              ) : (
                <span className="algo-empty-copy">-</span>
              )}
            </div>
          </section>

          <section className="string-stage-card">
            <div className="string-stage-head">
              <strong>{copy.views.inspected}</strong>
              <span>{copy.views.inspectedHint}</span>
            </div>
            <div className="algo-chip-row">
              {(currentSnapshot?.inspectedIds ?? []).length > 0 ? (
                currentSnapshot?.inspectedIds.map((activityId) => (
                  <span key={`inspected-${activityId}`} className="algo-chip">
                    {activityId}
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
            {copy.meta.lastEnd}: {Number.isFinite(currentSnapshot?.lastEnd ?? Number.NaN) ? currentSnapshot?.lastEnd : '-'}
          </span>
          <span className="tree-workspace-transport-chip">
            {copy.meta.inspected}: {currentSnapshot?.inspectedIds.length ?? 0}
          </span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {copy.meta.selected}: {(currentSnapshot?.selectedIds ?? []).join(', ') || '-'}
          </span>
        </>
      }
    />
  );
}
