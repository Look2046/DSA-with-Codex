import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import {
  getUnionFindPresetIds,
  type UnionFindAction,
  type UnionFindOperation,
  type UnionFindPresetId,
  type UnionFindStep,
} from '../../modules/paradigm/unionFind';
import { buildUnionFindTimelineFromPreset } from '../../modules/paradigm/unionFindTimelineAdapter';
import { DEFAULT_SPEED_OPTIONS, getPlaybackStatusLabel, getTimelineProgressWidth } from './modulePageHelpers';

const DEFAULT_PRESET: UnionFindPresetId = 'classic';

const PAGE_COPY = {
  en: {
    title: 'P-05 Union-Find',
    body: 'Use union-find to show component merging, root search, and path compression on a mutable parent array.',
    stage: 'Union-find stage',
    preset: 'Preset',
    presets: {
      classic: 'Classic merge chain',
      split: 'Split component sample',
    },
    step: {
      initial: 'Prepare singleton sets.',
      operationStart: 'Start the next union/find operation.',
      findPath: 'Climb parent pointers to reach the root.',
      compressPath: 'Rewrite the traversed node to point directly at the root.',
      linkRoots: 'Link two roots and merge their components.',
      completed: 'All union-find operations are complete.',
    } satisfies Record<UnionFindAction, string>,
    meta: {
      operation: 'Operation',
      active: 'Active nodes',
      path: 'Path',
      components: 'Components',
    },
    views: {
      operations: 'Operations',
      operationsHint: 'The highlighted operation is currently being executed.',
      parent: 'Parent / rank arrays',
      parentHint: 'Path compression updates the parent row in place.',
      components: 'Components',
      componentsHint: 'Each card groups nodes that currently share the same root.',
    },
    codeTitle: 'Union-find pseudocode',
    code: [
      'for the next operation, locate roots with find',
      'follow parent pointers until the root is reached',
      'compress the traversed path back to the root',
      'if this is union and roots differ: link them by rank',
      'repeat until all operations finish',
    ],
  },
  zh: {
    title: 'P-05 并查集',
    body: '用并查集展示集合合并、根节点查找，以及路径压缩如何直接修改 parent 数组。',
    stage: '并查集画布',
    preset: '预设',
    presets: {
      classic: '经典合并链',
      split: '分离集合样例',
    },
    step: {
      initial: '准备若干单元素集合。',
      operationStart: '开始执行下一条 union/find 操作。',
      findPath: '沿着 parent 指针向上找到根节点。',
      compressPath: '把路径上的节点直接改指向根节点。',
      linkRoots: '连接两个根节点并合并集合。',
      completed: '所有并查集操作执行完毕。',
    } satisfies Record<UnionFindAction, string>,
    meta: {
      operation: '操作',
      active: '当前节点',
      path: '路径',
      components: '连通分量',
    },
    views: {
      operations: '操作序列',
      operationsHint: '高亮项表示当前正在执行的操作。',
      parent: 'parent / rank 数组',
      parentHint: '路径压缩会直接更新 parent 行。',
      components: '当前集合',
      componentsHint: '每张卡片表示一组共享同一根节点的元素。',
    },
    codeTitle: '并查集伪代码',
    code: [
      '对下一条操作先执行 find',
      '沿着 parent 指针向上找到根',
      '把经过的路径压缩到根上',
      '若是 union 且根不同：按 rank 连接',
      '直到所有操作都处理完',
    ],
  },
} as const;

type PageCopy = (typeof PAGE_COPY)[keyof typeof PAGE_COPY];

function formatOperation(operation: UnionFindOperation | undefined): string {
  if (!operation) {
    return '-';
  }
  if (operation.type === 'union') {
    return `union(${operation.a}, ${operation.b})`;
  }
  return `find(${operation.a})`;
}

function getStepDescription(step: UnionFindStep | undefined, copy: PageCopy): string {
  if (!step) {
    return '-';
  }
  return copy.step[step.action];
}

