import { useEffect, useMemo, useState } from 'react';
import { advancePlaybackTick } from '../../engine/timeline/tick';
import { VisualizationCanvas } from '../../components/VisualizationCanvas';
import { useI18n } from '../../i18n/useI18n';
import { useCurrentModule } from '../../hooks/useCurrentModule';
import type { BubbleSortStep } from '../../modules/sorting/bubbleSort';
import { buildBubbleSortTimelineFromInput } from '../../modules/sorting/bubbleTimelineAdapter';
import { usePlaybackStore } from '../../store/playbackStore';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

const DEFAULT_SIZE = 8;
const MIN_SIZE = 5;
const MAX_SIZE = 20;

function createRandomDataset(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
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

export function BubbleSortPage() {
  const { t } = useI18n();
  const currentModule = useCurrentModule();

  const [datasetSize, setDatasetSize] = useState(DEFAULT_SIZE);
  const [inputData, setInputData] = useState<number[]>(() => createRandomDataset(DEFAULT_SIZE));

  const { status, speedMs, currentStep, totalSteps, setTotalSteps, setStatus, setSpeed, play, pause, nextStep, prevStep, reset } =
    usePlaybackStore();

  const timelineFrames = useMemo(() => buildBubbleSortTimelineFromInput(inputData), [inputData]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentSnapshot = steps[currentStep] ?? steps[0];

  const maxValue = useMemo(() => {
    const values = currentSnapshot?.arrayState ?? inputData;
    return Math.max(...values, 1);
  }, [currentSnapshot?.arrayState, inputData]);

  const highlightMap = useMemo(() => {
    const map = new Map<number, BubbleSortStep['highlights'][number]['type']>();
    (currentSnapshot?.highlights ?? []).forEach((item) => map.set(item.index, item.type));
    return map;
  }, [currentSnapshot]);

  useEffect(() => {
    setTotalSteps(steps.length);
    reset();
  }, [setTotalSteps, reset, steps.length]);

  useEffect(() => {
    if (status !== 'playing') {
      return;
    }

    const timer = window.setInterval(() => {
      const state = usePlaybackStore.getState();
      const result = advancePlaybackTick({
        currentStep: state.currentStep,
        totalSteps: state.totalSteps,
        setStatus: state.setStatus,
        nextStep: state.nextStep,
      });
      if (result === 'completed') {
        window.clearInterval(timer);
      }
    }, speedMs);

    return () => window.clearInterval(timer);
  }, [status, speedMs]);

  const regenerateData = () => {
    setInputData(createRandomDataset(datasetSize));
    setStatus('idle');
  };

  const speedOptions = [
    { key: 'module.s01.speed.slow', value: 1200 },
    { key: 'module.s01.speed.normal', value: 700 },
    { key: 'module.s01.speed.fast', value: 350 },
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
        <button type="button" onClick={regenerateData}>
          {t('module.s01.regenerate')}
        </button>
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
        {t('module.s01.moduleLabel')}: {currentModule?.id ?? '-'} | {t('playback.step')}: {currentStep + 1}/
        {totalSteps || 0} |{' '}
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
        <div className="array-bars" aria-label="array-visualizer">
          {(currentSnapshot?.arrayState ?? []).map((value, index) => {
            const highlight = highlightMap.get(index) ?? 'default';
            return (
              <div key={`${index}-${value}`} className={`array-bar bar-${highlight}`} style={{ height: `${(value / maxValue) * 100}%` }}>
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
        <button type="button" onClick={play} disabled={status === 'playing'}>
          {t('playback.play')}
        </button>
        <button type="button" onClick={pause} disabled={status !== 'playing'}>
          {t('playback.pause')}
        </button>
        <button type="button" onClick={prevStep}>
          {t('playback.prev')}
        </button>
        <button type="button" onClick={nextStep}>
          {t('playback.next')}
        </button>
        <button type="button" onClick={reset}>
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
