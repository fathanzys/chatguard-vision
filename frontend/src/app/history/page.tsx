'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { HistorySession, fetchHistory } from '@/lib/audit-api';
import { useLanguage } from '@/components/LanguageContext';
import { ShieldCheck, MessageSquare, AlertTriangle, Fingerprint, Clock, Image as ImageIcon, FileText, Anchor, ChevronRight, Inbox, RefreshCw } from 'lucide-react';

export default function HistoryPage() {
    const [history, setHistory] = useState<HistorySession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { langConfig } = useLanguage();

    const loadHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchHistory();
            setHistory(data);
        } catch (err) {
            setError(langConfig.audit_error_connect);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []); // Run once on mount

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto py-10 px-4">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            <ShieldCheck className="w-10 h-10 text-blue-600" />
                            {langConfig.hist_title}
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg">{langConfig.hist_desc}</p>
                    </div>

                    <div className="flex gap-3">
                        <Link href="/audit/text" className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm">
                            <FileText className="w-4 h-4 text-blue-500" />
                            {langConfig.hist_new_text}
                        </Link>
                        <Link href="/audit/image" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm shadow-blue-500/20">
                            <ImageIcon className="w-4 h-4" />
                            {langConfig.hist_new_img}
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                        <p className="text-slate-500 font-medium">{langConfig.hist_loading}</p>
                    </div>
                ) : error ? (
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 text-rose-700 flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold mb-1">Error</p>
                            <p>{error}</p>
                        </div>
                        <button onClick={loadHistory} className="px-4 py-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg ml-auto font-semibold text-sm transition-colors">
                            Coba Lagi
                        </button>
                    </div>
                ) : history.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <Inbox className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{langConfig.hist_empty}</h3>
                        <p className="text-slate-500 mb-8 max-w-sm">{langConfig.hist_empty_desc}</p>
                        <Link href="/audit/image" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 group">
                            {langConfig.hist_new_img}
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between px-2 mb-2">
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{langConfig.hist_total}: {history.length}</p>
                        </div>
                        {history.map((session) => (
                            <Link
                                href={`/history/${session.id}`}
                                key={session.id}
                                className="group bg-white border border-slate-100 p-6 rounded-2xl hover:shadow-md hover:border-blue-100 transition-all cursor-pointer flex flex-col sm:flex-row gap-6 relative overflow-hidden"
                            >
                                {/* Left Side: Source Type */}
                                <div className="shrink-0 flex sm:flex-col items-center sm:items-start gap-3 sm:w-48">
                                    <div className={`p-3 rounded-xl flex items-center justify-center ${session.source === 'image' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'
                                        }`}>
                                        {session.source === 'image' ? <ImageIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                            {session.source === 'image' ? langConfig.hist_source_img : langConfig.hist_source_text}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                                            <Clock className="w-3 h-3" /> {formatDate(session.created_at)}
                                        </p>
                                    </div>
                                </div>

                                {/* Middle: Metrics Grid */}
                                <div className="flex-1 grid grid-cols-3 gap-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                                            <MessageSquare className="w-3.5 h-3.5" /> Total
                                        </p>
                                        <p className="text-xl font-bold text-slate-800">{session.total_messages}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                                            <AlertTriangle className="w-3.5 h-3.5" /> Toxic
                                        </p>
                                        <p className={`text-xl font-bold ${session.toxic_messages > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                                            {session.toxic_messages}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                                            <Fingerprint className="w-3.5 h-3.5" /> Score
                                        </p>
                                        <p className={`text-xl font-bold ${session.safety_score < 70 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {session.safety_score?.toFixed(0)}%
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Action Icon */}
                                <div className="shrink-0 flex items-center justify-center px-2">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
