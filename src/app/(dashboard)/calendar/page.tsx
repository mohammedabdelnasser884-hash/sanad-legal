"use client";

import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Gavel,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  Phone,
  FileText,
  X,
  Pencil,
  Trash2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type EventType = "جلسة" | "موعد" | "مهمة" | "اجتماع";
type EventStatus = "قادم" | "مكتمل" | "ملغى" | "مؤجل";

interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  status: EventStatus;
  date: string;
  time: string;
  duration: string;
  location: string;
  client: string;
  caseId?: string;
  notes: string;
  judge?: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const initialEvents: CalendarEvent[] = [
  {
    id: "EVT-001",
    title: "جلسة قضية بن لادن ضد وزارة المالية",
    type: "جلسة",
    status: "قادم",
    date: "2026-06-02",
    time: "09:00",
    duration: "ساعتان",
    location: "المحكمة التجارية بالرياض - قاعة 5",
    client: "مجموعة بن لادن",
    caseId: "CAS-1029",
    notes: "تقديم مستندات الخبير المالي",
    judge: "القاضي فهد العتيبي",
  },
  {
    id: "EVT-002",
    title: "موعد استشارة قانونية - أرامكو",
    type: "موعد",
    status: "قادم",
    date: "2026-06-02",
    time: "14:00",
    duration: "ساعة",
    location: "مكتب المحامي - الرياض",
    client: "أرامكو السعودية",
    notes: "مراجعة عقود الخدمات الجديدة",
  },
  {
    id: "EVT-003",
    title: "جلسة قضية الحدود - الزهراني",
    type: "جلسة",
    status: "قادم",
    date: "2026-06-03",
    time: "10:30",
    duration: "ساعة ونصف",
    location: "محكمة الأحوال الشخصية - جدة",
    client: "فيصل الزهراني",
    caseId: "CAS-2234",
    notes: "الاستماع لشهود الإثبات",
    judge: "القاضي سالم المطيري",
  },
  {
    id: "EVT-004",
    title: "اجتماع فريق العمل الأسبوعي",
    type: "اجتماع",
    status: "قادم",
    date: "2026-06-04",
    time: "11:00",
    duration: "ساعة",
    location: "مكتب المحامي - غرفة الاجتماعات",
    client: "داخلي",
    notes: "مراجعة القضايا الجديدة وتوزيع المهام",
  },
  {
    id: "EVT-005",
    title: "جلسة نزاع عمالي - الشركة الوطنية",
    type: "جلسة",
    status: "قادم",
    date: "2026-06-05",
    time: "09:30",
    duration: "ساعتان",
    location: "المحكمة العمالية - الرياض",
    client: "الشركة الوطنية للتوزيع",
    caseId: "CAS-3341",
    notes: "المرحلة الأولى من الاستماع",
    judge: "القاضية نورة القحطاني",
  },
  {
    id: "EVT-006",
    title: "موعد توثيق عقد",
    type: "موعد",
    status: "قادم",
    date: "2026-06-05",
    time: "15:00",
    duration: "30 دقيقة",
    location: "كاتب العدل - الرياض",
    client: "خالد المصري",
    notes: "توثيق عقد بيع عقار",
  },
  {
    id: "EVT-007",
    title: "جلسة تحكيم تجاري",
    type: "جلسة",
    status: "مكتمل",
    date: "2026-05-28",
    time: "10:00",
    duration: "3 ساعات",
    location: "مركز التحكيم التجاري - الرياض",
    client: "شركة الفيصل للمقاولات",
    caseId: "CAS-0892",
    notes: "تم تقديم الحجج النهائية",
    judge: "المحكم د. عبدالله العسيري",
  },
  {
    id: "EVT-008",
    title: "موعد استشارة - الصندوق العقاري",
    type: "موعد",
    status: "مكتمل",
    date: "2026-05-27",
    time: "13:00",
    duration: "ساعة",
    location: "مكتب المحامي",
    client: "الصندوق العقاري",
    notes: "مراجعة إجراءات التقاضي",
  },
  {
    id: "EVT-009",
    title: "جلسة استئناف - الحارثي",
    type: "جلسة",
    status: "مؤجل",
    date: "2026-06-10",
    time: "11:00",
    duration: "ساعتان",
    location: "محكمة الاستئناف - الرياض",
    client: "سعود الحارثي",
    caseId: "CAS-1567",
    notes: "تأجلت من الجلسة السابقة بطلب من المحكمة",
    judge: "القاضي محمد الغامدي",
  },
  {
    id: "EVT-010",
    title: "مهمة: مراجعة لوائح قانونية",
    type: "مهمة",
    status: "قادم",
    date: "2026-06-06",
    time: "09:00",
    duration: "يوم كامل",
    location: "مكتب المحامي",
    client: "داخلي",
    notes: "مراجعة التحديثات على نظام المنافسة",
  },
];

