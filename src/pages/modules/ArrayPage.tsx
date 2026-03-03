import { useI18n } from '../../i18n/useI18n';

export function ArrayPage() {
  const { t } = useI18n();

  return (
    <section>
      <h2>{t('module.l01.title')}</h2>
      <p>{t('module.l01.body')}</p>
    </section>
  );
}
