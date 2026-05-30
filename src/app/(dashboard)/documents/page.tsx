"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  PlusCircle,
  FileText,
  FileSignature,
  ScrollText,
  Gavel,
  BarChart3,
  Upload,
  Eye,
  Download,
  Calendar,
  User,
  X,
  Clock,
  CheckCircle2,
  FilePen,
  AlertCircle,
  Tag,
  BookOpen,
  Trash2,
  Paperclip,
  ChevronDown,
} from "lucide-react";
import {
  mockDocuments,
  LegalDocument,
  DocType,
  DocStatus,
} from "@/components/documents/mock-data";
import { mockCases } from "@/components/cases/mock-data";
import { mockClients } from "@/components/clients/mock-data";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Config ───────────────────────────────────────────────────────────────────

const DOC_TYPE_CONFIG: Record<DocType, { icon: React.ElementType; color: string; bg: string }> = {
  عقد:    { icon: FileSignature, color: "text-primary",     bg: "bg-primary/10" },
  مذكرة:  { icon: ScrollText,    color: "text-accent",      bg: "bg-accent/10" },
  توكيل:  { icon: FileText,      color: "text-purple-400",  bg: "bg-purple-400/10" },
  لائحة:  { icon: BookOpen,      color: "text-amber-400",   bg: "bg-amber-400/10" },
  حكم:    { icon: Gavel,         color: "text-emerald-400", bg: "bg-emerald-400/10" },
  تقرير:  { icon: BarChart3,     color: "text-blue-400",    bg: "bg-blue-400/10" },
};

const STATUS_CONFIG: Record<DocStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  نشط:                { label: "نشط",               color: "text-emerald-400",      bg: "bg-emerald-400/10 border-emerald-400/20",   icon: CheckCircle2 },
  منتهي:              { label: "منتهي",             color: "text-muted-foreground", bg: "bg-secondary/40 border-white/10",            icon: Clock },
  "بانتظار التوقيع":  { label: "بانتظار التوقيع",  color: "text-amber-400",        bg: "bg-amber-400/10 border-amber-400/20",        icon: AlertCircle },
  مسودة:              { label: "مسودة",             color: "text-blue-400",         bg: "bg-blue-400/10 border-blue-400/20",          icon: FilePen },
};

const TYPE_FILTERS: { label: string; value: DocType | "الكل" }[] = [
  { label: "الكل", value: "الكل" },
  { label: "عقود", value: "عقد" },
  { label: "مذكرات", value: "مذكرة" },
  { label: "توكيلات", value: "توكيل" },
  { label: "لوائح", value: "لائحة" },
  { label: "أحكام", value: "حكم" },
  { label: "تقارير", value: "تقرير" },
];

const STATUS_FILTERS: { label: string; value: DocStatus | "الكل" }[] = [
  { label: "كل الحالات", value: "الكل" },
  { label: "نشط",               value: "نشط" },
  { label: "مسودة",             value: "مسودة" },
  { label: "بانتظار التوقيع",   value: "بانتظار التوقيع" },
  { label: "منتهي",             value: "منتهي" },
];