// ─── Config ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<EventType, { color: string; bg: string; icon: React.ElementType }> = {
  جلسة:   { color: "text-primary",     bg: "bg-primary/10 border-primary/20",      icon: Gavel },
  موعد:   { color: "text-accent",      bg: "bg-accent/10 border-accent/20",        icon: CalendarIcon },
  مهمة:   { color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/20",  icon: FileText },
  اجتماع: { color: "text-purple-400",  bg: "bg-purple-400/10 border-purple-400/20", icon: Phone },
};

const STATUS_CONFIG: Record<EventStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  قادم:  { label: "قادم",  color: "text-blue-400",       bg: "bg-blue-400/10 border-blue-400/20",       icon: CalendarIcon },
  مكتمل: { label: "مكتمل", color: "text-emerald-400",    bg: "bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
  ملغى:  { label: "ملغى",  color: "text-destructive",    bg: "bg-destructive/10 border-destructive/20", icon: X },
  مؤجل:  { label: "مؤجل",  color: "text-amber-400",      bg: "bg-amber-400/10 border-amber-400/20",     icon: AlertCircle },
};

const DAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateAr(dateStr: string) {
  const d = new Date(dateStr);
  return `${DAYS_AR[d.getDay()]} ${d.getDate()} ${MONTHS_AR[d.getMonth()]} ${d.getFullYear()}`;
}

function isSameDay(a: string, b: Date) {
  const da = new Date(a);
  return da.getFullYear() === b.getFullYear() &&
    da.getMonth() === b.getMonth() &&
    da.getDate() === b.getDate();
}

function generateId() {
  return "EVT-" + Math.floor(Math.random() * 9000 + 1000).toString();
}

// ─── Event Card ───────────────────────────────────────────────────────────────

