import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import {
  getSortingRacePresetIds,
  type SortingRaceAlgorithmId,
  type SortingRaceLane,
  type SortingRacePresetId,
  type SortingRaceStep,
} from '../../modules/sorting/sortingRace';
import { buildSortingRaceTimelineFromPreset } from '../../modules/sorting/sortingRaceTimelineAdapter';
import { DEFAULT_SPEED_OPTIONS, getPlaybackStatusLabel, getTimelineProgressWidth } from './modulePageHelpers';

const DEFAULT_PRESET: SortingRacePresetId = 'classic';

const PAGE_COPY = {
  en: {
    title: 'S-11 Sorting Race',
    body: 'Sorting race demo that replays several algorithms on the same dataset and compares progress by algorithm-step count.',
    stage: 'Sorting race stage',
    preset: 'Preset',
    presets: {
      classic: 'Classic mixed sample',
      nearlySorted: 'Nearly sorted sample',
    },
    action: {
      initial: 'Load the shared dataset for every algorithm lane.',
      tick: 'Advance every algorithm by one local step and compare race positions.',
      completed: 'The race is finished; compare who reached the end earlier.',
    },
    meta: {
      tick: 'Race tick',
      leader: 'Leader',
      dataset: 'Dataset',
      finish: 'Finish frame',
      progress: 'Progress',
    },
    views: {
      leaderboard: 'Leaderboard',
      leaderboardHint: 'This race treats one local algorithm frame as one race step.',
      lanes: 'Algorithm lanes',
      lanesHint: 'Each lane replays the same dataset with its own local step generator.',
    },
    laneLabels: {
      bubble: 'Bubble',
      selection: 'Selection',
      insertion: 'Insertion',
      quick: 'Quick',
    } satisfies Record<SortingRaceAlgorithmId, string>,
    codeTitle: 'Sorting race pseudocode',
    code: [
      'prepare the same dataset for each algorithm lane',
      'on every race tick, advance each lane by one local frame if possible',
      'rank lanes by progress ratio, then by finish frame',
      'the smallest finish frame wins after all lanes complete',
    ],
  },
  zh: {
    title: 'S-11 排序竞速',
    body: '在同一组数据上回放多种排序算法，并按“算法局部步骤数”比较谁更快完成。',
    stage: '排序竞速画布',
    preset: '预设',
    presets: {
      classic: '经典混合样例',
      nearlySorted: '近乎有序样例',
    },
    action: {
      initial: '为每条算法赛道加载同一组数据。',
      tick: '让每条赛道前进一步，并比较当前排名。',
      completed: '竞速结束，可以比较谁更早冲线。',
    },
    meta: {
      tick: '竞速步',
      leader: '领先者',
      dataset: '数据集',
      finish: '冲线帧',
      progress: '进度',
    },
    views: {
      leaderboard: '排行榜',
      leaderboardHint: '本模块把“算法内部一帧”视作“竞速中的一步”。',
      lanes: '算法赛道',
      lanesHint: '每条赛道都在同一数据集上运行自己的局部步骤生成器。',
    },
    laneLabels: {
      bubble: '冒泡',
      selection: '选择',
      insertion: '插入',
      quick: '快速',
    } satisfies Record<SortingRaceAlgorithmId, string>,
    codeTitle: '排序竞速伪代码',
    code: [
      '给每种算法准备同一组输入数据',
      '每个竞速步都让每条赛道尽量前进一步',
      '按进度比例排序，进度相同时比较冲线帧',
      '所有赛道结束后，冲线更早者获胜',
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

function formatLaneProgress(lane: SortingRaceLane): string {
  return `${Math.round(lane.progress * 100)}%`;
}

function getStepDescription(step: SortingRaceStep | undefined, copy: PageCopy): string {
  if (!step) {
    return '-';
  }
  return copy.action[step.action];
}

export function SortingRacePage() {
  const { t, language } = useI18n();
  const copy = PAGE_COPY[language];
  const [presetId, setPresetId] = useState<SortingRacePresetId>(DEFAULT_PRESET);
  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildSortingRaceTimelineFromPreset(presetId), [presetId]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const presetOptions = useMemo(() => getSortingRacePresetIds(), []);
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
            {copy.meta.tick}: {currentSnapshot?.tick ?? 0}/{currentSnapshot?.totalTicks ?? 0}
          </span>
          <span className="tree-workspace-pill">
            {copy.meta.leader}:{' '}
            {(currentSnapshot?.leaderIds ?? [])
              .map((laneId) => copy.laneLabels[laneId])
              .join(', ') || '-'}
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
            <span>{copy.meta.dataset}</span>
            <code>{currentSnapshot?.dataset.join(', ') ?? ''}</code>
          </div>
        </>
      }
      stepContent={
        <>
          <div className="tree-workspace-step-copy">
            <h3>{getStepDescription(currentSnapshot, copy)}</h3>
            <p>
              {copy.meta.leader}:{' '}
              {(currentSnapshot?.leaderIds ?? []).map((laneId) => copy.laneLabels[laneId]).join(', ') || '-'}
            </p>
          </div>

          <dl className="tree-workspace-kv">
            <div>
              <dt>{t('playback.status')}</dt>
              <dd>{getPlaybackStatusLabel(status, t)}</dd>
            </div>
            <div>
              <dt>{copy.meta.tick}</dt>
              <dd>
                {currentSnapshot?.tick ?? 0}/{currentSnapshot?.totalTicks ?? 0}
              </dd>
            </div>
            <div>
              <dt>{copy.meta.dataset}</dt>
              <dd>{currentSnapshot?.dataset.join(', ') ?? '-'}</dd>
            </div>
            <div>
              <dt>{copy.meta.leader}</dt>
              <dd>
                {(currentSnapshot?.leaderIds ?? []).map((laneId) => copy.laneLabels[laneId]).join(', ') || '-'}
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
        <div className="algo-stage-scene algo-stage-scene-wide">
          <section className="string-stage-card">
            <div className="string-stage-head">
              <strong>{copy.views.leaderboard}</strong>
              <span>{copy.views.leaderboardHint}</span>
            </div>
            <div className="algo-ranking-list">
              {(currentSnapshot?.ranking ?? []).map((laneId, index) => {
                const lane = currentSnapshot?.lanes.find((item) => item.id === laneId);
                return (
                  <div key={`ranking-${laneId}`} className="algo-ranking-row">
                    <span className="algo-ranking-index">#{index + 1}</span>
                    <span className="algo-ranking-name">{copy.laneLabels[laneId]}</span>
                    <span className="algo-ranking-meta">
                      {copy.meta.progress}: {lane ? formatLaneProgress(lane) : '-'}
                    </span>
                    <span className="algo-ranking-meta">
                      {copy.meta.finish}: {lane?.finishFrame ?? '-'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="string-stage-card">
            <div className="string-stage-head">
              <strong>{copy.views.lanes}</strong>
              <span>{copy.views.lanesHint}</span>
            </div>
            <div className="algo-lane-grid">
              {currentSnapshot?.lanes.map((lane) => (
                <div key={lane.id} className="algo-lane-card">
                  <div className="algo-lane-card-head">
                    <strong>{copy.laneLabels[lane.id]}</strong>
                    <span>{copy.meta.progress}: {formatLaneProgress(lane)}</span>
                  </div>
                  <div className="algo-chip-row">
                    <span className="algo-chip">
                      {copy.meta.finish}: {lane.finishFrame}
                    </span>
                    <span className="algo-chip">
                      {currentStep >= lane.finishFrame ? t('playback.status.completed') : getPlaybackStatusLabel(status, t)}
                    </span>
                  </div>
                  <div className="algo-array-grid algo-array-grid-compact">
                    {lane.arrayState.map((value, index) => (
                      <span
                        key={`${lane.id}-${index}`}
                        className={getAlgoCellClass({
                          success: lane.completed,
                          active: currentSnapshot.leaderIds.includes(lane.id) && index === 0,
                          muted: lane.arrayState.length === 0,
                        })}
                      >
                        {value}
                      </span>
                    ))}
                  </div>
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
            {copy.meta.tick}: {currentSnapshot?.tick ?? 0}
          </span>
          <span className="tree-workspace-transport-chip">
            {copy.meta.leader}:{' '}
            {(currentSnapshot?.leaderIds ?? []).map((laneId) => copy.laneLabels[laneId]).join(', ') || '-'}
          </span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {copy.meta.dataset}: {currentSnapshot?.dataset.length ?? 0}
          </span>
        </>
      }
    />
  );
}
