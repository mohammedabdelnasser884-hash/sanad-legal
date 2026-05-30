"use client";

import { useState } from "react";
import Link from "next/link";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  PlusCircle,
  Gavel,
  ChevronLeft,
  Calendar,
  User,
  Building2,
  Clock,
  CheckCircle2,
  PauseCircle,
  Scale,
  FileText,
} from "lucide-react";
import { mockCases, Case, CaseStatus } from "@/components/cases/mock-data";

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

export default function CasesPage() {
  const [filter, setFilter] = useState<CaseStatus | "الكل">("الكل");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [cases, setCases] = useState<Case[]>(mockCases);
  const [form, setForm] = useState({
    title: "",
    clientName: "",
    court: "",
    status: "نشطة" as CaseStatus,
    nextSession: "",
    type: "",
    description: "",
    caseNumber: "",
  });

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

  function handleAddCase() {
    if (!form.title || !form.clientName) return;
    const newCase: Case = {
      id: `CAS-${1100 + cases.length}`,
      caseNumber: form.caseNumber || `${1100 + cases.length}/ق/2024`,
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
    setCases((prev) => [newCase, ...prev]);
    setShowModal(false);
    setForm({ title: "", clientName: "", court: "", status: "نشطة", nextSession: "", type: "", description: "", caseNumber: "" });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold">إدارة القضايا</h2>
          <p className="text-muted-foreground mt-1">تتبع وإدارة كافة القضايا والإجراءات القانونية لمكتبك.</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="rounded-xl px-6 shadow-lg shadow-primary/20 font-bold gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          إضافة قضية جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "قضايا نشطة", value: stats.active, color: "text-emerald-400", bg: "bg-emerald-400/10", icon: CheckCircle2 },
          { label: "قضايا مؤجلة", value: stats.deferred, color: "text-amber-400", bg: "bg-amber-400/10", icon: PauseCircle },
          { label: "قضايا منتهية", value: stats.ended, color: "text-blue-400", bg: "bg-blue-400/10", icon: Scale },
        ].map((stat, i) => (
          <Card key={i} className="border-none bg-card/50 border border-white/5 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
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

      {/* Filters + Search */}
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

      {/* Table */}
      <Card className="border-none shadow-xl bg-card/50 border border-white/5 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-muted-foreground">
            <Gavel className="h-10 w-10 opacity-30" />
            <p className="text-sm font-medium">لا توجد قضايا تطابق معايير البحث</p>
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
                <TableHead className="text-left font-bold text-foreground/80 text-xs uppercase tracking-wide"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const sc = statusConfig[item.status];
                const StatusIcon = sc.icon;
                return (
                  <TableRow
                    key={item.id}
                    className="group hover:bg-white/5 border-border/40 transition-colors cursor-pointer"
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
                      <Link href={`/cases/${item.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          عرض التفاصيل <ChevronLeft className="h-3 w-3" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Add Case Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-card border border-white/10 text-foreground max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl flex items-center gap-2">
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
                <label className="text-xs font-bold text-muted-foreground">رقم القضية</label>
                <input
                  value={form.caseNumber}
                  onChange={(e) => setForm((p) => ({ ...p, caseNumber: e.target.value }))}
                  placeholder="مثال: 1100/ق/2024"
                  className="bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground"
                  dir="ltr"
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
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">الحالة</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as CaseStatus }))}
                  className="bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right"
                >
                  <option value="نشطة">نشطة</option>
                  <option value="مؤجلة">مؤجلة</option>
                  <option value="منتهية">منتهية</option>
                </select>
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
              <label className="text-xs font-bold text-muted-foreground">موعد الجلسة القادمة</label>
              <input
                value={form.nextSession}
                onChange={(e) => setForm((p) => ({ ...p, nextSession: e.target.value }))}
                placeholder="مثال: الأحد 15 يونيو 2024 - 9:00 ص"
                className="bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">نبذة عن القضية</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="وصف مختصر للقضية..."
                rows={3}
                className="bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground resize-none"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border-white/10">
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
    </div>
  );
}
