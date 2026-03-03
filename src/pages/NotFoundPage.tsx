import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/useI18n';

export function NotFoundPage() {
  const { t } = useI18n();

  return (
    <section>
      <h2>{t('notFound.title')}</h2>
      <p>{t('notFound.body')}</p>
      <Link to="/">{t('notFound.backHome')}</Link>
    </section>
  );
}
