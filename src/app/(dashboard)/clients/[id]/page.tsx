"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Gavel,
  FileText,
  ChevronLeft,
  BadgeCheck,
  MessageSquare,
  CreditCard,
  CheckCircle2,
  PauseCircle,
  Scale,
  Clock,
  Calendar,
} from "lucide-react";
import { mockClients, getClientCases } from "@/components/clients/mock-data";
import { CaseStatus } from "@/components/cases/mock-data";

const statusConfig: Record<CaseStatus, { color: string; bg: string; icon: React.ElementType }> = {
  نشطة: { color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
  منتهية: { color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20", icon: Scale },
  مؤجلة: { color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20", icon: PauseCircle },
};

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const client = mockClients.find((c) => c.id === id);

  if (!client) notFound();

  const cases = getClientCases(client.id);

  const avatarColors = [
    "from-primary/40 to-primary/20 text-primary",
    "from-accent/40 to-accent/20 text-accent",
    "from-blue-500/40 to-blue-500/20 text-blue-400",
    "from-purple-500/40 to-purple-500/20 text-purple-400",
    "from-emerald-500/40 to-emerald-500/20 text-emerald-400",
    "from-amber-500/40 to-amber-500/20 text-amber-400",
  ];
  const colorIndex = client.id.charCodeAt(client.id.length - 1) % avatarColors.length;
  const avatarColor = avatarColors[colorIndex];

  const initials = client.name.split(" ").slice(0, 2).map((w) => w[0]).join("");

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      {/* Breadcrumb */}
      <div className="flex flex-col gap-4">
        <Link
          href="/clients"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى قائمة الموكلين
        </Link>
      </div>

      {/* Profile Hero */}
      <Card className="border-none bg-gradient-to-br from-card/80 to-secondary/20 border border-white/5 overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className={`h-20 w-20 rounded-3xl bg-gradient-to-br ${avatarColor} flex items-center justify-center shrink-0 shadow-lg text-2xl font-bold`}>
              {client.type === "شركة" ? <Building2 className="h-9 w-9" /> : <span>{initials}</span>}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-headline font-bold">{client.name}</h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  client.type === "شركة" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                }`}>
                  {client.type === "شركة" ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
                  {client.type}
                </span>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-emerald-400" />
                رقم الملف: <span className="font-mono font-bold text-foreground">{client.id}</span>
                <span className="text-border">•</span>
                تاريخ التسجيل: <span className="font-bold text-foreground">{client.registeredAt}</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" className="rounded-xl border-white/10 gap-2 text-xs font-bold">
                <MessageSquare className="h-3.5 w-3.5" />
                تواصل
              </Button>
              <Button size="sm" className="rounded-xl gap-2 text-xs font-bold shadow-lg shadow-primary/20">
                <Gavel className="h-3.5 w-3.5" />
                إضافة قضية
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Contact & Details */}
        <div className="space-y-4">
          <Card className="border-none bg-card/50 border border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-headline flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                بيانات التواصل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ContactRow icon={Phone} label="الجوال" value={client.phone} dir="ltr" />
              {client.email && <ContactRow icon={Mail} label="البريد" value={client.email} dir="ltr" />}
              {client.nationalId && (
                <ContactRow
                  icon={CreditCard}
                  label={client.type === "شركة" ? "السجل التجاري" : "رقم الهوية"}
                  value={client.nationalId}
                  dir="ltr"
                />
              )}
              {client.address && <ContactRow icon={MapPin} label="العنوان" value={client.address} />}
              <ContactRow icon={CalendarDays} label="تاريخ التسجيل" value={client.registeredAt} />
            </CardContent>
          </Card>

          {/* Notes */}
          {client.notes && (
            <Card className="border-none bg-card/50 border border-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-headline flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-accent/10 flex items-center justify-center">
                    <FileText className="h-3.5 w-3.5 text-accent" />
                  </div>
                  ملاحظات المكتب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{client.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-none bg-card/50 border border-white/5">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-headline font-bold text-primary">{cases.length}</p>
                <p className="text-xs text-muted-foreground mt-1">قضية مسجلة</p>
              </CardContent>
            </Card>
            <Card className="border-none bg-card/50 border border-white/5">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-headline font-bold text-emerald-400">
                  {cases.filter((c) => c.status === "نشطة").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">قضية نشطة</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cases */}
        <div className="md:col-span-2">
          <Card className="border-none bg-card/50 border border-white/5 h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline text-base flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Gavel className="h-4 w-4 text-primary" />
                  </div>
                  القضايا المرتبطة
                </CardTitle>
                {cases.length > 0 && (
                  <span className="text-xs font-bold text-muted-foreground bg-secondary/30 px-3 py-1 rounded-full border border-white/10">
                    {cases.length} قضية
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {cases.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                  <Gavel className="h-10 w-10 opacity-20" />
                  <p className="text-sm font-medium">لا توجد قضايا مسجلة لهذا الموكل</p>
                  <Button size="sm" className="mt-2 rounded-xl font-bold gap-2 text-xs">
                    <Gavel className="h-3.5 w-3.5" /> إنشاء قضية جديدة
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cases.map((c) => {
                    const sc = statusConfig[c.status];
                    const SIcon = sc.icon;
                    return (
                      <Link key={c.id} href={`/cases/${c.id}`}>
                        <div className="group flex items-center gap-4 p-4 rounded-2xl bg-secondary/20 border border-white/5 hover:bg-secondary/40 hover:border-primary/20 transition-all cursor-pointer">
                          {/* Status dot */}
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${sc.bg}`}>
                            <SIcon className={`h-5 w-5 ${sc.color}`} />
                          </div>

                          {/* Case info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm group-hover:text-primary transition-colors truncate">
                              {c.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="text-[10px] font-mono text-muted-foreground">{c.caseNumber}</span>
                              <span className="text-[10px] text-muted-foreground">{c.court}</span>
                            </div>
                          </div>

                          {/* Next session + status */}
                          <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sc.bg} ${sc.color}`}>
                              <SIcon className="h-2.5 w-2.5" />
                              {c.status}
                            </span>
                            {c.nextSession !== "—" && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-2.5 w-2.5 text-accent" />
                                {c.nextSession}
                              </span>
                            )}
                          </div>

                          <ChevronLeft className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all shrink-0" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  dir: textDir,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-7 w-7 rounded-lg bg-secondary/40 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold truncate" dir={textDir}>
          {value}
        </p>
      </div>
    </div>
  );
}
