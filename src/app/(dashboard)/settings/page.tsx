"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  User,
  Bell,
  Shield,
  Building2,
  Palette,
  FileText,
  Users,
  CreditCard,
  Globe,
  Lock,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  LogOut,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

// ─── Section Nav ──────────────────────────────────────────────────────────────

type Section =
  | "profile"
  | "office"
  | "notifications"
  | "privacy"
  | "appearance"
  | "team"
  | "billing";

const sections: { id: Section; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "profile",       label: "الملف الشخصي",    icon: User,       desc: "معلوماتك الشخصية ومعلومات الاتصال" },
  { id: "office",        label: "إعدادات المكتب",  icon: Building2,  desc: "اسم المكتب، العنوان، والرخصة" },
  { id: "notifications", label: "الإشعارات",        icon: Bell,       desc: "تحكم في كيفية إشعارك" },
  { id: "privacy",       label: "الخصوصية والأمان", icon: Shield,     desc: "كلمة المرور والأمان" },
  { id: "appearance",    label: "المظهر واللغة",    icon: Palette,    desc: "تخصيص الواجهة" },
  { id: "team",          label: "فريق العمل",       icon: Users,      desc: "إدارة أعضاء الفريق" },
  { id: "billing",       label: "الفوترة والاشتراك", icon: CreditCard, desc: "الخطة الحالية والفواتير" },
];

// ─── Toggle Row ───────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onToggle} />
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label,
  id,
  defaultValue,
  type = "text",
  placeholder,
}: {
  label: string;
  id: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-bold">{label}</Label>
      <Input
        id={id}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl"
      />
    </div>
  );
}

// ─── Team Member ─────────────────────────────────────────────────────────────