const EMPTY_FORM = {
  title: "",
  type: "عقد" as DocType,
  clientId: "",
  clientName: "",
  caseId: "",
  caseNumber: "",
  status: "مسودة" as DocStatus,
  description: "",
  fileName: "",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<LegalDocument[]>(mockDocuments);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocType | "الكل">("الكل");
  const [statusFilter, setStatusFilter] = useState<DocStatus | "الكل">("الكل");

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [dragOver, setDragOver] = useState(false);

  const [previewDoc, setPreviewDoc] = useState<LegalDocument | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<LegalDocument | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = documents.filter((d) => {
    const matchType = typeFilter === "الكل" || d.type === typeFilter;
    const matchStatus = statusFilter === "الكل" || d.status === statusFilter;
    const matchSearch =
      search === "" ||
      d.title.includes(search) ||
      d.clientName.includes(search) ||
      d.caseNumber?.includes(search) ||
      d.tags.some((t) => t.includes(search));
    return matchType && matchStatus && matchSearch;
  });

  const stats = {
    total: documents.length,
    contracts: documents.filter((d) => d.type === "عقد").length,
    pending: documents.filter((d) => d.status === "بانتظار التوقيع").length,
    drafts: documents.filter((d) => d.status === "مسودة").length,
  };

  // ── Drag & Drop handlers ──
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setForm((p) => ({ ...p, fileName: file.name }));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setForm((p) => ({ ...p, fileName: file.name }));
  };

  // ── Client select handler ──
  const handleClientChange = (clientId: string) => {
    const client = mockClients.find((c) => c.id === clientId);
    setForm((p) => ({
      ...p,
      clientId,
      clientName: client?.name ?? "",
    }));
  };

  // ── Case select handler ──
  const handleCaseChange = (caseId: string) => {
    const cas = mockCases.find((c) => c.id === caseId);
    setForm((p) => ({
      ...p,
      caseId,
      caseNumber: cas?.caseNumber ?? "",
    }));
  };

  function openUpload() {
    setForm({ ...EMPTY_FORM });
    setShowUploadModal(true);
  }

  function handleAddDoc() {
    if (!form.title || !form.clientName) return;
    const today = new Date().toLocaleDateString("ar-SA");
    const newDoc: LegalDocument = {
      id: `DOC-${String(Date.now()).slice(-4)}`,
      title: form.title,
      type: form.type,
      clientName: form.clientName,
      clientId: form.clientId,
      caseId: form.caseId || undefined,
      caseNumber: form.caseNumber || undefined,
      status: form.status,
      createdAt: today,
      updatedAt: today,
      size: "—",
      pages: 0,
      author: "أحمد السلطان",
      description: form.description,
      tags: [form.type],
      previewContent: `${form.title}\n\n${form.description || "لا يوجد محتوى بعد."}`,
    };
    setDocuments((p) => [newDoc, ...p]);
    setShowUploadModal(false);
    toast({ title: "تم إضافة المستند ✓", description: `تمت إضافة "${newDoc.title}" بنجاح.` });
  }

  function handleDeleteDoc() {
    if (!deleteDoc) return;
    const title = deleteDoc.title;
    setDocuments((p) => p.filter((d) => d.id !== deleteDoc.id));
    setDeleteDoc(null);
    toast({ title: "تم حذف المستند", description: `تم حذف "${title}".`, variant: "destructive" });
  }

  function handleDownload(doc: LegalDocument) {
    toast({ title: "⬇️ جاري التحميل...", description: `يتم تحميل "${doc.title}"، يرجى الانتظار.` });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-headline font-black">العقود والمستندات</h2>
          <p className="text-muted-foreground mt-1">أرشيف رقمي لجميع الوثائق والملفات القانونية للمكتب.</p>
        </div>
        <Button
          onClick={openUpload}
          className="rounded-xl px-6 shadow-lg shadow-primary/30 font-bold transition-all duration-200 hover:shadow-primary/40 hover:shadow-xl gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          رفع مستند
        </Button>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="border border-primary/20 bg-card/50">
              <CardContent className="p-6 flex items-center gap-4">
                <Skeleton className="h-11 w-11 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-6 w-8 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "إجمالي المستندات", value: stats.total,     icon: FileText,     color: "text-primary",   bg: "bg-primary/10" },
            { label: "العقود النشطة",   value: stats.contracts,  icon: FileSignature, color: "text-accent",    bg: "bg-accent/10" },
            { label: "بانتظار التوقيع", value: stats.pending,    icon: AlertCircle,  color: "text-amber-400", bg: "bg-amber-400/10" },
            { label: "مسودات",          value: stats.drafts,     icon: FilePen,      color: "text-blue-400",  bg: "bg-blue-400/10" },
          ].map((s, i) => (
            <Card key={i} className="border border-primary/20 shadow-sm shadow-primary/10 bg-card/50 hover:border-primary/40 hover:shadow-primary/20 hover:shadow-md transition-all duration-200">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${s.bg}`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                  <p className={`text-2xl font-bold font-headline ${s.color}`}>{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث بالاسم، الموكل، رقم القضية، أو الوسم..."
            className="w-full bg-secondary/20 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground"
          />
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all border ${
                typeFilter === f.value
                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30"
                  : "border-white/10 text-muted-foreground hover:text-foreground bg-secondary/20"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all border ${
                statusFilter === f.value
                  ? "bg-accent text-accent-foreground border-accent shadow-sm shadow-accent/30"
                  : "border-white/10 text-muted-foreground hover:text-foreground bg-secondary/20"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border border-primary/20 bg-card/50">
              <CardContent className="p-5 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-3/4 rounded" />
                <div className="flex gap-2 pt-1 border-t border-white/5">
                  <Skeleton className="h-8 flex-1 rounded-xl" />
                  <Skeleton className="h-8 w-8 rounded-xl" />
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 flex flex-col items-center gap-4 text-muted-foreground">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <FileText className="h-8 w-8 text-primary/40" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-base font-semibold text-foreground/70">لا توجد مستندات مطابقة</p>
            <p className="text-sm text-muted-foreground">جرّب تغيير معايير البحث أو الفلتر</p>
          </div>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="rounded-xl gap-2 mt-2 shadow-lg shadow-primary/20"
          >
            <PlusCircle className="h-4 w-4" />
            رفع مستند جديد
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onPreview={() => setPreviewDoc(doc)}
              onDownload={() => handleDownload(doc)}
              onDelete={() => setDeleteDoc(doc)}
            />
          ))}
        </div>
      )}

      {/* ── Upload / Add Dialog ── */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="bg-card border border-white/10 text-foreground max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl font-bold flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="h-4 w-4 text-primary" />
              </div>
              رفع مستند جديد
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2 max-h-[70vh] overflow-y-auto pl-1">

            {/* ── Drag & Drop Zone ── */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                dragOver
                  ? "border-primary bg-primary/10 scale-[1.01]"
                  : form.fileName
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-white/10 bg-secondary/10 hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.jpg,.jpeg"
                onChange={handleFileChange}
              />
              {form.fileName ? (
                <div className="flex flex-col items-center gap-2">
                  <Paperclip className="h-7 w-7 text-emerald-400" />
                  <p className="text-sm font-bold text-emerald-400 break-all">{form.fileName}</p>
                  <p className="text-xs text-muted-foreground">انقر لتغيير الملف</p>
                </div>
              ) : (
                <>
                  <Upload className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-bold text-muted-foreground">
                    {dragOver ? "أفلت الملف هنا..." : "اسحب الملف هنا أو انقر للاختيار"}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">PDF, DOCX, JPG — حجم أقصى 20MB</p>
                </>
              )}
            </div>

            {/* Document title */}
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">اسم المستند *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="مثال: عقد توريد - شركة الأمل"
                className="bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground"
              />
            </div>

            {/* Type + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">نوع المستند</label>
                <div className="relative">
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as DocType }))}
                    className="w-full appearance-none bg-secondary/20 border border-white/10 rounded-xl py-2.5 pr-4 pl-8 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right"
                  >
                    {(["عقد", "لائحة", "حكم", "مذكرة", "توكيل", "تقرير"] as DocType[]).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">الحالة</label>
                <div className="relative">
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as DocStatus }))}
                    className="w-full appearance-none bg-secondary/20 border border-white/10 rounded-xl py-2.5 pr-4 pl-8 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right"
                  >
                    {(["نشط", "مسودة", "بانتظار التوقيع", "منتهي"] as DocStatus[]).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Client select */}
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">الموكل *</label>
              <div className="relative">
                <select
                  value={form.clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full appearance-none bg-secondary/20 border border-white/10 rounded-xl py-2.5 pr-4 pl-8 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right"
                >
                  <option value="">— اختر الموكل —</option>
                  {mockClients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Case select */}
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">القضية المرتبطة (اختياري)</label>
              <div className="relative">
                <select
                  value={form.caseId}
                  onChange={(e) => handleCaseChange(e.target.value)}
                  className="w-full appearance-none bg-secondary/20 border border-white/10 rounded-xl py-2.5 pr-4 pl-8 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right"
                >
                  <option value="">— لا توجد قضية مرتبطة —</option>
                  {mockCases.map((c) => (
                    <option key={c.id} value={c.id}>{c.caseNumber} — {c.title}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">ملاحظات</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="وصف مختصر لمحتوى المستند..."
                rows={3}
                className="bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground resize-none"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowUploadModal(false)} className="flex-1 rounded-xl border-white/10">
              إلغاء
            </Button>
            <Button
              onClick={handleAddDoc}
              disabled={!form.title || !form.clientName}
              className="flex-1 rounded-xl font-bold shadow-lg shadow-primary/20"
            >
              حفظ المستند
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Preview Modal ── */}
      {previewDoc && (
        <DocumentPreview
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
          onDownload={() => handleDownload(previewDoc)}
        />
      )}

      {/* ── Delete Confirm Dialog ── */}
      <AlertDialog open={!!deleteDoc} onOpenChange={(open) => { if (!open) setDeleteDoc(null); }}>
        <AlertDialogContent className="bg-card border border-white/10 text-foreground" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-xl">تأكيد حذف المستند</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              هل أنت متأكد من حذف المستند{" "}
              <span className="font-bold text-foreground">"{deleteDoc?.title}"</span>؟
              <br />
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel className="rounded-xl border-white/10 bg-secondary/20">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDoc}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف المستند
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
}

// ─── Document Card ─────────────────────────────────────────────────────────────

function DocumentCard({
  doc,
  onPreview,
  onDownload,
  onDelete,
}: {
  doc: LegalDocument;
  onPreview: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  const tc = DOC_TYPE_CONFIG[doc.type];
  const sc = STATUS_CONFIG[doc.status];
  const TypeIcon = tc.icon;
  const StatusIcon = sc.icon;

  return (
    <Card className="border-none bg-card/50 border border-white/5 shadow-sm hover:bg-card/80 hover:border-primary/20 transition-all duration-200 group overflow-hidden">
      <CardContent className="p-0">
        <div className={`h-1 w-full ${tc.color.replace("text-", "bg-")} opacity-60`} />

        <div className="p-6 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className={`h-11 w-11 rounded-2xl ${tc.bg} flex items-center justify-center shrink-0 shadow-inner`}>
              <TypeIcon className={`h-5 w-5 ${tc.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {doc.title}
              </p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${tc.bg} ${tc.color}`}>
                {doc.type}
              </span>
            </div>
          </div>

          {/* Meta */}
          <div className="space-y-2">
            <MetaRow icon={User} value={doc.clientName} />
            <MetaRow icon={Calendar} value={doc.createdAt} />
            {doc.caseNumber && <MetaRow icon={Gavel} value={doc.caseNumber} mono />}
            <MetaRow icon={FileText} value={`${doc.pages} صفحة • ${doc.size}`} />
          </div>

          {/* Tags */}
          {doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {doc.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-secondary/40 text-muted-foreground border border-white/5">
                  <Tag className="h-2.5 w-2.5" />{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${sc.bg} ${sc.color}`}>
              <StatusIcon className="h-3 w-3" />
              {sc.label}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                onClick={onPreview}
                title="عرض"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-accent/10 hover:text-accent"
                onClick={onDownload}
                title="تحميل"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                onClick={onDelete}
                title="حذف"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetaRow({ icon: Icon, value, mono }: { icon: React.ElementType; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Icon className="h-3 w-3 shrink-0" />
      <span className={`truncate ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

// ─── Preview Modal ──────────────────────────────────────────────────────────────

function DocumentPreview({
  doc,
  onClose,
  onDownload,
}: {
  doc: LegalDocument;
  onClose: () => void;
  onDownload: () => void;
}) {
  const tc = DOC_TYPE_CONFIG[doc.type];
  const sc = STATUS_CONFIG[doc.status];
  const TypeIcon = tc.icon;
  const StatusIcon = sc.icon;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border border-white/10 text-foreground max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden" dir="rtl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-white/10 shrink-0">
          <div className="flex items-start gap-4">
            <div className={`h-12 w-12 rounded-2xl ${tc.bg} flex items-center justify-center shrink-0`}>
              <TypeIcon className={`h-6 w-6 ${tc.color}`} />
            </div>
            <div>
              <h3 className="font-headline text-xl font-bold leading-snug">{doc.title}</h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${tc.bg} ${tc.color}`}>
                  {doc.type}
                </span>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.color}`}>
                  <StatusIcon className="h-3 w-3" />{sc.label}
                </span>
                {doc.caseNumber && (
                  <span className="text-[10px] font-mono text-muted-foreground bg-secondary/30 px-2.5 py-1 rounded-full border border-white/10">
                    {doc.caseNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-xl shrink-0 h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Meta bar */}
        <div className="flex items-center gap-6 px-6 py-3 bg-secondary/20 border-b border-white/5 shrink-0 flex-wrap">
          {[
            { icon: User,     value: doc.clientName },
            { icon: Calendar, value: doc.createdAt },
            { icon: FileText, value: `${doc.pages} صفحة` },
            { icon: FileText, value: doc.size },
            { icon: User,     value: doc.author },
          ].map((m, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <m.icon className="h-3 w-3" />
              <span>{m.value}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        {doc.description && (
          <div className="px-6 pt-4 pb-0 shrink-0">
            <p className="text-xs text-muted-foreground leading-relaxed bg-secondary/20 rounded-xl p-3 border border-white/5">
              {doc.description}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="bg-[#1a1d2e] border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-secondary/20">
              <span className="text-xs font-bold text-muted-foreground">معاينة المستند</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500/60" />
                <div className="h-2 w-2 rounded-full bg-amber-500/60" />
                <div className="h-2 w-2 rounded-full bg-emerald-500/60" />
              </div>
            </div>
            <div className="p-6 md:p-10">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90 text-right" dir="rtl">
                {doc.previewContent}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-5 border-t border-white/10 shrink-0">
          <div className="flex flex-wrap gap-1.5">
            {doc.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/40 text-muted-foreground border border-white/5">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl border-white/10 gap-2 text-xs font-bold" onClick={onClose}>
              إغلاق
            </Button>
            <Button size="sm" className="rounded-xl gap-2 text-xs font-bold shadow-lg shadow-primary/20" onClick={onDownload}>
              <Download className="h-3.5 w-3.5" />
              تحميل
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
