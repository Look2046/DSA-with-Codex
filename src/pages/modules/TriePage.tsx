import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import { buildTrieTimelineFromInput } from '../../modules/tree/trieTimelineAdapter';
import type { TrieOutcome, TriePhase, TrieStep } from '../../modules/tree/trie';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

type TriePreset = {
  key: 'classic' | 'overlap';
  seedWords: string[];
  insertWord: string;
  queryWord: string;
};

type TrieConfig = {
  seedWords: string[];
  insertWord: string;
  queryWord: string;
};

const PRESETS: TriePreset[] = [
  {
    key: 'classic',
    seedWords: ['to', 'tea', 'ted', 'ten'],
    insertWord: 'team',
    queryWord: 'tea',
  },
  {
    key: 'overlap',
    seedWords: ['ape', 'apple', 'apt'],
    insertWord: 'bat',
    queryWord: 'bad',
  },
] ;
const CODE_LINE_KEYS = [
  'module.t06.code.line1',
  'module.t06.code.line2',
  'module.t06.code.line3',
  'module.t06.code.line4',
  'module.t06.code.line5',
  'module.t06.code.line6',
  'module.t06.code.line7',
  'module.t06.code.line8',
  'module.t06.code.line9',
  'module.t06.code.line10',
] as const;
const SPEED_OPTIONS = [
  { key: 'module.s01.speed.slow', value: 1200 },
  { key: 'module.s01.speed.normal', value: 700 },
  { key: 'module.s01.speed.fast', value: 350 },
] as const;

type PresetKey = TriePreset['key'];
type TranslateFn = ReturnType<typeof useI18n>['t'];

function formatWords(words: string[]): string {
  return words.join(', ');
}

function isValidWord(value: string): boolean {
  return /^[a-z]{1,8}$/.test(value.trim().toLowerCase());
}

function getPresetByKey(key: PresetKey) {
  return PRESETS.find((preset) => preset.key === key) ?? PRESETS[0];
}

function getStatusLabel(status: PlaybackStatus, t: TranslateFn): string {
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

function getPhaseLabel(phase: TriePhase, t: TranslateFn): string {
  return phase === 'insert' ? t('module.t06.phase.insert') : t('module.t06.phase.search');
}

function getPresetLabel(presetKey: PresetKey, t: TranslateFn): string {
  return presetKey === 'classic' ? t('module.t06.preset.classic') : t('module.t06.preset.overlap');
}

function getOutcomeLabel(outcome: TrieOutcome, t: TranslateFn): string {
  if (outcome === 'inserted') {
    return t('module.t06.outcome.inserted');
  }
  if (outcome === 'found') {
    return t('module.t06.outcome.found');
  }
  if (outcome === 'notFound') {
    return t('module.t06.outcome.notFound');
  }
  if (outcome === 'duplicate') {
    return t('module.t06.outcome.duplicate');
  }
  return t('module.t06.outcome.ongoing');
}

function getStepDescription(step: TrieStep | undefined, t: TranslateFn): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'initial') {
    return t('module.t06.step.initial');
  }
  if (step.action === 'insertVisit') {
    return t('module.t06.step.insertVisit');
  }
  if (step.action === 'insertCreate') {
    return t('module.t06.step.insertCreate');
  }
  if (step.action === 'insertReuse') {
    return t('module.t06.step.insertReuse');
  }
  if (step.action === 'markTerminal') {
    return t('module.t06.step.markTerminal');
  }
  if (step.action === 'searchStart') {
    return t('module.t06.step.searchStart');
  }
  if (step.action === 'searchVisit') {
    return t('module.t06.step.searchVisit');
  }
  if (step.action === 'searchHit') {
    return t('module.t06.step.searchHit');
  }
  if (step.action === 'searchMiss') {
    return t('module.t06.step.searchMiss');
  }
  return t('module.t06.step.completed');
}

