'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShieldCheck, Globe } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { language, setLanguage, langConfig } = useLanguage();

  const navLinks = [
    { name: langConfig.nav_home, href: '/' },
    { name: langConfig.nav_image, href: '/audit/image' },
    { name: langConfig.nav_text, href: '/audit/text' },
    { name: langConfig.nav_history, href: '/history' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg text-white shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            ChatGuard
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            className="relative z-10 flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4 text-slate-500" />
            {language === 'id' ? 'ID' : 'EN'}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-2 relative z-10">
          <button
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            className="flex items-center gap-1 px-2 py-1.5 border border-slate-200 rounded-md text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <Globe className="w-3 h-3 text-slate-500" />
            {language === 'id' ? 'ID' : 'EN'}
          </button>
          <button
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-2 space-y-1 shadow-lg absolute w-full">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}