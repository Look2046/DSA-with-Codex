import { useEffect, useMemo, useState } from 'react';
import { VisualizationCanvas } from '../../components/VisualizationCanvas';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useCurrentModule } from '../../hooks/useCurrentModule';
import { useI18n } from '../../i18n/useI18n';
import { buildShellSortTimelineFromInput } from '../../modules/sorting/shellTimelineAdapter';
import type { ShellSortStep } from '../../modules/sorting/shellSort';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

const DEFAULT_SIZE = 8;
const MIN_SIZE = 5;
const MAX_SIZE = 20;
const SHIFT_FOCUS_MIN_SPEED = 900;

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

function getStepDescription(step: ShellSortStep | undefined, t: ReturnType<typeof useI18n>['t']): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'initial') {
    return t('module.s04.step.initial');
  }

  if (step.action === 'gapChange') {
    return `${t('module.s04.step.gapChange')} ${step.gap}`;
  }

  if (step.action === 'selectCurrent') {
    return `${t('module.s04.step.selectCurrent')} ${step.indices[0]}`;
  }

  if (step.action === 'compare') {
    return `${t('module.s04.step.compare')} ${step.indices[0]} ${t('module.s01.step.and')} ${step.indices[1]}`;
  }

  if (step.action === 'shift') {
    return `${t('module.s04.step.shift')} ${step.indices[0]} -> ${step.indices[1]}`;
  }

  if (step.action === 'insert') {
    return `${t('module.s04.step.insert')} ${step.indices[0]}`;
  }

  return t('module.s04.step.completed');
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
  if (type === 'moving') {
    return t('module.s04.highlight.shifting');
  }
  if (type === 'new-node') {
    return t('module.s04.highlight.inserting');
  }
  return t('module.s01.highlight.default');
}

