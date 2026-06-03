'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Geist } from 'next/font/google'; // for shadecn
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <html lang="en">
      <body className={geist.className}>
        {children}
      </body>
    </html>
  );
}