const teamMembers = [
  { name: "أحمد السلطان", role: "محامي أول", email: "ahmed@sanad.law", status: "نشط", avatar: "أ.س" },
  { name: "نورة القحطاني", role: "محامية", email: "noura@sanad.law", status: "نشط", avatar: "ن.ق" },
  { name: "خالد العتيبي", role: "مساعد قانوني", email: "khalid@sanad.law", status: "نشط", avatar: "خ.ع" },
  { name: "سارة المطيري", role: "سكرتيرة قانونية", email: "sara@sanad.law", status: "إجازة", avatar: "س.م" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const { toast } = useToast();

  const [notifSettings, setNotifSettings] = useState({
    sessions: true,
    appointments: true,
    deadlines: true,
    newClients: false,
    teamUpdates: true,
    emailDigest: false,
    smsAlerts: true,
    pushNotif: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    twoFactor: false,
    sessionLog: true,
    dataEncrypt: true,
  });

  const handleSave = () => {
    toast({
      title: "تم الحفظ",
      description: "تم حفظ التغييرات بنجاح.",
    });
  };

  const active = sections.find((s) => s.id === activeSection)!;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Toaster />

      {/* Header */}
      <div>
        <h2 className="text-3xl font-headline font-bold">الإعدادات</h2>
        <p className="text-muted-foreground">إدارة حساب المكتب والتفضيلات الشخصية</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Nav */}
        <div className="space-y-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition-all
                ${activeSection === s.id
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
            >
              <s.icon className="h-4 w-4 shrink-0" />
              <span className="text-sm">{s.label}</span>
            </button>
          ))}

          <Separator className="my-3 bg-white/10" />

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition-all text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">تسجيل الخروج</span>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <active.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg">{active.label}</h3>
              <p className="text-sm text-muted-foreground">{active.desc}</p>
            </div>
          </div>

          {/* Profile Section */}
          {activeSection === "profile" && (
            <div className="space-y-5">
              <Card className="border-none bg-card/50 border border-white/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="relative">
                      <Avatar className="h-20 w-20 rounded-2xl border-2 border-primary/20">
                        <AvatarImage src="https://picsum.photos/seed/lawyer1/100/100" />
                        <AvatarFallback className="rounded-2xl bg-primary/10 text-primary text-xl font-bold">أ.س</AvatarFallback>
                      </Avatar>
                      <button className="absolute -bottom-1 -left-1 p-1.5 rounded-lg bg-primary text-primary-foreground shadow">
                        <Camera className="h-3 w-3" />
                      </button>
                    </div>
                    <div>
                      <p className="font-bold text-lg">أحمد السلطان</p>
                      <p className="text-sm text-muted-foreground">محامي مرخص · عضو منذ 2019</p>
                      <Badge variant="outline" className="mt-1 text-xs text-emerald-400 bg-emerald-400/10 border-emerald-400/20">
                        <CheckCircle2 className="h-3 w-3 ml-1" /> حساب موثق
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="الاسم الأول" id="first-name" defaultValue="أحمد" />
                    <Field label="اسم العائلة" id="last-name" defaultValue="السلطان" />
                    <Field label="البريد الإلكتروني" id="email" type="email" defaultValue="ahmed@sanad.law" />
                    <Field label="رقم الجوال" id="phone" type="tel" defaultValue="+966 50 123 4567" />
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="bio" className="text-sm font-bold">نبذة مهنية</Label>
                      <Textarea
                        id="bio"
                        defaultValue="محامي متخصص في القضايا التجارية والعمالية، خبرة أكثر من 12 عاماً في المحاكم السعودية."
                        className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20" onClick={handleSave}>
                  <Save className="h-4 w-4 ml-2" /> حفظ التغييرات
                </Button>
              </div>
            </div>
          )}

          {/* Office Section */}
          {activeSection === "office" && (
            <div className="space-y-5">
              <Card className="border-none bg-card/50 border border-white/5">
                <CardHeader className="p-6 pb-3">
                  <CardTitle className="text-base">بيانات المكتب</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field label="اسم المكتب" id="office-name" defaultValue="مكتب سند القانوني" />
                    </div>
                    <Field label="رخصة مزاولة المهنة" id="license" defaultValue="SAR-2019-04412" />
                    <Field label="السجل التجاري" id="cr" defaultValue="1010123456" />
                    <div className="sm:col-span-2">
                      <Field label="العنوان" id="address" defaultValue="طريق الملك فهد، حي العليا، الرياض 12214" />
                    </div>
                    <Field label="الهاتف" id="office-phone" defaultValue="+966 11 234 5678" />
                    <Field label="البريد الرسمي" id="office-email" defaultValue="info@sanad.law" />
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="office-desc" className="text-sm font-bold">وصف المكتب</Label>
                      <Textarea
                        id="office-desc"
                        defaultValue="مكتب متخصص في القضايا التجارية والعمالية والأحوال الشخصية، نخدم الأفراد والشركات في جميع أنحاء المملكة."
                        className="bg-secondary/40 border-white/10 focus:border-primary/50 rounded-xl resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20" onClick={handleSave}>
                  <Save className="h-4 w-4 ml-2" /> حفظ
                </Button>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <Card className="border-none bg-card/50 border border-white/5">
              <CardContent className="p-6 space-y-1 divide-y divide-white/5">
                {[
                  { key: "sessions" as const, label: "تذكير الجلسات", desc: "إشعار قبل 24 ساعة من موعد الجلسة" },
                  { key: "appointments" as const, label: "المواعيد القادمة", desc: "تنبيه قبل ساعة من الموعد" },
                  { key: "deadlines" as const, label: "المواعيد النهائية", desc: "تحذير عند اقتراب موعد ناجز" },
                  { key: "newClients" as const, label: "موكلين جدد", desc: "إشعار عند إضافة موكل جديد" },
                  { key: "teamUpdates" as const, label: "تحديثات الفريق", desc: "إشعارات تغييرات أعضاء الفريق" },
                ].map((item) => (
                  <ToggleRow
                    key={item.key}
                    label={item.label}
                    description={item.desc}
                    checked={notifSettings[item.key]}
                    onToggle={() =>
                      setNotifSettings((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                    }
                  />
                ))}

                <div className="pt-4">
                  <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">قنوات الإشعار</p>
                  {[
                    { key: "pushNotif" as const, label: "إشعارات التطبيق", desc: "إشعارات داخل النظام" },
                    { key: "smsAlerts" as const, label: "رسائل SMS", desc: "تنبيهات على الجوال" },
                    { key: "emailDigest" as const, label: "ملخص البريد الإلكتروني", desc: "ملخص أسبوعي بالبريد" },
                  ].map((item) => (
                    <ToggleRow
                      key={item.key}
                      label={item.label}
                      description={item.desc}
                      checked={notifSettings[item.key]}
                      onToggle={() =>
                        setNotifSettings((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                      }
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy Section */}
          {activeSection === "privacy" && (
            <div className="space-y-5">
              <Card className="border-none bg-card/50 border border-white/5">
                <CardHeader className="p-6 pb-3">
                  <CardTitle className="text-base">تغيير كلمة المرور</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-2 space-y-4">
                  <Field label="كلمة المرور الحالية" id="current-pw" type="password" />
                  <Field label="كلمة المرور الجديدة" id="new-pw" type="password" />
                  <Field label="تأكيد كلمة المرور" id="confirm-pw" type="password" />
                  <Button variant="outline" className="rounded-xl border-white/10 w-full" onClick={handleSave}>
                    <Lock className="h-4 w-4 ml-2" /> تحديث كلمة المرور
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-none bg-card/50 border border-white/5">
                <CardHeader className="p-6 pb-3">
                  <CardTitle className="text-base">إعدادات الأمان</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-2 divide-y divide-white/5">
                  {[
                    { key: "twoFactor" as const, label: "المصادقة الثنائية", desc: "تحقق إضافي عند تسجيل الدخول" },
                    { key: "sessionLog" as const, label: "سجل الجلسات", desc: "تتبع جلسات تسجيل الدخول" },
                    { key: "dataEncrypt" as const, label: "تشفير البيانات", desc: "تشفير الملفات والمستندات" },
                  ].map((item) => (
                    <ToggleRow
                      key={item.key}
                      label={item.label}
                      description={item.desc}
                      checked={privacySettings[item.key]}
                      onToggle={() =>
                        setPrivacySettings((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                      }
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Appearance Section */}
          {activeSection === "appearance" && (
            <div className="space-y-5">
              <Card className="border-none bg-card/50 border border-white/5">
                <CardHeader className="p-6 pb-3">
                  <CardTitle className="text-base">المظهر</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-2 space-y-5">
                  <div>
                    <p className="text-sm font-bold mb-3">وضع العرض</p>
                    <div className="grid grid-cols-3 gap-3">
                      {["داكن", "فاتح", "تلقائي"].map((mode, i) => (
                        <button
                          key={mode}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all
                            ${i === 0 ? "bg-primary/10 border-primary text-primary" : "border-white/10 text-muted-foreground hover:border-white/20"}`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold mb-3">اللغة</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "العربية", active: true },
                        { label: "English", active: false },
                      ].map(({ label, active }) => (
                        <button
                          key={label}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2
                            ${active ? "bg-primary/10 border-primary text-primary" : "border-white/10 text-muted-foreground hover:border-white/20"}`}
                        >
                          <Globe className="h-4 w-4" />
                          {label}
                          {active && <CheckCircle2 className="h-3 w-3 mr-auto" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Team Section */}
          {activeSection === "team" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{teamMembers.length} أعضاء في الفريق</p>
                <Button size="sm" className="rounded-xl font-bold text-xs px-4">
                  + دعوة عضو
                </Button>
              </div>
              <div className="space-y-3">
                {teamMembers.map((member, i) => (
                  <Card key={i} className="border-none bg-card/50 border border-white/5">
                    <CardContent className="p-4 flex items-center gap-4">
                      <Avatar className="h-10 w-10 rounded-xl border border-white/10">
                        <AvatarImage src={`https://picsum.photos/seed/${member.name}/100/100`} />
                        <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-xs font-bold">
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{member.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                          <span className="text-muted-foreground/30">·</span>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${member.status === "نشط" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-amber-400 bg-amber-400/10 border-amber-400/20"}`}
                      >
                        {member.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Billing Section */}
          {activeSection === "billing" && (
            <div className="space-y-5">
              <Card className="border-none bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-3 bg-primary text-primary-foreground font-bold">الخطة الاحترافية</Badge>
                      <p className="text-3xl font-headline font-bold">499 ريال<span className="text-base font-normal text-muted-foreground">/شهر</span></p>
                      <p className="text-sm text-muted-foreground mt-1">تجدد تلقائياً في 15 يونيو 2026</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-primary opacity-60" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-5">
                    {[
                      { label: "القضايا", value: "غير محدود" },
                      { label: "الموكلين", value: "غير محدود" },
                      { label: "المستندات", value: "50 جيجا" },
                    ].map((f) => (
                      <div key={f.label} className="bg-black/20 rounded-xl p-3 text-center">
                        <p className="text-xs font-bold">{f.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{f.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none bg-card/50 border border-white/5">
                <CardHeader className="p-6 pb-3">
                  <CardTitle className="text-base">آخر الفواتير</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-2 space-y-2">
                  {[
                    { date: "15 مايو 2026", amount: "499 ريال", status: "مدفوعة" },
                    { date: "15 أبريل 2026", amount: "499 ريال", status: "مدفوعة" },
                    { date: "15 مارس 2026", amount: "499 ريال", status: "مدفوعة" },
                  ].map((inv, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary/40">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{inv.amount}</p>
                          <p className="text-xs text-muted-foreground">{inv.date}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs text-emerald-400 bg-emerald-400/10 border-emerald-400/20">
                        {inv.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
