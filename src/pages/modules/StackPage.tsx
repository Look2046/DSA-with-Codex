import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import { STACK_CAPACITY } from '../../modules/linear/stackOps';
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

function createRandomPushValue(): number {
  return Math.floor(Math.random() * 90) + 10;
}

export function StackPage() {
  const { t } = useI18n();

  const [stackInput, setStackInput] = useState(DEFAULT_CONFIG.stack.join(', '));
  const [operationType, setOperationType] = useState<StackConfig['operation']['type']>(DEFAULT_CONFIG.operation.type);
  const [valueInput, setValueInput] = useState(
    String(DEFAULT_CONFIG.operation.type === 'push' ? DEFAULT_CONFIG.operation.value : ''),
  );
  const [error, setError] = useState('');
  const [hasValidConfig, setHasValidConfig] = useState(true);
  const [stackConfig, setStackConfig] = useState<StackConfig>(DEFAULT_CONFIG);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonFeedback, setJsonFeedback] = useState('');
  const [hasJsonError, setHasJsonError] = useState(false);
  const stackCellsRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const container = stackCellsRef.current;
    if (!container || !currentSnapshot) {
      return;
    }

    const activeIndex = currentSnapshot.highlights[0]?.index ?? currentSnapshot.indices[0];
    if (activeIndex === undefined) {
      return;
    }

    const target = container.querySelector<HTMLElement>(`[data-stack-index="${activeIndex}"]`);
    if (!target) {
      return;
    }

    target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [currentStep, currentSnapshot]);

  const syncInputToCompletedStack = useCallback(
    (nextValueInput = valueInput) => {
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
      recomputeInputState(completedStackText, operationType, nextValueInput);
    },
    [completedStackText, hasValidConfig, operationType, recomputeInputState, reset, stackInput, steps.length, valueInput],
  );

  useEffect(() => {
    if (!hasValidConfig || steps.length === 0) {
      return;
    }

    if (operationType === 'peek' || currentSnapshot?.action !== 'completed') {
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
      if (operationType === 'push') {
        const nextValueInput = String(createRandomPushValue());
        setValueInput(nextValueInput);
        syncInputToCompletedStack(nextValueInput);
        return;
      }
      syncInputToCompletedStack();
    }
  }, [currentStep, next, operationType, steps.length, syncInputToCompletedStack]);

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

  const currentStack = currentSnapshot?.stackState ?? [];
  const currentSize = currentStack.length;
  const currentTopIndex = currentSize - 1;
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;
  const focusPoint = useMemo(() => {
    const activeIndex =
      currentSnapshot?.highlights[0]?.index ??
      currentSnapshot?.indices[0] ??
      Math.max(currentTopIndex, 0);
    return {
      x: 50,
      y: 82 - Math.min(Math.max(activeIndex, 0) * 9, 54),
    };
  }, [currentSnapshot?.highlights, currentSnapshot?.indices, currentTopIndex]);
  const highlightSummary =
    (currentSnapshot?.highlights ?? [])
      .map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`)
      .join(' | ') || t('module.s01.none');
  const operationLabel =
    operationType === 'push'
      ? t('module.l04.operation.push')
      : operationType === 'pop'
        ? t('module.l04.operation.pop')
        : t('module.l04.operation.peek');

  return (
    <WorkspaceShell
      pageClassName="array-page tree-page"
      stageAriaLabel={t('module.l04.title')}
      title={t('module.l04.title')}
      description={t('module.l04.body')}
      stageClassName="workspace-stage-array"
      stageBodyClassName="workspace-stage-body-array"
      controlsPanelClassName="workspace-drawer-xl workspace-drawer-scroll"
      stepPanelClassName="workspace-context-sheet-wide workspace-context-sheet-rich"
      defaultControlsPanelSize={{ width: 332, height: 620 }}
      defaultContextPanelSize={{ width: 320, height: 540 }}
      focusPoint={focusPoint}
      stageMeta={
        <>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('playback.status')}: {getStatusLabel(status, t)}
          </span>
          <span className="tree-workspace-pill">
            {t('playback.step')}: {currentStep}/{Math.max(steps.length - 1, 0)}
          </span>
          <span className="tree-workspace-pill">{operationLabel}</span>
          <span className="tree-workspace-pill">
            {t('module.l01.lengthCapacity')}: {currentSize}/{STACK_CAPACITY}
          </span>
          <span className="tree-workspace-pill">{getStepDescription(currentSnapshot, t)}</span>
        </>
      }
      controlsContent={
        <>
          <label className="tree-workspace-field" htmlFor="stack-input">
            <span>{t('module.l04.input.stack')}</span>
            <input
              id="stack-input"
              type="text"
              value={stackInput}
              onChange={(event) => {
                const nextValue = event.target.value;
                reset();
                setStackInput(nextValue);
                recomputeInputState(nextValue, operationType, valueInput);
              }}
              placeholder="3, 8, 1"
            />
          </label>

          <label className="tree-workspace-field" htmlFor="stack-operation">
            <span>{t('module.l04.input.operation')}</span>
            <select
              id="stack-operation"
              value={operationType}
              onChange={(event) => {
                const nextValue = event.target.value as StackConfig['operation']['type'];
                reset();
                setOperationType(nextValue);
                const normalized = nextValue === 'push' ? String(createRandomPushValue()) : '';
                if (nextValue !== 'push') {
                  setValueInput('');
                } else {
                  setValueInput(normalized);
                }
                recomputeInputState(stackInput, nextValue, normalized);
              }}
            >
              <option value="push">{t('module.l04.operation.push')}</option>
              <option value="pop">{t('module.l04.operation.pop')}</option>
              <option value="peek">{t('module.l04.operation.peek')}</option>
            </select>
          </label>

          {operationType === 'push' ? (
            <label className="tree-workspace-field" htmlFor="stack-value">
              <span>{t('module.l04.input.value')}</span>
              <input
                id="stack-value"
                type="number"
                value={valueInput}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  reset();
                  setValueInput(nextValue);
                  recomputeInputState(stackInput, operationType, nextValue);
                }}
              />
            </label>
          ) : null}

          <div className="tree-workspace-field">
            <span>{t('module.s01.speed')}</span>
            <div className="tree-workspace-toggle-row">
              {speedOptions.map((option) => (
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

          <label className="tree-workspace-field" htmlFor="stack-json-input">
            <span>{t('module.l04.json.label')}</span>
            <textarea
              id="stack-json-input"
              value={jsonInput}
              onChange={(event) => setJsonInput(event.target.value)}
              rows={6}
              placeholder={t('module.l04.json.placeholder')}
            />
          </label>

          {error ? <p className="form-error workspace-inline-feedback">{error}</p> : null}
          {jsonFeedback ? (
            <p className={`${hasJsonError ? 'form-error' : 'array-preview'} workspace-inline-feedback`}>{jsonFeedback}</p>
          ) : null}

          <div className="tree-workspace-drawer-actions">
            <button type="button" className="tree-workspace-ghost-button" onClick={handleExportJson}>
              {t('module.l04.json.export')}
            </button>
            <button type="button" className="tree-workspace-ghost-button" onClick={handleImportJson}>
              {t('module.l04.json.import')}
            </button>
          </div>
        </>
      }
      stepContent={
        <div className="workspace-panel-scroll">
          <div className="workspace-panel-copy">
            <h3>{getStepDescription(currentSnapshot, t)}</h3>
            <p>
              {t('module.l04.currentStack')}: [{currentStack.join(', ')}]
            </p>
          </div>

          <dl className="tree-workspace-kv">
            <div>
              <dt>{t('playback.status')}</dt>
              <dd>{getStatusLabel(status, t)}</dd>
            </div>
            <div>
              <dt>{t('playback.step')}</dt>
              <dd>
                {currentStep}/{Math.max(steps.length - 1, 0)}
              </dd>
            </div>
            <div>
              <dt>{t('module.l04.input.operation')}</dt>
              <dd>{operationLabel}</dd>
            </div>
            {operationType === 'push' ? (
              <div>
                <dt>{t('module.l04.input.value')}</dt>
                <dd>{stackConfig.operation.type === 'push' ? stackConfig.operation.value : '-'}</dd>
              </div>
            ) : null}
            <div>
              <dt>{t('module.l01.lengthCapacity')}</dt>
              <dd>
                {currentSize}/{STACK_CAPACITY}
              </dd>
            </div>
            <div>
              <dt>{t('module.l04.top')}</dt>
              <dd>{currentTopIndex >= 0 ? currentTopIndex : '-'}</dd>
            </div>
            <div>
              <dt>{t('module.s01.highlight')}</dt>
              <dd>{highlightSummary}</dd>
            </div>
          </dl>

          <div className="legend-row">
            <span className="legend-item legend-default">{t('module.s01.legend.default')}</span>
            <span className="legend-item legend-inserted">{t('module.l04.highlight.pushed')}</span>
            <span className="legend-item legend-moving">{t('module.l04.highlight.popped')}</span>
            <span className="legend-item legend-matched">{t('module.l04.highlight.peeked')}</span>
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
        </div>
      }
      stageContent={
        <div ref={stackCellsRef} className="stack-cells" aria-label="stack-cells">
          {Array.from({ length: STACK_CAPACITY }, (_, index) => {
            const value = currentStack[index] ?? null;
            const highlight = highlightMap.get(index) ?? 'default';
            const isTop = index === currentTopIndex;
            const isUnused = value === null;
            return (
              <div
                key={`${index}-${String(value)}`}
                data-stack-index={index}
                className={`stack-cell bar-${highlight}${isUnused ? ' stack-cell-unused' : ''}`}
              >
                {isTop ? <span className="stack-top-pointer">{t('module.l04.top')}</span> : null}
                <span className="array-cell-index">{index}</span>
                <strong>{value ?? '∅'}</strong>
              </div>
            );
          })}
          {currentSize === 0 ? <div className="stack-empty">{t('module.l04.empty')}</div> : null}
        </div>
      }
      transportLeft={
        <>
          <button
            type="button"
            className="tree-workspace-transport-btn"
            onClick={prev}
            disabled={!hasValidConfig || steps.length === 0 || currentStep <= 0}
          >
            {t('playback.prev')}
          </button>
          <button
            type="button"
            className="tree-workspace-transport-btn tree-workspace-transport-btn-primary"
            onClick={status === 'playing' ? pause : play}
            disabled={!hasValidConfig || steps.length === 0 || (status !== 'playing' && isAtLastFrame)}
          >
            {status === 'playing' ? t('playback.pause') : t('playback.play')}
          </button>
          <button
            type="button"
            className="tree-workspace-transport-btn"
            onClick={handleNextStep}
            disabled={!hasValidConfig || isAtLastFrame}
          >
            {t('playback.next')}
          </button>
          <button
            type="button"
            className="tree-workspace-transport-btn"
            onClick={reset}
            disabled={!hasValidConfig || steps.length === 0}
          >
            {t('playback.reset')}
          </button>
          <div className="tree-workspace-transport-progress" aria-hidden="true">
            <span
              className="tree-workspace-transport-progress-fill"
              style={{
                width: `${steps.length <= 1 ? 0 : (currentStep / Math.max(steps.length - 1, 1)) * 100}%`,
              }}
            />
          </div>
          <span className="tree-workspace-transport-step">
            {currentStep}/{Math.max(steps.length - 1, 0)}
          </span>
        </>
      }
      transportRight={
        <>
          <span className="tree-workspace-transport-chip">{operationLabel}</span>
          {operationType === 'push' ? (
            <span className="tree-workspace-transport-chip">
              +{stackConfig.operation.type === 'push' ? stackConfig.operation.value : valueInput}
            </span>
          ) : null}
          <span className="tree-workspace-transport-chip">top:{currentTopIndex >= 0 ? currentTopIndex : '-'}</span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {currentSize}/{STACK_CAPACITY}
          </span>
        </>
      }
    />
  );
}
