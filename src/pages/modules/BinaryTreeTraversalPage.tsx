import { useEffect, useMemo, useState } from 'react';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { VisualizationCanvas } from '../../components/VisualizationCanvas';
import { useCurrentModule } from '../../hooks/useCurrentModule';
import { useI18n } from '../../i18n/useI18n';
import {
  buildBinaryTreeTraversalTimelineFromInput,
} from '../../modules/tree/binaryTreeTraversalTimelineAdapter';
import type { HighlightType, PlaybackStatus } from '../../types/animation';
import type { BinaryTreeTraversalMode, BinaryTreeTraversalStep } from '../../modules/tree/binaryTreeTraversal';

const DEFAULT_SIZE = 7;
const MIN_SIZE = 3;
const MAX_SIZE = 15;

function createRandomDataset(size: number): number[] {
  const poolSize = Math.max(99, size);
  const values = Array.from({ length: poolSize }, (_, index) => index + 1);

  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }

  return values.slice(0, size);
}

function getStatusLabel(status: PlaybackStatus, t: ReturnType<typeof useI18n>['t']): string {
  switch (status) {
    case 'idle':
      return t('playback.status.idle');
    case 'playing':
      return t('playback.status.playing');
    case 'paused':
      return t('playback.status.paused');
    case 'completed':
      return t('playback.status.completed');
    default:
      return status;
  }
}

function getModeLabel(mode: BinaryTreeTraversalMode, t: ReturnType<typeof useI18n>['t']): string {
  if (mode === 'preorder') {
    return t('module.t01.mode.preorder');
  }
  if (mode === 'inorder') {
    return t('module.t01.mode.inorder');
  }
  if (mode === 'postorder') {
    return t('module.t01.mode.postorder');
  }
  return t('module.t01.mode.levelorder');
}

function getStepDescription(step: BinaryTreeTraversalStep | undefined, t: ReturnType<typeof useI18n>['t']): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'initial') {
    return t('module.t01.step.initial');
  }

  if (step.action === 'visit') {
    return `${t('module.t01.step.visit')} ${step.currentIndex} (${step.currentValue})`;
  }

  if (step.action === 'traversalDone') {
    return t('module.t01.step.done');
  }

  return t('module.t01.step.completed');
}

function getHighlightLabel(type: HighlightType, t: ReturnType<typeof useI18n>['t']): string {
  if (type === 'visiting') {
    return t('module.sr01.highlight.visited');
  }
  if (type === 'matched') {
    return t('module.sr01.highlight.found');
  }
  return t('module.s01.highlight.default');
}

function formatArrayPreview(values: number[], maxVisible = 24): string {
  if (values.length <= maxVisible) {
    return values.join(', ');
  }
  const leftCount = Math.floor(maxVisible / 2);
  const rightCount = maxVisible - leftCount;
  const leftPart = values.slice(0, leftCount).join(', ');
  const rightPart = values.slice(-rightCount).join(', ');
  return `${leftPart}, ..., ${rightPart} (n=${values.length})`;
}

