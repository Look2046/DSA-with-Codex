import { useCurrentModule } from '../../hooks/useCurrentModule';
import { useI18n } from '../../i18n/useI18n';

export function LinkedListPage() {
  const { t } = useI18n();
  const currentModule = useCurrentModule();

  return (
    <section>
      <h2>{t('module.l03.title')}</h2>
      <p>{t('module.l03.body')}</p>
      <p>Module: {currentModule?.id ?? '-'}</p>
    </section>
  );
}
