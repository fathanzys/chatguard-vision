import apiClient from './api-client';

// Tipe data disesuaikan dengan output Python (snake_case)
export interface AnalysisResult {
    label: string;
    score: number;
    is_toxic: boolean;
}

export interface ParsedMessage {
    id: number;
    timestamp: string;
    sender: string;
    raw_text: string;
    normalized_text: string;
    analysis: AnalysisResult;
}

export interface AuditResult {
    meta: {
        total_messages: number;
        toxic_messages: number;
        safety_score: number;
        processing_time_seconds: number;
        session_id: number;
    };
    data: ParsedMessage[];
}

export async function auditImage(file: File): Promise<AuditResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<AuditResult>(
        '/api/audit/upload',
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000 // 120 Detik timeout untuk OCR & inisialisasi model
        }
    );
    return response.data;
}

export async function auditText(text: string): Promise<AuditResult> {
    const response = await apiClient.post<AuditResult>(
        '/api/audit/text',
        { text },
        { timeout: 10000 }
    );
    return response.data;
}

export interface HistorySession {
    id: number;
    source: string;
    created_at: string;
    total_messages: number;
    toxic_messages: number;
    safety_score: number;
    processing_time_seconds: number;
}

export interface HistoryDetail {
    id: number;
    source: string;
    created_at: string;
    audit_result: {
        summary: {
            total_messages: number;
            toxic_count: number;
            safety_score: number;
            processing_time_seconds: number;
        };
        details: ParsedMessage[];
    };
}

export async function fetchHistory(skip = 0, limit = 20): Promise<HistorySession[]> {
    const response = await apiClient.get<HistorySession[]>('/api/history', {
        params: { skip, limit }
    });
    return response.data;
}

export async function fetchHistoryDetail(id: number): Promise<HistoryDetail> {
    const response = await apiClient.get<HistoryDetail>(`/api/history/${id}`);
    return response.data;
}