export function ShellSortPage() {
  const { t } = useI18n();
  const currentModule = useCurrentModule();

  const [datasetSize, setDatasetSize] = useState(DEFAULT_SIZE);
  const [inputData, setInputData] = useState<number[]>(() => createRandomDataset(DEFAULT_SIZE));
  const [manualSpeedMs, setManualSpeedMs] = useState(700);

  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } = useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildShellSortTimelineFromInput(inputData), [inputData]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const isShiftFocusStage =
    currentSnapshot?.holeIndex !== null && (currentSnapshot?.action === 'compare' || currentSnapshot?.action === 'shift');
  const shouldFocusShift = status === 'playing' && isShiftFocusStage;
  const targetSpeedMs = shouldFocusShift ? Math.max(manualSpeedMs, SHIFT_FOCUS_MIN_SPEED) : manualSpeedMs;
  const isAutoSlowActive = shouldFocusShift && targetSpeedMs !== manualSpeedMs;
  const holeIndex = currentSnapshot?.holeIndex ?? null;
  const shiftFrom = currentSnapshot?.action === 'shift' ? currentSnapshot.indices[0] : null;
  const shiftTo = currentSnapshot?.action === 'shift' ? currentSnapshot.indices[1] : null;

  const maxValue = useMemo(() => {
    const values = currentSnapshot?.arrayState ?? inputData;
    return Math.max(...values, 1);
  }, [currentSnapshot?.arrayState, inputData]);

  const highlightMap = useMemo(() => {
    const map = new Map<number, ShellSortStep['highlights'][number]['type']>();
    (currentSnapshot?.highlights ?? []).forEach((item) => map.set(item.index, item.type));
    return map;
  }, [currentSnapshot]);

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  useEffect(() => {
    if (speedMs !== targetSpeedMs) {
      setSpeed(targetSpeedMs);
    }
  }, [setSpeed, speedMs, targetSpeedMs]);

  const regenerateData = () => {
    setInputData(createRandomDataset(datasetSize));
    reset();
  };

  const speedOptions = [
    { key: 'module.s01.speed.slow', value: 1200 },
    { key: 'module.s01.speed.normal', value: 700 },
    { key: 'module.s01.speed.fast', value: 350 },
  ] as const;

  return (
    <section className="bubble-page">
      <h2>{t('module.s04.title')}</h2>
      <p>{t('module.s04.body')}</p>

      <div className="bubble-toolbar">
        <label htmlFor="dataset-size-s04" className="control-inline">
          <span>{t('module.s01.dataSize')}</span>
          <input
            id="dataset-size-s04"
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
              className={manualSpeedMs === option.value ? 'speed-active' : ''}
              onClick={() => {
                setManualSpeedMs(option.value);
                setSpeed(option.value);
              }}
            >
              {t(option.key)}
            </button>
          ))}
        </div>
      </div>

      <p>
        {t('module.s01.moduleLabel')}: {currentModule?.id ?? '-'} | {t('playback.step')}: {currentStep}/
        {Math.max(steps.length - 1, 0)} | {t('playback.status')}: {getStatusLabel(status, t)}
      </p>

      <p>
        {t('module.s01.sample')}: [{inputData.join(', ')}]
      </p>
      <p>{getStepDescription(currentSnapshot, t)}</p>
      <p>
        {t('module.s04.meta.gap')}: {currentSnapshot?.gap ?? '-'} | {t('module.s04.meta.heldValue')}:{' '}
        {currentSnapshot?.currentValue ?? '-'} | {t('module.s04.meta.hole')}: {holeIndex ?? '-'}
      </p>
      {shiftFrom !== null && shiftTo !== null ? (
        <p className="shell-shift-hint">
          {t('module.s04.meta.shiftPath')}: {shiftFrom}
          {' -> '}
          {shiftTo}
        </p>
      ) : null}
      {isAutoSlowActive ? <p className="shell-speed-hint">{t('module.s04.speed.autoSlow')}</p> : null}

      <VisualizationCanvas
        title={t('module.s04.title')}
        subtitle={t('module.canvas.sortingStage')}
        stageClassName="viz-canvas-stage-sorting"
      >
        <div className="array-bars" aria-label="array-visualizer-s04">
          {(currentSnapshot?.arrayState ?? []).map((value, index) => {
            const highlight = highlightMap.get(index) ?? 'default';
            const isHole = holeIndex === index;
            return (
              <div
                key={`${index}-${value}-${isHole ? 'hole' : 'filled'}`}
                className={isHole ? 'array-bar bar-hole' : `array-bar bar-${highlight}`}
                style={{ height: isHole ? '28%' : `${(value / maxValue) * 100}%` }}
              >
                <span>{isHole ? t('module.s04.hole.label') : value}</span>
              </div>
            );
          })}
        </div>
      </VisualizationCanvas>

      <div className="legend-row">
        <span className="legend-item legend-comparing">{t('module.s01.legend.comparing')}</span>
        <span className="legend-item legend-moving">{t('module.s04.legend.shifting')}</span>
        <span className="legend-item legend-inserted">{t('module.s04.legend.inserting')}</span>
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
          <li className={currentSnapshot?.codeLines.includes(1) ? 'code-active' : ''}>{t('module.s04.code.line1')}</li>
          <li className={currentSnapshot?.codeLines.includes(2) ? 'code-active' : ''}>{t('module.s04.code.line2')}</li>
          <li className={currentSnapshot?.codeLines.includes(3) ? 'code-active' : ''}>{t('module.s04.code.line3')}</li>
          <li className={currentSnapshot?.codeLines.includes(4) ? 'code-active' : ''}>{t('module.s04.code.line4')}</li>
          <li className={currentSnapshot?.codeLines.includes(5) ? 'code-active' : ''}>{t('module.s04.code.line5')}</li>
          <li className={currentSnapshot?.codeLines.includes(6) ? 'code-active' : ''}>{t('module.s04.code.line6')}</li>
          <li className={currentSnapshot?.codeLines.includes(7) ? 'code-active' : ''}>{t('module.s04.code.line7')}</li>
          <li className={currentSnapshot?.codeLines.includes(8) ? 'code-active' : ''}>{t('module.s04.code.line8')}</li>
          <li className={currentSnapshot?.codeLines.includes(9) ? 'code-active' : ''}>{t('module.s04.code.line9')}</li>
        </ol>
      </div>
    </section>
  );
}
