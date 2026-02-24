'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { useLanguage } from '@/components/LanguageContext';
import { Image as ImageIcon, FileText, Activity, Shield, Zap } from 'lucide-react';

export default function Home() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const { langConfig } = useLanguage();

  useEffect(() => {
    apiClient.get('/api/health')
      .then(() => setIsHealthy(true))
      .catch(() => setIsHealthy(false));
  }, []);

  return (
    <Layout>
      <section className="text-center py-16 md:py-24 max-w-4xl mx-auto space-y-8">

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-white shadow-sm mb-4 transition-all hover:shadow-md cursor-default">
          <Activity className={`w-5 h-5 ${isHealthy === true ? 'text-emerald-500' : isHealthy === false ? 'text-rose-500' : 'text-amber-500 animate-pulse'}`} />
          <span className="text-sm font-semibold tracking-wide uppercase text-slate-700">
            API Status: {' '}
            {isHealthy === true ? <span className="text-emerald-600">{langConfig.sys_online}</span> :
              isHealthy === false ? <span className="text-rose-600">{langConfig.sys_offline}</span> :
                <span className="text-amber-600">{langConfig.sys_checking}</span>}
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight">
          {langConfig.hero_title_1} <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            {langConfig.hero_title_2}
          </span>
        </h1>

        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          {langConfig.hero_desc}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/audit/image" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 hover:-translate-y-1">
            <ImageIcon className="w-5 h-5 mr-2" /> {langConfig.home_btn_image}
          </Link>
          <Link href="/audit/text" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-gray-700 transition-all bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:-translate-y-1">
            <FileText className="w-5 h-5 mr-2" /> {langConfig.home_btn_text}
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid md:grid-cols-3 gap-8 py-12">
        {[
          { icon: Zap, title: langConfig.feat_fast, desc: langConfig.feat_fast_desc },
          { icon: Shield, title: langConfig.feat_safe, desc: langConfig.feat_safe_desc },
          { icon: Activity, title: langConfig.feat_indo, desc: langConfig.feat_indo_desc }
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-3 hover:text-blue-600">
              {item.title}
            </h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              {item.desc}
            </p>
          </div>
        ))}
      </section>
    </Layout>
  );
}