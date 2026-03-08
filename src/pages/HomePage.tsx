import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/useI18n';

export function HomePage() {
  const { t } = useI18n();

  return (
    <div className="home-page">
      <section className="hero">
        <p className="eyebrow">{t('home.eyebrow')}</p>
        <h2>{t('home.title')}</h2>
        <p className="hero-copy">{t('home.copy')}</p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/modules">
            {t('home.action.browseModules')}
          </Link>
          <Link className="btn btn-secondary" to="/modules/sorting">
            {t('home.action.viewSorting')}
          </Link>
        </div>
      </section>

      <section className="card-grid">
        <article className="feature-card">
          <h3>{t('home.card.p0.title')}</h3>
          <p>{t('home.card.p0.body')}</p>
        </article>
        <article className="feature-card">
          <h3>{t('home.card.interaction.title')}</h3>
          <p>{t('home.card.interaction.body')}</p>
        </article>
        <article className="feature-card">
          <h3>{t('home.card.workflow.title')}</h3>
          <p>{t('home.card.workflow.body')}</p>
        </article>
      </section>

      <section className="milestone">
        <h3>{t('home.milestone.title')}</h3>
        <p>{t('home.milestone.body')}</p>
      </section>
    </div>
  );
}
