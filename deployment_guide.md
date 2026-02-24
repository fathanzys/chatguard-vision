# 🚀 Panduan Hosting ChatGuard Vision

Proyek **ChatGuard Vision** memiliki arsitektur *Fullstack* dengan kebutuhan sistem khusus (Tesseract OCR & PyTorch AI Models). Berikut adalah cara terbaik untuk meng-hosting aplikasi ini.

##  1. Hosting Frontend (Next.js)
Frontend sangat ringan dan bisa di-hosting **Gratis & Otomatis** menggunakan **Vercel**.

1. Buat akun di [Vercel.com](https://vercel.com/) menggunakan akun GitHub Anda.
2. Klik **Add New Project**.
3. Import repositori `fathanzys/chatguard-vision`.
4. Di bagian *Framework Preset*, Vercel akan otomatis mendeteksi **Next.js**.
5. Di menu *Root Directory*, pastikan Anda memilih folder `frontend`.
6. Klik **Deploy**.

> [!IMPORTANT]  
> Setelah Backend Anda berhasil di-hosting (langkah 2), Anda harus mengubah file `api-client.ts` di Frontend untuk mengarah ke URL Backend publik Anda, bukan lagi `http://127.0.0.1:8000`, lalu commit dan push ulang ke GitHub.

---

## 2. Hosting Backend (FastAPI + AI + OCR)
Backend aplikasi ini **TIDAK BISA** di-hosting di layanan gratis biasa (seperti Vercel Serverless atau Heroku Free).  
**Alasannya:**
- Membutuhkan instalasi sistem `Tesseract-OCR` secara native di OS.
- Menggunakan Model Huggingface (PyTorch) berukuran ratusan MB, sehingga butuh minimal RAM 2GB.

### Rekomendasi: Gunakan VPS Linux Terjangkau
- **DigitalOcean Droplet** ($6 - $12 / bulan)
- **Hetzner Cloud** (~€4 / bulan)
- **AWS EC2 / GCP Compute Engine** (Bisa pakai *Free Tier*)

### Langkah-langkah Deploy di Ubuntu 22.04/24.04:

#### 1. Masuk lewat SSH dan Install Kebutuhan Sistem
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv git tesseract-ocr tesseract-ocr-ind libtesseract-dev -y
```

#### 2. Clone Repositori
```bash
git clone https://github.com/fathanzys/chatguard-vision.git
cd chatguard-vision/backend
```

#### 3. Buat Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 4. Buat File Environment (`.env`)
```bash
nano .env
```
Isi dengan teks berikut:
```env
TESSERACT_CMD=/usr/bin/tesseract
HF_CACHE_DIR=/tmp/huggingface_cache
SENTIMENT_MODEL=w11wo/indonesian-roberta-base-sentiment-classifier
SLANG_DATA_PATH=app/data/colloquial-indonesian-lexicon.csv
```
Tekan `Ctrl+X`, lalu `Y`, lalu `Enter` untuk menyimpan.

#### 5. Menjalankan Backend secara Permanen
Gunakan Gunicorn agar server tidak mati saat koneksi SSH ditutup:
```bash
pip install gunicorn
gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000 --workers 2 --timeout 120 --daemon
```

### 3. Koneksi Frontend & Backend Akhir
Ubah `baseURL` di `frontend/src/lib/api-client.ts` menjadi Alamat IP Publik VPS Anda (misal `http://198.51.100.22:8000`). Commit lalu Push ke GitHub, Vercel akan otomatis me-rebuild Frontend Anda. Selesai! 🌐
