import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const t = await getTranslations('home');

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <div className="max-w-lg space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button render={<Link href="/login" />}>{t('login')}</Button>
        <Button variant="outline" render={<Link href="/register" />}>
          {t('register')}
        </Button>
      </div>
    </main>
  );
}
