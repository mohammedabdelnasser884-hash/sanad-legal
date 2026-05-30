"use client";

import { useState } from "react";
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
  ChevronLeft,
  Clock,
  CheckCircle2,
  FilePen,
  AlertCircle,
  Tag,
  BookOpen,
} from "lucide-react";
import {
  mockDocuments,
  LegalDocument,
  DocType,
  DocStatus,
} from "@/components/documents/mock-data";

// ─── Config ─────────────────────────────────────────────────────────────────

const DOC_TYPE_CONFIG: Record<DocType, { icon: React.ElementType; color: string; bg: string }> = {
  عقد:    { icon: FileSignature, color: "text-primary",     bg: "bg-primary/10" },
  مذكرة:  { icon: ScrollText,    color: "text-accent",      bg: "bg-accent/10" },
  توكيل:  { icon: FileText,      color: "text-purple-400",  bg: "bg-purple-400/10" },
  لائحة:  { icon: BookOpen,      color: "text-amber-400",   bg: "bg-amber-400/10" },
  حكم:    { icon: Gavel,         color: "text-emerald-400", bg: "bg-emerald-400/10" },
  تقرير:  { icon: BarChart3,     color: "text-blue-400",    bg: "bg-blue-400/10" },
};

const STATUS_CONFIG: Record<DocStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  نشط:                 { label: "نشط",                color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
  منتهي:               { label: "منتهي",              color: "text-muted-foreground", bg: "bg-secondary/40 border-white/10",     icon: Clock },
  "بانتظار التوقيع":   { label: "بانتظار التوقيع",   color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/20",   icon: AlertCircle },
  مسودة:               { label: "مسودة",              color: "text-blue-400",    bg: "bg-blue-400/10 border-blue-400/20",     icon: FilePen },
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>(mockDocuments);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocType | "الكل">("الكل");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<LegalDocument | null>(null);

  const [form, setForm] = useState({
    title: "",
    type: "عقد" as DocType,
    clientName: "",
    status: "مسودة" as DocStatus,
    description: "",
    caseNumber: "",
  });

  const filtered = documents.filter((d) => {
    const matchType = typeFilter === "الكل" || d.type === typeFilter;
    const matchSearch =
      search === "" ||
      d.title.includes(search) ||
      d.clientName.includes(search) ||
      d.caseNumber?.includes(search) ||
      d.tags.some((t) => t.includes(search));
    return matchType && matchSearch;
  });

  const stats = {
    total: documents.length,
    contracts: documents.filter((d) => d.type === "عقد").length,
    pending: documents.filter((d) => d.status === "بانتظار التوقيع").length,
    drafts: documents.filter((d) => d.status === "مسودة").length,
  };

  function handleAddDoc() {
    if (!form.title || !form.clientName) return;
    const newDoc: LegalDocument = {
      id: `DOC-${String(documents.length + 1).padStart(3, "0")}`,
      title: form.title,
      type: form.type,
      clientName: form.clientName,
      clientId: "",
      caseNumber: form.caseNumber || undefined,
      status: form.status,
      createdAt: new Date().toLocaleDateString("ar-SA"),
      updatedAt: new Date().toLocaleDateString("ar-SA"),
      size: "—",
      pages: 0,
      author: "أحمد السلطان",
      description: form.description,
      tags: [form.type],
      previewContent: `${form.title}\n\n${form.description || "لا يوجد محتوى بعد."}`,
    };
    setDocuments((p) => [newDoc, ...p]);
    setShowUploadModal(false);
    setForm({ title: "", type: "عقد", clientName: "", status: "مسودة", description: "", caseNumber: "" });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold">العقود والمستندات</h2>
          <p className="text-muted-foreground mt-1">أرشيف رقمي لجميع الوثائق والملفات القانونية للمكتب.</p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="rounded-xl px-6 shadow-lg shadow-primary/20 font-bold gap-2"
        >
          <Upload className="h-4 w-4" />
          رفع مستند جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "إجمالي المستندات", value: stats.total,     icon: FileText,     color: "text-primary",   bg: "bg-primary/10" },
          { label: "العقود النشطة",   value: stats.contracts,  icon: FileSignature, color: "text-accent",    bg: "bg-accent/10" },
          { label: "بانتظار التوقيع", value: stats.pending,    icon: AlertCircle,  color: "text-amber-400", bg: "bg-amber-400/10" },
          { label: "مسودات",          value: stats.drafts,     icon: FilePen,      color: "text-blue-400",  bg: "bg-blue-400/10" },
        ].map((s, i) => (
          <Card key={i} className="border-none bg-card/50 border border-white/5 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
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

      {/* Search + Type Filters */}
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
      </div>

      {/* Documents Grid */}
      {filtered.length === 0 ? (
        <div className="py-24 flex flex-col items-center gap-3 text-muted-foreground">
          <FileText className="h-10 w-10 opacity-30" />
          <p className="text-sm font-medium">لا توجد مستندات تطابق معايير البحث</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onPreview={() => setPreviewDoc(doc)}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="bg-card border border-white/10 text-foreground max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="h-4 w-4 text-primary" />
              </div>
              رفع مستند جديد
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Drop zone */}
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer bg-secondary/10">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-bold text-muted-foreground">اسحب الملف هنا أو انقر للاختيار</p>
              <p className="text-xs text-muted-foreground/60 mt-1">PDF, DOCX, PNG — حجم أقصى 20MB</p>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">عنوان المستند *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="مثال: عقد توريد - شركة الأمل"
                className="bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">نوع المستند</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as DocType }))}
                  className="bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right"
                >
                  {(["عقد", "مذكرة", "توكيل", "لائحة", "حكم", "تقرير"] as DocType[]).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">الحالة</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as DocStatus }))}
                  className="bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right"
                >
                  {(["نشط", "مسودة", "بانتظار التوقيع", "منتهي"] as DocStatus[]).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">اسم الموكل *</label>
                <input
                  value={form.clientName}
                  onChange={(e) => setForm((p) => ({ ...p, clientName: e.target.value }))}
                  placeholder="اسم الموكل"
                  className="bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">رقم القضية (اختياري)</label>
                <input
                  value={form.caseNumber}
                  onChange={(e) => setForm((p) => ({ ...p, caseNumber: e.target.value }))}
                  placeholder="مثال: 1029/ق/2024"
                  className="bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">وصف المستند</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="وصف مختصر لمحتوى المستند..."
                rows={2}
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

      {/* Preview Modal */}
      {previewDoc && (
        <DocumentPreview doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
    </div>
  );
}

// ─── Document Card ────────────────────────────────────────────────────────────

function DocumentCard({
  doc,
  onPreview,
}: {
  doc: LegalDocument;
  onPreview: () => void;
}) {
  const tc = DOC_TYPE_CONFIG[doc.type];
  const sc = STATUS_CONFIG[doc.status];
  const TypeIcon = tc.icon;
  const StatusIcon = sc.icon;

  return (
    <Card className="border-none bg-card/50 border border-white/5 shadow-sm hover:bg-card/80 hover:border-primary/20 transition-all duration-200 group overflow-hidden">
      <CardContent className="p-0">
        {/* Colored top bar */}
        <div className={`h-1 w-full ${tc.color.replace("text-", "bg-")} opacity-60`} />

        <div className="p-5 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className={`h-11 w-11 rounded-2xl ${tc.bg} flex items-center justify-center shrink-0 shadow-inner`}>
              <TypeIcon className={`h-5 w-5 ${tc.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {doc.title}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tc.bg} ${tc.color}`}>
                  {doc.type}
                </span>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="space-y-2">
            <MetaRow icon={User} value={doc.clientName} />
            <MetaRow icon={Calendar} value={doc.createdAt} />
            {doc.caseNumber && <MetaRow icon={Gavel} value={doc.caseNumber} mono />}
            <div className="flex items-center justify-between">
              <MetaRow icon={FileText} value={`${doc.pages} صفحة • ${doc.size}`} />
            </div>
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
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-accent/10 hover:text-accent"
              >
                <Download className="h-4 w-4" />
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

// ─── Preview Modal ────────────────────────────────────────────────────────────

function DocumentPreview({ doc, onClose }: { doc: LegalDocument; onClose: () => void }) {
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
              <h3 className="font-headline text-lg font-bold leading-snug">{doc.title}</h3>
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

        {/* Document preview */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="bg-[#1a1d2e] border border-white/10 rounded-2xl overflow-hidden">
            {/* Page header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-secondary/20">
              <span className="text-xs font-bold text-muted-foreground">معاينة المستند</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500/60" />
                <div className="h-2 w-2 rounded-full bg-amber-500/60" />
                <div className="h-2 w-2 rounded-full bg-emerald-500/60" />
              </div>
            </div>
            {/* Content */}
            <div className="p-6 md:p-10">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90 text-right" dir="rtl">
                {doc.previewContent}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer actions */}
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
            <Button size="sm" className="rounded-xl gap-2 text-xs font-bold shadow-lg shadow-primary/20">
              <Download className="h-3.5 w-3.5" />
              تحميل
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
