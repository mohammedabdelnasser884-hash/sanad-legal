"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Scale,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  TrendingUp,
  Calendar as CalendarIcon,
  ChevronLeft,
  Briefcase,
  FileText,
  Gavel,
  PlusCircle,
  Download,
  ShieldAlert,
  FileSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { type CaseStatus } from "@/components/cases/mock-data";

const INITIAL_CASES = [
  { title: "شركة الإنشاءات الكبرى vs المقاول الرئيسي", id: "قضية تجارية - المحكمة العامة بالرياض", status: "بانتظار الحكم", date: "الأحد القادم - 9 ص", priority: "high" },
  { title: "تركة فهد الراجحي (تصفية)", id: "أحوال شخصية - الدائرة الثالثة", status: "موعد جلسة", date: "غداً - 10:30 صباحاً", priority: "urgent" },
  { title: "استشارة امتثال شركة تقنية", id: "عقد توريد دولي", status: "مراجعة ذكية", date: "اليوم - 2 مساءً", priority: "normal" },
  { title: "نزاع عقاري - حي الملقا", id: "قضية مدنية - المحكمة العامة", status: "تم التأجيل", date: "24 مايو، 2024", priority: "low" },
];

const EMPTY_FORM = {
  title: "",
  clientName: "",
  court: "",
  type: "",
  nextSession: "",
  status: "نشطة" as CaseStatus,
  description: "",
  caseNumber: "",
};

