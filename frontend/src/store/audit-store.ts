import { create } from 'zustand';
import { AuditResult } from '@/lib/audit-api';

interface AuditStore {
  result: AuditResult | null;
  loading: boolean;
  error: string | null;
  setResult: (result: AuditResult | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAuditStore = create<AuditStore>((set) => ({
  result: null,
  loading: false,
  error: null,
  
  setResult: (result) => set({ result }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  reset: () => set({
    result: null,
    loading: false,
    error: null,
  }),
}));