export function UnionFindPage() {
  const { t, language } = useI18n();
  const copy = PAGE_COPY[language];
  const [presetId, setPresetId] = useState<UnionFindPresetId>(DEFAULT_PRESET);
  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildUnionFindTimelineFromPreset(presetId), [presetId]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const presetOptions = useMemo(() => getUnionFindPresetIds(), []);
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;
  const currentOperation = currentSnapshot?.operations[currentSnapshot.operationIndex];

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  const focusPoint = useMemo(() => {
    if ((currentSnapshot?.activeNodes.length ?? 0) === 0 || (currentSnapshot?.size ?? 0) === 0) {
      return null;
    }
    const center =
      currentSnapshot?.activeNodes.reduce((sum, value) => sum + value, 0) /
      Math.max(currentSnapshot?.activeNodes.length ?? 1, 1);
    return {
      x: ((center + 0.5) / Math.max(currentSnapshot?.size ?? 1, 1)) * 100,
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
            {copy.meta.operation}: {formatOperation(currentOperation)}
          </span>
          <span className="tree-workspace-pill">
            {copy.meta.active}: {currentSnapshot?.activeNodes.join(', ') || '-'}
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
              {copy.meta.path}: {currentSnapshot?.path.join(' -> ') || '-'}
            </p>
          </div>

          <dl className="tree-workspace-kv">
            <div>
              <dt>{t('playback.status')}</dt>
              <dd>{getPlaybackStatusLabel(status, t)}</dd>
            </div>
            <div>
              <dt>{copy.meta.operation}</dt>
              <dd>{formatOperation(currentOperation)}</dd>
            </div>
            <div>
              <dt>{copy.meta.active}</dt>
              <dd>{currentSnapshot?.activeNodes.join(', ') || '-'}</dd>
            </div>
            <div>
              <dt>{copy.meta.path}</dt>
              <dd>{currentSnapshot?.path.join(' -> ') || '-'}</dd>
            </div>
            <div>
              <dt>{copy.meta.components}</dt>
              <dd>{currentSnapshot?.components.length ?? 0}</dd>
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
              <strong>{copy.views.operations}</strong>
              <span>{copy.views.operationsHint}</span>
            </div>
            <div className="algo-chip-row">
              {(currentSnapshot?.operations ?? []).map((operation, index) => (
                <span
                  key={`operation-${index}`}
                  className={`algo-chip${currentSnapshot?.operationIndex === index ? ' algo-chip-success' : ''}`}
                >
                  {formatOperation(operation)}
                </span>
              ))}
            </div>
          </section>

          <section className="string-stage-card">
            <div className="string-stage-head">
              <strong>{copy.views.parent}</strong>
              <span>{copy.views.parentHint}</span>
            </div>
            <div className="algo-parent-grid">
              <div className="algo-parent-row">
                <span className="algo-parent-label">parent</span>
                {currentSnapshot?.parents.map((value, index) => (
                  <span
                    key={`parent-${index}`}
                    className={`algo-cell${currentSnapshot.activeNodes.includes(index) ? ' algo-cell-active' : ''}`}
                  >
                    {value}
                  </span>
                ))}
              </div>
              <div className="algo-parent-row">
                <span className="algo-parent-label">rank</span>
                {currentSnapshot?.ranks.map((value, index) => (
                  <span key={`rank-${index}`} className="algo-cell">
                    {value}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="string-stage-card">
            <div className="string-stage-head">
              <strong>{copy.views.components}</strong>
              <span>{copy.views.componentsHint}</span>
            </div>
            <div className="algo-component-grid">
              {(currentSnapshot?.components ?? []).map((component, index) => (
                <div key={`component-${index}`} className="algo-component-card">
                  <strong>#{index + 1}</strong>
                  <span>{component.join(', ')}</span>
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
            {copy.meta.operation}: {formatOperation(currentOperation)}
          </span>
          <span className="tree-workspace-transport-chip">
            {copy.meta.path}: {currentSnapshot?.path.join(' -> ') || '-'}
          </span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {copy.meta.components}: {currentSnapshot?.components.length ?? 0}
          </span>
        </>
      }
    />
  );
}