export function BinaryTreeTraversalPage() {
  const { t } = useI18n();
  const currentModule = useCurrentModule();

  const [datasetSize, setDatasetSize] = useState(DEFAULT_SIZE);
  const [mode, setMode] = useState<BinaryTreeTraversalMode>('preorder');
  const [inputData, setInputData] = useState<number[]>(() => createRandomDataset(DEFAULT_SIZE));

  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } = useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildBinaryTreeTraversalTimelineFromInput(inputData, mode), [inputData, mode]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const treeState = currentSnapshot?.treeState ?? inputData;

  const nodePositions = useMemo(
    () =>
      treeState.map((_, index) => {
        const level = Math.floor(Math.log2(index + 1));
        const firstIndexOfLevel = 2 ** level - 1;
        const positionInLevel = index - firstIndexOfLevel;
        const nodesInLevel = 2 ** level;
        const x = ((positionInLevel + 1) / (nodesInLevel + 1)) * 100;
        const y = 14 + level * 24;
        return { x, y };
      }),
    [treeState],
  );

  const edges = useMemo(() => {
    const allEdges: Array<{ from: number; to: number }> = [];

    for (let index = 0; index < treeState.length; index += 1) {
      const leftChild = index * 2 + 1;
      const rightChild = index * 2 + 2;
      if (leftChild < treeState.length) {
        allEdges.push({ from: index, to: leftChild });
      }
      if (rightChild < treeState.length) {
        allEdges.push({ from: index, to: rightChild });
      }
    }

    return allEdges;
  }, [treeState.length]);

  const visitedSet = useMemo(() => new Set(currentSnapshot?.visitedIndices ?? []), [currentSnapshot?.visitedIndices]);
  const modeLabel = getModeLabel(mode, t);

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [setTotalFrames, reset, steps.length]);

  const regenerateData = () => {
    setInputData(createRandomDataset(datasetSize));
    reset();
  };

  const speedOptions = [
    { key: 'module.s01.speed.slow', value: 1200 },
    { key: 'module.s01.speed.normal', value: 700 },
    { key: 'module.s01.speed.fast', value: 350 },
  ] as const;

  const modeOptions: BinaryTreeTraversalMode[] = ['preorder', 'inorder', 'postorder', 'levelorder'];

  return (
    <section className="array-page tree-page">
      <h2>{t('module.t01.title')}</h2>
      <p>{t('module.t01.body')}</p>

      <div className="bubble-toolbar">
        <label htmlFor="dataset-size-t01" className="control-inline">
          <span>{t('module.s01.dataSize')}</span>
          <input
            id="dataset-size-t01"
            type="range"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={datasetSize}
            onChange={(event) => setDatasetSize(Number(event.target.value))}
          />
          <strong>{datasetSize}</strong>
        </label>
        <div className="speed-group">
          <button type="button" onClick={regenerateData}>
            {t('module.s01.regenerate')}
          </button>
        </div>
      </div>

      <div className="bubble-toolbar">
        <span>{t('module.t01.mode.label')}</span>
        <div className="speed-group">
          {modeOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={mode === option ? 'speed-active' : ''}
              onClick={() => {
                setMode(option);
                reset();
              }}
            >
              {getModeLabel(option, t)}
            </button>
          ))}
        </div>
      </div>

      <div className="bubble-toolbar">
        <span>{t('module.s01.speed')}</span>
        <div className="speed-group">
          {speedOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              className={speedMs === option.value ? 'speed-active' : ''}
              onClick={() => setSpeed(option.value)}
            >
              {t(option.key)}
            </button>
          ))}
        </div>
      </div>

      <div className="module-status-block">
        <p className="module-status-line">
          {t('module.s01.moduleLabel')}: {currentModule?.id ?? '-'} | {t('playback.step')}: {currentStep}/
          {Math.max(steps.length - 1, 0)} | {t('playback.status')}: {getStatusLabel(status, t)}
        </p>
        <p className="module-status-line">{getStepDescription(currentSnapshot, t)}</p>
        <p className="module-status-line">
          {t('module.t01.meta.mode')}: {modeLabel} | {t('module.t01.meta.currentNode')}:{' '}
          {currentSnapshot?.currentIndex ?? '-'} | {t('module.t01.meta.currentValue')}: {currentSnapshot?.currentValue ?? '-'}
        </p>
        <p className="module-status-line">
          {t('module.t01.meta.output')}: [{(currentSnapshot?.outputOrder ?? []).join(', ')}]
        </p>
      </div>

      <p className="array-preview">
        {t('module.s01.sample')}: [{formatArrayPreview(inputData)}]
      </p>

      <VisualizationCanvas title={t('module.t01.title')} subtitle={t('module.t01.stage')} stageClassName="viz-canvas-stage-tree">
        <div className="tree-stage" aria-label="binary-tree-stage">
          <svg className="tree-edge-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {edges.map((edge) => {
              const from = nodePositions[edge.from];
              const to = nodePositions[edge.to];
              return (
                <line
                  key={`${edge.from}-${edge.to}`}
                  className="tree-edge"
                  x1={from?.x ?? 0}
                  y1={from?.y ?? 0}
                  x2={to?.x ?? 0}
                  y2={to?.y ?? 0}
                />
              );
            })}
          </svg>

          <div className="tree-node-layer" aria-hidden="true">
            {treeState.map((value, index) => {
              const isCurrent = currentSnapshot?.action === 'visit' && currentSnapshot.currentIndex === index;
              const isVisited = visitedSet.has(index);
              const stateClass = isCurrent ? ' bar-visiting' : isVisited ? ' bar-matched' : '';

              return (
                <div
                  key={`${index}-${value}`}
                  className={`tree-node${stateClass}`}
                  style={{ left: `${nodePositions[index]?.x ?? 0}%`, top: `${nodePositions[index]?.y ?? 0}%` }}
                >
                  <span className="tree-node-value">{value}</span>
                  <span className="tree-node-index">#{index}</span>
                </div>
              );
            })}
          </div>
        </div>
      </VisualizationCanvas>

      <div className="legend-row">
        <span className="legend-item legend-visiting">{t('module.t01.legend.visiting')}</span>
        <span className="legend-item legend-matched">{t('module.t01.legend.visited')}</span>
        <span className="legend-item legend-default">{t('module.s01.legend.default')}</span>
      </div>

      <p>
        {t('module.s01.highlight')}:{' '}
        {(currentSnapshot?.highlights ?? []).map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`).join(' | ') || t('module.s01.none')}
      </p>

      <div className="playback-actions">
        <button type="button" onClick={play} disabled={status === 'playing' || steps.length === 0}>
          {t('playback.play')}
        </button>
        <button type="button" onClick={pause} disabled={status !== 'playing'}>
          {t('playback.pause')}
        </button>
        <button type="button" onClick={prev} disabled={steps.length === 0}>
          {t('playback.prev')}
        </button>
        <button type="button" onClick={next} disabled={steps.length === 0}>
          {t('playback.next')}
        </button>
        <button type="button" onClick={reset} disabled={steps.length === 0}>
          {t('playback.reset')}
        </button>
      </div>

      <div className="pseudocode-block">
        <h3>{t('module.s01.pseudocode')}</h3>
        <ol>
          <li className={currentSnapshot?.codeLines.includes(1) ? 'code-active' : ''}>{t('module.t01.code.line1')}</li>
          <li className={currentSnapshot?.codeLines.includes(2) ? 'code-active' : ''}>{t('module.t01.code.line2')}</li>
          <li className={currentSnapshot?.codeLines.includes(3) ? 'code-active' : ''}>{t('module.t01.code.line3')}</li>
          <li className={currentSnapshot?.codeLines.includes(4) ? 'code-active' : ''}>{t('module.t01.code.line4')}</li>
          <li className={currentSnapshot?.codeLines.includes(5) ? 'code-active' : ''}>{t('module.t01.code.line5')}</li>
          <li className={currentSnapshot?.codeLines.includes(6) ? 'code-active' : ''}>{t('module.t01.code.line6')}</li>
          <li className={currentSnapshot?.codeLines.includes(7) ? 'code-active' : ''}>{t('module.t01.code.line7')}</li>
          <li className={currentSnapshot?.codeLines.includes(8) ? 'code-active' : ''}>{t('module.t01.code.line8')}</li>
          <li className={currentSnapshot?.codeLines.includes(9) ? 'code-active' : ''}>{t('module.t01.code.line9')}</li>
        </ol>
      </div>
    </section>
  );
}
