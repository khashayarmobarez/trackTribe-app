'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { useAppDispatch } from '@/lib/store/hooks';
import { logout as logoutAction } from '@/lib/store/slices/authSlice';
import { useGetMeQuery } from '@/lib/api/endpoints/userApi';
import { useLogoutMutation } from '@/lib/api/endpoints/authApi';
import { Button } from '@/components/ui/button';

export function DashboardPanel() {
  const t = useTranslations('home');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: user, isLoading, isError } = useGetMeQuery();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.replace('/login');
    }
  }, [isLoading, isError, user, router]);

  async function handleLogout() {
    try {
      await logout().unwrap();
    } finally {
      dispatch(logoutAction());
      router.push('/login');
    }
  }

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <p className="text-muted-foreground">{t('loading')}</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="max-w-md space-y-2">
        <h1 className="text-3xl font-bold">{t('welcome', { name: user.name })}</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>
      <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
        {t('logout')}
      </Button>
    </main>
  );
}
