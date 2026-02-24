'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import AuditResults from '@/components/AuditResults';
import { auditText } from '@/lib/audit-api';
import { useAuditStore } from '@/store/audit-store';
import { useLanguage } from '@/components/LanguageContext';
import { Loader2, AlertCircle, FileText, Eraser, Sparkles, Quote, ChevronRight } from 'lucide-react';

export default function AuditTextPage() {
  const [text, setText] = useState('');

  // Use Zustand store
  const { result, loading: isLoading, error, setResult, setLoading, setError, reset } = useAuditStore();
  const { langConfig } = useLanguage();

  // Reset store on mount
  useEffect(() => {
    reset();
  }, [reset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const auditResult = await auditText(text);
      setResult(auditResult);
    } catch (err: any) {
      setError(langConfig.audit_error_connect);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="grid lg:grid-cols-2 gap-12 w-full max-w-6xl mx-auto">
        <div className="space-y-8 flex flex-col justify-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight flex items-center gap-4 mb-4">
              {langConfig.text_title}
            </h1>
            <p className="text-lg text-slate-600 max-w-md leading-relaxed">
              {langConfig.text_desc}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <div className="absolute top-4 left-4 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                <Quote className="w-6 h-6 rotate-180" />
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={langConfig.text_placeholder}
                className="w-full h-[320px] p-6 pl-14 bg-white border-2 border-slate-200 rounded-3xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono text-sm leading-relaxed text-slate-700 shadow-sm resize-none"
              />
              {text && (
                <button
                  type="button"
                  onClick={() => setText('')}
                  className="absolute bottom-4 right-4 p-2 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                  title="Bersihkan teks"
                >
                  <Eraser className="w-4 h-4" /> {langConfig.text_btn_clear}
                </button>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-sm flex items-start gap-3 border border-rose-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!text.trim() || isLoading}
              className="w-full py-4 px-6 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:hover:shadow-md hover:-translate-y-0.5 disabled:hover:-translate-y-0 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {langConfig.text_analyzing}
                </>
              ) : (
                <>
                  <FileText className="w-6 h-6" />
                  {langConfig.text_btn_scan}
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col h-full min-h-[500px]">
          {result ? (
            <div className="h-full flex flex-col bg-slate-50/50 animate-in fade-in zoom-in-95 duration-500">
              <AuditResults result={result} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center bg-slate-50/30">
              <div className="relative mb-6">
                <div className="absolute -inset-4 bg-blue-50 rounded-full blur-xl opacity-50"></div>
                <Sparkles className="w-16 h-16 text-slate-300 relative" />
              </div>
              <p className="text-lg font-medium text-slate-500 mb-2">Belum ada hasil analisis</p>
              <p className="text-sm text-slate-400 max-w-[250px]">Ketik atau paste teks di samping, lalu klik Pindai untuk melihat laporan deteksi di sini.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}