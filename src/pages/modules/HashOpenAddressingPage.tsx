import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import type { TranslationKey } from '../../i18n/translations';
import {
  getHashOpenAddressingOperationConfig,
  getHashOpenAddressingOperationIds,
  getOpenAddressingIndex,
  type HashOpenAddressingAction,
  type HashOpenAddressingOperationId,
} from '../../modules/hash/hashOpenAddressing';
import { buildHashOpenAddressingTimelineFromOperation } from '../../modules/hash/hashOpenAddressingTimelineAdapter';
import type { PlaybackStatus } from '../../types/animation';

const DEFAULT_OPERATION: HashOpenAddressingOperationId = 'insert';
const SPEED_OPTIONS = [
  { key: 'module.s01.speed.slow', value: 1200 },
  { key: 'module.s01.speed.normal', value: 700 },
  { key: 'module.s01.speed.fast', value: 350 },
] as const;

const CODE_LINE_KEYS: Record<HashOpenAddressingOperationId, readonly TranslationKey[]> = {
  insert: [
    'module.h02.code.insert.line1',
    'module.h02.code.insert.line2',
    'module.h02.code.insert.line3',
    'module.h02.code.insert.line4',
    'module.h02.code.insert.line5',
    'module.h02.code.insert.line6',
  ],
  search: [
    'module.h02.code.search.line1',
    'module.h02.code.search.line2',
    'module.h02.code.search.line3',
    'module.h02.code.search.line4',
    'module.h02.code.search.line5',
    'module.h02.code.search.line6',
    'module.h02.code.search.line7',
  ],
  delete: [
    'module.h02.code.delete.line1',
    'module.h02.code.delete.line2',
    'module.h02.code.delete.line3',
    'module.h02.code.delete.line4',
    'module.h02.code.delete.line5',
    'module.h02.code.delete.line6',
    'module.h02.code.delete.line7',
  ],
};

type TranslateFn = ReturnType<typeof useI18n>['t'];

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

function getActionLabel(action: HashOpenAddressingAction | undefined, t: TranslateFn): string {
  if (!action) {
    return '-';
  }
  return t(`module.h02.step.${action}` as const);
}

function formatLoadFactor(value: number): string {
  return value.toFixed(2);
}

