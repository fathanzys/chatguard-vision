'use client';

import { useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import AuditResults from '@/components/AuditResults';
import { auditImage } from '@/lib/audit-api';
import { useAuditStore } from '@/store/audit-store';
import { useLanguage } from '@/components/LanguageContext';
import { UploadCloud, Image as ImageIcon, Loader2, AlertCircle, ScanLine, Sparkles, ChevronRight } from 'lucide-react';

export default function AuditImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use Zustand store
  const { result, loading: isLoading, error, setResult, setLoading, setError, reset } = useAuditStore();
  const { langConfig } = useLanguage();

  // Reset store on mount
  useEffect(() => {
    reset();
  }, [reset]);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError(langConfig.img_err_format);
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError(langConfig.img_err_size);
      return;
    }
    setFile(selectedFile);
    reset(); // Clear previous results and errors

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFileSelect(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const auditResult = await auditImage(file);
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
              {langConfig.img_title}
            </h1>
            <p className="text-lg text-slate-600 max-w-md leading-relaxed">
              {langConfig.img_desc}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              className={`relative border-2 border-dashed rounded-3xl p-10 transition-all duration-300 ${file ? 'border-blue-400 bg-blue-50/50' : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50'
                } text-center cursor-pointer group flex flex-col items-center justify-center min-h-[300px] overflow-hidden`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept="image/*"
                className="hidden"
              />

              {preview ? (
                <div className="absolute inset-0 w-full h-full p-2">
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm group-hover:opacity-90 transition-opacity">
                    <img src={preview} alt="Preview" className="w-full h-full object-contain bg-slate-900/5" />
                    <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-white/90 text-slate-800 px-4 py-2 rounded-full font-semibold text-sm shadow-sm flex items-center gap-2">
                        <UploadCloud className="w-4 h-4" /> Ganti Gambar
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <ImageIcon className="w-10 h-10 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 text-lg">{langConfig.img_drop}</p>
                    <p className="text-sm text-slate-500 mt-1">{langConfig.img_format}</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-sm flex items-start gap-3 border border-rose-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || isLoading}
              className="w-full py-4 px-6 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:hover:shadow-md hover:-translate-y-0.5 disabled:hover:-translate-y-0 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {langConfig.img_scanning}
                </>
              ) : (
                <>
                  <ScanLine className="w-6 h-6" />
                  {langConfig.img_btn_scan}
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
              <p className="text-sm text-slate-400 max-w-[250px]">Upload screenshot dan klik Pindai untuk melihat laporan deteksi di sini.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}