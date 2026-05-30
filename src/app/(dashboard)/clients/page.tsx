"use client";

import { useState } from "react";
import Link from "next/link";
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
  Users,
  Building2,
  User,
  Phone,
  Mail,
  ChevronLeft,
  Gavel,
  CalendarDays,
  BadgeCheck,
} from "lucide-react";
import { mockClients, Client } from "@/components/clients/mock-data";

type ClientType = "الكل" | "فرد" | "شركة";

const TYPE_FILTERS: { label: string; value: ClientType }[] = [
  { label: "الكل", value: "الكل" },
  { label: "أفراد", value: "فرد" },
  { label: "شركات", value: "شركة" },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ClientType>("الكل");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    nationalId: "",
    type: "فرد" as "فرد" | "شركة",
    address: "",
    notes: "",
  });

  const filtered = clients.filter((c) => {
    const matchesType = typeFilter === "الكل" || c.type === typeFilter;
    const matchesSearch =
      search === "" ||
      c.name.includes(search) ||
      c.phone.includes(search) ||
      c.email.includes(search);
    return matchesType && matchesSearch;
  });

  const stats = {
    total: clients.length,
    companies: clients.filter((c) => c.type === "شركة").length,
    individuals: clients.filter((c) => c.type === "فرد").length,
    withCases: clients.filter((c) => c.caseIds.length > 0).length,
  };

  function handleAddClient() {
    if (!form.name || !form.phone) return;
    const newClient: Client = {
      id: `CLT-${String(clients.length + 1).padStart(3, "0")}`,
      name: form.name,
      phone: form.phone,
      email: form.email,
      nationalId: form.nationalId,
      type: form.type,
      registeredAt: new Date().toLocaleDateString("ar-SA"),
      address: form.address,
      notes: form.notes,
      caseIds: [],
    };
    setClients((prev) => [newClient, ...prev]);
    setShowModal(false);
    setForm({ name: "", phone: "", email: "", nationalId: "", type: "فرد", address: "", notes: "" });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold">إدارة الموكلين</h2>
          <p className="text-muted-foreground mt-1">سجل شامل بكافة موكلي المكتب وقضاياهم.</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="rounded-xl px-6 shadow-lg shadow-primary/20 font-bold gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          إضافة موكل جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الموكلين", value: stats.total, icon: Users, color: "text-primary", bg: "bg-primary/10" },
          { label: "شركات", value: stats.companies, icon: Building2, color: "text-accent", bg: "bg-accent/10" },
          { label: "أفراد", value: stats.individuals, icon: User, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "لديهم قضايا", value: stats.withCases, icon: Gavel, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        ].map((stat, i) => (
          <Card key={i} className="border-none bg-card/50 border border-white/5 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <p className={`text-2xl font-bold font-headline ${stat.color}`}>{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث بالاسم، الجوال، أو البريد الإلكتروني..."
            className="w-full bg-secondary/20 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 bg-secondary/20 border border-white/10 rounded-xl p-1.5 shrink-0">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                typeFilter === f.value
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Grid */}
      {filtered.length === 0 ? (
        <div className="py-24 flex flex-col items-center gap-3 text-muted-foreground">
          <Users className="h-10 w-10 opacity-30" />
          <p className="text-sm font-medium">لا يوجد موكلون يطابقون البحث</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-card border border-white/10 text-foreground max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              إضافة موكل جديد
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Type Toggle */}
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">نوع الموكل</label>
              <div className="flex gap-2">
                {(["فرد", "شركة"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm((p) => ({ ...p, type: t }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      form.type === t
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "border-white/10 text-muted-foreground hover:text-foreground bg-secondary/20"
                    }`}
                  >
                    {t === "فرد" ? "👤 فرد" : "🏢 شركة"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">
                {form.type === "شركة" ? "اسم الشركة *" : "الاسم الكامل *"}
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder={form.type === "شركة" ? "مثال: شركة الأمل للتطوير" : "مثال: محمد أحمد العتيبي"}
                className="bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">رقم الجوال *</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+966 5X XXX XXXX"
                  className="bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground"
                  dir="ltr"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">
                  {form.type === "شركة" ? "السجل التجاري" : "رقم الهوية"}
                </label>
                <input
                  value={form.nationalId}
                  onChange={(e) => setForm((p) => ({ ...p, nationalId: e.target.value }))}
                  placeholder={form.type === "شركة" ? "1010XXXXXX" : "10XXXXXXXX"}
                  className="bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">البريد الإلكتروني</label>
              <input
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="example@domain.com"
                className="bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground"
                dir="ltr"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">العنوان</label>
              <input
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="المدينة، الحي، الشارع"
                className="bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">ملاحظات</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="أي معلومات إضافية مهمة..."
                rows={2}
                className="bg-secondary/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground resize-none"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border-white/10">
              إلغاء
            </Button>
            <Button
              onClick={handleAddClient}
              disabled={!form.name || !form.phone}
              className="flex-1 rounded-xl font-bold shadow-lg shadow-primary/20"
            >
              حفظ الموكل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClientCard({ client }: { client: Client }) {
  const initials = client.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

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

  return (
    <Link href={`/clients/${client.id}`}>
      <Card className="border-none bg-card/50 border border-white/5 shadow-sm hover:bg-card/80 hover:border-primary/20 hover:shadow-primary/10 hover:shadow-md transition-all duration-200 group cursor-pointer h-full">
        <CardContent className="p-5 flex flex-col gap-4">
          {/* Top: Avatar + Name + Type */}
          <div className="flex items-start gap-3">
            <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-sm font-bold shrink-0 shadow-inner`}>
              {client.type === "شركة"
                ? <Building2 className="h-5 w-5" />
                : <span>{initials}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-snug group-hover:text-primary transition-colors truncate">
                {client.name}
              </p>
              <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                client.type === "شركة"
                  ? "bg-accent/10 text-accent"
                  : "bg-primary/10 text-primary"
              }`}>
                {client.type === "شركة" ? <Building2 className="h-2.5 w-2.5" /> : <User className="h-2.5 w-2.5" />}
                {client.type}
              </span>
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0" />
              <span dir="ltr" className="truncate">{client.phone}</span>
            </div>
            {client.email && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3 w-3 shrink-0" />
                <span dir="ltr" className="truncate">{client.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3 shrink-0" />
              <span>تسجيل: {client.registeredAt}</span>
            </div>
          </div>

          {/* Footer: cases count + arrow */}
          <div className="flex items-center justify-between pt-1 border-t border-white/5 mt-auto">
            <div className="flex items-center gap-1.5">
              <Gavel className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-bold">
                {client.caseIds.length > 0 ? (
                  <span className="text-foreground">{client.caseIds.length} قضية</span>
                ) : (
                  <span className="text-muted-foreground">لا توجد قضايا</span>
                )}
              </span>
            </div>
            <ChevronLeft className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all -translate-x-1 group-hover:translate-x-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
