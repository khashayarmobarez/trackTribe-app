'use client';

import { ThemeToggle } from '../ThemeToggle';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';

export function Navbar() {
  const t = useTranslations('common');

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <section className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-semibold">
          TrackTribe
        </Link>

        <section className="flex items-center gap-2">
          <Button variant="ghost" size="sm" render={<Link href="/login" />}>
            {t('login')}
          </Button>
          <Button size="sm" render={<Link href="/register" />}>
            {t('sign_up')}
          </Button>
          <ThemeToggle />
          <LanguageSwitcher />
        </section>
      </section>
    </nav>
  );
}
