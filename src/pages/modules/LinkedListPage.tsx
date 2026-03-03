import { useI18n } from '../../i18n/useI18n';

export function LinkedListPage() {
  const { t } = useI18n();

  return (
    <section>
      <h2>{t('module.l03.title')}</h2>
      <p>{t('module.l03.body')}</p>
    </section>
  );
}
