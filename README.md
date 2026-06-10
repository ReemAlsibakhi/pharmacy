# حسابات — Pharmacy POS

نظام إدارة صيدلية كامل مبني بـ React + TypeScript + Supabase

---

## 🚀 بدء التشغيل

### 1. تثبيت المتطلبات

```bash
npm install
```

### 2. إعداد المتغيرات البيئية

```bash
cp .env.example .env.local
```

ثم عدّل `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. تشغيل المشروع

```bash
npm run dev
```

---

## 📁 هيكل المشروع

```
src/
├── lib/          # Supabase client, TanStack Query, utils
├── types/        # TypeScript types من Schema
├── hooks/        # TanStack Query hooks
├── store/        # Zustand stores (Cart, UI)
├── schemas/      # Zod validation schemas
├── components/
│   ├── ui/       # Reusable components
│   └── layout/   # Sidebar, Header, Layout
└── features/     # Feature modules
    ├── dashboard/
    ├── pos/
    ├── inventory/
    ├── purchases/
    ├── customers/
    ├── suppliers/
    └── reports/
```

---

## 🛠 Tech Stack

| الطبقة | التقنية |
|--------|---------|
| Build  | Vite + React 18 + TypeScript |
| UI     | Tailwind CSS v3 |
| State  | TanStack Query v5 + Zustand |
| Forms  | React Hook Form + Zod |
| Backend | Supabase (PostgreSQL + RLS) |
| Charts | Recharts |
| Barcode | @zxing/browser |
| Deploy | Vercel |

---

## 📦 النشر على Vercel

1. ادفع الكود لـ GitHub
2. اربط المشروع بـ Vercel
3. أضف المتغيرات البيئية في Vercel Dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Vercel يبني تلقائياً عند كل push

---

## ✅ الميزات المبنية

- [x] Dashboard مع إحصائيات وتنبيهات
- [x] نقطة البيع (POS) مع سلة وباركود
- [x] إدارة المخزون (CRUD كامل)
- [x] المشتريات مع تشغيلات وصلاحية
- [x] إدارة العملاء
- [x] إدارة الموردين
- [x] تقارير الأرباح (يومي/أسبوعي/شهري)
- [x] RTL عربي كامل
- [x] قارئ باركود (كاميرا + USB)
