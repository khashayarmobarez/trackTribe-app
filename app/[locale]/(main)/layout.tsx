import type { ReactNode } from 'react';
import { Navbar } from '@/components/shared/Navbar';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {children}
    </div>
  );
}
