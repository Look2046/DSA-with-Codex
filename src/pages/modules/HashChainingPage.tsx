import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import type { TranslationKey } from '../../i18n/translations';
import {
  getHashChainingOperationConfig,
  getHashChainingOperationIds,
  getHashTableIndex,
  type HashChainingAction,
  type HashChainingOperationId,
} from '../../modules/hash/hashChaining';
import { buildHashChainingTimelineFromOperation } from '../../modules/hash/hashChainingTimelineAdapter';
import type { PlaybackStatus } from '../../types/animation';

const DEFAULT_OPERATION: HashChainingOperationId = 'insert';
const SPEED_OPTIONS = [
  { key: 'module.s01.speed.slow', value: 1200 },
  { key: 'module.s01.speed.normal', value: 700 },
  { key: 'module.s01.speed.fast', value: 350 },
] as const;

const CODE_LINE_KEYS: Record<HashChainingOperationId, readonly TranslationKey[]> = {
  insert: [
    'module.h01.code.insert.line1',
    'module.h01.code.insert.line2',
    'module.h01.code.insert.line3',
    'module.h01.code.insert.line4',
    'module.h01.code.insert.line5',
    'module.h01.code.insert.line6',
  ],
  search: [
    'module.h01.code.search.line1',
    'module.h01.code.search.line2',
    'module.h01.code.search.line3',
    'module.h01.code.search.line4',
    'module.h01.code.search.line5',
    'module.h01.code.search.line6',
  ],
  delete: [
    'module.h01.code.delete.line1',
    'module.h01.code.delete.line2',
    'module.h01.code.delete.line3',
    'module.h01.code.delete.line4',
    'module.h01.code.delete.line5',
    'module.h01.code.delete.line6',
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

function getActionLabel(action: HashChainingAction | undefined, t: TranslateFn): string {
  if (!action) {
    return '-';
  }
  return t(`module.h01.step.${action}` as const);
}

function formatLoadFactor(value: number): string {
  return value.toFixed(2);
}

export function HashChainingPage() {
  const { t } = useI18n();
  const [operation, setOperation] = useState<HashChainingOperationId>(DEFAULT_OPERATION);
  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildHashChainingTimelineFromOperation(operation), [operation]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const config = useMemo(() => getHashChainingOperationConfig(operation), [operation]);
  const codeLines = useMemo(() => CODE_LINE_KEYS[operation].map((key) => t(key)), [operation, t]);
  const operationOptions = useMemo(() => getHashChainingOperationIds(), []);

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  const bucketIndex =
    currentSnapshot?.activeBucketIndex ?? getHashTableIndex(currentSnapshot?.targetKey ?? config.targetKey);
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;
  const inspectedText =
    (currentSnapshot?.inspectedKeys.length ?? 0) > 0 ? currentSnapshot?.inspectedKeys.join(' -> ') ?? '-' : '-';
  const activeChainPosition =
    currentSnapshot?.activeChainIndex !== null && currentSnapshot?.activeChainIndex !== undefined
      ? currentSnapshot.activeChainIndex + 1
      : '-';
  const detailParts = [
    `${t('module.h01.meta.bucket')}: ${bucketIndex}`,
    `${t('module.h01.meta.key')}: ${currentSnapshot?.activeKey ?? config.targetKey}`,
    `${t('module.h01.meta.loadFactor')}: ${formatLoadFactor(currentSnapshot?.loadFactor ?? 0)}`,
  ];

  if (inspectedText !== '-') {
    detailParts.push(`${t('module.h01.meta.chainPath')}: ${inspectedText}`);
  }

  return (
    <WorkspaceShell
      pageClassName="array-page tree-page bst-page"
      title={t('module.h01.title')}
      description={t('module.h01.body')}
      stageAriaLabel={t('module.h01.stage')}
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
            {t('module.h01.meta.mode')}: {t(config.titleKey)}
          </span>
          <span className="tree-workspace-pill">
            {t('module.h01.meta.bucket')}: {bucketIndex}
          </span>
          <span className="tree-workspace-pill">
            {t('module.h01.meta.loadFactor')}: {formatLoadFactor(currentSnapshot?.loadFactor ?? 0)}
          </span>
          <span className="tree-workspace-pill">{getActionLabel(currentSnapshot?.action, t)}</span>
        </>
      }
      controlsContent={
        <>
          <div className="tree-workspace-field">
            <span>{t('module.h01.input.operation')}</span>
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
                  {t(getHashChainingOperationConfig(option).titleKey)}
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
            <span>{t('module.h01.sample.hashRule')}</span>
            <code>{t('module.h01.sample.hashRuleValue')}</code>
          </div>

          <div className="tree-workspace-sample-block">
            <span>{t('module.h01.sample.dataset')}</span>
            <code>{config.keys.join(', ')}</code>
          </div>

          <div className="tree-workspace-sample-block">
            <span>{t('module.h01.sample.summary')}</span>
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
              <dt>{t('module.h01.meta.mode')}</dt>
              <dd>{t(config.titleKey)}</dd>
            </div>
            <div>
              <dt>{t('module.h01.meta.key')}</dt>
              <dd>{currentSnapshot?.activeKey ?? config.targetKey}</dd>
            </div>
            <div>
              <dt>{t('module.h01.meta.target')}</dt>
              <dd>{currentSnapshot?.targetKey ?? config.targetKey}</dd>
            </div>
            <div>
              <dt>{t('module.h01.meta.bucket')}</dt>
              <dd>{bucketIndex}</dd>
            </div>
            <div>
              <dt>{t('module.h01.meta.chainPosition')}</dt>
              <dd>{activeChainPosition}</dd>
            </div>
            <div>
              <dt>{t('module.h01.meta.chainPath')}</dt>
              <dd>{inspectedText}</dd>
            </div>
            <div>
              <dt>{t('module.h01.meta.loadFactor')}</dt>
              <dd>{formatLoadFactor(currentSnapshot?.loadFactor ?? 0)}</dd>
            </div>
            <div>
              <dt>{t('module.h01.meta.found')}</dt>
              <dd>
                {currentSnapshot?.found === null
                  ? '-'
                  : currentSnapshot.found
                    ? t('module.h01.meta.foundYes')
                    : t('module.h01.meta.foundNo')}
              </dd>
            </div>
          </dl>

          <div className="tree-workspace-code-block">
            <span className="tree-workspace-code-title">{t('module.h01.code.title')}</span>
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
                <strong>{t('module.h01.view.hashRule')}</strong>
                <span>{t('module.h01.view.hashHint')}</span>
              </div>

              <div className="hash-summary-grid">
                <div className="hash-summary-tile">
                  <span>{t('module.h01.meta.key')}</span>
                  <strong>{currentSnapshot.activeKey ?? config.targetKey}</strong>
                </div>
                <div className="hash-summary-tile">
                  <span>{t('module.h01.meta.bucket')}</span>
                  <strong>{bucketIndex}</strong>
                </div>
                <div className="hash-summary-tile">
                  <span>{t('module.h01.meta.loadFactor')}</span>
                  <strong>{formatLoadFactor(currentSnapshot.loadFactor)}</strong>
                </div>
              </div>

              <div className="hash-formula-strip">
                <span className="hash-formula-chip">
                  {currentSnapshot.activeKey ?? config.targetKey} % {currentSnapshot.tableSize} = {bucketIndex}
                </span>
                <span className="hash-formula-chip">{t(config.summaryKey)}</span>
              </div>
            </section>

            <section className="hash-stage-card">
              <div className="hash-stage-card-head">
                <strong>{t('module.h01.view.table')}</strong>
                <span>{t('module.h01.view.tableHint')}</span>
              </div>

              <div className="hash-bucket-grid">
                {currentSnapshot.buckets.map((bucket, rowIndex) => {
                  const isActiveBucket = currentSnapshot.activeBucketIndex === rowIndex;

                  return (
                    <div
                      key={`bucket-${rowIndex}`}
                      className={`hash-bucket-row${isActiveBucket ? ' hash-bucket-row-active' : ''}`}
                    >
                      <span className="hash-bucket-label">
                        {t('module.h01.bucket.label')} {rowIndex}
                      </span>
                      <div className="hash-bucket-chain">
                        {bucket.length === 0 ? (
                          <span className="hash-empty-chip">{t('module.h01.bucket.empty')}</span>
                        ) : (
                          bucket.map((value, chainIndex) => {
                            const isActiveNode =
                              isActiveBucket && currentSnapshot.activeChainIndex === chainIndex;
                            const isScanned = currentSnapshot.inspectedKeys.includes(value);

                            return (
                              <span
                                key={`${rowIndex}-${value}-${chainIndex}`}
                                className={`hash-chain-chip${isActiveNode ? ' hash-chain-chip-active' : ''}${
                                  isScanned ? ' hash-chain-chip-scanned' : ''
                                }`}
                              >
                                {value}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
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
            {t('module.h01.meta.mode')}: {t(config.titleKey)}
          </span>
          <span className="tree-workspace-transport-chip">
            {t('module.h01.meta.bucket')}: {bucketIndex}
          </span>
          <span className="tree-workspace-transport-chip">
            {t('module.h01.meta.loadFactor')}: {formatLoadFactor(currentSnapshot?.loadFactor ?? 0)}
          </span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {t('module.h01.meta.chainPath')}: {inspectedText}
          </span>
        </>
      }
    />
  );
}
