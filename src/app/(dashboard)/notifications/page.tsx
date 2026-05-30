"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Gavel,
  Calendar,
  Users,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  Trash2,
  BellOff,
  MessageSquareCode,
  CreditCard,
  Filter,
  RefreshCw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifCategory = "القضايا" | "المواعيد" | "الموكلين" | "المستندات" | "النظام" | "المالية";
type NotifPriority = "عالية" | "متوسطة" | "منخفضة";

interface Notification {
  id: string;
  title: string;
  body: string;
  category: NotifCategory;
  priority: NotifPriority;
  time: string;
  read: boolean;
  link?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockNotifications: Notification[] = [
  {
    id: "N001",
    title: "جلسة غداً - قضية بن لادن",
    body: "تذكير: جلسة قضية 1029/ق/2024 غداً الأحد الساعة 9:00 صباحاً في المحكمة التجارية بالرياض.",
    category: "المواعيد",
    priority: "عالية",
    time: "منذ 10 دقائق",
    read: false,
    link: "/calendar",
  },
  {
    id: "N002",
    title: "موعد ناجز قادم",
    body: "القضية CAS-2234 لديها موعد ناجز بعد 3 أيام. يُرجى رفع المستندات المطلوبة قبل انتهاء المهلة.",
    category: "القضايا",
    priority: "عالية",
    time: "منذ 35 دقيقة",
    read: false,
    link: "/cases",
  },
  {
    id: "N003",
    title: "موكل جديد تم إضافته",
    body: "تم إضافة الموكل الجديد 'خالد المصري' بنجاح. يمكنك الآن ربطه بقضاياه.",
    category: "الموكلين",
    priority: "منخفضة",
    time: "منذ ساعة",
    read: false,
    link: "/clients",
  },
  {
    id: "N004",
    title: "مستند بانتظار التوقيع",
    body: "عقد الخدمات القانونية مع أرامكو السعودية لا يزال بانتظار التوقيع من الطرفين.",
    category: "المستندات",
    priority: "متوسطة",
    time: "منذ 3 ساعات",
    read: true,
    link: "/documents",
  },
  {
    id: "N005",
    title: "تقرير المساعد الذكي جاهز",
    body: "اكتمل تحليل عقد الخدمات لمجموعة بن لادن. يمكنك مراجعة النتائج والتوصيات الآن.",
    category: "النظام",
    priority: "منخفضة",
    time: "منذ 5 ساعات",
    read: true,
    link: "/ai-assistant",
  },
  {
    id: "N006",
    title: "جلسة قضية الزهراني - تأجيل",
    body: "تم تأجيل جلسة قضية الأحوال الشخصية رقم 2234 من تاريخ 3 يونيو إلى 10 يونيو 2026.",
    category: "القضايا",
    priority: "عالية",
    time: "منذ 6 ساعات",
    read: true,
    link: "/cases",
  },
  {
    id: "N007",
    title: "تجديد الاشتراك قادم",
    body: "اشتراكك في الخطة الاحترافية سيُجدد تلقائياً في 15 يونيو 2026 بمبلغ 499 ريال.",
    category: "المالية",
    priority: "متوسطة",
    time: "أمس",
    read: true,
    link: "/settings",
  },
  {
    id: "N008",
    title: "نشاط جلسة تحكيم - الفيصل",
    body: "تم تسجيل نتيجة جلسة التحكيم لقضية شركة الفيصل للمقاولات. اضغط للاطلاع على التفاصيل.",
    category: "القضايا",
    priority: "متوسطة",
    time: "أمس",
    read: true,
    link: "/cases",
  },
  {
    id: "N009",
    title: "موعد استشاري بعد غد",
    body: "تذكير: لديك موعد استشاري مع الصندوق العقاري الساعة 1:00 ظهراً.",
    category: "المواعيد",
    priority: "متوسطة",
    time: "يومان",
    read: true,
    link: "/calendar",
  },
  {
    id: "N010",
    title: "عضو فريق في إجازة",
    body: "سارة المطيري ستكون في إجازة من 1 إلى 7 يونيو. يُرجى إعادة توزيع المهام المتعلقة بها.",
    category: "النظام",
    priority: "منخفضة",
    time: "3 أيام",
    read: true,
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<NotifCategory, { icon: React.ElementType; color: string; bg: string }> = {
  القضايا:   { icon: Gavel,              color: "text-primary",    bg: "bg-primary/10" },
  المواعيد:  { icon: Calendar,           color: "text-accent",     bg: "bg-accent/10" },
  الموكلين:  { icon: Users,              color: "text-amber-400",   bg: "bg-amber-400/10" },
  المستندات: { icon: FileText,           color: "text-purple-400", bg: "bg-purple-400/10" },
  النظام:    { icon: MessageSquareCode,  color: "text-amber-400",  bg: "bg-amber-400/10" },
  المالية:   { icon: CreditCard,         color: "text-emerald-400", bg: "bg-emerald-400/10" },
};

const PRIORITY_CONFIG: Record<NotifPriority, { color: string; bg: string }> = {
  عالية:    { color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
  متوسطة:   { color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/20" },
  منخفضة:   { color: "text-muted-foreground", bg: "bg-secondary/40 border-white/10" },
};

const CATEGORIES: (NotifCategory | "الكل")[] = ["الكل", "القضايا", "المواعيد", "الموكلين", "المستندات", "النظام", "المالية"];

// ─── Notification Item ────────────────────────────────────────────────────────

function NotifItem({
  notif,
  onRead,
  onDelete,
}: {
  notif: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const catCfg = CATEGORY_CONFIG[notif.category];
  const priCfg = PRIORITY_CONFIG[notif.priority];
  const Icon = catCfg.icon;

  return (
    <div
      className={`group relative flex gap-4 p-4 rounded-xl border transition-all cursor-pointer
        ${notif.read
          ? "bg-card/30 border-white/5 hover:bg-card/50"
          : "bg-card/60 border-primary/20 hover:bg-card/80"
        }`}
      onClick={() => onRead(notif.id)}
    >
      {/* Unread dot */}
      {!notif.read && (
        <span className="absolute top-4 left-4 w-2 h-2 rounded-full bg-primary" />
      )}

      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${catCfg.bg} shrink-0 mt-0.5`}>
        <Icon className={`h-5 w-5 ${catCfg.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-tight ${notif.read ? "font-medium text-muted-foreground" : "font-bold"}`}>
            {notif.title}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priCfg.bg} ${priCfg.color} border hidden sm:flex`}>
              {notif.priority}
            </Badge>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{notif.body}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
            <Clock className="h-3 w-3" /> {notif.time}
          </span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-white/10 text-muted-foreground">
            {notif.category}
          </Badge>
        </div>
      </div>

      {notif.link && (
        <ChevronLeft className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground mt-3 shrink-0 transition-colors" />
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<NotifCategory | "الكل">("الكل");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast({ title: "تم حذف الإشعار" });
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast({ title: "تم تحديد الكل كمقروء ✓" });
  };

  const handleClearAll = () => {
    setNotifications((prev) => prev.filter((n) => !n.read));
    toast({ title: "تم حذف الإشعارات المقروءة" });
  };

  const filtered = notifications.filter((n) => {
    const matchCat = filter === "الكل" || n.category === filter;
    const matchRead = !showUnreadOnly || !n.read;
    return matchCat && matchRead;
  });

  // Group: today, yesterday, older
  const grouped = filtered.reduce<Record<string, Notification[]>>((acc, n) => {
    const bucket =
      n.time.includes("دقيقة") || n.time.includes("ساعة") || n.time.includes("ساعات")
        ? "اليوم"
        : n.time === "أمس"
        ? "أمس"
        : "سابقاً";
    if (!acc[bucket]) acc[bucket] = [];
    acc[bucket].push(n);
    return acc;
  }, {});

  const bucketOrder = ["اليوم", "أمس", "سابقاً"];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Toaster />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-4xl font-headline font-black flex items-center gap-3">
              الإشعارات
              {unreadCount > 0 && (
                <Badge className="bg-primary text-primary-foreground font-bold text-sm px-2.5">
                  {unreadCount}
                </Badge>
              )}
            </h2>
            <p className="text-muted-foreground">تنبيهات المواعيد والقضايا والتحديثات</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-white/10 text-xs"
              onClick={handleMarkAllRead}
            >
              <CheckCircle2 className="h-3.5 w-3.5 ml-1.5" />
              تحديد الكل كمقروء
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-white/10 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleClearAll}
          >
            <Trash2 className="h-3.5 w-3.5 ml-1.5" />
            حذف المقروءة
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "غير مقروءة", value: unreadCount, icon: Bell, color: "text-primary", bg: "bg-primary/10" },
          { label: "عالية الأولوية", value: notifications.filter((n) => n.priority === "عالية" && !n.read).length, icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "مواعيد", value: notifications.filter((n) => n.category === "المواعيد").length, icon: Calendar, color: "text-accent", bg: "bg-accent/10" },
          { label: "الإجمالي", value: notifications.length, icon: RefreshCw, color: "text-muted-foreground", bg: "bg-secondary/40" },
        ].map((s, i) => (
          <Card key={i} className="border border-primary/15 shadow-sm shadow-primary/5 bg-card/50 hover:border-primary/30 transition-all duration-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-headline font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium
                ${filter === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-white/10 hover:border-white/20 text-muted-foreground hover:text-foreground"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="mr-auto">
          <button
            onClick={() => setShowUnreadOnly((p) => !p)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all font-medium
              ${showUnreadOnly
                ? "bg-accent/10 text-accent border-accent/20"
                : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
              }`}
          >
            <Filter className="h-3 w-3" />
            غير المقروءة فقط
          </button>
        </div>
      </div>

      {/* Notifications */}
      {filtered.length === 0 ? (
        <Card className="border border-primary/15 shadow-sm shadow-primary/5 bg-card/50 hover:border-primary/30 transition-all duration-200">
          <CardContent className="p-20 text-center text-muted-foreground">
            <BellOff className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="font-bold">لا توجد إشعارات</p>
            <p className="text-sm mt-1">جميع الإشعارات مقروءة أو لا تتطابق مع الفلتر المحدد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {bucketOrder.map((bucket) => {
            const items = grouped[bucket];
            if (!items || items.length === 0) return null;
            return (
              <div key={bucket}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{bucket}</h3>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((n) => (
                    <NotifItem
                      key={n.id}
                      notif={n}
                      onRead={handleRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
