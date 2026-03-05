import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { VisualizationCanvas } from '../../components/VisualizationCanvas';
import { useCurrentModule } from '../../hooks/useCurrentModule';
import { useI18n } from '../../i18n/useI18n';
import { buildStackTimelineFromInput } from '../../modules/linear/stackTimelineAdapter';
import {
  getHighlightLabel,
  getStatusLabel,
  getStepDescription,
  resolveStackConfig,
  resolveStackConfigFromJson,
  serializeStackConfigAsJson,
  type StackConfig,
} from './stackPageUtils';
import type { HighlightType } from '../../types/animation';

const DEFAULT_CONFIG: StackConfig = {
  stack: [3, 8, 1],
  operation: { type: 'push', value: 9 },
};

export function StackPage() {
  const { t } = useI18n();
  const currentModule = useCurrentModule();

  const [stackInput, setStackInput] = useState(DEFAULT_CONFIG.stack.join(', '));
  const [operationType, setOperationType] = useState<StackConfig['operation']['type']>(DEFAULT_CONFIG.operation.type);
  const [valueInput, setValueInput] = useState(String(DEFAULT_CONFIG.operation.type === 'push' ? DEFAULT_CONFIG.operation.value : ''));
  const [error, setError] = useState('');
  const [hasValidConfig, setHasValidConfig] = useState(true);
  const [stackConfig, setStackConfig] = useState<StackConfig>(DEFAULT_CONFIG);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonFeedback, setJsonFeedback] = useState('');
  const [hasJsonError, setHasJsonError] = useState(false);

  const { status, speedMs, currentFrame, setSpeed, setTotalFrames, play, pause, next, prev, reset } = useTimelinePlayer(0);
  const currentStep = currentFrame;

  const recomputeInputState = useCallback(
    (nextStackInput: string, nextOperationType: StackConfig['operation']['type'], nextValueInput: string) => {
      const resolved = resolveStackConfig(nextStackInput, nextOperationType, nextValueInput, t);
      setError(resolved.error);
      setHasValidConfig(resolved.config !== null);
      if (resolved.config) {
        setStackConfig(resolved.config);
      }
    },
    [t],
  );

  const timelineFrames = useMemo(
    () => buildStackTimelineFromInput(stackConfig.stack, stackConfig.operation),
    [stackConfig],
  );
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const completedStackText = useMemo(() => {
    const last = steps[steps.length - 1];
    return (last?.stackState ?? []).join(', ');
  }, [steps]);

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [setTotalFrames, reset, steps.length]);

  const syncInputToCompletedStack = useCallback(() => {
    if (!hasValidConfig || steps.length === 0) {
      return;
    }
    if (operationType === 'peek') {
      return;
    }
    if (stackInput === completedStackText) {
      return;
    }

    reset();
    setStackInput(completedStackText);
    recomputeInputState(completedStackText, operationType, valueInput);
  }, [completedStackText, hasValidConfig, operationType, recomputeInputState, reset, stackInput, steps.length, valueInput]);

  useEffect(() => {
    if (!hasValidConfig || steps.length === 0) {
      return;
    }

    if (operationType === 'peek') {
      return;
    }

    if (currentSnapshot?.action !== 'push' && currentSnapshot?.action !== 'pop' && currentSnapshot?.action !== 'completed') {
      return;
    }

    if (stackInput === completedStackText) {
      return;
    }

    const timer = window.setTimeout(() => {
      syncInputToCompletedStack();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [completedStackText, currentSnapshot?.action, hasValidConfig, operationType, stackInput, steps.length, syncInputToCompletedStack]);

  const handleExportJson = useCallback(() => {
    setJsonInput(serializeStackConfigAsJson(stackConfig));
    setHasJsonError(false);
    setJsonFeedback(t('module.l04.json.exported'));
  }, [stackConfig, t]);

  const handleImportJson = useCallback(() => {
    const resolved = resolveStackConfigFromJson(jsonInput, t);
    if (!resolved.config) {
      setHasJsonError(true);
      setJsonFeedback(resolved.error);
      return;
    }

    const nextStackInput = resolved.config.stack.join(', ');
    const nextOperationType = resolved.config.operation.type;
    const nextValueInput = resolved.config.operation.type === 'push' ? String(resolved.config.operation.value) : '';

    reset();
    setStackInput(nextStackInput);
    setOperationType(nextOperationType);
    setValueInput(nextValueInput);
    recomputeInputState(nextStackInput, nextOperationType, nextValueInput);
    setHasJsonError(false);
    setJsonFeedback(t('module.l04.json.imported'));
  }, [jsonInput, recomputeInputState, reset, t]);

  const handleNextStep = useCallback(() => {
    const willComplete = currentStep >= steps.length - 2;
    next();
    if (willComplete) {
      syncInputToCompletedStack();
    }
  }, [currentStep, next, steps.length, syncInputToCompletedStack]);

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

  return (
    <section className="array-page">
      <h2>{t('module.l04.title')}</h2>
      <p>{t('module.l04.body')}</p>

      <div className="array-form">
        <label htmlFor="stack-input">
          <span>{t('module.l04.input.stack')}</span>
          <input
            id="stack-input"
            value={stackInput}
            onChange={(event) => {
              const next = event.target.value;
              reset();
              setStackInput(next);
              recomputeInputState(next, operationType, valueInput);
            }}
            placeholder="3, 8, 1"
          />
        </label>
        <label htmlFor="stack-operation">
          <span>{t('module.l04.input.operation')}</span>
          <select
            id="stack-operation"
            value={operationType}
            onChange={(event) => {
              const next = event.target.value as StackConfig['operation']['type'];
              reset();
              setOperationType(next);
              const normalized = next === 'push' ? valueInput : '';
              if (next !== 'push') {
                setValueInput('');
              }
              recomputeInputState(stackInput, next, normalized);
            }}
          >
            <option value="push">{t('module.l04.operation.push')}</option>
            <option value="pop">{t('module.l04.operation.pop')}</option>
            <option value="peek">{t('module.l04.operation.peek')}</option>
          </select>
        </label>
        {operationType === 'push' ? (
          <label htmlFor="stack-value">
            <span>{t('module.l04.input.value')}</span>
            <input
              id="stack-value"
              type="number"
              value={valueInput}
              onChange={(event) => {
                const next = event.target.value;
                reset();
                setValueInput(next);
                recomputeInputState(stackInput, operationType, next);
              }}
            />
          </label>
        ) : null}
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="array-form">
        <label htmlFor="stack-json-input">
          <span>{t('module.l04.json.label')}</span>
          <textarea
            id="stack-json-input"
            value={jsonInput}
            onChange={(event) => setJsonInput(event.target.value)}
            rows={6}
            placeholder={t('module.l04.json.placeholder')}
          />
        </label>
      </div>
      <div className="playback-actions">
        <button type="button" onClick={handleExportJson}>
          {t('module.l04.json.export')}
        </button>
        <button type="button" onClick={handleImportJson}>
          {t('module.l04.json.import')}
        </button>
      </div>
      {jsonFeedback ? <p className={hasJsonError ? 'form-error' : 'array-preview'}>{jsonFeedback}</p> : null}

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
        {Math.max(steps.length - 1, 0)} | {t('playback.status')}: {getStatusLabel(status, t)}
      </p>

      <p>{getStepDescription(currentSnapshot, t)}</p>
      <p className="array-preview">
        {t('module.l04.currentStack')}: [{(currentSnapshot?.stackState ?? []).join(', ')}]
      </p>
      <p>
        {t('module.s01.highlight')}:{' '}
        {(currentSnapshot?.highlights ?? [])
          .map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`)
          .join(' | ') || t('module.s01.none')}
      </p>

      <VisualizationCanvas
        title={t('module.l04.title')}
        subtitle={t('module.l04.stage')}
        stageClassName="viz-canvas-stage-array"
      >
        <div className="stack-cells" aria-label="stack-cells">
          {(currentSnapshot?.stackState ?? []).map((value, index, array) => {
            const visualIndex = array.length - 1 - index;
            const highlight = highlightMap.get(index) ?? 'default';
            const isTop = index === array.length - 1;
            return (
              <div key={`${index}-${value}`} className={`stack-cell bar-${highlight}`}>
                {isTop ? <span className="stack-top-pointer">{t('module.l04.top')}</span> : null}
                <span className="array-cell-index">{visualIndex}</span>
                <strong>{value}</strong>
              </div>
            );
          })}
          {(currentSnapshot?.stackState ?? []).length === 0 ? <div className="stack-empty">{t('module.l04.empty')}</div> : null}
        </div>
      </VisualizationCanvas>

      <div className="legend-row">
        <span className="legend-item legend-default">{t('module.s01.legend.default')}</span>
        <span className="legend-item legend-inserted">{t('module.l04.highlight.pushed')}</span>
        <span className="legend-item legend-moving">{t('module.l04.highlight.popped')}</span>
        <span className="legend-item legend-matched">{t('module.l04.highlight.peeked')}</span>
      </div>

      <div className="playback-actions">
        <button type="button" onClick={play} disabled={status === 'playing' || !hasValidConfig || steps.length === 0}>
          {t('playback.play')}
        </button>
        <button type="button" onClick={pause} disabled={status !== 'playing'}>
          {t('playback.pause')}
        </button>
        <button type="button" onClick={prev} disabled={!hasValidConfig || steps.length === 0}>
          {t('playback.prev')}
        </button>
        <button type="button" onClick={handleNextStep} disabled={!hasValidConfig || steps.length === 0}>
          {t('playback.next')}
        </button>
        <button type="button" onClick={reset} disabled={!hasValidConfig || steps.length === 0}>
          {t('playback.reset')}
        </button>
      </div>

      <div className="pseudocode-block">
        <h3>{t('module.l04.pseudocode')}</h3>
        <ol>
          <li className={currentSnapshot?.codeLines.includes(1) ? 'code-active' : ''}>{t('module.l04.code.line1')}</li>
          <li className={currentSnapshot?.codeLines.includes(2) ? 'code-active' : ''}>{t('module.l04.code.line2')}</li>
          <li className={currentSnapshot?.codeLines.includes(3) ? 'code-active' : ''}>{t('module.l04.code.line3')}</li>
          <li className={currentSnapshot?.codeLines.includes(4) ? 'code-active' : ''}>{t('module.l04.code.line4')}</li>
          <li className={currentSnapshot?.codeLines.includes(5) ? 'code-active' : ''}>{t('module.l04.code.line5')}</li>
          <li className={currentSnapshot?.codeLines.includes(6) ? 'code-active' : ''}>{t('module.l04.code.line6')}</li>
        </ol>
      </div>
    </section>
  );
}
