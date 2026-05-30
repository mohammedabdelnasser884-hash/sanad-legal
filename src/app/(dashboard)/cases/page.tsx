"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  PlusCircle,
  Gavel,
  ChevronLeft,
  ChevronDown,
  Calendar,
  User,
  Building2,
  CheckCircle2,
  PauseCircle,
  Scale,
  Download,
  Printer,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import { Case, CaseStatus } from "@/components/cases/mock-data";
import { getCases, addCase, updateCase, deleteCase as deleteCaseFromDB } from "@/lib/services/cases";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig: Record<CaseStatus, { color: string; bg: string; icon: React.ElementType }> = {
  نشطة: { color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
  منتهية: { color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20", icon: Scale },
  مؤجلة: { color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20", icon: PauseCircle },
};

const FILTERS: { label: string; value: CaseStatus | "الكل" }[] = [
  { label: "الكل", value: "الكل" },
  { label: "نشطة", value: "نشطة" },
  { label: "مؤجلة", value: "مؤجلة" },
  { label: "منتهية", value: "منتهية" },
];

const EMPTY_FORM = {
  title: "",
  clientName: "",
  court: "",
  status: "نشطة" as CaseStatus,
  nextSession: "",
  type: "",
  description: "",
  caseNumber: "",
};

export default function CasesPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<CaseStatus | "الكل">("الكل");
  const [search, setSearch] = useState("");
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    getCases()
      .then((data) => setCases(data))
      .catch(() => toast({ title: "خطأ في تحميل القضايا", variant: "destructive" }))
      .finally(() => setIsLoading(false));
  }, []);

  // Add dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  // Edit dialog
  const [editCase, setEditCase] = useState<Case | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  // Delete dialog
  const [deleteCase, setDeleteCase] = useState<Case | null>(null);

  const filtered = cases.filter((c) => {
    const matchesFilter = filter === "الكل" || c.status === filter;
    const matchesSearch =
      search === "" ||
      c.title.includes(search) ||
      c.clientName.includes(search) ||
      c.caseNumber.includes(search) ||
      c.court.includes(search);
    return matchesFilter && matchesSearch;
  });

  const stats = {
    active: cases.filter((c) => c.status === "نشطة").length,
    ended: cases.filter((c) => c.status === "منتهية").length,
    deferred: cases.filter((c) => c.status === "مؤجلة").length,
  };

  async function handleAddCase() {
    if (!form.title || !form.clientName) return;
    const newCase = {
      caseNumber: form.caseNumber || `${Date.now()}/ق/2024`,
      title: form.title,
      clientName: form.clientName,
      court: form.court,
      status: form.status,
      nextSession: form.nextSession || "—",
      type: form.type,
      createdAt: new Date().toLocaleDateString("ar-SA"),
      description: form.description,
      judge: "—",
      opponent: "—",
      sessions: [],
      documents: [],
    };
    try {
      const id = await addCase(newCase);
      setCases((prev) => [{ ...newCase, id }, ...prev]);
      setShowAddDialog(false);
      setForm(EMPTY_FORM);
      toast({ title: "✅ تم إضافة القضية بنجاح", description: `"${form.title}" أُضيفت إلى سجل القضايا` });
    } catch {
      toast({ title: "خطأ في الإضافة", variant: "destructive" });
    }
  }

  function openEdit(c: Case) {
    setEditCase(c);
    setEditForm({
      title: c.title,
      clientName: c.clientName,
      court: c.court,
      status: c.status,
      nextSession: c.nextSession,
      type: c.type,
      description: c.description,
      caseNumber: c.caseNumber,
    });
  }

  async function handleEditCase() {
    if (!editCase || !editForm.title || !editForm.clientName) return;
    try {
      await updateCase(editCase.id, editForm);
      setCases((prev) =>
        prev.map((c) => c.id === editCase.id ? { ...c, ...editForm } : c)
      );
      setEditCase(null);
      toast({ title: "✅ تم تحديث القضية", description: `تم حفظ التعديلات على "${editForm.title}"` });
    } catch {
      toast({ title: "خطأ في التحديث", variant: "destructive" });
    }
  }

  async function handleDeleteCase() {
    if (!deleteCase) return;
    try {
      await deleteCaseFromDB(deleteCase.id);
      setCases((prev) => prev.filter((c) => c.id !== deleteCase.id));
      toast({ title: "🗑️ تم حذف القضية", description: `تم حذف "${deleteCase.title}" من السجل` });
      setDeleteCase(null);
    } catch {
      toast({ title: "خطأ في الحذف", variant: "destructive" });
    }
  }

  function exportCSV() {
    const headers = ["رقم القضية", "العنوان", "الموكل", "الحالة", "النوع", "تاريخ الافتتاح"];
    const rows = filtered.map((c) => [
      c.caseNumber,
      c.title,
      c.clientName,
      c.status,
      c.type,
      c.createdAt,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `قضايا_${new Date().toLocaleDateString("ar-SA").replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "✅ تم تصدير CSV بنجاح", description: `تم تصدير ${filtered.length} قضية` });
  }

  function handlePrint() {
    window.print();
  }

  const inputCls = "bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground w-full";

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-headline font-black">إدارة القضايا</h2>
          <p className="text-muted-foreground mt-1">تتبع وإدارة كافة القضايا والإجراءات القانونية لمكتبك.</p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-xl border-primary/30 bg-white/5 hover:border-primary/60 transition-all duration-200 gap-2"
              >
                <Download className="h-4 w-4" />
                تصدير
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={exportCSV} className="gap-2 cursor-pointer">
                <Download className="h-4 w-4" />
                تصدير CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint} className="gap-2 cursor-pointer">
                <Printer className="h-4 w-4" />
                طباعة
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="rounded-xl px-6 shadow-lg shadow-primary/30 font-bold transition-all duration-200 hover:shadow-primary/40 hover:shadow-xl gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            إضافة قضية جديدة
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="border border-primary/20 bg-card/50">
              <CardContent className="p-6 flex items-center gap-4">
                <Skeleton className="h-11 w-11 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-6 w-10 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "قضايا نشطة", value: stats.active, color: "text-emerald-400", bg: "bg-emerald-400/10", icon: CheckCircle2 },
            { label: "قضايا مؤجلة", value: stats.deferred, color: "text-amber-400", bg: "bg-amber-400/10", icon: PauseCircle },
            { label: "قضايا منتهية", value: stats.ended, color: "text-blue-400", bg: "bg-blue-400/10", icon: Scale },
          ].map((stat, i) => (
            <Card key={i} className="border border-primary/20 shadow-sm shadow-primary/10 bg-card/50 hover:border-primary/40 hover:shadow-primary/20 hover:shadow-md transition-all duration-200">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className={`text-2xl font-bold font-headline ${stat.color}`}>{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Filters + Search ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث برقم القضية، الموكل، المحكمة..."
            className="w-full bg-secondary/20 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 bg-secondary/20 border border-white/10 rounded-xl p-1.5 shrink-0">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                filter === f.value
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <Card className="border border-primary/15 shadow-md shadow-primary/5 bg-card/50 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-border/30">
                <Skeleton className="h-4 w-24 rounded" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-48 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-28 rounded" />
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-4 text-muted-foreground">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Gavel className="h-8 w-8 text-primary/40" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-semibold text-foreground/70">لا توجد قضايا مطابقة</p>
              <p className="text-sm text-muted-foreground">جرّب تغيير معايير البحث أو الفلتر</p>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="rounded-xl gap-2 mt-2 shadow-lg shadow-primary/20"
            >
              <PlusCircle className="h-4 w-4" />
              إضافة قضية جديدة
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-right font-bold text-foreground/80 text-xs uppercase tracking-wide">رقم القضية</TableHead>
                <TableHead className="text-right font-bold text-foreground/80 text-xs uppercase tracking-wide">القضية / الموكل</TableHead>
                <TableHead className="text-right font-bold text-foreground/80 text-xs uppercase tracking-wide">المحكمة</TableHead>
                <TableHead className="text-right font-bold text-foreground/80 text-xs uppercase tracking-wide">الحالة</TableHead>
                <TableHead className="text-right font-bold text-foreground/80 text-xs uppercase tracking-wide">الجلسة القادمة</TableHead>
                <TableHead className="text-left font-bold text-foreground/80 text-xs uppercase tracking-wide">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const sc = statusConfig[item.status];
                const StatusIcon = sc.icon;
                return (
                  <TableRow
                    key={item.id}
                    className="group hover:bg-white/5 border-border/40 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground text-right">
                      {item.caseNumber}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-sm group-hover:text-primary transition-colors leading-snug">
                          {item.title}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          {item.clientName} <User className="h-3 w-3" />
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        {item.court} <Building2 className="h-3 w-3 shrink-0" />
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${sc.bg} ${sc.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-end">
                        {item.nextSession !== "—" && <Calendar className="h-3 w-3 shrink-0 text-accent" />}
                        <span className={item.nextSession !== "—" ? "text-foreground/80" : ""}>{item.nextSession}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-all">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/cases/${item.id}`)}
                          className="rounded-lg h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          title="عرض التفاصيل"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(item)}
                          className="rounded-lg h-8 w-8 p-0 text-muted-foreground hover:text-accent hover:bg-accent/10"
                          title="تعديل"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteCase(item)}
                          className="rounded-lg h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="حذف"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/cases/${item.id}`)}
                          className="rounded-lg gap-1 text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 px-2"
                        >
                          التفاصيل <ChevronLeft className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* ══════════════════════════════════════════════════════════════
          DIALOGS
      ══════════════════════════════════════════════════════════════ */}

      {/* Add Case Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-card border border-white/10 text-foreground max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl font-bold flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Gavel className="h-4 w-4 text-primary" />
              </div>
              إضافة قضية جديدة
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">عنوان القضية *</label>
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="مثال: شركة الأمل ضد وزارة التجارة" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">اسم الموكل *</label>
                <input value={form.clientName} onChange={(e) => setForm((p) => ({ ...p, clientName: e.target.value }))} placeholder="اسم الموكل" className={inputCls} />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">رقم القضية</label>
                <input value={form.caseNumber} onChange={(e) => setForm((p) => ({ ...p, caseNumber: e.target.value }))} placeholder="1100/ق/2024" className={inputCls} dir="ltr" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">المحكمة</label>
              <input value={form.court} onChange={(e) => setForm((p) => ({ ...p, court: e.target.value }))} placeholder="المحكمة التجارية بالرياض" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">الحالة</label>
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as CaseStatus }))} className={inputCls}>
                  <option value="نشطة">نشطة</option>
                  <option value="مؤجلة">مؤجلة</option>
                  <option value="منتهية">منتهية</option>
                </select>
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">نوع القضية</label>
                <input value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} placeholder="تجارية، عمالية..." className={inputCls} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">تاريخ أول جلسة</label>
              <input value={form.nextSession} onChange={(e) => setForm((p) => ({ ...p, nextSession: e.target.value }))} placeholder="الأحد 15 يونيو 2024 - 9:00 ص" className={inputCls} />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">نبذة عن القضية</label>
              <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="وصف مختصر للقضية..." rows={3} className={`${inputCls} resize-none`} />
            </div>
          </div>
          <DialogFooter className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1 rounded-xl border-white/10">إلغاء</Button>
            <Button onClick={handleAddCase} disabled={!form.title || !form.clientName} className="flex-1 rounded-xl font-bold shadow-lg shadow-primary/20">
              إنشاء القضية
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Case Dialog */}
      <Dialog open={!!editCase} onOpenChange={(open) => !open && setEditCase(null)}>
        <DialogContent className="bg-card border border-white/10 text-foreground max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl font-bold flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Pencil className="h-4 w-4 text-accent" />
              </div>
              تعديل القضية
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">عنوان القضية *</label>
              <input value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">اسم الموكل *</label>
                <input value={editForm.clientName} onChange={(e) => setEditForm((p) => ({ ...p, clientName: e.target.value }))} className={inputCls} />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">رقم القضية</label>
                <input value={editForm.caseNumber} onChange={(e) => setEditForm((p) => ({ ...p, caseNumber: e.target.value }))} className={inputCls} dir="ltr" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">المحكمة</label>
              <input value={editForm.court} onChange={(e) => setEditForm((p) => ({ ...p, court: e.target.value }))} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">الحالة</label>
                <select value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as CaseStatus }))} className={inputCls}>
                  <option value="نشطة">نشطة</option>
                  <option value="مؤجلة">مؤجلة</option>
                  <option value="منتهية">منتهية</option>
                </select>
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">نوع القضية</label>
                <input value={editForm.type} onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">موعد الجلسة القادمة</label>
              <input value={editForm.nextSession} onChange={(e) => setEditForm((p) => ({ ...p, nextSession: e.target.value }))} className={inputCls} />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">نبذة عن القضية</label>
              <textarea value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} rows={3} className={`${inputCls} resize-none`} />
            </div>
          </div>
          <DialogFooter className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditCase(null)} className="flex-1 rounded-xl border-white/10">إلغاء</Button>
            <Button onClick={handleEditCase} disabled={!editForm.title || !editForm.clientName} className="flex-1 rounded-xl font-bold shadow-lg shadow-primary/20">
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete AlertDialog */}
      <AlertDialog open={!!deleteCase} onOpenChange={(open) => !open && setDeleteCase(null)}>
        <AlertDialogContent className="bg-card border border-white/10 text-foreground" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-xl font-bold flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-destructive" />
              </div>
              تأكيد حذف القضية
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground leading-relaxed">
              هل أنت متأكد من حذف القضية{" "}
              <span className="font-bold text-foreground">"{deleteCase?.title}"</span>؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه وسيُزال السجل نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel className="rounded-xl border-white/10 bg-secondary/20">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCase}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold"
            >
              نعم، احذف القضية
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
}
