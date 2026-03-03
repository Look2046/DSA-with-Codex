import { useI18n } from '../i18n/useI18n';

export function ModulesPage() {
  const { t } = useI18n();

  return (
    <section>
      <h2>{t('modules.title')}</h2>
      <p>{t('modules.body')}</p>
    </section>
  );
}
