'use client';

import { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* Konten halaman akan masuk ke sini */}
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}