import React from 'react';
import { Shield, ShieldAlert, AlertTriangle, Clock, MessageSquare, CheckCircle2, ChevronRight, BarChart3, Fingerprint } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function AuditResults({ result }: { result: any }) {
  const { langConfig } = useLanguage();

  if (!result) return null;

  // Normalize result payload as direct API and DB API return slightly different keys
  const summary = result.summary || result.meta || {};
  const details = result.details || result.data || [];

  const toxicCount = summary.toxic_count !== undefined ? summary.toxic_count : (summary.toxic_messages || 0);
  const totalMessages = summary.total_messages || 0;
  const processTime = summary.processing_time_seconds || result.processing_time_seconds || 0;
  const safetyScore = summary.safety_score ?? 100;

  const isOverallToxic = toxicCount > 0 || safetyScore < 50;

  return (
    <div className="flex flex-col h-full bg-white/50">
      <div className="p-6 md:p-8 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3 mb-8">
          <div className={`p-3 rounded-2xl ${isOverallToxic ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {isOverallToxic ? <ShieldAlert className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{langConfig.audit_result_title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold ${isOverallToxic ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {isOverallToxic ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                {isOverallToxic ? 'Perlu Perhatian' : 'Aman'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">{langConfig.audit_meta_total}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalMessages}</p>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-rose-500 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{langConfig.audit_meta_toxic}</span>
            </div>
            <p className="text-2xl font-bold text-rose-600">{toxicCount}</p>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-blue-500 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{langConfig.audit_meta_time}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {processTime ? parseFloat(processTime as string).toFixed(2) : '0.00'}s
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-emerald-500 mb-2">
              <Fingerprint className="w-4 h-4" />
              <span className="text-sm font-medium">{langConfig.audit_meta_score}</span>
            </div>
            <div className="flex items-end gap-1">
              <p className="text-2xl font-bold text-slate-900">{safetyScore}</p>
              <p className="text-sm font-medium text-slate-500 mb-1">/ 100</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 md:p-8 bg-slate-50/50">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-bold text-slate-800">Detail Pesan ({details.length})</h3>
        </div>

        <div className="space-y-4">
          {details.map((msg: any, i: number) => {
            const isToxic = msg.analysis?.is_toxic;
            // The API returns different structures depending on image vs text OCR. Clean it.
            const content = msg.content || msg.message || msg.raw_text;
            const sender = msg.sender || 'Unknown';
            const time = msg.time || msg.timestamp || '--:--';

            return (
              <div
                key={i}
                className={`group grid grid-cols-1 sm:grid-cols-[180px_1fr_120px] gap-4 p-5 rounded-2xl transition-all border w-full ${isToxic
                  ? 'bg-white border-rose-100 hover:border-rose-200 hover:shadow-md'
                  : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
                  }`}
              >
                {/* Kolom 1: Profil & Waktu */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-200/50">
                    {sender.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900 truncate" title={sender}>
                      {sender}
                    </h4>
                    <span className="text-xs text-slate-500 font-mono tracking-wider">{time}</span>
                  </div>
                </div>

                {/* Kolom 2: Isi Pesan */}
                <div className="flex items-center">
                  <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap break-words w-full">
                    {content}
                  </p>
                </div>

                {/* Kolom 3: Status / Badge */}
                <div className="flex items-center sm:justify-end">
                  <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap ${isToxic
                    ? 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200'
                    : 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
                    }`}>
                    {isToxic ? langConfig.audit_col_toxic : langConfig.audit_col_safe}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}