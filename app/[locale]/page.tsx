// CORRECT — either add 'use client', or use the server API
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('common');
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>{t('loading')}</p>
    </main>
  );
}
