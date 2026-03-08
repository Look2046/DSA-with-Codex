import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { VisualizationCanvas } from '../../components/VisualizationCanvas';
import { useI18n } from '../../i18n/useI18n';
import { useCurrentModule } from '../../hooks/useCurrentModule';
import type { BubbleSortStep } from '../../modules/sorting/bubbleSort';
import { buildBubbleSortTimelineFromInput } from '../../modules/sorting/bubbleTimelineAdapter';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

const DEFAULT_SIZE = 10;
const MIN_SIZE = 5;
const MAX_SIZE = 20;

function createRandomDataset(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
}

function createAscendingDataset(size: number): number[] {
  const step = Math.max(1, Math.floor(80 / Math.max(size - 1, 1)));
  return Array.from({ length: size }, (_, index) => 10 + index * step);
}

function createDescendingDataset(size: number): number[] {
  return [...createAscendingDataset(size)].reverse();
}

function createNearlySortedDataset(size: number): number[] {
  const values = createAscendingDataset(size);
  const swapCount = Math.max(1, Math.floor(size / 5));

  for (let index = 0; index < swapCount; index += 1) {
    const leftIndex = Math.floor(Math.random() * (size - 1));
    const rightIndex = Math.min(size - 1, leftIndex + 1 + Math.floor(Math.random() * 2));
    [values[leftIndex], values[rightIndex]] = [values[rightIndex], values[leftIndex]];
  }

  return values;
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

function getStepDescription(step: BubbleSortStep | undefined, t: ReturnType<typeof useI18n>['t']): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'initial') {
    return t('module.s01.step.initial');
  }

  if (step.action === 'compare') {
    return `${t('module.s01.step.compare')} ${step.indices[0]} ${t('module.s01.step.and')} ${step.indices[1]}`;
  }

  if (step.action === 'swap') {
    return `${t('module.s01.step.swap')} ${step.indices[0]} ${t('module.s01.step.and')} ${step.indices[1]}`;
  }

  if (step.action === 'sortedMark') {
    return `${t('module.s01.step.sorted')} ${step.indices[0]}`;
  }

  return t('module.s01.step.completed');
}

function getHighlightLabel(type: HighlightType, t: ReturnType<typeof useI18n>['t']): string {
  if (type === 'comparing') {
    return t('module.s01.highlight.comparing');
  }
  if (type === 'swapping') {
    return t('module.s01.highlight.swapping');
  }
  if (type === 'sorted') {
    return t('module.s01.highlight.sorted');
  }
  return t('module.s01.highlight.default');
}

function buildBarOrderByFrame(steps: BubbleSortStep[]): number[][] {
  if (steps.length === 0) {
    return [];
  }

  const initialOrder = steps[0].arrayState.map((_, index) => index);
  const order = [...initialOrder];

  return steps.map((step) => {
    if (step.action === 'swap' && step.indices.length === 2) {
      const [leftIndex, rightIndex] = step.indices;
      if (order[leftIndex] !== undefined && order[rightIndex] !== undefined) {
        [order[leftIndex], order[rightIndex]] = [order[rightIndex], order[leftIndex]];
      }
    }

    return [...order];
  });
}

