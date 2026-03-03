import { useI18n } from '../../i18n/useI18n';

export function BubbleSortPage() {
  const { t } = useI18n();

  return (
    <section>
      <h2>{t('module.s01.title')}</h2>
      <p>{t('module.s01.body')}</p>
    </section>
  );
}
