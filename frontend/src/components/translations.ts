export type Language = 'id' | 'en';

export const translations = {
    id: {
        // Navigation
        nav_home: 'Beranda',
        nav_image: 'Audit Gambar',
        nav_text: 'Audit Teks',
        nav_history: 'Riwayat',

        // Home Page
        hero_title_1: 'Pendeteksi Toksisitas Cerdas dari',
        hero_title_2: 'Screenshot & Teks',
        hero_desc: 'Analisis sentimen dan deteksi kata-kata kasar dari gambar tangkapan layar hingga pesan teks dengan AI Indonesia mutakhir yang mendukung bahasa gaul.',
        home_btn_image: 'Analisis dari Gambar',
        home_btn_text: 'Input Teks Manual',
        sys_online: 'Sistem Online',
        sys_offline: 'Backend Offline',
        sys_checking: 'Memeriksa Sistem...',

        // Metrics/Home Features
        feat_fast: 'Cepat & Akurat',
        feat_fast_desc: 'Proses klasifikasi teks dan gambar dalam hitungan detik.',
        feat_indo: 'Bahasa Indonesia Gaul',
        feat_indo_desc: 'Mendukung singkatan dan bahasa gaul kompleks (wkwk, bgt, otw).',
        feat_safe: 'Aman & Privat',
        feat_safe_desc: 'Tidak menyimpan data pribadi. Histori audit bersifat lokal.',

        // General Audit UI
        audit_error_connect: 'Gagal terhubung ke backend. Pastikan server aktif.',
        audit_result_title: 'Hasil Analisis',
        audit_meta_total: 'Total Pesan',
        audit_meta_toxic: 'Pesan Toxic',
        audit_meta_time: 'Waktu Proses',
        audit_meta_score: 'Skor Keamanan',
        audit_col_time: 'Waktu',
        audit_col_sender: 'Pengirim',
        audit_col_message: 'Pesan',
        audit_col_safe: 'Aman',
        audit_col_toxic: 'Toxic',

        // Text Audit Page
        text_title: 'Audit Pesan Teks',
        text_desc: 'Masukkan log obrolan atau teks untuk dianalisis oleh AI ChatGuard.',
        text_placeholder: 'Contoh log chat:\n[10:30] Andi: bro dmn?\n[10:31] Budi: lagi di warkop t0l0l',
        text_btn_clear: 'Bersihkan',
        text_btn_scan: 'Pindai Teks',
        text_analyzing: 'Menganalisis Teks...',

        // Image Audit Page
        img_title: 'Audit Screenshot Chat',
        img_desc: 'Unggah file gambar screenshot WhatsApp/Line/Discord untuk di-scan secara otomatis.',
        img_drop: 'Klik untuk upload atau drag and drop',
        img_format: 'SVG, PNG, JPG (Maks. 5MB)',
        img_err_format: 'Format file harus gambar (JPG/PNG).',
        img_err_size: 'Ukuran file maksimal 5MB.',
        img_btn_scan: 'Pindai Gambar',
        img_scanning: 'Memproses Gambar...',

        // History Pages
        hist_title: 'Riwayat Audit',
        hist_desc: 'Daftar sesi analisis teks dan gambar sebelumnya.',
        hist_total: 'Total Sesi',
        hist_loading: 'Memuat data riwayat...',
        hist_empty: 'Belum ada riwayat audit',
        hist_empty_desc: 'Mulai analisis teks atau gambar pertama Anda.',
        hist_new_text: 'Audit Teks Baru',
        hist_new_img: 'Audit Gambar Baru',
        hist_session: 'Sesi',
        hist_score: 'Skor',
        hist_source_img: 'Upload Gambar',
        hist_source_text: 'Teks Langsung',
        hist_process_via: 'Proses via',
        hist_on: 'pada',
        hist_btn_back: 'Kembali ke Riwayat',
        hist_btn_all: 'Semua Riwayat',
        hist_btn_del: 'Hapus Riwayat',
        hist_err_not_found: 'Sesi audit tidak ditemukan.',
        hist_err_del_confirm: 'Apakah Anda yakin ingin menghapus riwayat ini?',
        hist_err_del_fail: 'Gagal menghapus riwayat.'
    },
    en: {
        // Navigation
        nav_home: 'Home',
        nav_image: 'Image Audit',
        nav_text: 'Text Audit',
        nav_history: 'History',

        // Home Page
        hero_title_1: 'Smart Toxicity Detector for',
        hero_title_2: 'Screenshots & Texts',
        hero_desc: 'Analyze sentiment and detect harsh words from image screenshots to text messages with state-of-the-art Indonesian AI supporting slang.',
        home_btn_image: 'Scan from Image',
        home_btn_text: 'Manual Text Input',
        sys_online: 'System Online',
        sys_offline: 'Backend Offline',
        sys_checking: 'Checking System...',

        // Metrics/Home Features
        feat_fast: 'Fast & Accurate',
        feat_fast_desc: 'Classify text and images into metrics within seconds.',
        feat_indo: 'Indonesian Slang Support',
        feat_indo_desc: 'Supports complex abbreviations and slangs (wkwk, bgt, otw).',
        feat_safe: 'Safe & Private',
        feat_safe_desc: 'No personal data is kept. Audit history is locally secured.',

        // General Audit UI
        audit_error_connect: 'Failed to connect to backend. Ensure server is running.',
        audit_result_title: 'Analysis Results',
        audit_meta_total: 'Total Messages',
        audit_meta_toxic: 'Toxic Messages',
        audit_meta_time: 'Processing Time',
        audit_meta_score: 'Safety Score',
        audit_col_time: 'Time',
        audit_col_sender: 'Sender',
        audit_col_message: 'Message',
        audit_col_safe: 'Safe',
        audit_col_toxic: 'Toxic',

        // Text Audit Page
        text_title: 'Text Message Audit',
        text_desc: 'Paste a chat log or text to be analyzed by the ChatGuard AI.',
        text_placeholder: 'Example chat log:\n[10:30] Andi: where u at bro?\n[10:31] Budi: grabbing coffee u id1ot',
        text_btn_clear: 'Clear Text',
        text_btn_scan: 'Scan Text',
        text_analyzing: 'Analyzing Text...',

        // Image Audit Page
        img_title: 'Chat Screenshot Audit',
        img_desc: 'Upload an image of a WhatsApp/Line/Discord chat to be scanned automatically.',
        img_drop: 'Click to upload or drag and drop',
        img_format: 'SVG, PNG, JPG (Max. 5MB)',
        img_err_format: 'File format must be an image (JPG/PNG).',
        img_err_size: 'Maximum file size is 5MB.',
        img_btn_scan: 'Scan Image',
        img_scanning: 'Processing Image...',

        // History Pages
        hist_title: 'Audit History',
        hist_desc: 'List of past text and image analysis sessions.',
        hist_total: 'Total Sessions',
        hist_loading: 'Loading history data...',
        hist_empty: 'No audit history yet',
        hist_empty_desc: 'Start your first text or image analysis.',
        hist_new_text: 'New Text Audit',
        hist_new_img: 'New Image Audit',
        hist_session: 'Session',
        hist_score: 'Score',
        hist_source_img: 'Image Upload',
        hist_source_text: 'Direct Text',
        hist_process_via: 'Processed via',
        hist_on: 'on',
        hist_btn_back: 'Back to History',
        hist_btn_all: 'All History',
        hist_btn_del: 'Delete History',
        hist_err_not_found: 'Audit session not found.',
        hist_err_del_confirm: 'Are you sure you want to delete this history?',
        hist_err_del_fail: 'Failed to delete history.'
    }
};
