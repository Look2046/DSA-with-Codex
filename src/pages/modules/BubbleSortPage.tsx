import { useEffect, useMemo } from 'react';
import { useI18n } from '../../i18n/useI18n';
import { useCurrentModule } from '../../hooks/useCurrentModule';
import { generateBubbleSortSteps } from '../../modules/sorting/bubbleSort';
import { usePlaybackStore } from '../../store/playbackStore';

const SAMPLE_INPUT = [5, 1, 4, 2, 8];
const AUTO_PLAY_MS = 700;

export function BubbleSortPage() {
  const { t } = useI18n();
  const currentModule = useCurrentModule();
  const { status, currentStep, totalSteps, setTotalSteps, play, pause, nextStep, prevStep, reset } =
    usePlaybackStore();
  const steps = useMemo(() => generateBubbleSortSteps(SAMPLE_INPUT), []);
  const currentSnapshot = steps[currentStep] ?? steps[0];

  useEffect(() => {
    setTotalSteps(steps.length);
  }, [setTotalSteps, steps.length]);

  useEffect(() => {
    if (status !== 'playing') {
      return;
    }

    const timer = window.setInterval(() => {
      const { currentStep: stepInStore, totalSteps: totalInStore } = usePlaybackStore.getState();
      if (stepInStore >= totalInStore - 1) {
        usePlaybackStore.getState().setStatus('completed');
        window.clearInterval(timer);
        return;
      }
      usePlaybackStore.getState().nextStep();
    }, AUTO_PLAY_MS);

    return () => window.clearInterval(timer);
  }, [status]);

  return (
    <section>
      <h2>{t('module.s01.title')}</h2>
      <p>{t('module.s01.body')}</p>
      <p>
        Module: {currentModule?.id ?? '-'} | {t('playback.step')}: {currentStep + 1}/{totalSteps || 0} |{' '}
        {t('playback.status')}: {status}
      </p>
      <p>
        {t('module.s01.sample')}: [{SAMPLE_INPUT.join(', ')}]
      </p>
      <p>{currentSnapshot?.description ?? '-'}</p>
      <p className="array-preview">[{(currentSnapshot?.arrayState ?? []).join(', ')}]</p>
      <p>
        Highlights:{' '}
        {(currentSnapshot?.highlights ?? [])
          .map((item) => `${item.index}:${item.type}`)
          .join(' | ') || '-'}
      </p>
      <div className="playback-actions">
        <button type="button" onClick={play}>
          {t('playback.play')}
        </button>
        <button type="button" onClick={pause}>
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
    </section>
  );
}
