import type { TranslationKey } from '../../i18n/translations';
import type { PlaybackStatus } from '../../types/animation';

export const DEFAULT_SPEED_OPTIONS = [
  { key: 'module.s01.speed.slow' as TranslationKey, value: 1200 },
  { key: 'module.s01.speed.normal' as TranslationKey, value: 700 },
  { key: 'module.s01.speed.fast' as TranslationKey, value: 350 },
] as const;

export function getPlaybackStatusLabel(
  status: PlaybackStatus,
  t: (key: TranslationKey) => string,
): string {
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

export function getTimelineProgressWidth(currentStep: number, totalSteps: number): string {
  if (totalSteps <= 1) {
    return '0%';
  }
  return `${(currentStep / Math.max(totalSteps - 1, 1)) * 100}%`;
}

export function formatOptionalNumberArray(values: Array<number | null>, empty = '-'): string {
  const visible = values.filter((value): value is number => value !== null);
  return visible.length > 0 ? visible.join(', ') : empty;
}
