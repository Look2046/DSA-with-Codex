import { useI18n } from '../i18n/useI18n';

export function SortingOverviewPage() {
  const { t } = useI18n();

  return (
    <section>
      <h2>{t('sorting.title')}</h2>
      <p>{t('sorting.body')}</p>
    </section>
  );
}
