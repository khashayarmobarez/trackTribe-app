import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from '@/features/auth';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });

  return {
    title: t('login_title'),
    description: t('login_description'),
    alternates: {
      canonical: `/${locale}/login`,
      languages: {
        fa: '/fa/login',
        en: '/en/login',
      },
    },
    openGraph: {
      locale,
    },
  };
}

export default function LoginPage() {
  return <LoginForm />;
}
