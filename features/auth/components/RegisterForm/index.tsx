'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, Link } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAppDispatch } from '@/lib/store/hooks';
import { setUser } from '@/lib/store/slices/authSlice';
import { useRegisterMutation } from '@/lib/api/endpoints/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const t = useTranslations('auth');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      const result = await register(values).unwrap();
      dispatch(setUser(result.user));
      router.push('/dashboard');
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 409) {
        form.setError('email', { message: t('email_taken') });
      } else {
        form.setError('root', { message: t('server_error') });
      }
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-sm space-y-6">
      <h1 className="text-center text-2xl font-bold">{t('register_title')}</h1>

      <div className="space-y-2">
        <Label htmlFor="name">{t('name_label')}</Label>
        <Input id="name" type="text" autoComplete="name" {...form.register('name')} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

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
          autoComplete="new-password"
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
        {isLoading ? t('registering') : t('register_button')}
      </Button>

      <p className="text-center text-sm">
        {t('has_account')}{' '}
        <Link href="/login" className="text-primary underline">
          {t('login_link')}
        </Link>
      </p>
    </form>
  );
}
