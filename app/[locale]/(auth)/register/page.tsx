import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { RegisterForm } from '@/features/auth';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });

  return {
    title: t('register_title'),
    description: t('register_description'),
    alternates: {
      canonical: `/${locale}/register`,
      languages: {
        fa: '/fa/register',
        en: '/en/register',
      },
    },
    openGraph: {
      locale,
    },
  };
}

export default function RegisterPage() {
  return <RegisterForm />;
}
