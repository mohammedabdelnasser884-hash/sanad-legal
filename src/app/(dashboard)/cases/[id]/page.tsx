"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { mockCases, CaseStatus } from "@/components/cases/mock-data";

const statusConfig: Record<CaseStatus, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  نشطة: { color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2, label: "نشطة" },
  منتهية: { color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20", icon: Scale, label: "منتهية" },
  مؤجلة: { color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20", icon: PauseCircle, label: "مؤجلة" },
};

const docTypeColor: Record<string, string> = {
  عقد: "text-primary bg-primary/10",
  تقرير: "text-accent bg-accent/10",
  لائحة: "text-amber-400 bg-amber-400/10",
  حكم: "text-emerald-400 bg-emerald-400/10",
  مذكرة: "text-purple-400 bg-purple-400/10",
  "وثيقة رسمية": "text-blue-400 bg-blue-400/10",
};

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const caseData = mockCases.find((c) => c.id === id);

  if (!caseData) {
    notFound();
  }

  const sc = statusConfig[caseData.status];
  const StatusIcon = sc.icon;

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
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
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="rounded-xl border-white/10 gap-2 text-xs font-bold">
              <Download className="h-3.5 w-3.5" /> تصدير الملف
            </Button>
            <Button size="sm" className="rounded-xl gap-2 text-xs font-bold shadow-lg shadow-primary/20">
              <MessageSquare className="h-3.5 w-3.5" /> استشارة سند الذكي
            </Button>
          </div>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Key Info */}
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
              <InfoItem icon={User} label="الموكل" value={caseData.clientName} />
              <InfoItem icon={Building2} label="المحكمة" value={caseData.court} />
              <InfoItem icon={Users} label="الخصم" value={caseData.opponent} />
              <InfoItem icon={BookOpen} label="القاضي" value={caseData.judge} />
              <InfoItem icon={Clock} label="تاريخ القيد" value={caseData.createdAt} />
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

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Next session highlight */}
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

          {/* Documents count */}
          <Card className="border-none bg-card/50 border border-white/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-accent" /> المستندات
                </span>
                <span className="text-2xl font-headline font-bold text-accent">{caseData.documents.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">ملف مرفق بالقضية</p>
            </CardContent>
          </Card>

          {/* Sessions count */}
          <Card className="border-none bg-card/50 border border-white/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold flex items-center gap-2">
                  <Gavel className="h-4 w-4 text-primary" /> الجلسات
                </span>
                <span className="text-2xl font-headline font-bold text-primary">{caseData.sessions.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">جلسة مسجلة</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sessions Timeline */}
      {caseData.sessions.length > 0 && (
        <Card className="border-none bg-card/50 border border-white/5">
          <CardHeader>
            <CardTitle className="font-headline text-base flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-accent" />
              </div>
              سجل الجلسات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-0">
              {caseData.sessions.map((session, i) => (
                <div key={i} className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center shrink-0 mt-1">
                      <span className="text-xs font-bold text-primary">{i + 1}</span>
                    </div>
                    {i < caseData.sessions.length - 1 && (
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
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      {caseData.documents.length > 0 && (
        <Card className="border-none bg-card/50 border border-white/5">
          <CardHeader>
            <CardTitle className="font-headline text-base flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-accent" />
              </div>
              المستندات والملفات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {caseData.documents.map((doc, i) => (
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}

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
