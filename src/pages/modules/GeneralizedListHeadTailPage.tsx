import { useState } from 'react';
import { useI18n } from '../../i18n/useI18n';
import {
  GENERALIZED_LIST_DEFAULT_CONFIG,
  GENERALIZED_LIST_LIMITS,
  generateGeneralizedListProblem,
  sanitizeGeneralizedListConfig,
  type GeneralizedListGeneratorConfig,
  type GeneralizedListNode,
  type GeneralizedListOperationMode,
} from '../../modules/storage/generalizedListHeadTail';

function GeneralizedListExpressionRich({ expression }: { expression: string }) {
  const parts: React.ReactNode[] = [];
  const stack: Array<'function' | 'list'> = [];
  let pendingFunctionParen = false;
  let index = 0;

  while (index < expression.length) {
    if (expression.startsWith('head', index) || expression.startsWith('tail', index)) {
      const token = expression.startsWith('head', index) ? 'head' : 'tail';
      parts.push(
        <span key={`fn-${index}`} className="generalized-list-fn-name">
          {token}
        </span>,
      );
      pendingFunctionParen = true;
      index += token.length;
      continue;
    }

    const char = expression[index];
    if (char === '(') {
      const type: 'function' | 'list' = pendingFunctionParen ? 'function' : 'list';
      stack.push(type);
      parts.push(
        <span
          key={`open-${index}`}
          className={type === 'function' ? 'generalized-list-fn-paren' : 'generalized-list-list-paren'}
        >
          (
        </span>,
      );
      pendingFunctionParen = false;
      index += 1;
      continue;
    }

    if (char === ')') {
      const type = stack.pop() ?? 'list';
      parts.push(
        <span
          key={`close-${index}`}
          className={type === 'function' ? 'generalized-list-fn-paren' : 'generalized-list-list-paren'}
        >
          )
        </span>,
      );
      pendingFunctionParen = false;
      index += 1;
      continue;
    }

    if (char === ',') {
      parts.push(
        <span key={`comma-${index}`} className="generalized-list-comma-token">
          ,
        </span>,
      );
      pendingFunctionParen = false;
      index += 1;
      continue;
    }

    parts.push(
      <span key={`char-${index}`} className="generalized-list-expression-char">
        {char}
      </span>,
    );
    pendingFunctionParen = false;
    index += 1;
  }

  return <span className="generalized-list-expression-rich">{parts}</span>;
}

function GeneralizedListInlineExpression({
  node,
  depth = 0,
}: {
  node: GeneralizedListNode;
  depth?: number;
}) {
  if (node.kind === 'atom') {
    return <span className="generalized-list-atom">{node.value}</span>;
  }

  return (
    <span className={`generalized-list-inline generalized-list-depth-${Math.min(depth, 4)}`}>
      <span className="generalized-list-paren">(</span>
      {node.items.map((item, index) => (
        <span key={`${depth}-${index}`} className="generalized-list-inline-item">
          <GeneralizedListInlineExpression node={item} depth={depth + 1} />
          {index < node.items.length - 1 ? <span className="generalized-list-comma">, </span> : null}
        </span>
      ))}
      <span className="generalized-list-paren">)</span>
    </span>
  );
}

const DEFAULT_PROBLEM = generateGeneralizedListProblem(GENERALIZED_LIST_DEFAULT_CONFIG);

