"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  Users,
  Building2,
  User,
  Phone,
  Mail,
  ChevronLeft,
  ChevronDown,
  Gavel,
  CalendarDays,
  Download,
  Printer,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Client } from "@/components/clients/mock-data";
import { getClients, addClient, updateClient, deleteClient as deleteClientFromDB } from "@/lib/services/clients";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

type ClientType = "الكل" | "فرد" | "شركة";

const TYPE_FILTERS: { label: string; value: ClientType }[] = [
  { label: "الكل", value: "الكل" },
  { label: "أفراد", value: "فرد" },
  { label: "شركات", value: "شركة" },
];

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  nationalId: "",
  type: "فرد" as "فرد" | "شركة",
  address: "",
  notes: "",
};

export default function ClientsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ClientType>("الكل");

  useEffect(() => {
    getClients()
      .then((data) => setClients(data))
      .catch(() => toast({ title: "خطأ في تحميل الموكلين", variant: "destructive" }))
      .finally(() => setIsLoading(false));
  }, []);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // Edit modal
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });

  // Delete dialog
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);

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

  async function handleAddClient() {
    if (!form.name || !form.phone) return;
    const newClient = {
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
    try {
      const id = await addClient(newClient);
      setClients((prev) => [{ ...newClient, id }, ...prev]);
      setShowAddModal(false);
      setForm({ ...EMPTY_FORM });
      toast({ title: "✅ تم إضافة الموكل", description: `تمت إضافة "${newClient.name}" بنجاح.` });
    } catch {
      toast({ title: "خطأ في الإضافة", variant: "destructive" });
    }
  }

  function openEditModal(client: Client) {
    setEditClient(client);
    setEditForm({
      name: client.name,
      phone: client.phone,
      email: client.email,
      nationalId: client.nationalId,
      type: client.type,
      address: client.address,
      notes: client.notes,
    });
  }

  async function handleEditClient() {
    if (!editClient || !editForm.name || !editForm.phone) return;
    try {
      await updateClient(editClient.id, editForm);
      setClients((prev) =>
        prev.map((c) => c.id === editClient.id ? { ...c, ...editForm } : c)
      );
      setEditClient(null);
      toast({ title: "✏️ تم تحديث بيانات الموكل", description: `تم تحديث بيانات "${editForm.name}" بنجاح.` });
    } catch {
      toast({ title: "خطأ في التحديث", variant: "destructive" });
    }
  }

  async function handleDeleteClient() {
    if (!deleteClient) return;
    const name = deleteClient.name;
    try {
      await deleteClientFromDB(deleteClient.id);
      setClients((prev) => prev.filter((c) => c.id !== deleteClient.id));
      setDeleteClient(null);
      toast({ title: "🗑️ تم حذف الموكل", description: `تم حذف "${name}" من قائمة الموكلين.`, variant: "destructive" });
    } catch {
      toast({ title: "خطأ في الحذف", variant: "destructive" });
    }
  }

  function exportCSV() {
    const headers = ["الاسم", "الهاتف", "البريد الإلكتروني", "عدد القضايا", "الحالة"];
    const rows = filtered.map((c) => [
      c.name,
      c.phone,
      c.email,
      String(c.caseIds.length),
      c.type,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `موكلين_${new Date().toLocaleDateString("ar-SA").replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "✅ تم تصدير CSV بنجاح", description: `تم تصدير ${filtered.length} موكل` });
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-headline font-black">إدارة الموكلين</h2>
          <p className="text-muted-foreground mt-1">سجل شامل بكافة موكلي المكتب وقضاياهم.</p>
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
            onClick={() => setShowAddModal(true)}
            className="rounded-xl px-6 shadow-lg shadow-primary/30 font-bold transition-all duration-200 hover:shadow-primary/40 hover:shadow-xl gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            إضافة موكل جديد
          </Button>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="border border-primary/20 bg-card/50">
              <CardContent className="p-6 flex items-center gap-4">
                <Skeleton className="h-11 w-11 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-6 w-8 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "إجمالي الموكلين", value: stats.total, icon: Users, color: "text-primary", bg: "bg-primary/10" },
            { label: "شركات", value: stats.companies, icon: Building2, color: "text-accent", bg: "bg-accent/10" },
            { label: "أفراد", value: stats.individuals, icon: User, color: "text-amber-400", bg: "bg-amber-400/10" },
            { label: "لديهم قضايا", value: stats.withCases, icon: Gavel, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          ].map((stat, i) => (
            <Card key={i} className="border border-primary/20 shadow-sm shadow-primary/10 bg-card/50 hover:border-primary/40 hover:shadow-primary/20 hover:shadow-md transition-all duration-200">
              <CardContent className="p-6 flex items-center gap-4">
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
      )}

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
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Card key={i} className="border border-primary/20 bg-card/50">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-4 w-14 rounded-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-36 rounded" />
                  <Skeleton className="h-3 w-40 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
                <Skeleton className="h-3 w-20 rounded" />
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
            <Users className="h-8 w-8 text-primary/40" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-base font-semibold text-foreground/70">لا يوجد موكلون مطابقون</p>
            <p className="text-sm text-muted-foreground">جرّب تغيير معايير البحث أو الفلتر</p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl gap-2 mt-2 shadow-lg shadow-primary/20"
          >
            <PlusCircle className="h-4 w-4" />
            إضافة موكل جديد
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={() => openEditModal(client)}
              onDelete={() => setDeleteClient(client)}
            />
          ))}
        </div>
      )}

      {/* ── Add Client Modal ── */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-card border border-white/10 text-foreground max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              إضافة موكل جديد
            </DialogTitle>
          </DialogHeader>
          <ClientForm form={form} setForm={setForm} />
          <DialogFooter className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1 rounded-xl border-white/10">
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

      {/* ── Edit Client Modal ── */}
      <Dialog open={!!editClient} onOpenChange={(open) => { if (!open) setEditClient(null); }}>
        <DialogContent className="bg-card border border-white/10 text-foreground max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                <Pencil className="h-4 w-4 text-amber-400" />
              </div>
              تعديل بيانات الموكل
            </DialogTitle>
          </DialogHeader>
          <ClientForm form={editForm} setForm={setEditForm} />
          <DialogFooter className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditClient(null)} className="flex-1 rounded-xl border-white/10">
              إلغاء
            </Button>
            <Button
              onClick={handleEditClient}
              disabled={!editForm.name || !editForm.phone}
              className="flex-1 rounded-xl font-bold shadow-lg shadow-primary/20"
            >
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <AlertDialog open={!!deleteClient} onOpenChange={(open) => { if (!open) setDeleteClient(null); }}>
        <AlertDialogContent className="bg-card border border-white/10 text-foreground" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-xl">تأكيد حذف الموكل</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              هل أنت متأكد من حذف الموكل <span className="font-bold text-foreground">"{deleteClient?.name}"</span>؟
              <br />
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel className="rounded-xl border-white/10 bg-secondary/20">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClient}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف الموكل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
}

// ── Shared Form Fields ──────────────────────────────────────────────────────

function ClientForm({
  form,
  setForm,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
}) {
  return (
    <div className="grid gap-4 py-2">
      {/* Type Toggle */}
      <div className="grid gap-1.5">
        <label className="text-xs font-bold text-muted-foreground">نوع الموكل</label>
        <div className="flex gap-2">
          {(["فرد", "شركة"] as const).map((t) => (
            <button
              key={t}
              type="button"
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
  );
}

// ── Client Card ──────────────────────────────────────────────────────────────

function ClientCard({
  client,
  onEdit,
  onDelete,
}: {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const initials = client.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  const avatarColors = [
    "from-primary/40 to-primary/20 text-primary",
    "from-accent/40 to-accent/20 text-accent",
    "from-blue-500/40 to-blue-500/20 text-amber-400",
    "from-purple-500/40 to-purple-500/20 text-purple-400",
    "from-emerald-500/40 to-emerald-500/20 text-emerald-400",
    "from-amber-500/40 to-amber-500/20 text-amber-400",
  ];
  const colorIndex = client.id.charCodeAt(client.id.length - 1) % avatarColors.length;
  const avatarColor = avatarColors[colorIndex];

  return (
    <Card className="border border-primary/20 shadow-sm shadow-primary/5 bg-card/50 hover:bg-card/80 hover:border-primary/40 hover:shadow-primary/15 hover:shadow-md transition-all duration-200 group h-full">
      <CardContent className="p-6 flex flex-col gap-4">
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

        {/* Cases count */}
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/5 mt-auto">
          <Link href={`/clients/${client.id}`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-xl border-white/10 gap-1.5 text-xs font-bold hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            >
              <Eye className="h-3.5 w-3.5" />
              عرض الملف
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl hover:bg-amber-400/10 hover:text-amber-400 shrink-0"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            title="تعديل"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl hover:bg-destructive/10 hover:text-destructive shrink-0"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="حذف"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
