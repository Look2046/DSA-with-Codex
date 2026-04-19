import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import { getRabinKarpPresetIds, type RabinKarpPresetId, type RabinKarpStep } from '../../modules/string/rabinKarp';
import { buildRabinKarpTimelineFromPreset } from '../../modules/string/rabinKarpTimelineAdapter';
import type { PlaybackStatus } from '../../types/animation';

const DEFAULT_PRESET: RabinKarpPresetId = 'classic';
const CODE_LINE_KEYS = [
  'module.st02.code.line1',
  'module.st02.code.line2',
  'module.st02.code.line3',
  'module.st02.code.line4',
  'module.st02.code.line5',
  'module.st02.code.line6',
  'module.st02.code.line7',
  'module.st02.code.line8',
] as const;
const SPEED_OPTIONS = [
  { key: 'module.s01.speed.slow', value: 1200 },
  { key: 'module.s01.speed.normal', value: 700 },
  { key: 'module.s01.speed.fast', value: 350 },
] as const;

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

function getPresetLabel(presetId: RabinKarpPresetId, t: TranslateFn): string {
  return presetId === 'classic' ? t('module.st02.preset.classic') : t('module.st02.preset.collision');
}

function getPhaseLabel(step: RabinKarpStep | undefined, t: TranslateFn): string {
  if (!step) {
    return '-';
  }

  switch (step.phase) {
    case 'setup':
      return t('module.st02.phase.setup');
    case 'scan':
      return t('module.st02.phase.scan');
    case 'verify':
      return t('module.st02.phase.verify');
    case 'completed':
      return t('playback.status.completed');
    default:
      return '-';
  }
}

function getStepDescription(step: RabinKarpStep | undefined, t: TranslateFn): string {
  if (!step) {
    return '-';
  }

  switch (step.action) {
    case 'initial':
      return t('module.st02.step.initial');
    case 'hashPattern':
      return t('module.st02.step.hashPattern');
    case 'hashWindow':
      return t('module.st02.step.hashWindow');
    case 'compareHash':
      return t('module.st02.step.compareHash');
    case 'verifyChar':
      return t('module.st02.step.verifyChar');
    case 'shiftWindow':
      return t('module.st02.step.shiftWindow');
    case 'matchFound':
      return t('module.st02.step.matchFound');
    case 'completed':
      return t('module.st02.step.completed');
    default:
      return '-';
  }
}

function getOutcomeLabel(step: RabinKarpStep | undefined, t: TranslateFn): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'matchFound') {
    return t('module.st02.outcome.matchFound');
  }
  if (step.action === 'verifyChar' && step.collision) {
    return t('module.st02.outcome.collision');
  }
  if (step.action === 'verifyChar') {
    return t('module.st02.outcome.verify');
  }
  if (step.action === 'compareHash') {
    return step.hashMatched ? t('module.st02.outcome.hashMatched') : t('module.st02.outcome.hashMissed');
  }
  if (step.action === 'shiftWindow') {
    return t('module.st02.outcome.shifted');
  }
  if (step.action === 'completed') {
    return t('module.st02.outcome.completed');
  }

  return t('module.st02.outcome.pending');
}

function getStringCellClass({
  isActive,
  isWindow,
  isVerified,
  isFound,
  isCollision,
}: {
  isActive: boolean;
  isWindow: boolean;
  isVerified: boolean;
  isFound: boolean;
  isCollision: boolean;
}): string {
  const classes = ['string-cell'];

  if (isWindow) {
    classes.push('string-cell-window');
  }
  if (isVerified) {
    classes.push('string-cell-verified');
  }
  if (isFound) {
    classes.push('string-cell-found');
  }
  if (isActive) {
    classes.push('string-cell-active');
  }
  if (isCollision) {
    classes.push('string-cell-collision');
  }

  return classes.join(' ');
}

