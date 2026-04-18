import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import { buildKmpTimelineFromPreset } from '../../modules/string/kmpTimelineAdapter';
import { getKmpPresetIds, type KmpPresetId, type KmpStep } from '../../modules/string/kmp';
import type { PlaybackStatus } from '../../types/animation';

const DEFAULT_PRESET: KmpPresetId = 'classic';
const CODE_LINE_KEYS = [
  'module.st01.code.line1',
  'module.st01.code.line2',
  'module.st01.code.line3',
  'module.st01.code.line4',
  'module.st01.code.line5',
  'module.st01.code.line6',
  'module.st01.code.line7',
  'module.st01.code.line8',
  'module.st01.code.line9',
  'module.st01.code.line10',
  'module.st01.code.line11',
  'module.st01.code.line12',
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

function getPresetLabel(presetId: KmpPresetId, t: TranslateFn): string {
  return presetId === 'classic' ? t('module.st01.preset.classic') : t('module.st01.preset.overlap');
}

function getPhaseLabel(step: KmpStep | undefined, t: TranslateFn): string {
  if (!step) {
    return '-';
  }
  if (step.phase === 'prefix') {
    return t('module.st01.phase.prefix');
  }
  if (step.phase === 'search') {
    return t('module.st01.phase.search');
  }
  return t('playback.status.completed');
}

function getStepDescription(step: KmpStep | undefined, t: TranslateFn): string {
  if (!step) {
    return '-';
  }

  switch (step.action) {
    case 'initial':
      return t('module.st01.step.initial');
    case 'prefixCompare':
      return t('module.st01.step.prefixCompare');
    case 'prefixFallback':
      return t('module.st01.step.prefixFallback');
    case 'prefixWrite':
      return t('module.st01.step.prefixWrite');
    case 'prefixComplete':
      return t('module.st01.step.prefixComplete');
    case 'searchCompare':
      return t('module.st01.step.searchCompare');
    case 'searchAdvance':
      return t('module.st01.step.searchAdvance');
    case 'searchShift':
      return t('module.st01.step.searchShift');
    case 'searchFallback':
      return t('module.st01.step.searchFallback');
    case 'matchFound':
      return t('module.st01.step.matchFound');
    case 'completed':
      return t('module.st01.step.completed');
    default:
      return '-';
  }
}

function getCellClass(isActive: boolean, isMatched: boolean, isFound: boolean): string {
  if (isFound) {
    return 'string-cell string-cell-found';
  }
  if (isActive) {
    return 'string-cell string-cell-active';
  }
  if (isMatched) {
    return 'string-cell string-cell-matched';
  }
  return 'string-cell';
}

export function KmpPage() {
  const { t } = useI18n();
  const [presetId, setPresetId] = useState<KmpPresetId>(DEFAULT_PRESET);
  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildKmpTimelineFromPreset(presetId), [presetId]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const codeLines = useMemo(() => CODE_LINE_KEYS.map((key) => t(key)), [t]);
  const presetOptions = useMemo(() => getKmpPresetIds(), []);

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  const textChars = currentSnapshot?.text.split('') ?? [];
  const patternChars = currentSnapshot?.pattern.split('') ?? [];
  const activeTextIndex = currentSnapshot?.searchTextIndex ?? null;
  const activePatternIndex = currentSnapshot?.searchPatternIndex ?? null;
  const alignmentStart = currentSnapshot?.alignmentStart ?? 0;
  const matchStarts = currentSnapshot?.matches ?? [];
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;

  const focusPoint = useMemo(() => {
    if (textChars.length > 0 && activeTextIndex !== null && activeTextIndex >= 0) {
      return {
        x: ((activeTextIndex + 0.5) / textChars.length) * 100,
        y: 28,
      };
    }
    if (patternChars.length > 0 && currentSnapshot?.prefixIndex !== null) {
      return {
        x: ((currentSnapshot.prefixIndex + 0.5) / patternChars.length) * 100,
        y: 72,
      };
    }
    return null;
  }, [activeTextIndex, currentSnapshot, patternChars.length, textChars.length]);

  return (
    <WorkspaceShell
      pageClassName="array-page tree-page bst-page"
      title={t('module.st01.title')}
      description={t('module.st01.body')}
      stageAriaLabel={t('module.st01.stage')}
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
            {t('module.st01.meta.phase')}: {getPhaseLabel(currentSnapshot, t)}
          </span>
          <span className="tree-workspace-pill">
            {t('module.st01.meta.alignment')}: {alignmentStart}
          </span>
          <span className="tree-workspace-pill">
            {t('module.st01.meta.matches')}: {matchStarts.length}
          </span>
          <span className="tree-workspace-pill">{getStepDescription(currentSnapshot, t)}</span>
        </>
      }
      controlsContent={
        <>
          <div className="tree-workspace-field">
            <span>{t('module.st01.input.preset')}</span>
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
            <span>{t('module.st01.sample.text')}</span>
            <code>{currentSnapshot?.text ?? ''}</code>
          </div>

          <div className="tree-workspace-sample-block">
            <span>{t('module.st01.sample.pattern')}</span>
            <code>{currentSnapshot?.pattern ?? ''}</code>
          </div>
        </>
      }
      stepContent={
        <>
          <div className="tree-workspace-step-copy">
            <h3>{getStepDescription(currentSnapshot, t)}</h3>
            <p>{`${t('module.st01.meta.matches')}: ${matchStarts.length} · ${t('module.st01.meta.alignment')}: ${alignmentStart}`}</p>
          </div>

          <dl className="tree-workspace-kv">
            <div>
              <dt>{t('playback.status')}</dt>
              <dd>{getStatusLabel(status, t)}</dd>
            </div>
            <div>
              <dt>{t('module.st01.meta.phase')}</dt>
              <dd>{getPhaseLabel(currentSnapshot, t)}</dd>
            </div>
            <div>
              <dt>{t('module.st01.meta.prefixIndex')}</dt>
              <dd>{currentSnapshot?.prefixIndex ?? '-'}</dd>
            </div>
            <div>
              <dt>{t('module.st01.meta.candidate')}</dt>
              <dd>{currentSnapshot?.prefixCandidateIndex ?? '-'}</dd>
            </div>
            <div>
              <dt>{t('module.st01.meta.textIndex')}</dt>
              <dd>{activeTextIndex ?? '-'}</dd>
            </div>
            <div>
              <dt>{t('module.st01.meta.patternIndex')}</dt>
              <dd>{activePatternIndex ?? '-'}</dd>
            </div>
            <div>
              <dt>{t('module.st01.meta.alignment')}</dt>
              <dd>{alignmentStart}</dd>
            </div>
            <div>
              <dt>{t('module.st01.meta.lpsBuilt')}</dt>
              <dd>{currentSnapshot?.prefixBuiltCount ?? 0}</dd>
            </div>
            <div>
              <dt>{t('module.st01.meta.matches')}</dt>
              <dd>{matchStarts.join(', ') || '-'}</dd>
            </div>
          </dl>

          <div className="tree-workspace-code-block">
            <span className="tree-workspace-code-title">{t('module.st01.code.title')}</span>
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
              <strong>{t('module.st01.view.search')}</strong>
              <span>{t('module.st01.view.searchHint')}</span>
            </div>

            <div className="string-track">
              <span className="string-track-label">{t('module.st01.view.text')}</span>
              <div className="string-track-cells">
                {textChars.map((char, index) => {
                  const isFound = matchStarts.some(
                    (start) => index >= start && index < start + patternChars.length,
                  );
                  const isActive = activeTextIndex === index;
                  return (
                    <span key={`text-${index}`} className={getCellClass(isActive, false, isFound)}>
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="string-track">
              <span className="string-track-label">{t('module.st01.view.pattern')}</span>
              <div className="string-track-cells">
                {textChars.map((_, slotIndex) => {
                  const patternSlot = slotIndex - alignmentStart;
                  const char = patternSlot >= 0 && patternSlot < patternChars.length ? patternChars[patternSlot] : '';
                  const isMatched =
                    char !== '' &&
                    activePatternIndex !== null &&
                    patternSlot >= 0 &&
                    patternSlot < activePatternIndex;
                  const isFound = currentSnapshot?.action === 'matchFound' && char !== '';
                  const isActive = char !== '' && patternSlot === activePatternIndex && slotIndex === activeTextIndex;
                  return (
                    <span key={`pattern-slot-${slotIndex}`} className={getCellClass(isActive, isMatched, isFound)}>
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="string-stage-card">
            <div className="string-stage-head">
              <strong>{t('module.st01.view.prefix')}</strong>
              <span>{t('module.st01.view.prefixHint')}</span>
            </div>

            <div className="string-prefix-grid">
              <div className="string-track-label">{t('module.st01.view.pattern')}</div>
              <div className="string-track-cells">
                {patternChars.map((char, index) => {
                  const isActive =
                    currentSnapshot?.phase === 'prefix' &&
                    (currentSnapshot.prefixIndex === index || currentSnapshot.prefixCandidateIndex === index);
                  const isMatched = index < (currentSnapshot?.prefixBuiltCount ?? 0);
                  return (
                    <span key={`prefix-pattern-${index}`} className={getCellClass(isActive, isMatched, false)}>
                      {char}
                    </span>
                  );
                })}
              </div>

              <div className="string-track-label">LPS</div>
              <div className="string-track-cells">
                {(currentSnapshot?.lps ?? []).map((value, index) => {
                  const isActive =
                    currentSnapshot?.phase === 'prefix' &&
                    (currentSnapshot.prefixIndex === index || currentSnapshot.prefixCandidateIndex === index);
                  const isMatched = index < (currentSnapshot?.prefixBuiltCount ?? 0);
                  return (
                    <span key={`lps-${index}`} className={getCellClass(isActive, isMatched, false)}>
                      {value}
                    </span>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="string-stage-card">
            <div className="string-stage-head">
              <strong>{t('module.st01.view.matches')}</strong>
              <span>{t('module.st01.view.matchesHint')}</span>
            </div>

            <div className="string-match-row">
              {matchStarts.length > 0 ? (
                matchStarts.map((start) => (
                  <span key={`match-${start}`} className="graph-floyd-chip">
                    {start}
                  </span>
                ))
              ) : (
                <span className="string-empty-copy">{t('module.st01.view.matchesEmpty')}</span>
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
            {t('module.st01.meta.phase')}: {getPhaseLabel(currentSnapshot, t)}
          </span>
          <span className="tree-workspace-transport-chip">
            {t('module.st01.meta.alignment')}: {alignmentStart}
          </span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {t('module.st01.meta.matches')}: {matchStarts.length}
          </span>
        </>
      }
    />
  );
}
