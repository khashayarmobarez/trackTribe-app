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
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-xl">TrackTribe</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
              {t('dashboard') || 'Dashboard'}
            </Link>
            <Link href="/features" className="text-sm font-medium hover:text-primary">
              {t('features') || 'Features'}
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary">
              {t('about') || 'About'}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {t('login') || 'Login'}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">{t('sign_up') || 'Sign Up'}</Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}