export default function DashboardPage() {
  const { toast } = useToast();

  // local cases list (dashboard display)
  const [recentCases, setRecentCases] = useState(INITIAL_CASES);

  // add-case dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  // AI insight dialogs
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);

  const stats = [
    { label: "القضايا النشطة", value: String(32 + recentCases.length - INITIAL_CASES.length), icon: Gavel, color: "text-primary", bg: "bg-primary/10" },
    { label: "جلسات اليوم", value: "5", icon: CalendarIcon, color: "text-accent", bg: "bg-accent/10" },
    { label: "مواعيد ناجز", value: "14", icon: Clock, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "إجمالي الموكلين", value: "184", icon: Users, color: "text-amber-400", bg: "bg-amber-400/10" },
  ];

  function handleExport() {
    toast({ title: "جاري تصدير السجل...", description: "يتم إعداد ملف التصدير" });
    setTimeout(() => {
      toast({ title: "✅ تم التصدير بنجاح", description: "تم حفظ سجل القضايا كملف PDF" });
    }, 2000);
  }

  function handleAddCase() {
    if (!form.title || !form.clientName) return;
    const newItem = {
      title: `${form.title} (${form.clientName})`,
      id: `${form.type || "قضية"} - ${form.court || "المحكمة العامة"}`,
      status: "جديدة",
      date: form.nextSession || "—",
      priority: "normal",
    };
    setRecentCases((prev) => [newItem, ...prev]);
    setShowAddDialog(false);
    setForm(EMPTY_FORM);
    toast({ title: "✅ تم إضافة القضية بنجاح", description: `تمت إضافة "${form.title}" إلى سجل القضايا` });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-headline font-black">مرحباً بك، أستاذ أحمد السلطان</h2>
          <p className="text-base leading-relaxed text-muted-foreground">إليك ملخص أعمالك القانونية وتنبيهات الأنظمة لهذا اليوم.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            className="rounded-xl border-primary/30 bg-white/5 hover:border-primary/60 transition-all duration-200 gap-2"
          >
            <Download className="h-4 w-4" />
            تصدير سجل القضايا
          </Button>
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border border-primary/20 shadow-sm shadow-primary/10 bg-card/50 hover:bg-card/80 hover:border-primary/40 hover:shadow-primary/20 hover:shadow-md transition-all duration-200">
            <CardContent className="p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="text-3xl font-headline font-bold mt-1">{stat.value}</h3>
                </div>
                <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} shadow-sm`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-green-500">
                <TrendingUp className="h-3 w-3" />
                <span>+15% زيادة في الإنتاجية</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Cases */}
        <Card className="lg:col-span-2 border border-primary/15 shadow-sm shadow-primary/5 bg-card/50 hover:border-primary/30 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline text-xl font-bold">آخر التحديثات (منصة ناجز)</CardTitle>
              <CardDescription>تمت المزامنة بنجاح قبل 5 دقائق.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-primary hover:bg-primary/10">
              <Link href="/cases">مشاهدة الكل</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCases.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 hover:bg-secondary/40 transition-all group cursor-pointer border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.priority === "urgent" ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"}`}>
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm group-hover:text-primary transition-colors">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{item.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-left hidden sm:block">
                      <p className="text-[10px] text-muted-foreground uppercase font-extrabold mb-1">الموعد</p>
                      <p className="text-xs font-semibold">{item.date}</p>
                    </div>
                    <Badge variant={item.priority === "urgent" ? "destructive" : "secondary"} className="rounded-full px-4 text-[10px] font-bold">
                      {item.status}
                    </Badge>
                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <div className="space-y-6">
          <Card className="border border-primary/30 shadow-md shadow-primary/10 bg-gradient-to-br from-primary/20 to-accent/10 hover:border-primary/50 hover:shadow-primary/20 transition-all duration-200">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <CardTitle className="font-headline text-xl font-bold">تنبيهات سند الذكية</CardTitle>
              </div>
              <CardDescription className="text-xs">توصيات بناءً على الأنظمة السعودية الحديثة.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-2xl bg-background/50 border border-white/10 backdrop-blur-sm shadow-sm">
                <p className="text-sm font-bold text-primary flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4" /> رصد تعارض في عقد التوريد
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  تم اكتشاف بند في عقد شركة "أركان" يتعارض مع المادة 24 من نظام المعاملات المدنية المحدث. يرجى المراجعة.
                </p>
                <Button
                  size="sm"
                  variant="link"
                  onClick={() => setShowConflictDialog(true)}
                  className="p-0 h-auto mt-2 text-accent text-xs font-bold"
                >
                  معالجة الثغرة
                </Button>
              </div>

              <div className="p-4 rounded-2xl bg-background/50 border border-white/10 backdrop-blur-sm shadow-sm">
                <p className="text-sm font-bold text-accent flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" /> تحديث جدول قضية العمالة
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  تحديث آلي: تم رصد إيداع مذكرة جديدة من الخصم في ناجز. مساعد سند قام بتلخيصها لك.
                </p>
                <Button
                  size="sm"
                  variant="link"
                  onClick={() => setShowSummaryDialog(true)}
                  className="p-0 h-auto mt-2 text-accent text-xs font-bold"
                >
                  عرض الملخص الذكي
                </Button>
              </div>

              <Button asChild className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold h-12">
                <Link href="/ai-assistant">افتح مساعد سند الذكي</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-primary/15 shadow-sm shadow-primary/5 bg-card/50 p-6 flex flex-col items-center text-center hover:border-primary/30 transition-all duration-200">
            <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4 shadow-inner">
              <FileText className="h-8 w-8" />
            </div>
            <h4 className="font-bold mb-2">أتمتة المذكرات</h4>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">قم بإنشاء لائحة اعتراضية احترافية مدعمة بأحدث المبادئ القضائية في دقائق.</p>
            <Button variant="outline" className="w-full rounded-xl text-xs font-bold" asChild>
              <Link href="/ai-assistant">ابدأ الصياغة الآن</Link>
            </Button>
          </Card>
        </div>
      </div>

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
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="مثال: شركة الأمل ضد وزارة التجارة"
                className="bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground"
              />
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
                <label className="text-xs font-bold text-muted-foreground">نوع القضية</label>
                <input
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  placeholder="تجارية، عمالية..."
                  className="bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">المحكمة</label>
              <input
                value={form.court}
                onChange={(e) => setForm((p) => ({ ...p, court: e.target.value }))}
                placeholder="مثال: المحكمة التجارية بالرياض"
                className="bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">تاريخ أول جلسة</label>
              <input
                value={form.nextSession}
                onChange={(e) => setForm((p) => ({ ...p, nextSession: e.target.value }))}
                placeholder="مثال: الأحد 15 يونيو 2024 - 9:00 ص"
                className="bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1 rounded-xl border-white/10">
              إلغاء
            </Button>
            <Button
              onClick={handleAddCase}
              disabled={!form.title || !form.clientName}
              className="flex-1 rounded-xl font-bold shadow-lg shadow-primary/20"
            >
              إنشاء القضية
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conflict Dialog */}
      <Dialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <DialogContent className="bg-card border border-white/10 text-foreground max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl font-bold flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <ShieldAlert className="h-4 w-4 text-destructive" />
              </div>
              معالجة ثغرة عقد التوريد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm font-bold text-destructive mb-1">البند المتعارض — المادة 14 فقرة (ج)</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                "يحق للطرف الأول إنهاء العقد دون إشعار مسبق في حال تأخر الطرف الثاني عن أي دفعة لمدة تتجاوز 7 أيام."
              </p>
            </div>
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-sm font-bold text-primary mb-1">توصية سند القانوني</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                وفقاً للمادة 24 من نظام المعاملات المدنية المحدث 1444هـ، يشترط الإشعار المسبق لا يقل عن 30 يوماً قبل إنهاء أي عقد تجاري. يُنصح بتعديل البند ليتوافق مع النظام وتجنب بطلانه.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
              <p className="text-sm font-bold text-accent mb-2">الصياغة المقترحة</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                "يحق للطرف الأول إنهاء العقد بإشعار خطي مسبق لا يقل عن (30) يوماً، في حال تأخر الطرف الثاني عن سداد أي دفعة لمدة تتجاوز (15) يوماً من تاريخ استحقاقها."
              </p>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setShowConflictDialog(false)} className="rounded-xl border-white/10">
              إغلاق
            </Button>
            <Button className="rounded-xl font-bold shadow-lg shadow-primary/20" onClick={() => { setShowConflictDialog(false); toast({ title: "✅ تم نسخ الصياغة المقترحة" }); }}>
              نسخ الصياغة المقترحة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary Dialog */}
      <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
        <DialogContent className="bg-card border border-white/10 text-foreground max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl font-bold flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <FileSearch className="h-4 w-4 text-accent" />
              </div>
              ملخص المذكرة — قضية العمالة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-secondary/20 rounded-xl p-3">
              <span>تاريخ الإيداع: اليوم - 11:42 ص</span>
              <span className="text-accent font-bold">مذكرة دفاع</span>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-secondary/20 border border-white/5">
                <p className="text-xs font-bold text-foreground mb-1">📌 الموضوع الرئيسي</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  يطعن الخصم في صحة عقد العمل المبرم في مارس 2023، مدّعياً أن الراتب المتفق عليه يختلف عن ما أُودع في وزارة الموارد البشرية.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/20 border border-white/5">
                <p className="text-xs font-bold text-foreground mb-1">⚖️ الحجج القانونية</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  استند الخصم إلى المادة 55 من نظام العمل السعودي، وقدّم شهادة موظف سابق. طلب تعويضاً قدره 180,000 ريال عن الفارق المزعوم.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-xs font-bold text-primary mb-1">🤖 توصية سند</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  يُنصح بتقديم سجلات التحويلات البنكية للأشهر الـ12 الماضية، وشهادة المدير المباشر. موقف موكلك قوي بناءً على ما توفر من مستندات.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setShowSummaryDialog(false)} className="rounded-xl border-white/10">
              إغلاق
            </Button>
            <Button className="rounded-xl font-bold" asChild>
              <Link href="/ai-assistant" onClick={() => setShowSummaryDialog(false)}>
                فتح في المساعد الذكي
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