export function RabinKarpPage() {
  const { t } = useI18n();
  const [presetId, setPresetId] = useState<RabinKarpPresetId>(DEFAULT_PRESET);
  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildRabinKarpTimelineFromPreset(presetId), [presetId]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const codeLines = useMemo(() => CODE_LINE_KEYS.map((key) => t(key)), [t]);
  const presetOptions = useMemo(() => getRabinKarpPresetIds(), []);

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  const textChars = currentSnapshot?.text.split('') ?? [];
  const patternChars = currentSnapshot?.pattern.split('') ?? [];
  const windowStart = currentSnapshot?.windowStart ?? 0;
  const verificationIndex = currentSnapshot?.verificationIndex ?? null;
  const verifiedPrefixLength = currentSnapshot?.verifiedPrefixLength ?? 0;
  const matchStarts = currentSnapshot?.matches ?? [];
  const patternLength = patternChars.length;
  const currentWindowText =
    currentSnapshot?.text.slice(windowStart, windowStart + patternLength) ?? '';
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;

  const focusPoint = useMemo(() => {
    if (textChars.length === 0 || patternLength === 0) {
      return null;
    }

    const activeIndex =
      verificationIndex !== null ? windowStart + verificationIndex : windowStart + Math.max((patternLength - 1) / 2, 0);

    return {
      x: ((activeIndex + 0.5) / textChars.length) * 100,
      y: 28,
    };
  }, [patternLength, textChars.length, verificationIndex, windowStart]);

  return (
    <WorkspaceShell
      pageClassName="array-page tree-page bst-page"
      title={t('module.st02.title')}
      description={t('module.st02.body')}
      stageAriaLabel={t('module.st02.stage')}
      stageClassName="string-stage"
      stageBodyClassName="workspace-stage-body-tree"
      controlsPanelClassName="workspace-drawer-xl workspace-drawer-scroll"
      stepPanelClassName="workspace-context-sheet-wide workspace-context-sheet-rich"
      defaultControlsPanelSize={{ width: 332, height: 560 }}
      defaultContextPanelSize={{ width: 320, height: 560 }}
      focusPoint={focusPoint}
      stageMeta={
        <>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('playback.status')}: {getStatusLabel(status, t)}
          </span>
          <span className="tree-workspace-pill">
            {t('module.st02.meta.phase')}: {getPhaseLabel(currentSnapshot, t)}
          </span>
          <span className="tree-workspace-pill">
            {t('module.st02.meta.windowStart')}: {windowStart}
          </span>
          <span className="tree-workspace-pill">
            {t('module.st02.meta.matches')}: {matchStarts.length}
          </span>
          <span className="tree-workspace-pill">{getStepDescription(currentSnapshot, t)}</span>
        </>
      }
      controlsContent={
        <>
          <div className="tree-workspace-field">
            <span>{t('module.st02.input.preset')}</span>
            <div className="tree-workspace-toggle-row">
              {presetOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`tree-workspace-toggle${presetId === option ? ' tree-workspace-toggle-active' : ''}`}
                  onClick={() => {
                    setPresetId(option);
                    reset();
                  }}
                >
                  {getPresetLabel(option, t)}
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
            <span>{t('module.st02.sample.text')}</span>
            <code>{currentSnapshot?.text ?? ''}</code>
          </div>

          <div className="tree-workspace-sample-block">
            <span>{t('module.st02.sample.pattern')}</span>
            <code>{currentSnapshot?.pattern ?? ''}</code>
          </div>

          <div className="string-hash-grid">
            <div className="string-hash-card">
              <span>{t('module.st02.meta.base')}</span>
              <strong>{currentSnapshot?.base ?? '-'}</strong>
            </div>
            <div className="string-hash-card">
              <span>{t('module.st02.meta.mod')}</span>
              <strong>{currentSnapshot?.mod ?? '-'}</strong>
            </div>
          </div>
        </>
      }
      stepContent={
        <>
          <div className="tree-workspace-step-copy">
            <h3>{getStepDescription(currentSnapshot, t)}</h3>
            <p>
              {`${t('module.st02.meta.matches')}: ${matchStarts.length} · ${t('module.st02.meta.scanned')}: ${
                currentSnapshot?.scannedWindowCount ?? 0
              }/${currentSnapshot?.totalWindows ?? 0}`}
            </p>
          </div>

          <dl className="tree-workspace-kv">
            <div>
              <dt>{t('playback.status')}</dt>
              <dd>{getStatusLabel(status, t)}</dd>
            </div>
            <div>
              <dt>{t('module.st02.meta.phase')}</dt>
              <dd>{getPhaseLabel(currentSnapshot, t)}</dd>
            </div>
            <div>
              <dt>{t('module.st02.meta.windowStart')}</dt>
              <dd>{windowStart}</dd>
            </div>
            <div>
              <dt>{t('module.st02.meta.patternHash')}</dt>
              <dd>{currentSnapshot?.patternHash ?? '-'}</dd>
            </div>
            <div>
              <dt>{t('module.st02.meta.windowHash')}</dt>
              <dd>{currentSnapshot?.windowHash ?? '-'}</dd>
            </div>
            <div>
              <dt>{t('module.st02.meta.basePower')}</dt>
              <dd>{currentSnapshot?.basePower ?? '-'}</dd>
            </div>
            <div>
              <dt>{t('module.st02.meta.verifyIndex')}</dt>
              <dd>{verificationIndex ?? '-'}</dd>
            </div>
            <div>
              <dt>{t('module.st02.meta.verified')}</dt>
              <dd>{verifiedPrefixLength}</dd>
            </div>
            <div>
              <dt>{t('module.st02.meta.outgoing')}</dt>
              <dd>{currentSnapshot?.outgoingChar ?? '-'}</dd>
            </div>
            <div>
              <dt>{t('module.st02.meta.incoming')}</dt>
              <dd>{currentSnapshot?.incomingChar ?? '-'}</dd>
            </div>
            <div>
              <dt>{t('module.st02.meta.outcome')}</dt>
              <dd>{getOutcomeLabel(currentSnapshot, t)}</dd>
            </div>
            <div>
              <dt>{t('module.st02.meta.matches')}</dt>
              <dd>{matchStarts.join(', ') || '-'}</dd>
            </div>
          </dl>

          <div className="tree-workspace-code-block">
            <span className="tree-workspace-code-title">{t('module.st02.code.title')}</span>
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
        <div className="string-stage-scene">
          <section className="string-stage-card">
            <div className="string-stage-head">
              <strong>{t('module.st02.view.scan')}</strong>
              <span>{t('module.st02.view.scanHint')}</span>
            </div>

            <div className="string-track">
              <span className="string-track-label">{t('module.st02.view.text')}</span>
              <div className="string-track-cells">
                {textChars.map((char, index) => {
                  const isWindow = index >= windowStart && index < windowStart + patternLength;
                  const localIndex = index - windowStart;
                  const isVerified = verificationIndex !== null && localIndex >= 0 && localIndex < verifiedPrefixLength;
                  const isActive = verificationIndex !== null && localIndex === verificationIndex;
                  const isCollision = currentSnapshot?.action === 'verifyChar' && currentSnapshot.collision && isActive;
                  const isFound = matchStarts.some(
                    (start) => index >= start && index < start + patternLength,
                  );

                  return (
                    <span
                      key={`text-${index}`}
                      className={getStringCellClass({ isActive, isWindow, isVerified, isFound, isCollision })}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="string-track">
              <span className="string-track-label">{t('module.st02.view.pattern')}</span>
              <div className="string-track-cells">
                {textChars.map((_, slotIndex) => {
                  const patternSlot = slotIndex - windowStart;
                  const char = patternSlot >= 0 && patternSlot < patternChars.length ? patternChars[patternSlot] : '';
                  const isWindow = char !== '';
                  const isVerified = char !== '' && patternSlot >= 0 && patternSlot < verifiedPrefixLength;
                  const isActive = char !== '' && verificationIndex !== null && patternSlot === verificationIndex;
                  const isCollision = currentSnapshot?.action === 'verifyChar' && currentSnapshot.collision && isActive;
                  const isFound = currentSnapshot?.action === 'matchFound' && char !== '';

                  return (
                    <span
                      key={`pattern-slot-${slotIndex}`}
                      className={getStringCellClass({ isActive, isWindow, isVerified, isFound, isCollision })}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="string-stage-card">
            <div className="string-stage-head">
              <strong>{t('module.st02.view.hash')}</strong>
              <span>{t('module.st02.view.hashHint')}</span>
            </div>

            <div className="string-hash-grid">
              <div className="string-hash-card">
                <span>{t('module.st02.meta.patternHash')}</span>
                <strong>{currentSnapshot?.patternHash ?? '-'}</strong>
              </div>
              <div className="string-hash-card">
                <span>{t('module.st02.meta.windowHash')}</span>
                <strong>{currentSnapshot?.windowHash ?? '-'}</strong>
              </div>
              <div className="string-hash-card">
                <span>{t('module.st02.meta.window')}</span>
                <strong>{currentWindowText || '-'}</strong>
              </div>
              <div className="string-hash-card">
                <span>{t('module.st02.meta.outcome')}</span>
                <strong>{getOutcomeLabel(currentSnapshot, t)}</strong>
              </div>
            </div>

            <div className="string-scan-progress">
              <span className="graph-floyd-chip">
                {t('module.st02.meta.scanned')}: {currentSnapshot?.scannedWindowCount ?? 0}/{currentSnapshot?.totalWindows ?? 0}
              </span>
              <span className="graph-floyd-chip">
                {t('module.st02.meta.basePower')}: {currentSnapshot?.basePower ?? '-'}
              </span>
              <span className="graph-floyd-chip">
                {t('module.st02.meta.outgoing')}: {currentSnapshot?.outgoingChar ?? '-'}
              </span>
              <span className="graph-floyd-chip">
                {t('module.st02.meta.incoming')}: {currentSnapshot?.incomingChar ?? '-'}
              </span>
            </div>
          </section>

          <section className="string-stage-card">
            <div className="string-stage-head">
              <strong>{t('module.st02.view.matches')}</strong>
              <span>{t('module.st02.view.matchesHint')}</span>
            </div>

            <div className="string-match-row">
              {matchStarts.length > 0 ? (
                matchStarts.map((start) => (
                  <span key={`match-${start}`} className="graph-floyd-chip">
                    {start}
                  </span>
                ))
              ) : (
                <span className="string-empty-copy">{t('module.st02.view.matchesEmpty')}</span>
              )}
            </div>
          </section>
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
        <>
          <span className="tree-workspace-transport-chip">
            {t('module.st02.meta.phase')}: {getPhaseLabel(currentSnapshot, t)}
          </span>
          <span className="tree-workspace-transport-chip">
            {t('module.st02.meta.windowStart')}: {windowStart}
          </span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {t('module.st02.meta.matches')}: {matchStarts.length}
          </span>
        </>
      }
    />
  );
}