export function BubbleSortPage() {
  const { t } = useI18n();
  const currentModule = useCurrentModule();

  const [datasetSize, setDatasetSize] = useState(DEFAULT_SIZE);
  const [inputData, setInputData] = useState<number[]>(() => createRandomDataset(DEFAULT_SIZE));

  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } = useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildBubbleSortTimelineFromInput(inputData), [inputData]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const initialValues = useMemo(() => steps[0]?.arrayState ?? [], [steps]);
  const barIds = useMemo(() => initialValues.map((_, index) => index), [initialValues]);
  const barOrdersByFrame = useMemo(() => buildBarOrderByFrame(steps), [steps]);
  const currentBarOrder = useMemo(
    () => barOrdersByFrame[currentStep] ?? barOrdersByFrame[0] ?? [],
    [barOrdersByFrame, currentStep]
  );

  const barPositionMap = useMemo(() => {
    const positions = new Map<number, number>();
    currentBarOrder.forEach((barId, position) => positions.set(barId, position));
    return positions;
  }, [currentBarOrder]);

  const maxValue = useMemo(() => {
    return Math.max(...initialValues, 1);
  }, [initialValues]);

  const highlightMap = useMemo(() => {
    const map = new Map<number, BubbleSortStep['highlights'][number]['type']>();
    (currentSnapshot?.highlights ?? []).forEach((item) => map.set(item.index, item.type));
    return map;
  }, [currentSnapshot]);
  const isFinaleFrame = currentSnapshot?.action === 'completed';

  const sortedIndexSet = useMemo(() => {
    const sorted = new Set<number>();
    for (let frameIndex = 0; frameIndex <= currentStep && frameIndex < steps.length; frameIndex += 1) {
      const step = steps[frameIndex];
      if (!step) {
        continue;
      }
      if (step.action === 'sortedMark' && step.indices.length > 0) {
        sorted.add(step.indices[0]);
      }
      if (step.action === 'completed') {
        step.arrayState.forEach((_, index) => sorted.add(index));
      }
    }
    return sorted;
  }, [steps, currentStep]);

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [setTotalFrames, reset, steps.length]);

  const regenerateData = (generator: (size: number) => number[]) => {
    setInputData(generator(datasetSize));
    reset();
  };

  const speedOptions = [
    { key: 'module.s01.speed.slow', value: 1200 },
    { key: 'module.s01.speed.normal', value: 700 },
    { key: 'module.s01.speed.fast', value: 350 },
    { key: 'module.s01.speed.faster', value: 175 },
    { key: 'module.s01.speed.fastest', value: 88 },
  ] as const;

  return (
    <section className="bubble-page">
      <h2>{t('module.s01.title')}</h2>
      <p>{t('module.s01.body')}</p>

      <div className="bubble-toolbar">
        <label htmlFor="dataset-size" className="control-inline">
          <span>{t('module.s01.dataSize')}</span>
          <input
            id="dataset-size"
            type="range"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={datasetSize}
            onChange={(event) => setDatasetSize(Number(event.target.value))}
          />
          <strong>{datasetSize}</strong>
        </label>
        <div className="speed-group">
          <button type="button" onClick={() => regenerateData(createRandomDataset)}>
            {t('module.s01.generate.random')}
          </button>
          <button type="button" onClick={() => regenerateData(createNearlySortedDataset)}>
            {t('module.s01.generate.nearlySorted')}
          </button>
          <button type="button" onClick={() => regenerateData(createAscendingDataset)}>
            {t('module.s01.generate.ascending')}
          </button>
          <button type="button" onClick={() => regenerateData(createDescendingDataset)}>
            {t('module.s01.generate.descending')}
          </button>
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

      <p>
        {t('module.s01.moduleLabel')}: {currentModule?.id ?? '-'} | {t('playback.step')}: {currentStep}/
        {Math.max(steps.length - 1, 0)} |{' '}
        {t('playback.status')}: {getStatusLabel(status, t)}
      </p>

      <p>
        {t('module.s01.sample')}: [{inputData.join(', ')}]
      </p>
      <p>{getStepDescription(currentSnapshot, t)}</p>

      <VisualizationCanvas
        title={t('module.s01.title')}
        subtitle={t('module.canvas.sortingStage')}
        stageClassName="viz-canvas-stage-sorting"
      >
        <div className="array-bars bubble-array-bars" aria-label="array-visualizer" style={{ '--bubble-count': Math.max(barIds.length, 1) } as CSSProperties}>
          {barIds.map((barId) => {
            const position = barPositionMap.get(barId) ?? barId;
            const frameHighlight = highlightMap.get(position);
            const highlight = frameHighlight ?? (sortedIndexSet.has(position) ? 'sorted' : 'default');
            const value = initialValues[barId] ?? 0;
            const barStyle = {
              height: `${(value / maxValue) * 100}%`,
              '--bubble-offset': position - barId,
              '--bubble-z': highlight === 'swapping' ? 3 : highlight === 'comparing' ? 2 : 1,
              '--piano-order': position,
            } as CSSProperties;
            return (
              <div
                key={barId}
                className={`array-bar bubble-sort-bar bar-${highlight}${isFinaleFrame ? ' bar-finale' : ''}`}
                style={barStyle}
              >
                <span>{value}</span>
              </div>
            );
          })}
        </div>
      </VisualizationCanvas>

      <div className="legend-row">
        <span className="legend-item legend-comparing">{t('module.s01.legend.comparing')}</span>
        <span className="legend-item legend-swapping">{t('module.s01.legend.swapping')}</span>
        <span className="legend-item legend-sorted">{t('module.s01.legend.sorted')}</span>
        <span className="legend-item legend-default">{t('module.s01.legend.default')}</span>
      </div>

      <p className="array-preview">
        {t('module.s01.currentArray')}: [{(currentSnapshot?.arrayState ?? []).join(', ')}]
      </p>
      <p>
        {t('module.s01.highlight')}:{' '}
        {(currentSnapshot?.highlights ?? [])
          .map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`)
          .join(' | ') || t('module.s01.none')}
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
          <li className={currentSnapshot?.codeLines.includes(1) ? 'code-active' : ''}>{t('module.s01.code.line1')}</li>
          <li className={currentSnapshot?.codeLines.includes(2) ? 'code-active' : ''}>{t('module.s01.code.line2')}</li>
          <li className={currentSnapshot?.codeLines.includes(3) ? 'code-active' : ''}>{t('module.s01.code.line3')}</li>
          <li className={currentSnapshot?.codeLines.includes(4) ? 'code-active' : ''}>{t('module.s01.code.line4')}</li>
          <li className={currentSnapshot?.codeLines.includes(5) ? 'code-active' : ''}>{t('module.s01.code.line5')}</li>
          <li className={currentSnapshot?.codeLines.includes(7) ? 'code-active' : ''}>{t('module.s01.code.line7')}</li>
          <li className={currentSnapshot?.codeLines.includes(8) ? 'code-active' : ''}>{t('module.s01.code.line8')}</li>
        </ol>
      </div>
    </section>
  );
}
