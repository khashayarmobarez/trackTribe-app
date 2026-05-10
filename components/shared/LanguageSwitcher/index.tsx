'use client';

import { useRouter, usePathname } from '@/lib/i18n/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';

const locales = [
  { code: 'fa', name: 'فارسی', dir: 'rtl' },
  { code: 'en', name: 'English', dir: 'ltr' },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('common');

  const switchLanguage = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={t('switch_language') || 'Switch language'}
        >
          <Globe className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map(({ code, name }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => switchLanguage(code)}
            className={locale === code ? 'bg-accent' : ''}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
