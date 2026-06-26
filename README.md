# سَنَد — نظام التشغيل القانوني

نظام إدارة قضايا وموكلين لمكاتب المحاماة، مبني بـ React + TypeScript + Supabase.

## 🚀 النشر على Vercel

### 1. رفع المشروع على GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/sanad-legal-platform.git
git push -u origin main
```

### 2. ربط Vercel بـ GitHub
- اذهب إلى [vercel.com](https://vercel.com)
- اختر "Import Project" → اختر الـ repository
- في **Environment Variables** أضف:
  - `VITE_SUPABASE_URL` = رابط مشروع Supabase
  - `VITE_SUPABASE_ANON_KEY` = المفتاح العام

### 3. Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## 💻 التشغيل المحلي

```bash
npm install
cp .env.example .env
# عدّل .env وحط بيانات Supabase
npm run dev
```

## 📁 هيكل المشروع

```
src/
  main.tsx          - نقطة الدخول + Service Worker
  App.tsx           - المكون الرئيسي
  supabaseClient.ts - إعداد Supabase
  constants.ts      - الأيقونات + إعدادات الدول
  index.css         - الـ CSS المخصص
  components/
    LoginScreen.tsx
    FeesTab.tsx
    SessionsCalendar.tsx
    RemindersTab.tsx
    ArchiveTab.tsx
    CaseDetailView.tsx
    NewCaseModal.tsx
    NewClientModal.tsx
    NewLawyerModal.tsx
    ClientDetailModal.tsx
    EditCaseModal.tsx
    EditClientModal.tsx
    UniversalSearchModal.tsx
    AILegalAssistant.tsx
    SettingsPage.tsx
    CountrySettings.tsx
    DatePicker.tsx
    DeleteConfirmModal.tsx
    PdfViewerModal.tsx
    UpcomingSessionsList.tsx
    shared.tsx        - مكونات مشتركة (Inp, Sel, DatePicker utils)
public/
  sw.js             - Service Worker
  manifest.json     - PWA Manifest
  client-portal.html - بوابة الموكلين
```

## 🗄️ جداول Supabase المطلوبة (SQL)

### لتفعيل قسم "إدارة الجلسات" في لوحة الإدارة:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen_device text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen_browser text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen_ip text;
```

### لتفعيل النسخ الاحتياطي:
```sql
CREATE TABLE IF NOT EXISTS backups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  created_by uuid,
  created_by_name text,
  tables_count int,
  rows_count int,
  size_kb int,
  data jsonb
);
```

## ⚠️ ملاحظة Supabase Credentials
لا ترفع ملف `.env` على GitHub أبداً.
أضف المتغيرات مباشرة في Vercel Environment Variables عند النشر.
