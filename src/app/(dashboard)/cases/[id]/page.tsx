"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  User,
  Building2,
  Calendar,
  Gavel,
  FileText,
  Clock,
  CheckCircle2,
  PauseCircle,
  Scale,
  Users,
  BookOpen,
  MessageSquare,
  Download,
  Pencil,
  Trash2,
  Plus,
  CheckSquare,
  Square,
  AlertCircle,
} from "lucide-react";
import { mockCases, CaseStatus, Case } from "@/components/cases/mock-data";

// ─── Config ───────────────────────────────────────────────────────────────────

const statusConfig: Record<CaseStatus, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  نشطة:   { color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2, label: "نشطة" },
  منتهية: { color: "text-blue-400",    bg: "bg-blue-400/10 border-blue-400/20",       icon: Scale,        label: "منتهية" },
  مؤجلة:  { color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/20",     icon: PauseCircle,  label: "مؤجلة" },
};

const docTypeColor: Record<string, string> = {
  عقد:           "text-primary bg-primary/10",
  تقرير:         "text-accent bg-accent/10",
  لائحة:         "text-amber-400 bg-amber-400/10",
  حكم:           "text-emerald-400 bg-emerald-400/10",
  مذكرة:         "text-purple-400 bg-purple-400/10",
  "وثيقة رسمية": "text-blue-400 bg-blue-400/10",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Task {
  id: string;
  title: string;
  priority: "عالية" | "متوسطة" | "منخفضة";
  dueDate: string;
  done: boolean;
}

const PRIORITY_CONFIG: Record<Task["priority"], { color: string; bg: string }> = {
  عالية:    { color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
  متوسطة:   { color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/20" },
  منخفضة:   { color: "text-muted-foreground", bg: "bg-secondary/40 border-white/10" },
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = "info" | "sessions" | "documents" | "tasks";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "info",      label: "البيانات",   icon: Gavel },
  { id: "sessions",  label: "الجلسات",    icon: Clock },
  { id: "documents", label: "المستندات",  icon: FileText },
  { id: "tasks",     label: "المهام",     icon: CheckCircle2 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  // Find case from mock — we hold a local copy so edits reflect immediately
  const found = mockCases.find((c) => c.id === id);
  const [caseData, setCaseData] = useState<Case | null>(found ?? null);

  const [activeTab, setActiveTab] = useState<Tab>("info");

  // ── Edit Case ────────────────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: caseData?.title ?? "",
    status: (caseData?.status ?? "نشطة") as CaseStatus,
    type: caseData?.type ?? "",
    clientName: caseData?.clientName ?? "",
    court: caseData?.court ?? "",
    judge: caseData?.judge ?? "",
    opponent: caseData?.opponent ?? "",
    nextSession: caseData?.nextSession ?? "",
    description: caseData?.description ?? "",
  });

  const handleOpenEdit = () => {
    if (!caseData) return;
    setEditForm({
      title: caseData.title,
      status: caseData.status,
      type: caseData.type,
      clientName: caseData.clientName,
      court: caseData.court,
      judge: caseData.judge,
      opponent: caseData.opponent,
      nextSession: caseData.nextSession,
      description: caseData.description,
    });
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editForm.title.trim() || !editForm.clientName.trim()) {
      toast({ title: "خطأ", description: "العنوان واسم الموكل مطلوبان", variant: "destructive" });
      return;
    }
    setCaseData((prev) => prev ? { ...prev, ...editForm } : prev);
    setEditOpen(false);
    toast({ title: "تم تعديل القضية ✓" });
  };

  // ── Delete Case ──────────────────────────────────────────────────────────
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = () => {
    setDeleteOpen(false);
    toast({ title: "تم حذف القضية", description: caseData?.title });
    router.push("/cases");
  };

  // ── Sessions ─────────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState(caseData?.sessions ?? []);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({ date: "", result: "", notes: "" });

  const handleAddSession = () => {
    if (!sessionForm.date.trim() || !sessionForm.result.trim()) {
      toast({ title: "خطأ", description: "التاريخ والنتيجة مطلوبان", variant: "destructive" });
      return;
    }
    setSessions((prev) => [...prev, { ...sessionForm }]);
    setSessionOpen(false);
    setSessionForm({ date: "", result: "", notes: "" });
    toast({ title: "تم إضافة الجلسة ✓" });
  };

  // ── Documents ────────────────────────────────────────────────────────────
  const [documents, setDocuments] = useState(caseData?.documents ?? []);
  const [docOpen, setDocOpen] = useState(false);
  const [docForm, setDocForm] = useState({ name: "", type: "عقد", notes: "" });

  const handleAddDoc = () => {
    if (!docForm.name.trim()) {
      toast({ title: "خطأ", description: "اسم المستند مطلوب", variant: "destructive" });
      return;
    }
    const today = new Date().toLocaleDateString("ar-SA");
    setDocuments((prev) => [...prev, { name: docForm.name, type: docForm.type, date: today }]);
    setDocOpen(false);
    setDocForm({ name: "", type: "عقد", notes: "" });
    toast({ title: "تم إضافة المستند ✓" });
  };

  // ── Tasks ────────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState<Task[]>([
    { id: "T1", title: "مراجعة مستندات الخبير", priority: "عالية",  dueDate: "2026-06-05", done: false },
    { id: "T2", title: "التواصل مع الموكل",      priority: "متوسطة", dueDate: "2026-06-03", done: true },
  ]);
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", priority: "متوسطة" as Task["priority"], dueDate: "" });

  const handleAddTask = () => {
    if (!taskForm.title.trim()) {
      toast({ title: "خطأ", description: "عنوان المهمة مطلوب", variant: "destructive" });
      return;
    }
    const newTask: Task = { id: "T" + Date.now(), ...taskForm, done: false };
    setTasks((prev) => [...prev, newTask]);
    setTaskOpen(false);
    setTaskForm({ title: "", priority: "متوسطة", dueDate: "" });
    toast({ title: "تم إضافة المهمة ✓" });
  };

  const toggleTask = (tid: string) => {
    setTasks((prev) => prev.map((t) => t.id === tid ? { ...t, done: !t.done } : t));
  };

  // ─────────────────────────────────────────────────────────────────────────

  if (!caseData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
        <AlertCircle className="h-12 w-12 opacity-20" />
        <p className="font-bold">القضية غير موجودة</p>
        <Link href="/cases">
          <Button variant="outline" className="rounded-xl border-white/10">العودة للقضايا</Button>
        </Link>
      </div>
    );
  }

  const sc = statusConfig[caseData.status];
  const StatusIcon = sc.icon;

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      <Toaster />

      {/* Breadcrumb + Title */}
      <div className="flex flex-col gap-4">
        <Link
          href="/cases"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى قائمة القضايا
        </Link>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${sc.bg} ${sc.color}`}>
                <StatusIcon className="h-3 w-3" />
                {sc.label}
              </span>
              <span className="font-mono text-xs text-muted-foreground bg-secondary/30 px-3 py-1 rounded-full border border-white/10">
                {caseData.caseNumber}
              </span>
              {caseData.type && (
                <span className="text-xs text-muted-foreground bg-secondary/30 px-3 py-1 rounded-full border border-white/10">
                  {caseData.type}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold leading-snug">{caseData.title}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 gap-2 text-xs font-bold"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" /> حذف القضية
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-white/10 gap-2 text-xs font-bold"
              onClick={handleOpenEdit}
            >
              <Pencil className="h-3.5 w-3.5" /> تعديل القضية
            </Button>
            <Button size="sm" className="rounded-xl gap-2 text-xs font-bold shadow-lg shadow-primary/20">
              <MessageSquare className="h-3.5 w-3.5" /> استشارة سند الذكي
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border border-primary/15 bg-card/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10"><Gavel className="h-4 w-4 text-primary" /></div>
            <div><p className="text-xl font-headline font-bold text-primary">{sessions.length}</p><p className="text-[10px] text-muted-foreground">جلسة مسجلة</p></div>
          </CardContent>
        </Card>
        <Card className="border border-primary/15 bg-card/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10"><FileText className="h-4 w-4 text-accent" /></div>
            <div><p className="text-xl font-headline font-bold text-accent">{documents.length}</p><p className="text-[10px] text-muted-foreground">مستند مرفق</p></div>
          </CardContent>
        </Card>
        <Card className="border border-primary/15 bg-card/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400/10"><CheckCircle2 className="h-4 w-4 text-amber-400" /></div>
            <div><p className="text-xl font-headline font-bold text-amber-400">{tasks.filter(t => !t.done).length}</p><p className="text-[10px] text-muted-foreground">مهمة معلقة</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/30 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Info ─────────────────────────────────────────────────────── */}
      {activeTab === "info" && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 border-none bg-card/50 border border-white/5">
            <CardHeader>
              <CardTitle className="font-headline text-base flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Gavel className="h-4 w-4 text-primary" />
                </div>
                بيانات القضية
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem icon={User}     label="الموكل"         value={caseData.clientName} />
                <InfoItem icon={Building2} label="المحكمة"        value={caseData.court} />
                <InfoItem icon={Users}    label="الخصم"          value={caseData.opponent} />
                <InfoItem icon={BookOpen} label="القاضي"         value={caseData.judge} />
                <InfoItem icon={Clock}    label="تاريخ القيد"    value={caseData.createdAt} />
                {caseData.nextSession !== "—" && (
                  <InfoItem icon={Calendar} label="الجلسة القادمة" value={caseData.nextSession} accent />
                )}
              </div>
              {caseData.description && (
                <div className="p-4 rounded-2xl bg-secondary/20 border border-white/5 space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">نبذة عن القضية</p>
                  <p className="text-sm leading-relaxed text-foreground/90">{caseData.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {caseData.nextSession !== "—" && (
              <Card className="border-none bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="font-bold text-sm">الجلسة القادمة</span>
                  </div>
                  <p className="text-lg font-headline font-bold leading-snug text-foreground">{caseData.nextSession}</p>
                  <Button size="sm" className="mt-4 w-full rounded-xl text-xs font-bold" variant="outline">
                    إضافة للتقويم
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Sessions ─────────────────────────────────────────────────── */}
      {activeTab === "sessions" && (
        <Card className="border-none bg-card/50 border border-white/5">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-headline text-base flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-accent" />
              </div>
              سجل الجلسات
            </CardTitle>
            <Button size="sm" className="rounded-xl text-xs font-bold gap-1.5" onClick={() => setSessionOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> إضافة جلسة
            </Button>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="font-bold text-sm">لا توجد جلسات مسجلة</p>
                <Button size="sm" variant="outline" className="mt-4 rounded-xl border-white/10 text-xs" onClick={() => setSessionOpen(true)}>
                  <Plus className="h-3.5 w-3.5 ml-1" /> أضف أول جلسة
                </Button>
              </div>
            ) : (
              <div className="relative space-y-0">
                {sessions.map((session, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center shrink-0 mt-1">
                        <span className="text-xs font-bold text-primary">{i + 1}</span>
                      </div>
                      {i < sessions.length - 1 && (
                        <div className="w-px flex-1 bg-border/50 my-1 min-h-4" />
                      )}
                    </div>
                    <div className="pb-6 flex-1">
                      <div className="p-4 rounded-2xl bg-secondary/20 border border-white/5 hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <span className="font-bold text-sm">{session.result}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {session.date}
                          </span>
                        </div>
                        {session.notes && (
                          <p className="text-xs text-muted-foreground leading-relaxed">{session.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Tab: Documents ────────────────────────────────────────────────── */}
      {activeTab === "documents" && (
        <Card className="border-none bg-card/50 border border-white/5">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-headline text-base flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-accent" />
              </div>
              المستندات والملفات
            </CardTitle>
            <Button size="sm" className="rounded-xl text-xs font-bold gap-1.5" onClick={() => setDocOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> إضافة مستند
            </Button>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="font-bold text-sm">لا توجد مستندات مرفقة</p>
                <Button size="sm" variant="outline" className="mt-4 rounded-xl border-white/10 text-xs" onClick={() => setDocOpen(true)}>
                  <Plus className="h-3.5 w-3.5 ml-1" /> أضف أول مستند
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {documents.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/20 border border-white/5 hover:bg-secondary/30 transition-colors group cursor-pointer"
                  >
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${docTypeColor[doc.type] || "text-muted-foreground bg-secondary/30"}`}>
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.date}</p>
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Tab: Tasks ────────────────────────────────────────────────────── */}
      {activeTab === "tasks" && (
        <Card className="border-none bg-card/50 border border-white/5">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-headline text-base flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-amber-400/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-amber-400" />
              </div>
              المهام
            </CardTitle>
            <Button size="sm" className="rounded-xl text-xs font-bold gap-1.5" onClick={() => setTaskOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> مهمة جديدة
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="font-bold text-sm">لا توجد مهام</p>
                <Button size="sm" variant="outline" className="mt-4 rounded-xl border-white/10 text-xs" onClick={() => setTaskOpen(true)}>
                  <Plus className="h-3.5 w-3.5 ml-1" /> أضف أول مهمة
                </Button>
              </div>
            ) : (
              tasks.map((task) => {
                const priCfg = PRIORITY_CONFIG[task.priority];
                return (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer
                      ${task.done ? "bg-card/20 border-white/5 opacity-60" : "bg-card/50 border-white/10 hover:border-white/20"}`}
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.done
                      ? <CheckSquare className="h-5 w-5 text-emerald-400 shrink-0" />
                      : <Square className="h-5 w-5 text-muted-foreground shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${task.done ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
                      {task.dueDate && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {task.dueDate}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className={`text-xs shrink-0 ${priCfg.bg} ${priCfg.color} border`}>
                      {task.priority}
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}

      {/* ══ Dialogs ══════════════════════════════════════════════════════════ */}

      {/* Edit Case */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg bg-card border-white/10 text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">تعديل القضية</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-bold">العنوان *</Label>
              <Input value={editForm.title} onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))}
                className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-bold">الحالة</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm(p => ({ ...p, status: v as CaseStatus }))}>
                  <SelectTrigger className="bg-secondary/40 border-white/10 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نشطة">نشطة</SelectItem>
                    <SelectItem value="مؤجلة">مؤجلة</SelectItem>
                    <SelectItem value="منتهية">منتهية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-bold">النوع</Label>
                <Input value={editForm.type} onChange={(e) => setEditForm(p => ({ ...p, type: e.target.value }))}
                  className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-bold">الموكل *</Label>
                <Input value={editForm.clientName} onChange={(e) => setEditForm(p => ({ ...p, clientName: e.target.value }))}
                  className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-bold">المحكمة</Label>
                <Input value={editForm.court} onChange={(e) => setEditForm(p => ({ ...p, court: e.target.value }))}
                  className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-bold">القاضي</Label>
                <Input value={editForm.judge} onChange={(e) => setEditForm(p => ({ ...p, judge: e.target.value }))}
                  className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-bold">الخصم</Label>
                <Input value={editForm.opponent} onChange={(e) => setEditForm(p => ({ ...p, opponent: e.target.value }))}
                  className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold">الجلسة القادمة</Label>
              <Input value={editForm.nextSession} onChange={(e) => setEditForm(p => ({ ...p, nextSession: e.target.value }))}
                placeholder="مثل: الأحد 2 يونيو 2026 - 9:00 ص"
                className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold">الوصف</Label>
              <Textarea value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))}
                className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl resize-none" rows={3} />
            </div>
          </div>
          <DialogFooter className="gap-2 flex-row-reverse sm:flex-row-reverse mt-2">
            <Button variant="outline" className="rounded-xl border-white/10 flex-1" onClick={() => setEditOpen(false)}>إلغاء</Button>
            <Button className="rounded-xl flex-1 font-bold" onClick={handleSaveEdit}>حفظ التعديلات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Case */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-white/10" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد حذف القضية</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف قضية "{caseData.title}"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel className="rounded-xl border-white/10">إلغاء</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Session */}
      <Dialog open={sessionOpen} onOpenChange={setSessionOpen}>
        <DialogContent className="max-w-md bg-card border-white/10 text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">إضافة جلسة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-bold">التاريخ *</Label>
              <Input type="date" value={sessionForm.date} onChange={(e) => setSessionForm(p => ({ ...p, date: e.target.value }))}
                className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold">النتيجة / الإجراء *</Label>
              <Input value={sessionForm.result} onChange={(e) => setSessionForm(p => ({ ...p, result: e.target.value }))}
                placeholder="مثل: تأجيل، استماع، حكم..."
                className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold">ملاحظات</Label>
              <Textarea value={sessionForm.notes} onChange={(e) => setSessionForm(p => ({ ...p, notes: e.target.value }))}
                className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl resize-none" rows={3} />
            </div>
          </div>
          <DialogFooter className="gap-2 flex-row-reverse sm:flex-row-reverse mt-2">
            <Button variant="outline" className="rounded-xl border-white/10 flex-1" onClick={() => setSessionOpen(false)}>إلغاء</Button>
            <Button className="rounded-xl flex-1 font-bold" onClick={handleAddSession}>إضافة الجلسة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Document */}
      <Dialog open={docOpen} onOpenChange={setDocOpen}>
        <DialogContent className="max-w-md bg-card border-white/10 text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">إضافة مستند</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-bold">اسم المستند *</Label>
              <Input value={docForm.name} onChange={(e) => setDocForm(p => ({ ...p, name: e.target.value }))}
                placeholder="اسم الملف أو المستند"
                className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold">النوع</Label>
              <Select value={docForm.type} onValueChange={(v) => setDocForm(p => ({ ...p, type: v }))}>
                <SelectTrigger className="bg-secondary/40 border-white/10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["عقد","لائحة","حكم","مذكرة","تقرير","وثيقة رسمية"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold">ملاحظات</Label>
              <Textarea value={docForm.notes} onChange={(e) => setDocForm(p => ({ ...p, notes: e.target.value }))}
                className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl resize-none" rows={2} />
            </div>
          </div>
          <DialogFooter className="gap-2 flex-row-reverse sm:flex-row-reverse mt-2">
            <Button variant="outline" className="rounded-xl border-white/10 flex-1" onClick={() => setDocOpen(false)}>إلغاء</Button>
            <Button className="rounded-xl flex-1 font-bold" onClick={handleAddDoc}>إضافة المستند</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task */}
      <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
        <DialogContent className="max-w-md bg-card border-white/10 text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">مهمة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-bold">عنوان المهمة *</Label>
              <Input value={taskForm.title} onChange={(e) => setTaskForm(p => ({ ...p, title: e.target.value }))}
                placeholder="وصف المهمة المطلوبة"
                className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-bold">الأولوية</Label>
                <Select value={taskForm.priority} onValueChange={(v) => setTaskForm(p => ({ ...p, priority: v as Task["priority"] }))}>
                  <SelectTrigger className="bg-secondary/40 border-white/10 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="عالية">عالية</SelectItem>
                    <SelectItem value="متوسطة">متوسطة</SelectItem>
                    <SelectItem value="منخفضة">منخفضة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-bold">تاريخ الاستحقاق</Label>
                <Input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm(p => ({ ...p, dueDate: e.target.value }))}
                  className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 flex-row-reverse sm:flex-row-reverse mt-2">
            <Button variant="outline" className="rounded-xl border-white/10 flex-1" onClick={() => setTaskOpen(false)}>إلغاء</Button>
            <Button className="rounded-xl flex-1 font-bold" onClick={handleAddTask}>إضافة المهمة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── InfoItem ─────────────────────────────────────────────────────────────────

function InfoItem({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${accent ? "bg-accent/10 text-accent" : "bg-secondary/40 text-muted-foreground"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-sm font-semibold ${accent ? "text-accent" : "text-foreground/90"}`}>{value}</p>
      </div>
    </div>
  );
}