export function TriePage() {
  const { t } = useI18n();
  const [presetKey, setPresetKey] = useState<PresetKey>(PRESETS[0].key);
  const [insertInput, setInsertInput] = useState<string>(PRESETS[0].insertWord);
  const [queryInput, setQueryInput] = useState<string>(PRESETS[0].queryWord);
  const [error, setError] = useState('');
  const [activeConfig, setActiveConfig] = useState<TrieConfig>(() => ({
    seedWords: PRESETS[0].seedWords,
    insertWord: PRESETS[0].insertWord,
    queryWord: PRESETS[0].queryWord,
  }));

  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(
    () => buildTrieTimelineFromInput(activeConfig.seedWords, activeConfig.insertWord, activeConfig.queryWord),
    [activeConfig],
  );
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  const nodeMap = useMemo(
    () => new Map((currentSnapshot?.nodes ?? []).map((node) => [node.id, node])),
    [currentSnapshot?.nodes],
  );

  const positionMap = useMemo(() => {
    const positions = new Map<number, { x: number; y: number }>();
    if (!currentSnapshot) {
      return positions;
    }

    const leafCount = (nodeId: number): number => {
      const node = nodeMap.get(nodeId);
      if (!node || node.children.length === 0) {
        return 1;
      }
      return node.children.reduce((sum, childId) => sum + leafCount(childId), 0);
    };

    const maxDepth = currentSnapshot.nodes.reduce((max, node) => Math.max(max, node.depth), 0);
    const yStep = maxDepth > 0 ? 72 / maxDepth : 0;

    const placeNode = (nodeId: number, depth: number, minX: number, maxX: number) => {
      const node = nodeMap.get(nodeId);
      if (!node) {
        return;
      }

      positions.set(nodeId, { x: (minX + maxX) / 2, y: 12 + depth * yStep });
      if (node.children.length === 0) {
        return;
      }

      const totalLeaves = node.children.reduce((sum, childId) => sum + leafCount(childId), 0);
      let offset = minX;
      node.children.forEach((childId) => {
        const childLeaves = leafCount(childId);
        const width = ((maxX - minX) * childLeaves) / totalLeaves;
        placeNode(childId, depth + 1, offset, offset + width);
        offset += width;
      });
    };

    placeNode(currentSnapshot.rootId, 0, 4, 96);
    return positions;
  }, [currentSnapshot, nodeMap]);

  const edges = useMemo(() => {
    if (!currentSnapshot) {
      return [] as Array<{ from: number; to: number }>;
    }
    return currentSnapshot.nodes.flatMap((node) => node.children.map((childId) => ({ from: node.id, to: childId })));
  }, [currentSnapshot]);

  const highlightMap = useMemo(() => {
    const map = new Map<number, HighlightType>();
    (currentSnapshot?.highlights ?? []).forEach((entry) => {
      map.set(entry.index, entry.type);
    });
    return map;
  }, [currentSnapshot?.highlights]);

  const pathSet = useMemo(() => new Set(currentSnapshot?.pathIds ?? []), [currentSnapshot?.pathIds]);
  const codeLines = useMemo(() => CODE_LINE_KEYS.map((key) => t(key)), [t]);
  const currentOutcomeLabel = getOutcomeLabel(currentSnapshot?.outcome ?? 'ongoing', t);
  const currentPhaseLabel = getPhaseLabel(currentSnapshot?.phase ?? 'insert', t);
  const currentStepDescription = getStepDescription(currentSnapshot, t);
  const focusPoint =
    currentSnapshot?.currentId === null || currentSnapshot?.currentId === undefined
      ? null
      : (positionMap.get(currentSnapshot.currentId) ?? null);
  const currentPathChars = useMemo(
    () =>
      (currentSnapshot?.pathIds ?? [])
        .map((nodeId) => nodeMap.get(nodeId))
        .filter((node): node is NonNullable<typeof node> => Boolean(node))
        .map((node) => (node.char === '' ? 'ROOT' : node.char.toUpperCase())),
    [currentSnapshot?.pathIds, nodeMap],
  );
  const currentNodeLabel =
    currentSnapshot?.currentId !== null && currentSnapshot?.currentId !== undefined
      ? (nodeMap.get(currentSnapshot.currentId)?.char || 'ROOT')
      : 'ROOT';
  const matchedWord = currentSnapshot?.matchedWord ?? '-';
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;

  const applyPreset = (nextPresetKey: PresetKey) => {
    const preset = getPresetByKey(nextPresetKey);
    setPresetKey(nextPresetKey);
    setInsertInput(preset.insertWord);
    setQueryInput(preset.queryWord);
    setActiveConfig({
      seedWords: preset.seedWords,
      insertWord: preset.insertWord,
      queryWord: preset.queryWord,
    });
    setError('');
    reset();
  };

  const handleApply = () => {
    const insertWord = insertInput.trim().toLowerCase();
    const queryWord = queryInput.trim().toLowerCase();

    if (!isValidWord(insertWord)) {
      setError(t('module.t06.error.insert'));
      return;
    }
    if (!isValidWord(queryWord)) {
      setError(t('module.t06.error.query'));
      return;
    }

    const preset = getPresetByKey(presetKey);
    setActiveConfig({
      seedWords: preset.seedWords,
      insertWord,
      queryWord,
    });
    setError('');
    reset();
  };

  return (
    <WorkspaceShell
      pageClassName="array-page tree-page bst-page"
      title={t('module.t06.title')}
      description={t('module.t06.body')}
      stageAriaLabel={t('module.t06.stage')}
      stageClassName="bst-stage trie-stage"
      stageBodyClassName="workspace-stage-body-tree"
      controlsPanelClassName="workspace-drawer-xl workspace-drawer-scroll"
      stepPanelClassName="workspace-context-sheet-wide workspace-context-sheet-rich"
      defaultControlsPanelSize={{ width: 332, height: 600 }}
      defaultContextPanelSize={{ width: 320, height: 560 }}
      focusPoint={focusPoint}
      stageMeta={
        <>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('playback.status')}: {getStatusLabel(status, t)}
          </span>
          <span className="tree-workspace-pill">
            {t('module.t06.meta.phase')}: {currentPhaseLabel}
          </span>
          <span className="tree-workspace-pill">
            {t('module.t06.meta.insert')}: {activeConfig.insertWord}
          </span>
          <span className="tree-workspace-pill">
            {t('module.t06.meta.query')}: {activeConfig.queryWord}
          </span>
          <span className="tree-workspace-pill">
            {t('module.t06.meta.outcome')}: {currentOutcomeLabel}
          </span>
        </>
      }
      controlsContent={
        <>
          <div className="tree-workspace-field">
            <span>{t('module.t06.input.preset')}</span>
            <div className="tree-workspace-toggle-row">
              {PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  className={`tree-workspace-toggle${presetKey === preset.key ? ' tree-workspace-toggle-active' : ''}`}
                  onClick={() => applyPreset(preset.key)}
                >
                  {getPresetLabel(preset.key, t)}
                </button>
              ))}
            </div>
          </div>

          <label className="tree-workspace-field" htmlFor="trie-insert-input">
            <span>{t('module.t06.input.insert')}</span>
            <input
              id="trie-insert-input"
              type="text"
              value={insertInput}
              onChange={(event) => {
                setInsertInput(event.target.value);
                setError('');
                reset();
              }}
            />
          </label>

          <label className="tree-workspace-field" htmlFor="trie-query-input">
            <span>{t('module.t06.input.query')}</span>
            <input
              id="trie-query-input"
              type="text"
              value={queryInput}
              onChange={(event) => {
                setQueryInput(event.target.value);
                setError('');
                reset();
              }}
            />
          </label>

          <div className="tree-workspace-field">
            <span>{t('module.s01.speed')}</span>
            <div className="tree-workspace-toggle-row">
              {SPEED_OPTIONS.map((option) => (
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

          {error ? <p className="form-error workspace-inline-feedback">{error}</p> : null}

          <div className="tree-workspace-drawer-actions">
            <button type="button" className="tree-workspace-ghost-button" onClick={() => applyPreset(presetKey)}>
              {t('module.t06.resetPreset')}
            </button>
            <button type="button" className="tree-workspace-ghost-button" onClick={handleApply}>
              {t('module.t06.apply')}
            </button>
          </div>

          <div className="tree-workspace-sample-block">
            <span>{t('module.t06.seed')}</span>
            <code>{formatWords(activeConfig.seedWords)}</code>
          </div>
        </>
      }
      stepContent={
        <>
          <div className="tree-workspace-step-copy">
            <h3>{currentStepDescription}</h3>
            <p>
              {t('module.t06.meta.phase')}: {currentPhaseLabel} · {t('module.t06.meta.outcome')}: {currentOutcomeLabel}
            </p>
          </div>

          <dl className="tree-workspace-kv">
            <div>
              <dt>{t('playback.status')}</dt>
              <dd>{getStatusLabel(status, t)}</dd>
            </div>
            <div>
              <dt>{t('module.t06.meta.phase')}</dt>
              <dd>{currentPhaseLabel}</dd>
            </div>
            <div>
              <dt>{t('module.t06.meta.insert')}</dt>
              <dd>{activeConfig.insertWord}</dd>
            </div>
            <div>
              <dt>{t('module.t06.meta.query')}</dt>
              <dd>{activeConfig.queryWord}</dd>
            </div>
            <div>
              <dt>{t('module.t06.meta.current')}</dt>
              <dd>{currentNodeLabel === '' ? 'ROOT' : currentNodeLabel.toUpperCase()}</dd>
            </div>
            <div>
              <dt>{t('module.t06.meta.activeChar')}</dt>
              <dd>{currentSnapshot?.activeChar?.toUpperCase() ?? '-'}</dd>
            </div>
            <div>
              <dt>{t('module.t06.meta.match')}</dt>
              <dd>{matchedWord}</dd>
            </div>
            <div>
              <dt>{t('module.t06.meta.outcome')}</dt>
              <dd>{currentOutcomeLabel}</dd>
            </div>
          </dl>

          <div className="tree-workspace-code-block">
            <span className="tree-workspace-code-title">{t('module.t06.code.title')}</span>
            <ol className="tree-workspace-code-list">
              {codeLines.map((line, index) => {
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
        <div className="trie-stage-scene" aria-hidden="true">
          <svg className="tree-edge-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
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

          <div className="tree-node-layer trie-node-layer">
            {(currentSnapshot?.nodes ?? []).map((node) => {
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

              return (
                <div
                  key={node.id}
                  className={`tree-node trie-node${stateClass}${pathClass}${node.char === '' ? ' trie-node-root' : ''}${
                    node.terminal ? ' trie-node-terminal' : ''
                  }`}
                  style={{
                    left: `${positionMap.get(node.id)?.x ?? 0}%`,
                    top: `${positionMap.get(node.id)?.y ?? 0}%`,
                  }}
                >
                  <span className="trie-node-char">{node.char === '' ? 'ROOT' : node.char.toUpperCase()}</span>
                  <span className="tree-node-index">{node.terminal ? t('module.t06.legend.word') : t('module.t06.legend.prefix')}</span>
                  {node.word ? <span className="trie-node-word">{node.word}</span> : null}
                </div>
              );
            })}
          </div>
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
        currentPathChars.length === 0 ? (
          <span className="tree-workspace-transport-empty">{t('module.t06.legend.path')}: -</span>
        ) : (
          <>
            <span className="tree-workspace-transport-empty">{t('module.t06.legend.path')}</span>
            {currentPathChars.map((value, index) => (
              <span
                key={`${value}-${index}`}
                className={`tree-workspace-transport-chip${index === currentPathChars.length - 1 ? ' tree-workspace-transport-chip-active' : ''}`}
              >
                {value}
              </span>
            ))}
          </>
        )
      }
    />
  );
}
