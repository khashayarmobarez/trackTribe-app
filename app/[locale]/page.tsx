import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('common');
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>{t('loading')}</p>
    </main>
  );
}
