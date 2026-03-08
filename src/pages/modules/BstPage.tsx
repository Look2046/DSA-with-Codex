import { useEffect, useMemo, useState } from 'react';
import { VisualizationCanvas } from '../../components/VisualizationCanvas';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useCurrentModule } from '../../hooks/useCurrentModule';
import { useI18n } from '../../i18n/useI18n';
import { buildBstTimelineFromInput } from '../../modules/tree/bstTimelineAdapter';
import type { BstDeleteCase, BstOperation, BstOutcome, BstStep } from '../../modules/tree/bst';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

const DEFAULT_DATASET = [50, 30, 70, 20, 40, 60, 80, 65];
const MIN_SIZE = 5;
const MAX_SIZE = 15;

type BstOperationConfig = {
  operation: BstOperation;
  target: number;
};

function createRandomUniqueDataset(size: number): number[] {
  const pool = Array.from({ length: 99 }, (_, index) => index + 1);

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool.slice(0, size);
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

function getOperationLabel(operation: BstOperation, t: ReturnType<typeof useI18n>['t']): string {
  if (operation === 'searchPath') {
    return t('module.t02.operation.searchPath');
  }
  if (operation === 'insert') {
    return t('module.t02.operation.insert');
  }
  return t('module.t02.operation.delete');
}

function getDeleteCaseLabel(deleteCase: BstDeleteCase, t: ReturnType<typeof useI18n>['t']): string {
  if (deleteCase === 'leaf') {
    return t('module.t02.case.leaf');
  }
  if (deleteCase === 'oneChild') {
    return t('module.t02.case.oneChild');
  }
  if (deleteCase === 'twoChildren') {
    return t('module.t02.case.twoChildren');
  }
  return t('module.t02.case.none');
}

function getOutcomeLabel(outcome: BstOutcome, t: ReturnType<typeof useI18n>['t']): string {
  if (outcome === 'found') {
    return t('module.t02.outcome.found');
  }
  if (outcome === 'inserted') {
    return t('module.t02.outcome.inserted');
  }
  if (outcome === 'deleted') {
    return t('module.t02.outcome.deleted');
  }
  if (outcome === 'notFound') {
    return t('module.t02.outcome.notFound');
  }
  if (outcome === 'duplicate') {
    return t('module.t02.outcome.duplicate');
  }
  return t('module.t02.outcome.ongoing');
}

function getHighlightLabel(type: HighlightType, t: ReturnType<typeof useI18n>['t']): string {
  if (type === 'visiting') {
    return t('module.t01.legend.visiting');
  }
  if (type === 'comparing') {
    return t('module.s01.highlight.comparing');
  }
  if (type === 'matched') {
    return t('module.sr01.highlight.found');
  }
  if (type === 'new-node') {
    return t('module.t02.legend.newNode');
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

function getStepDescription(step: BstStep | undefined, t: ReturnType<typeof useI18n>['t']): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'initial') {
    return t('module.t02.step.initial');
  }

  if (step.action === 'visit') {
    return t('module.t02.step.visit');
  }

  if (step.action === 'found') {
    return t('module.t02.step.found');
  }

  if (step.action === 'notFound') {
    return t('module.t02.step.notFound');
  }

  if (step.action === 'inserted') {
    return t('module.t02.step.inserted');
  }

  if (step.action === 'duplicate') {
    return t('module.t02.step.duplicate');
  }

  if (step.action === 'deleteCase') {
    return t('module.t02.step.deleteCase');
  }

  if (step.action === 'successor') {
    return t('module.t02.step.successor');
  }

  if (step.action === 'deleted') {
    return t('module.t02.step.deleted');
  }

  if (step.action === 'operationDone') {
    return t('module.t02.step.operationDone');
  }

  return t('module.t02.step.completed');
}

export function BstPage() {
  const { t } = useI18n();
  const currentModule = useCurrentModule();

  const [datasetSize, setDatasetSize] = useState(DEFAULT_DATASET.length);
  const [seedData, setSeedData] = useState<number[]>(DEFAULT_DATASET);
  const [operationInput, setOperationInput] = useState<BstOperation>('searchPath');
  const [targetInput, setTargetInput] = useState(String(DEFAULT_DATASET[0] ?? 0));
  const [error, setError] = useState('');
  const [activeConfig, setActiveConfig] = useState<BstOperationConfig>({
    operation: 'searchPath',
    target: DEFAULT_DATASET[0] ?? 0,
  });

  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } = useTimelinePlayer(0);

  const timelineFrames = useMemo(
    () => buildBstTimelineFromInput(seedData, activeConfig.operation, activeConfig.target),
    [activeConfig.operation, activeConfig.target, seedData],
  );
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  const nodeMap = useMemo(
    () => new Map((currentSnapshot?.treeState ?? []).map((node) => [node.id, node])),
    [currentSnapshot?.treeState],
  );

  const positionMap = useMemo(() => {
    const positions = new Map<number, { x: number; y: number }>();

    if (!currentSnapshot || currentSnapshot.rootId === null) {
      return positions;
    }

    const depthOf = (nodeId: number | null): number => {
      if (nodeId === null) {
        return 0;
      }
      const node = nodeMap.get(nodeId);
      if (!node) {
        return 0;
      }
      return Math.max(depthOf(node.left), depthOf(node.right)) + 1;
    };

    const maxDepth = Math.max(depthOf(currentSnapshot.rootId), 1);
    const yStep = maxDepth > 1 ? 76 / (maxDepth - 1) : 0;

    const placeNode = (nodeId: number | null, depth: number, minX: number, maxX: number) => {
      if (nodeId === null) {
        return;
      }

      const node = nodeMap.get(nodeId);
      if (!node) {
        return;
      }

      const x = (minX + maxX) / 2;
      const y = 12 + depth * yStep;
      positions.set(nodeId, { x, y });

      placeNode(node.left, depth + 1, minX, x);
      placeNode(node.right, depth + 1, x, maxX);
    };

    placeNode(currentSnapshot.rootId, 0, 4, 96);
    return positions;
  }, [currentSnapshot, nodeMap]);

  const edges = useMemo(() => {
    if (!currentSnapshot) {
      return [] as Array<{ from: number; to: number }>;
    }

    const nextEdges: Array<{ from: number; to: number }> = [];

    currentSnapshot.treeState.forEach((node) => {
      if (node.left !== null) {
        nextEdges.push({ from: node.id, to: node.left });
      }
      if (node.right !== null) {
        nextEdges.push({ from: node.id, to: node.right });
      }
    });

    return nextEdges;
  }, [currentSnapshot]);

  const highlightMap = useMemo(() => {
    const map = new Map<number, HighlightType>();
    (currentSnapshot?.highlights ?? []).forEach((entry) => {
      map.set(entry.index, entry.type);
    });
    return map;
  }, [currentSnapshot]);

  const pathSet = useMemo(() => new Set(currentSnapshot?.pathIds ?? []), [currentSnapshot?.pathIds]);

  const speedOptions = [
    { key: 'module.s01.speed.slow', value: 1200 },
    { key: 'module.s01.speed.normal', value: 700 },
    { key: 'module.s01.speed.fast', value: 350 },
  ] as const;

  const operationOptions: BstOperation[] = ['searchPath', 'insert', 'delete'];

  const handleRegenerate = () => {
    const nextData = createRandomUniqueDataset(datasetSize);
    setSeedData(nextData);
    setTargetInput(String(nextData[0] ?? 0));
    setError('');
    reset();
  };

  const handleApply = () => {
    const parsedTarget = Number(targetInput);

    if (!Number.isInteger(parsedTarget)) {
      setError(t('module.t02.input.targetInvalid'));
      return;
    }

    setError('');
    setActiveConfig({ operation: operationInput, target: parsedTarget });
    reset();
  };

  return (
    <section className="array-page tree-page bst-page">
      <h2>{t('module.t02.title')}</h2>
      <p>{t('module.t02.body')}</p>

      <div className="bubble-toolbar">
        <label htmlFor="dataset-size-t02" className="control-inline">
          <span>{t('module.s01.dataSize')}</span>
          <input
            id="dataset-size-t02"
            type="range"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={datasetSize}
            onChange={(event) => setDatasetSize(Number(event.target.value))}
          />
          <strong>{datasetSize}</strong>
        </label>
        <div className="speed-group">
          <button type="button" onClick={handleRegenerate}>
            {t('module.s01.regenerate')}
          </button>
        </div>
      </div>

      <div className="bubble-toolbar">
        <span>{t('module.t02.meta.operation')}</span>
        <div className="speed-group">
          {operationOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={operationInput === option ? 'speed-active' : ''}
              onClick={() => {
                setOperationInput(option);
                reset();
              }}
            >
              {getOperationLabel(option, t)}
            </button>
          ))}
        </div>
      </div>

      <div className="array-form bst-input-form">
        <label htmlFor="bst-target-input">
          <span>{t('module.t02.input.target')}</span>
          <input
            id="bst-target-input"
            type="number"
            value={targetInput}
            onChange={(event) => {
              setTargetInput(event.target.value);
              setError('');
              reset();
            }}
          />
        </label>
        <button type="button" onClick={handleApply}>
          {t('module.t02.apply')}
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
          {t('module.t02.meta.operation')}: {getOperationLabel(currentSnapshot?.operation ?? activeConfig.operation, t)} |{' '}
          {t('module.t02.meta.target')}: {currentSnapshot?.target ?? activeConfig.target}
        </p>
        <p className="module-status-line">
          {t('module.t02.meta.current')}: {currentSnapshot?.currentId ?? '-'} | {t('module.t02.meta.successor')}:{' '}
          {currentSnapshot?.successorId ?? '-'} | {t('module.t02.meta.case')}:{' '}
          {getDeleteCaseLabel(currentSnapshot?.deleteCase ?? 'none', t)} | {t('module.t02.meta.outcome')}:{' '}
          {getOutcomeLabel(currentSnapshot?.outcome ?? 'ongoing', t)}
        </p>
      </div>

      <p className="array-preview">
        {t('module.t02.seed')}: [{formatArrayPreview(seedData)}]
      </p>

      <VisualizationCanvas title={t('module.t02.title')} subtitle={t('module.t02.stage')} stageClassName="viz-canvas-stage-tree">
        <div className="tree-stage bst-stage" aria-label="bst-stage">
          <svg className="tree-edge-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {edges.map((edge) => {
              const from = positionMap.get(edge.from);
              const to = positionMap.get(edge.to);
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
            {(currentSnapshot?.treeState ?? []).map((node) => {
              const highlightType = highlightMap.get(node.id);
              const isPath = pathSet.has(node.id);
              const stateClass =
                highlightType === 'matched'
                  ? ' bar-matched'
                  : highlightType === 'new-node'
                    ? ' bar-new-node'
                    : highlightType === 'comparing' || highlightType === 'visiting'
                      ? ' bar-visiting'
                      : '';
              const pathClass = isPath ? ' bst-node-path' : '';

              const marker: string[] = [];
              if (currentSnapshot?.currentId === node.id) {
                marker.push('C');
              }
              if (currentSnapshot?.successorId === node.id) {
                marker.push('S');
              }

              return (
                <div
                  key={node.id}
                  className={`tree-node bst-node${stateClass}${pathClass}`}
                  style={{
                    left: `${positionMap.get(node.id)?.x ?? 0}%`,
                    top: `${positionMap.get(node.id)?.y ?? 0}%`,
                  }}
                >
                  {marker.length > 0 ? <span className="tree-node-tag">{marker.join('/')}</span> : null}
                  <span className="tree-node-value">{node.value}</span>
                  <span className="tree-node-index">#{node.id}</span>
                </div>
              );
            })}
          </div>

          {(currentSnapshot?.treeState.length ?? 0) === 0 ? <p className="array-preview bst-empty">{t('module.t02.empty')}</p> : null}
        </div>
      </VisualizationCanvas>

      <div className="legend-row">
        <span className="legend-item legend-visiting">{t('module.s01.highlight.comparing')}</span>
        <span className="legend-item legend-matched">{t('module.sr01.highlight.found')}</span>
        <span className="legend-item legend-moving">{t('module.t02.legend.newNode')}</span>
        <span className="legend-item legend-default">{t('module.t02.legend.path')}</span>
      </div>

      <p>
        {t('module.s01.highlight')}:{' '}
        {(currentSnapshot?.highlights ?? [])
          .map((entry) => `${entry.index}:${getHighlightLabel(entry.type, t)}`)
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
          <li className={currentSnapshot?.codeLines.includes(1) ? 'code-active' : ''}>{t('module.t02.code.line1')}</li>
          <li className={currentSnapshot?.codeLines.includes(2) ? 'code-active' : ''}>{t('module.t02.code.line2')}</li>
          <li className={currentSnapshot?.codeLines.includes(3) ? 'code-active' : ''}>{t('module.t02.code.line3')}</li>
          <li className={currentSnapshot?.codeLines.includes(4) ? 'code-active' : ''}>{t('module.t02.code.line4')}</li>
          <li className={currentSnapshot?.codeLines.includes(5) ? 'code-active' : ''}>{t('module.t02.code.line5')}</li>
          <li className={currentSnapshot?.codeLines.includes(6) ? 'code-active' : ''}>{t('module.t02.code.line6')}</li>
          <li className={currentSnapshot?.codeLines.includes(7) ? 'code-active' : ''}>{t('module.t02.code.line7')}</li>
          <li className={currentSnapshot?.codeLines.includes(8) ? 'code-active' : ''}>{t('module.t02.code.line8')}</li>
          <li className={currentSnapshot?.codeLines.includes(9) ? 'code-active' : ''}>{t('module.t02.code.line9')}</li>
          <li className={currentSnapshot?.codeLines.includes(10) ? 'code-active' : ''}>{t('module.t02.code.line10')}</li>
          <li className={currentSnapshot?.codeLines.includes(11) ? 'code-active' : ''}>{t('module.t02.code.line11')}</li>
          <li className={currentSnapshot?.codeLines.includes(12) ? 'code-active' : ''}>{t('module.t02.code.line12')}</li>
          <li className={currentSnapshot?.codeLines.includes(13) ? 'code-active' : ''}>{t('module.t02.code.line13')}</li>
          <li className={currentSnapshot?.codeLines.includes(14) ? 'code-active' : ''}>{t('module.t02.code.line14')}</li>
        </ol>
      </div>
    </section>
  );
}