export function GeneralizedListHeadTailPage() {
  const { t } = useI18n();
  const [config, setConfig] = useState<GeneralizedListGeneratorConfig>(GENERALIZED_LIST_DEFAULT_CONFIG);
  const [problem, setProblem] = useState(DEFAULT_PROBLEM);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = problem.steps[currentStepIndex] ?? null;

  const updateConfig = <K extends keyof GeneralizedListGeneratorConfig>(
    key: K,
    value: GeneralizedListGeneratorConfig[K],
  ) => {
    setConfig((current) => sanitizeGeneralizedListConfig({ ...current, [key]: value }));
  };

  const regenerate = (nextConfig = config) => {
    const sanitized = sanitizeGeneralizedListConfig(nextConfig);
    setConfig(sanitized);
    setProblem(generateGeneralizedListProblem(sanitized));
    setCurrentStepIndex(0);
  };

  const handleReset = () => {
    regenerate(GENERALIZED_LIST_DEFAULT_CONFIG);
  };

  const operationModeLabel =
    config.operationMode === 'head-only'
      ? t('module.m07.mode.headOnly')
      : config.operationMode === 'tail-only'
        ? t('module.m07.mode.tailOnly')
        : t('module.m07.mode.mixed');

  return (
    <section className="array-page tree-page storage-page generalized-list-page">
      <div className="tree-workspace-header">
        <h2>{t('module.m07.title')}</h2>
        <p>{t('module.m07.body')}</p>
      </div>

      <section className="storage-workbench" aria-label={t('module.m07.stage')}>
        <div className="storage-toolbar generalized-list-toolbar">
          <label className="tree-workspace-field" htmlFor="m07-atom-count">
            <span>{t('module.m07.input.atomTypeCount')}</span>
            <input
              id="m07-atom-count"
              type="number"
              min={GENERALIZED_LIST_LIMITS.atomTypeCount.min}
              max={GENERALIZED_LIST_LIMITS.atomTypeCount.max}
              value={config.atomTypeCount}
              onChange={(event) => updateConfig('atomTypeCount', Number(event.target.value))}
            />
          </label>

          <label className="tree-workspace-field" htmlFor="m07-max-width">
            <span>{t('module.m07.input.maxWidth')}</span>
            <input
              id="m07-max-width"
              type="number"
              min={GENERALIZED_LIST_LIMITS.maxWidth.min}
              max={GENERALIZED_LIST_LIMITS.maxWidth.max}
              value={config.maxWidth}
              onChange={(event) => updateConfig('maxWidth', Number(event.target.value))}
            />
          </label>

          <label className="tree-workspace-field" htmlFor="m07-max-depth">
            <span>{t('module.m07.input.maxDepth')}</span>
            <input
              id="m07-max-depth"
              type="number"
              min={GENERALIZED_LIST_LIMITS.maxDepth.min}
              max={GENERALIZED_LIST_LIMITS.maxDepth.max}
              value={config.maxDepth}
              onChange={(event) => updateConfig('maxDepth', Number(event.target.value))}
            />
          </label>

          <label className="tree-workspace-field" htmlFor="m07-operation-mode">
            <span>{t('module.m07.input.operationMode')}</span>
            <select
              id="m07-operation-mode"
              value={config.operationMode}
              onChange={(event) =>
                updateConfig('operationMode', event.target.value as GeneralizedListOperationMode)
              }
            >
              <option value="head-only">{t('module.m07.mode.headOnly')}</option>
              <option value="tail-only">{t('module.m07.mode.tailOnly')}</option>
              <option value="mixed">{t('module.m07.mode.mixed')}</option>
            </select>
          </label>

          <label className="tree-workspace-field" htmlFor="m07-operation-depth">
            <span>{t('module.m07.input.operationDepth')}</span>
            <input
              id="m07-operation-depth"
              type="number"
              min={GENERALIZED_LIST_LIMITS.operationDepth.min}
              max={GENERALIZED_LIST_LIMITS.operationDepth.max}
              value={config.operationDepth}
              onChange={(event) => updateConfig('operationDepth', Number(event.target.value))}
            />
          </label>

          <div className="storage-toolbar-actions">
            <button type="button" className="tree-workspace-ghost-button" onClick={() => regenerate()}>
              {t('module.m07.action.generate')}
            </button>
            <button type="button" className="tree-workspace-ghost-button" onClick={handleReset}>
              {t('playback.reset')}
            </button>
          </div>
        </div>

        <div className="storage-summary-strip">
          <span className="tree-workspace-pill">
            {t('module.m07.meta.atomTypes')}: {config.atomTypeCount}
          </span>
          <span className="tree-workspace-pill">
            {t('module.m07.meta.widthDepth')}: {config.maxWidth} / {config.maxDepth}
          </span>
          <span className="tree-workspace-pill">
            {t('module.m07.meta.operationMode')}: {operationModeLabel}
          </span>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('module.m07.meta.operationDepth')}: {config.operationDepth}
          </span>
        </div>

        <div className="storage-layout generalized-list-layout">
          <section className="graph-stage-view-card storage-layout-panel">
            <div className="graph-stage-view-head">
              <strong>{t('module.m07.view.source')}</strong>
              <span>{t('module.m07.view.sourceHint')}</span>
            </div>

            <div className="generalized-list-source-card">
              <div className="generalized-list-formula-line">
                <span className="generalized-list-label">L = </span>
                <GeneralizedListInlineExpression node={problem.list} />
              </div>
            </div>

            <div className="generalized-list-source-card generalized-list-expression-card">
              <span className="generalized-list-card-label">{t('module.m07.meta.generatedExpression')}</span>
              <div className="generalized-list-code-block">
                <GeneralizedListExpressionRich expression={problem.displayExpressionText} />
              </div>
            </div>
            <div className="generalized-list-source-card generalized-list-expression-card">
              <span className="generalized-list-card-label">{t('module.m07.meta.bracketHint')}</span>
              <p className="storage-formula-explainer">{t('module.m07.explain.brackets')}</p>
            </div>
          </section>

          <section className="graph-stage-view-card storage-layout-panel storage-formula-panel">
            <div className="graph-stage-view-head">
              <strong>{t('module.m07.view.solve')}</strong>
              <span>{t('module.m07.view.solveHint')}</span>
            </div>

            <div className="generalized-list-steps">
              <div className="generalized-list-step-card generalized-list-step-card-active">
                <span className="generalized-list-card-label">{t('module.m07.meta.originalExpression')}</span>
                <div className="generalized-list-code-block">
                  <GeneralizedListExpressionRich expression={problem.displayExpressionText} />
                </div>
              </div>

              {problem.steps.map((step, index) => (
                <button
                  type="button"
                  key={`${step.expressionBefore}-${index}`}
                  className={`generalized-list-step-card${
                    index === currentStepIndex ? ' generalized-list-step-card-active' : ''
                  }${index < currentStepIndex ? ' generalized-list-step-card-completed' : ''}`}
                  onClick={() => setCurrentStepIndex(index)}
                >
                  <span className="generalized-list-card-label">
                    {t('module.m07.meta.step')} {index + 1}
                  </span>
                <div className="generalized-list-substep generalized-list-substep-inline">
                    <span className="generalized-list-substep-label">
                      {step.needsSubstitutionDisplay
                        ? t('module.m07.meta.reduceCurrent')
                        : t('module.m07.meta.directResult')}
                    </span>
                    <div className="generalized-list-code-block">
                      <GeneralizedListExpressionRich expression={step.displayFocusExpression} />
                    </div>
                    <div className="generalized-list-step-arrow">⇒</div>
                    <div className="generalized-list-code-block">
                      <GeneralizedListExpressionRich expression={step.resultExpression} />
                    </div>
                  </div>
                  {step.needsSubstitutionDisplay ? (
                    <div className="generalized-list-substep generalized-list-substep-inline">
                      <span className="generalized-list-substep-label">{t('module.m07.meta.substituteBack')}</span>
                      <div className="generalized-list-code-block">
                        <GeneralizedListExpressionRich expression={step.displayExpressionBefore} />
                      </div>
                      <div className="generalized-list-step-arrow">⇒</div>
                      <div className="generalized-list-code-block">
                        <GeneralizedListExpressionRich expression={step.displayExpressionAfter} />
                      </div>
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          </section>

          <section className="graph-stage-view-card storage-layout-panel">
            <div className="graph-stage-view-head">
              <strong>{t('module.m07.view.explain')}</strong>
              <span>{t('module.m07.view.explainHint')}</span>
            </div>

            {currentStep ? (
              <div className="storage-formula-stack">
                <div className="storage-formula-card">
                  <span>
                    {t('module.m07.meta.step')} {currentStepIndex + 1} {t('module.m07.meta.currentStepAction')}
                  </span>
                  <div className="generalized-list-code-block generalized-list-code-block-compact">
                    <GeneralizedListExpressionRich expression={currentStep.displayFocusExpression} />
                  </div>
                  <p className="storage-formula-explainer">{t('module.m07.explain.reduceInner')}</p>
                </div>

                <div className="generalized-list-explain-grid">
                  <div className="storage-formula-card">
                    <span>{t('module.m07.meta.currentOperation')}</span>
                    <strong>
                      {currentStep.operation === 'head'
                        ? t('module.m07.op.head')
                        : t('module.m07.op.tail')}
                    </strong>
                    <p className="storage-formula-explainer">
                      {currentStep.operation === 'head'
                        ? t('module.m07.explain.head')
                        : t('module.m07.explain.tail')}
                    </p>
                  </div>

                  <div className="storage-formula-card">
                    <span>{t('module.m07.meta.bracketLegend')}</span>
                    <div className="generalized-list-legend">
                      <div className="generalized-list-legend-item">
                        <GeneralizedListExpressionRich expression="head((a,b))" />
                        <small>{t('module.m07.meta.functionParens')}</small>
                      </div>
                      <div className="generalized-list-legend-item">
                        <GeneralizedListExpressionRich expression="((a,b),c)" />
                        <small>{t('module.m07.meta.listParens')}</small>
                      </div>
                    </div>
                  </div>

                  <div className="storage-formula-card">
                    <span>{t('module.m07.meta.currentTarget')}</span>
                    <strong className="generalized-list-strong-expression">
                      <GeneralizedListExpressionRich expression={currentStep.explanationTarget} />
                    </strong>
                  </div>

                  <div className="storage-formula-card generalized-list-result-card">
                    <span>{t('module.m07.meta.currentResult')}</span>
                    <strong className="generalized-list-strong-expression">
                      <GeneralizedListExpressionRich expression={currentStep.resultExpression} />
                    </strong>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </section>
    </section>
  );
}
