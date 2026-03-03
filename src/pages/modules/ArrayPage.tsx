import { useEffect, useMemo, useState } from 'react';
import { useCurrentModule } from '../../hooks/useCurrentModule';
import { useI18n } from '../../i18n/useI18n';
import { generateArrayInsertSteps } from '../../modules/linear/arrayInsert';
import type { ArrayInsertStep } from '../../modules/linear/arrayInsert';
import { usePlaybackStore } from '../../store/playbackStore';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

type InsertConfig = {
  array: number[];
  index: number;
  value: number;
};

const DEFAULT_CONFIG: InsertConfig = {
  array: [3, 8, 1, 5],
  index: 2,
  value: 9,
};

function parseNumberArray(raw: string): number[] | null {
  const parts = raw
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  if (parts.length === 0) {
    return null;
  }

  const parsed = parts.map((item) => Number(item));
  if (parsed.some((value) => Number.isNaN(value))) {
    return null;
  }

  return parsed;
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

function getStepDescription(step: ArrayInsertStep | undefined, t: ReturnType<typeof useI18n>['t']): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'initial') {
    return t('module.l01.step.initial');
  }
  if (step.action === 'shift') {
    return `${t('module.l01.step.shift')} ${step.indices[0]} -> ${step.indices[1]}`;
  }
  if (step.action === 'insert') {
    return `${t('module.l01.step.insert')} ${step.indices[0]}`;
  }
  return t('module.l01.step.completed');
}

function getHighlightLabel(type: HighlightType, t: ReturnType<typeof useI18n>['t']): string {
  if (type === 'moving') {
    return t('module.l01.highlight.moving');
  }
  if (type === 'new-node') {
    return t('module.l01.highlight.inserted');
  }
  return t('module.s01.highlight.default');
}

export function ArrayPage() {
  const { t } = useI18n();
  const currentModule = useCurrentModule();

  const [arrayInput, setArrayInput] = useState(DEFAULT_CONFIG.array.join(', '));
  const [indexInput, setIndexInput] = useState(String(DEFAULT_CONFIG.index));
  const [valueInput, setValueInput] = useState(String(DEFAULT_CONFIG.value));
  const [error, setError] = useState('');
  const [speedMs, setSpeedMs] = useState(700);
  const [insertConfig, setInsertConfig] = useState<InsertConfig>(DEFAULT_CONFIG);

  const { status, currentStep, totalSteps, setTotalSteps, setStatus, play, pause, nextStep, prevStep, reset } =
    usePlaybackStore();

  const steps = useMemo(
    () => generateArrayInsertSteps(insertConfig.array, insertConfig.index, insertConfig.value),
    [insertConfig],
  );
  const currentSnapshot = steps[currentStep] ?? steps[0];

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
      if (state.currentStep >= state.totalSteps - 1) {
        state.setStatus('completed');
        window.clearInterval(timer);
        return;
      }
      state.nextStep();
    }, speedMs);

    return () => window.clearInterval(timer);
  }, [status, speedMs]);

  const highlightMap = useMemo(() => {
    const map = new Map<number, HighlightType>();
    (currentSnapshot?.highlights ?? []).forEach((item) => map.set(item.index, item.type));
    return map;
  }, [currentSnapshot]);

  const speedOptions = [
    { key: 'module.s01.speed.slow', value: 1200 },
    { key: 'module.s01.speed.normal', value: 700 },
    { key: 'module.s01.speed.fast', value: 350 },
  ] as const;

  const applyInsert = () => {
    const parsedArray = parseNumberArray(arrayInput);
    if (!parsedArray) {
      setError(t('module.l01.error.array'));
      return;
    }

    const parsedIndex = Number(indexInput);
    if (!Number.isInteger(parsedIndex) || parsedIndex < 0 || parsedIndex > parsedArray.length) {
      setError(t('module.l01.error.index'));
      return;
    }

    const parsedValue = Number(valueInput);
    if (Number.isNaN(parsedValue)) {
      setError(t('module.l01.error.value'));
      return;
    }

    setError('');
    setInsertConfig({
      array: parsedArray,
      index: parsedIndex,
      value: parsedValue,
    });
    setStatus('idle');
  };

  return (
    <section className="array-page">
      <h2>{t('module.l01.title')}</h2>
      <p>{t('module.l01.body')}</p>

      <div className="array-form">
        <label htmlFor="array-input">
          <span>{t('module.l01.input.array')}</span>
          <input
            id="array-input"
            value={arrayInput}
            onChange={(event) => setArrayInput(event.target.value)}
            placeholder="3, 8, 1, 5"
          />
        </label>
        <label htmlFor="insert-index">
          <span>{t('module.l01.input.index')}</span>
          <input
            id="insert-index"
            type="number"
            value={indexInput}
            onChange={(event) => setIndexInput(event.target.value)}
          />
        </label>
        <label htmlFor="insert-value">
          <span>{t('module.l01.input.value')}</span>
          <input
            id="insert-value"
            type="number"
            value={valueInput}
            onChange={(event) => setValueInput(event.target.value)}
          />
        </label>
        <button type="button" onClick={applyInsert}>
          {t('module.l01.apply')}
        </button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="bubble-toolbar">
        <span>{t('module.s01.speed')}</span>
        <div className="speed-group">
          {speedOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              className={speedMs === option.value ? 'speed-active' : ''}
              onClick={() => setSpeedMs(option.value)}
            >
              {t(option.key)}
            </button>
          ))}
        </div>
      </div>

      <p>
        {t('module.s01.moduleLabel')}: {currentModule?.id ?? '-'} | {t('playback.step')}: {currentStep + 1}/
        {totalSteps || 0} | {t('playback.status')}: {getStatusLabel(status, t)}
      </p>

      <p>{getStepDescription(currentSnapshot, t)}</p>
      <p className="array-preview">
        {t('module.l01.currentArray')}: [{(currentSnapshot?.arrayState ?? []).join(', ')}]
      </p>
      <p>
        {t('module.s01.highlight')}:{' '}
        {(currentSnapshot?.highlights ?? [])
          .map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`)
          .join(' | ') || t('module.s01.none')}
      </p>

      <div className="array-cells" aria-label="array-cells">
        {(currentSnapshot?.arrayState ?? []).map((value, index) => {
          const highlight = highlightMap.get(index) ?? 'default';
          return (
            <div key={`${index}-${value}`} className={`array-cell bar-${highlight}`}>
              <span className="array-cell-index">{index}</span>
              <strong>{value}</strong>
            </div>
          );
        })}
      </div>

      <div className="legend-row">
        <span className="legend-item legend-default">{t('module.s01.legend.default')}</span>
        <span className="legend-item legend-moving">{t('module.l01.highlight.moving')}</span>
        <span className="legend-item legend-inserted">{t('module.l01.highlight.inserted')}</span>
      </div>

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
        <h3>{t('module.l01.pseudocode')}</h3>
        <ol>
          <li className={currentSnapshot?.codeLines.includes(1) ? 'code-active' : ''}>{t('module.l01.code.line1')}</li>
          <li className={currentSnapshot?.codeLines.includes(2) ? 'code-active' : ''}>{t('module.l01.code.line2')}</li>
          <li className={currentSnapshot?.codeLines.includes(3) ? 'code-active' : ''}>{t('module.l01.code.line3')}</li>
          <li className={currentSnapshot?.codeLines.includes(4) ? 'code-active' : ''}>{t('module.l01.code.line4')}</li>
          <li className={currentSnapshot?.codeLines.includes(5) ? 'code-active' : ''}>{t('module.l01.code.line5')}</li>
        </ol>
      </div>
    </section>
  );
}
