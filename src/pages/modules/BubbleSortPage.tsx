import { useEffect } from 'react';
import { useI18n } from '../../i18n/useI18n';
import { useCurrentModule } from '../../hooks/useCurrentModule';
import { usePlaybackStore } from '../../store/playbackStore';

const STEP_COUNT = 42;

export function BubbleSortPage() {
  const { t } = useI18n();
  const currentModule = useCurrentModule();
  const { status, currentStep, totalSteps, setTotalSteps, play, pause, goToStep, reset } = usePlaybackStore();

  useEffect(() => {
    setTotalSteps(STEP_COUNT);
  }, [setTotalSteps]);

  return (
    <section>
      <h2>{t('module.s01.title')}</h2>
      <p>{t('module.s01.body')}</p>
      <p>
        Module: {currentModule?.id ?? '-'} | Step: {currentStep + 1}/{totalSteps || 0} | Status: {status}
      </p>
      <div className="playback-actions">
        <button type="button" onClick={play}>
          Play
        </button>
        <button type="button" onClick={pause}>
          Pause
        </button>
        <button type="button" onClick={() => goToStep(currentStep + 1)}>
          Next
        </button>
        <button type="button" onClick={reset}>
          Reset
        </button>
      </div>
    </section>
  );
}
