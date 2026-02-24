'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import AuditResults from '@/components/AuditResults';
import { HistoryDetail, fetchHistoryDetail } from '@/lib/audit-api';
import apiClient from '@/lib/api-client';
import { useLanguage } from '@/components/LanguageContext';
import { ArrowLeft, Trash2, Calendar, FileText, Image as ImageIcon, Copy, RefreshCw, AlertTriangle, Fingerprint } from 'lucide-react';

export default function HistoryDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [detail, setDetail] = useState<HistoryDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { langConfig } = useLanguage();

    useEffect(() => {
        const loadDetail = async () => {
            try {
                const data = await fetchHistoryDetail(Number(id));
                setDetail(data);
            } catch (err: any) {
                if (err.response?.status === 404) {
                    setError(langConfig.hist_err_not_found);
                } else {
                    setError(langConfig.audit_error_connect);
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) loadDetail();
    }, [id, langConfig.audit_error_connect, langConfig.hist_err_not_found]);

    const handleDelete = async () => {
        if (!window.confirm(langConfig.hist_err_del_confirm)) return;

        setIsDeleting(true);
        try {
            await apiClient.delete(`/api/history/${id}`);
            router.push('/history');
        } catch (err) {
            alert(langConfig.hist_err_del_fail);
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto py-20 flex flex-col items-center justify-center">
                    <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                    <p className="text-lg text-slate-500 font-medium">{langConfig.hist_loading}</p>
                </div>
            </Layout>
        );
    }

    if (error || !detail) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto py-20 px-4">
                    <div className="bg-rose-50 border border-rose-100 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
                        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-rose-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
                        <p className="text-slate-600 mb-8">{error || langConfig.hist_err_not_found}</p>
                        <Link href="/history" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm">
                            <ArrowLeft className="w-5 h-5" />
                            {langConfig.hist_btn_back}
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-5xl mx-auto py-8 px-4">

                {/* Navigation & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <Link
                        href="/history"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {langConfig.hist_btn_all}
                    </Link>

                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors shadow-sm disabled:opacity-50"
                    >
                        {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        {langConfig.hist_btn_del}
                    </button>
                </div>

                {/* Header Metadata */}
                <div className="bg-white rounded-3xl p-8 mb-8 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-indigo-500"></div>

                    <div className="flex items-center gap-3 mb-6">
                        <div className={`p-3 rounded-2xl ${detail.source === 'image' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'
                            }`}>
                            {detail.source === 'image' ? <ImageIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                {langConfig.hist_session} #{detail.id}
                            </h1>
                            <p className="text-slate-500 flex items-center gap-2 mt-1 font-medium">
                                <Calendar className="w-4 h-4" />
                                {formatDate(detail.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{langConfig.hist_process_via}</p>
                            <p className="font-semibold text-slate-800 capitalize flex items-center gap-2">
                                {detail.source === 'image' ? langConfig.hist_source_img : langConfig.hist_source_text}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700">
                                Selesai
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{langConfig.hist_score}</p>
                            <p className={`font-bold flex items-center gap-1 ${detail.audit_result?.summary?.safety_score < 70 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                <Fingerprint className="w-4 h-4" />
                                {detail.audit_result?.summary?.safety_score}%
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ID</p>
                            <p className="font-mono text-slate-600 text-sm flex items-center gap-2">
                                UID-{detail.id.toString().padStart(4, '0')}
                                <Copy className="w-3 h-3 cursor-pointer hover:text-blue-500 transition-colors" />
                            </p>
                        </div>
                    </div>
                </div>

                {/* Audit Results Container */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    {detail.audit_result ? (
                        <AuditResults result={detail.audit_result} />
                    ) : (
                        <div className="p-12 text-center text-slate-500">
                            Data hasil analisis tidak tersedia untuk sesi ini.
                        </div>
                    )}
                </div>

            </div>
        </Layout>
    );
}
