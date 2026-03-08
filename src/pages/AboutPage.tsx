import { useI18n } from '../i18n/useI18n';

export function AboutPage() {
  const { t } = useI18n();

  return (
    <section>
      <h2>{t('about.title')}</h2>
      <p>{t('about.body')}</p>
    </section>
  );
}
