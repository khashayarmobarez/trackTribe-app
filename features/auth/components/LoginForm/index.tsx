'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, Link } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAppDispatch } from '@/lib/store/hooks';
import { setUser } from '@/lib/store/slices/authSlice';
import { useLoginMutation } from '@/lib/api/endpoints/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const t = useTranslations('auth');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      const result = await login(values).unwrap();
      dispatch(setUser(result.user));
      router.push('/dashboard');
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      form.setError('root', {
        message: status === 401 ? t('invalid_credentials') : t('server_error'),
      });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-sm space-y-6">
      <h1 className="text-center text-2xl font-bold">{t('login_title')}</h1>

      <div className="space-y-2">
        <Label htmlFor="email">{t('email_label')}</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t('password_label')}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...form.register('password')}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        )}
      </div>

      {form.formState.errors.root && (
        <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? t('logging_in') : t('login_button')}
      </Button>

      <p className="text-center text-sm">
        {t('no_account')}{' '}
        <Link href="/register" className="text-primary underline">
          {t('register_link')}
        </Link>
      </p>
    </form>
  );
}
