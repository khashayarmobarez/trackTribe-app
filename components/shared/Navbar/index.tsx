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
          <Link href="/login">
            <Button variant="ghost" size="sm">
              {t('login')}
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">{t('sign_up')}</Button>
          </Link>
          <ThemeToggle />
          <LanguageSwitcher />
        </section>
      </section>
    </nav>
  );
}