function EventCard({ event, onClick }: { event: CalendarEvent; onClick: () => void }) {
  const typeCfg = TYPE_CONFIG[event.type];
  const statusCfg = STATUS_CONFIG[event.status];
  const TypeIcon = typeCfg.icon;
  const StatusIcon = statusCfg.icon;

  return (
    <div
      onClick={onClick}
      className="group flex gap-4 p-4 rounded-xl bg-card/50 hover:bg-card border border-white/5 hover:border-white/15 transition-all cursor-pointer"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${typeCfg.bg} shrink-0 mt-0.5`}>
        <TypeIcon className={`h-5 w-5 ${typeCfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-sm leading-tight line-clamp-1">{event.title}</p>
          <Badge variant="outline" className={`text-xs shrink-0 ${statusCfg.bg} ${statusCfg.color} border`}>
            <StatusIcon className="h-3 w-3 ml-1" />
            {statusCfg.label}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {event.time} · {event.duration}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {event.location}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" /> {event.client}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────

function MiniCalendar({
  currentDate,
  events,
  onSelectDay,
  selectedDay,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectDay: (d: Date) => void;
  selectedDay: Date | null;
}) {
  const [viewDate, setViewDate] = useState(new Date(currentDate));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const hasEvent = (day: number) =>
    events.some((e) => isSameDay(e.date, new Date(year, month, day)));

  const isToday = (day: number) => {
    const t = new Date();
    return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
  };

  const isSelected = (day: number) =>
    selectedDay &&
    selectedDay.getFullYear() === year &&
    selectedDay.getMonth() === month &&
    selectedDay.getDate() === day;

  return (
    <Card className="border border-primary/15 shadow-sm shadow-primary/5 bg-card/50 hover:border-primary/30 transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="font-bold text-sm">
            {MONTHS_AR[month]} {year}
          </span>
          <button
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 mb-2">
          {["أ", "إ", "ث", "أر", "خ", "ج", "س"].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, i) => (
            <div key={i} className="aspect-square">
              {day ? (
                <button
                  onClick={() => onSelectDay(new Date(year, month, day))}
                  className={`w-full h-full flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-colors relative
                    ${isSelected(day) ? "bg-primary text-primary-foreground" : ""}
                    ${isToday(day) && !isSelected(day) ? "bg-accent/20 text-accent font-bold" : ""}
                    ${!isSelected(day) && !isToday(day) ? "hover:bg-white/10" : ""}
                  `}
                >
                  {day}
                  {hasEvent(day) && (
                    <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected(day) ? "bg-primary-foreground" : "bg-primary"}`} />
                  )}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Add/Edit Event Form ──────────────────────────────────────────────────────

interface EventFormData {
  title: string;
  type: EventType;
  date: string;
  time: string;
  duration: string;
  location: string;
  client: string;
  notes: string;
}

const emptyForm: EventFormData = {
  title: "",
  type: "موعد",
  date: "",
  time: "",
  duration: "",
  location: "",
  client: "",
  notes: "",
};

function EventForm({
  value,
  onChange,
}: {
  value: EventFormData;
  onChange: (v: EventFormData) => void;
}) {
  const set = (k: keyof EventFormData, v: string) => onChange({ ...value, [k]: v });

  return (
    <div className="space-y-4 text-right" dir="rtl">
      <div className="space-y-1.5">
        <Label className="text-sm font-bold">العنوان *</Label>
        <Input
          value={value.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="عنوان الموعد"
          className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-bold">النوع *</Label>
          <Select value={value.type} onValueChange={(v) => set("type", v)}>
            <SelectTrigger className="bg-secondary/40 border-white/10 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="جلسة">جلسة</SelectItem>
              <SelectItem value="موعد">موعد</SelectItem>
              <SelectItem value="مهمة">مهمة</SelectItem>
              <SelectItem value="اجتماع">اجتماع</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-bold">التاريخ *</Label>
          <Input
            type="date"
            value={value.date}
            onChange={(e) => set("date", e.target.value)}
            className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-bold">الوقت *</Label>
          <Input
            type="time"
            value={value.time}
            onChange={(e) => set("time", e.target.value)}
            className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-bold">المدة</Label>
          <Input
            value={value.duration}
            onChange={(e) => set("duration", e.target.value)}
            placeholder="مثل: ساعة"
            className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-bold">الموقع</Label>
        <Input
          value={value.location}
          onChange={(e) => set("location", e.target.value)}
          placeholder="موقع الموعد"
          className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-bold">الموكل</Label>
        <Input
          value={value.client}
          onChange={(e) => set("client", e.target.value)}
          placeholder="اسم الموكل"
          className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-bold">ملاحظات</Label>
        <Textarea
          value={value.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="ملاحظات إضافية"
          className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl resize-none"
          rows={3}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { toast } = useToast();
  const today = new Date();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, []);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState<EventType | "الكل">("الكل");
  const [filterStatus, setFilterStatus] = useState<EventStatus | "الكل">("الكل");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<EventFormData>(emptyForm);

  // Edit mode inside detail dialog
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<EventFormData>(emptyForm);

  // Delete confirm
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAdd = () => {
    if (!addForm.title.trim() || !addForm.date || !addForm.time) {
      toast({ title: "خطأ", description: "يرجى تعبئة الحقول المطلوبة (العنوان، التاريخ، الوقت)", variant: "destructive" });
      return;
    }
    const newEvent: CalendarEvent = {
      id: generateId(),
      title: addForm.title,
      type: addForm.type,
      status: "قادم",
      date: addForm.date,
      time: addForm.time,
      duration: addForm.duration || "—",
      location: addForm.location || "—",
      client: addForm.client || "—",
      notes: addForm.notes,
    };
    setEvents((prev) => [...prev, newEvent]);
    setAddOpen(false);
    setAddForm(emptyForm);
    toast({ title: "تم إضافة الموعد", description: newEvent.title });
  };

  const handleOpenEdit = () => {
    if (!selectedEvent) return;
    setEditForm({
      title: selectedEvent.title,
      type: selectedEvent.type,
      date: selectedEvent.date,
      time: selectedEvent.time,
      duration: selectedEvent.duration,
      location: selectedEvent.location,
      client: selectedEvent.client,
      notes: selectedEvent.notes,
    });
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    if (!selectedEvent) return;
    if (!editForm.title.trim() || !editForm.date || !editForm.time) {
      toast({ title: "خطأ", description: "يرجى تعبئة الحقول المطلوبة", variant: "destructive" });
      return;
    }
    const updated: CalendarEvent = {
      ...selectedEvent,
      title: editForm.title,
      type: editForm.type,
      date: editForm.date,
      time: editForm.time,
      duration: editForm.duration,
      location: editForm.location,
      client: editForm.client,
      notes: editForm.notes,
    };
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setSelectedEvent(updated);
    setEditMode(false);
    toast({ title: "تم تعديل الموعد", description: updated.title });
  };

  const handleDelete = () => {
    if (!selectedEvent) return;
    setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
    setDeleteOpen(false);
    setSelectedEvent(null);
    setEditMode(false);
    toast({ title: "تم حذف الموعد", description: "تم حذف الموعد بنجاح" });
  };

  const handleCloseDetail = () => {
    setSelectedEvent(null);
    setEditMode(false);
  };

  // ── Filter ────────────────────────────────────────────────────────────────

  const filteredEvents = events.filter((e) => {
    const matchType = filterType === "الكل" || e.type === filterType;
    const matchStatus = filterStatus === "الكل" || e.status === filterStatus;
    const matchDay = !selectedDay || isSameDay(e.date, selectedDay);
    return matchType && matchStatus && matchDay;
  });

  const grouped = filteredEvents.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  const upcomingCount = events.filter((e) => e.status === "قادم").length;
  const todayCount = events.filter((e) => isSameDay(e.date, today)).length;
  const sessionsCount = events.filter((e) => e.type === "جلسة" && e.status === "قادم").length;

  const stats = [
    { label: "جلسات قادمة", value: sessionsCount, icon: Gavel, color: "text-primary", bg: "bg-primary/10" },
    { label: "مواعيد اليوم", value: todayCount, icon: CalendarIcon, color: "text-accent", bg: "bg-accent/10" },
    { label: "إجمالي النشاطات", value: upcomingCount, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Toaster />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-headline font-black">المواعيد والجلسات</h2>
          <p className="text-muted-foreground">جدولة وإدارة جلسات المحاكم والمواعيد القانونية</p>
        </div>
        <Button
          className="rounded-xl px-6 shadow-lg shadow-primary/30 font-bold transition-all duration-200 hover:shadow-primary/40 hover:shadow-xl w-fit"
          onClick={() => { setAddForm(emptyForm); setAddOpen(true); }}
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة موعد
        </Button>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid gap-4 grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="border border-primary/15 bg-card/50">
              <CardContent className="p-6 flex items-center gap-4">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-8 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-3">
          {stats.map((s, i) => (
            <Card key={i} className="border border-primary/15 shadow-sm shadow-primary/5 bg-card/50 hover:border-primary/30 transition-all duration-200">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${s.bg}`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-headline font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <div className="space-y-4">
          <MiniCalendar
            currentDate={today}
            events={events}
            onSelectDay={(d) => setSelectedDay((prev) =>
              prev?.toDateString() === d.toDateString() ? null : d
            )}
            selectedDay={selectedDay}
          />

          {/* Filters */}
          <Card className="border border-primary/15 shadow-sm shadow-primary/5 bg-card/50 hover:border-primary/30 transition-all duration-200">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                تصفية النشاطات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-bold">النوع</p>
                <div className="flex flex-wrap gap-1.5">
                  {(["الكل", "جلسة", "موعد", "مهمة", "اجتماع"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`text-xs px-3 py-1 rounded-lg border transition-all font-medium
                        ${filterType === t
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-white/10 hover:border-white/20 text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-bold">الحالة</p>
                <div className="flex flex-wrap gap-1.5">
                  {(["الكل", "قادم", "مكتمل", "مؤجل", "ملغى"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`text-xs px-3 py-1 rounded-lg border transition-all font-medium
                        ${filterStatus === s
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-white/10 hover:border-white/20 text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {selectedDay && (
                <button
                  onClick={() => setSelectedDay(null)}
                  className="flex items-center gap-1.5 text-xs text-destructive hover:underline"
                >
                  <X className="h-3 w-3" />
                  إلغاء تصفية التاريخ
                </button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <Card key={i} className="border border-primary/15 bg-card/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3 mb-3">
                      <Skeleton className="h-8 w-8 rounded-xl" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-3 w-16 rounded" />
                      </div>
                    </div>
                    {[0, 1].map((j) => (
                      <div key={j} className="flex items-center gap-3 p-3 rounded-xl border border-white/5">
                        <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-4 w-48 rounded" />
                          <Skeleton className="h-3 w-32 rounded" />
                        </div>
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedDates.length === 0 ? (
            <Card className="border border-primary/15 shadow-sm shadow-primary/5 bg-card/50 hover:border-primary/30 transition-all duration-200">
              <CardContent className="p-16 text-center text-muted-foreground">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="h-8 w-8 text-primary/40" />
                </div>
                <p className="font-bold text-base text-foreground/70 mb-1">لا توجد نشاطات مطابقة</p>
                <p className="text-sm text-muted-foreground mb-4">جرّب تغيير معايير الفلتر أو التاريخ</p>
                <Button
                  onClick={() => setAddOpen(true)}
                  className="rounded-xl gap-2 shadow-lg shadow-primary/20"
                >
                  <Plus className="h-4 w-4" />
                  إضافة نشاط جديد
                </Button>
              </CardContent>
            </Card>
          ) : (
            sortedDates.map((date) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-xl bg-secondary flex items-center justify-center text-sm font-bold text-foreground">
                    {new Date(date).getDate()}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{formatDateAr(date)}</p>
                    <p className="text-xs text-muted-foreground">{grouped[date].length} نشاط</p>
                  </div>
                </div>
                <div className="space-y-2 mr-11">
                  {grouped[date]
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((ev) => (
                      <EventCard key={ev.id} event={ev} onClick={() => { setSelectedEvent(ev); setEditMode(false); }} />
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Add Event Dialog ───────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg bg-card border-white/10 text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">إضافة موعد جديد</DialogTitle>
          </DialogHeader>
          <EventForm value={addForm} onChange={setAddForm} />
          <DialogFooter className="gap-2 flex-row-reverse sm:flex-row-reverse mt-2">
            <Button variant="outline" className="rounded-xl border-white/10 flex-1" onClick={() => setAddOpen(false)}>
              إلغاء
            </Button>
            <Button className="rounded-xl flex-1 font-bold" onClick={handleAdd}>
              حفظ الموعد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Detail / Edit Dialog ───────────────────────────────────────────── */}
      <Dialog open={!!selectedEvent} onOpenChange={handleCloseDetail}>
        <DialogContent className="max-w-lg bg-card border-white/10 text-right" dir="rtl">
          {selectedEvent && (() => {
            const typeCfg = TYPE_CONFIG[selectedEvent.type];
            const statusCfg = STATUS_CONFIG[selectedEvent.status];
            const TIcon = typeCfg.icon;
            const SIcon = statusCfg.icon;
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-3 rounded-xl ${typeCfg.bg}`}>
                      <TIcon className={`h-5 w-5 ${typeCfg.color}`} />
                    </div>
                    <div>
                      <DialogTitle className="text-base font-bold leading-tight">
                        {editMode ? "تعديل الموعد" : selectedEvent.title}
                      </DialogTitle>
                      {!editMode && (
                        <Badge variant="outline" className={`text-xs mt-1 ${statusCfg.bg} ${statusCfg.color} border`}>
                          <SIcon className="h-3 w-3 ml-1" />
                          {statusCfg.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </DialogHeader>

                {editMode ? (
                  <>
                    <EventForm value={editForm} onChange={setEditForm} />
                    <DialogFooter className="gap-2 flex-row-reverse sm:flex-row-reverse mt-2">
                      <Button variant="outline" className="rounded-xl border-white/10 flex-1" onClick={() => setEditMode(false)}>
                        إلغاء
                      </Button>
                      <Button className="rounded-xl flex-1 font-bold" onClick={handleSaveEdit}>
                        حفظ التعديلات
                      </Button>
                    </DialogFooter>
                  </>
                ) : (
                  <>
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-secondary/40 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground mb-1">التاريخ</p>
                          <p className="font-bold text-xs">{formatDateAr(selectedEvent.date)}</p>
                        </div>
                        <div className="bg-secondary/40 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground mb-1">الوقت والمدة</p>
                          <p className="font-bold text-xs">{selectedEvent.time} · {selectedEvent.duration}</p>
                        </div>
                      </div>
                      <div className="bg-secondary/40 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> الموقع</p>
                        <p className="font-bold text-xs">{selectedEvent.location}</p>
                      </div>
                      <div className="bg-secondary/40 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><User className="h-3 w-3" /> الموكل</p>
                        <p className="font-bold text-xs">{selectedEvent.client}</p>
                      </div>
                      {selectedEvent.judge && (
                        <div className="bg-secondary/40 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Gavel className="h-3 w-3" /> القاضي</p>
                          <p className="font-bold text-xs">{selectedEvent.judge}</p>
                        </div>
                      )}
                      {selectedEvent.caseId && (
                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground mb-1">رقم القضية</p>
                          <p className="font-bold text-xs text-primary">{selectedEvent.caseId}</p>
                        </div>
                      )}
                      <div className="bg-secondary/40 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground mb-1">ملاحظات</p>
                        <p className="text-xs leading-relaxed">{selectedEvent.notes}</p>
                      </div>
                    </div>

                    <DialogFooter className="gap-2 flex-row-reverse sm:flex-row-reverse">
                      <Button
                        variant="outline"
                        className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 flex-1"
                        onClick={() => setDeleteOpen(true)}
                      >
                        <Trash2 className="h-4 w-4 ml-2" /> حذف الموعد
                      </Button>
                      <Button className="rounded-xl flex-1 font-bold" onClick={handleOpenEdit}>
                        <Pencil className="h-4 w-4 ml-2" /> تعديل الموعد
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ─────────────────────────────────────────────────── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-white/10" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد حذف الموعد</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف "{selectedEvent?.title}"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel className="rounded-xl border-white/10">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
