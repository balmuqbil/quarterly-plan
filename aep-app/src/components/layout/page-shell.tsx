'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';

interface PageShellProps {
  children: React.ReactNode;
  title: string;
}

export function PageShell({ children, title }: PageShellProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-64">
        <Header title={title} />
        <main className="flex-1 bg-slate-50 p-6">{children}</main>
      </div>
    </div>
  );
}