export function HashOpenAddressingPage() {
  const { t } = useI18n();
  const [operation, setOperation] = useState<HashOpenAddressingOperationId>(DEFAULT_OPERATION);
  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildHashOpenAddressingTimelineFromOperation(operation), [operation]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const config = useMemo(() => getHashOpenAddressingOperationConfig(operation), [operation]);
  const codeLines = useMemo(() => CODE_LINE_KEYS[operation].map((key) => t(key)), [operation, t]);
  const operationOptions = useMemo(() => getHashOpenAddressingOperationIds(), []);

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  const homeIndex =
    currentSnapshot?.homeIndex ?? getOpenAddressingIndex(currentSnapshot?.targetKey ?? config.targetKey);
  const probeText =
    (currentSnapshot?.probeSequence.length ?? 0) > 0 ? currentSnapshot?.probeSequence.join(' -> ') ?? '-' : '-';
  const occupiedCount = currentSnapshot?.slots.filter((value) => value !== null).length ?? 0;
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;
  const detailParts = [
    `${t('module.h02.meta.home')}: ${homeIndex}`,
    `${t('module.h02.meta.index')}: ${currentSnapshot?.activeIndex ?? '-'}`,
    `${t('module.h02.meta.loadFactor')}: ${formatLoadFactor(currentSnapshot?.loadFactor ?? 0)}`,
  ];

  if (probeText !== '-') {
    detailParts.push(`${t('module.h02.meta.probePath')}: ${probeText}`);
  }

  return (
    <WorkspaceShell
      pageClassName="array-page tree-page bst-page"
      title={t('module.h02.title')}
      description={t('module.h02.body')}
      stageAriaLabel={t('module.h02.stage')}
      stageClassName="bst-stage hash-stage"
      stageBodyClassName="workspace-stage-body-tree"
      controlsPanelClassName="workspace-drawer-xl workspace-drawer-scroll"
      stepPanelClassName="workspace-context-sheet-wide workspace-context-sheet-rich"
      defaultControlsPanelSize={{ width: 332, height: 560 }}
      defaultContextPanelSize={{ width: 320, height: 560 }}
      stageMeta={
        <>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('playback.status')}: {getStatusLabel(status, t)}
          </span>
          <span className="tree-workspace-pill">
            {t('module.h02.meta.mode')}: {t(config.titleKey)}
          </span>
          <span className="tree-workspace-pill">
            {t('module.h02.meta.home')}: {homeIndex}
          </span>
          <span className="tree-workspace-pill">
            {t('module.h02.meta.loadFactor')}: {formatLoadFactor(currentSnapshot?.loadFactor ?? 0)}
          </span>
          <span className="tree-workspace-pill">{getActionLabel(currentSnapshot?.action, t)}</span>
        </>
      }
      controlsContent={
        <>
          <div className="tree-workspace-field">
            <span>{t('module.h02.input.operation')}</span>
            <div className="tree-workspace-toggle-row">
              {operationOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`tree-workspace-toggle${operation === option ? ' tree-workspace-toggle-active' : ''}`}
                  onClick={() => {
                    setOperation(option);
                    reset();
                  }}
                >
                  {t(getHashOpenAddressingOperationConfig(option).titleKey)}
                </button>
              ))}
            </div>
          </div>

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

          <div className="tree-workspace-sample-block">
            <span>{t('module.h02.sample.hashRule')}</span>
            <code>{t('module.h02.sample.hashRuleValue')}</code>
          </div>

          <div className="tree-workspace-sample-block">
            <span>{t('module.h02.sample.dataset')}</span>
            <code>{config.keys.join(', ')}</code>
          </div>

          <div className="tree-workspace-sample-block">
            <span>{t('module.h02.sample.summary')}</span>
            <code>{t(config.summaryKey)}</code>
          </div>
        </>
      }
      stepContent={
        <>
          <div className="tree-workspace-step-copy">
            <h3>{getActionLabel(currentSnapshot?.action, t)}</h3>
            <p>{detailParts.join(' · ')}</p>
          </div>

          <dl className="tree-workspace-kv">
            <div>
              <dt>{t('playback.status')}</dt>
              <dd>{getStatusLabel(status, t)}</dd>
            </div>
            <div>
              <dt>{t('module.h02.meta.mode')}</dt>
              <dd>{t(config.titleKey)}</dd>
            </div>
            <div>
              <dt>{t('module.h02.meta.key')}</dt>
              <dd>{currentSnapshot?.activeKey ?? config.targetKey}</dd>
            </div>
            <div>
              <dt>{t('module.h02.meta.target')}</dt>
              <dd>{currentSnapshot?.targetKey ?? config.targetKey}</dd>
            </div>
            <div>
              <dt>{t('module.h02.meta.home')}</dt>
              <dd>{homeIndex}</dd>
            </div>
            <div>
              <dt>{t('module.h02.meta.index')}</dt>
              <dd>{currentSnapshot?.activeIndex ?? '-'}</dd>
            </div>
            <div>
              <dt>{t('module.h02.meta.probePath')}</dt>
              <dd>{probeText}</dd>
            </div>
            <div>
              <dt>{t('module.h02.meta.occupied')}</dt>
              <dd>
                {occupiedCount}/{currentSnapshot?.tableSize ?? 0}
              </dd>
            </div>
            <div>
              <dt>{t('module.h02.meta.loadFactor')}</dt>
              <dd>{formatLoadFactor(currentSnapshot?.loadFactor ?? 0)}</dd>
            </div>
            <div>
              <dt>{t('module.h02.meta.found')}</dt>
              <dd>
                {currentSnapshot?.found === null
                  ? '-'
                  : currentSnapshot.found
                    ? t('module.h02.meta.foundYes')
                    : t('module.h02.meta.foundNo')}
              </dd>
            </div>
          </dl>

          <div className="tree-workspace-code-block">
            <span className="tree-workspace-code-title">{t('module.h02.code.title')}</span>
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
        currentSnapshot ? (
          <div className="hash-stage-scene" aria-hidden="true">
            <section className="hash-stage-card">
              <div className="hash-stage-card-head">
                <strong>{t('module.h02.view.hashRule')}</strong>
                <span>{t('module.h02.view.hashHint')}</span>
              </div>

              <div className="hash-summary-grid">
                <div className="hash-summary-tile">
                  <span>{t('module.h02.meta.key')}</span>
                  <strong>{currentSnapshot.activeKey ?? config.targetKey}</strong>
                </div>
                <div className="hash-summary-tile">
                  <span>{t('module.h02.meta.home')}</span>
                  <strong>{homeIndex}</strong>
                </div>
                <div className="hash-summary-tile">
                  <span>{t('module.h02.meta.index')}</span>
                  <strong>{currentSnapshot.activeIndex ?? '-'}</strong>
                </div>
              </div>

              <div className="hash-formula-strip">
                <span className="hash-formula-chip">
                  {currentSnapshot.activeKey ?? config.targetKey} % {currentSnapshot.tableSize} = {homeIndex}
                </span>
                <span className="hash-formula-chip">{t(config.summaryKey)}</span>
              </div>
            </section>

            <section className="hash-stage-card">
              <div className="hash-stage-card-head">
                <strong>{t('module.h02.view.table')}</strong>
                <span>{t('module.h02.view.tableHint')}</span>
              </div>

              <div className="hash-array-grid">
                {currentSnapshot.slots.map((value, index) => {
                  const isActive = currentSnapshot.activeIndex === index;
                  const isHome = currentSnapshot.homeIndex === index;
                  const isTombstone = currentSnapshot.tombstoneIndices.includes(index);
                  const isProbed = currentSnapshot.probeSequence.includes(index);

                  return (
                    <div
                      key={`slot-${index}`}
                      className={`hash-array-cell${isActive ? ' hash-array-cell-active' : ''}${
                        isHome ? ' hash-array-cell-home' : ''
                      }${isTombstone ? ' hash-array-cell-tombstone' : ''}${isProbed ? ' hash-array-cell-probed' : ''}`}
                    >
                      <span className="hash-array-cell-index">[{index}]</span>
                      <strong className="hash-array-cell-value">
                        {isTombstone ? t('module.h02.slot.tombstone') : value ?? t('module.h02.slot.empty')}
                      </strong>
                    </div>
                  );
                })}
              </div>

              <div className="hash-probe-strip">
                <span className="hash-probe-label">{t('module.h02.meta.probePath')}</span>
                <div className="hash-probe-list">
                  {currentSnapshot.probeSequence.length === 0 ? (
                    <span className="hash-empty-chip">{t('module.h02.probe.empty')}</span>
                  ) : (
                    currentSnapshot.probeSequence.map((index, sequenceIndex) => (
                      <span
                        key={`${index}-${sequenceIndex}`}
                        className={`hash-probe-chip${currentSnapshot.activeIndex === index ? ' hash-probe-chip-active' : ''}`}
                      >
                        {index}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        ) : null
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
        <>
          <span className="tree-workspace-transport-chip">
            {t('module.h02.meta.mode')}: {t(config.titleKey)}
          </span>
          <span className="tree-workspace-transport-chip">
            {t('module.h02.meta.home')}: {homeIndex}
          </span>
          <span className="tree-workspace-transport-chip">
            {t('module.h02.meta.loadFactor')}: {formatLoadFactor(currentSnapshot?.loadFactor ?? 0)}
          </span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {t('module.h02.meta.probePath')}: {probeText}
          </span>
        </>
      }
    />
  );
}
