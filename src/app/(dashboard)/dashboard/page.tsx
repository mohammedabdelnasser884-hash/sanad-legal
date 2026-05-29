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
  Gavel
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const stats = [
    { label: "القضايا النشطة", value: "32", icon: Gavel, color: "text-primary", bg: "bg-primary/10" },
    { label: "جلسات اليوم", value: "5", icon: CalendarIcon, color: "text-accent", bg: "bg-accent/10" },
    { label: "مواعيد ناجز", value: "14", icon: Clock, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "إجمالي الموكلين", value: "184", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold">مرحباً بك، أستاذ أحمد السلطان</h2>
          <p className="text-muted-foreground">إليك ملخص أعمالك القانونية وتنبيهات الأنظمة لهذا اليوم.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5">تصدير سجل القضايا</Button>
          <Button className="rounded-xl px-6 shadow-lg shadow-primary/20 font-bold">+ إضافة قضية جديدة</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-md bg-card/50 hover:bg-card/80 transition-all border border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="text-3xl font-headline font-bold mt-1">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Cases */}
        <Card className="lg:col-span-2 border-none shadow-md bg-card/50 border border-white/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline text-xl">آخر التحديثات (منصة ناجز)</CardTitle>
              <CardDescription>تمت المزامنة بنجاح قبل 5 دقائق.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">مشاهدة الكل</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "شركة الإنشاءات الكبرى vs المقاول الرئيسي", id: "قضية تجارية - المحكمة العامة بالرياض", status: "بانتظار الحكم", date: "الأحد القادم - 9 ص", priority: "high" },
                { title: "تركة فهد الراجحي (تصفية)", id: "أحوال شخصية - الدائرة الثالثة", status: "موعد جلسة", date: "غداً - 10:30 صباحاً", priority: "urgent" },
                { title: "استشارة امتثال شركة تقنية", id: "عقد توريد دولي", status: "مراجعة ذكية", date: "اليوم - 2 مساءً", priority: "normal" },
                { title: "نزاع عقاري - حي الملقا", id: "قضية مدنية - المحكمة العامة", status: "تم التأجيل", date: "24 مايو، 2024", priority: "low" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 hover:bg-secondary/40 transition-all group cursor-pointer border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.priority === 'urgent' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
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
                    <Badge variant={item.priority === 'urgent' ? 'destructive' : 'secondary'} className="rounded-full px-4 text-[10px] font-bold">
                      {item.status}
                    </Badge>
                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights Panel */}
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <CardTitle className="font-headline text-lg">تنبيهات سند الذكية</CardTitle>
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
                <Button size="sm" variant="link" className="p-0 h-auto mt-2 text-accent text-xs font-bold">معالجة الثغرة</Button>
              </div>
              
              <div className="p-4 rounded-2xl bg-background/50 border border-white/10 backdrop-blur-sm shadow-sm">
                <p className="text-sm font-bold text-accent flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" /> تحديث جدول قضية العمالة
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  تحديث آلي: تم رصد إيداع مذكرة جديدة من الخصم في ناجز. مساعد سند قام بتلخيصها لك.
                </p>
                <Button size="sm" variant="link" className="p-0 h-auto mt-2 text-accent text-xs font-bold">عرض الملخص الذكي</Button>
              </div>

              <Button asChild className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold h-12">
                <Link href="/ai-assistant">افتح مساعد سند الذكي</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none bg-card/50 p-6 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4 shadow-inner">
              <FileText className="h-8 w-8" />
            </div>
            <h4 className="font-bold mb-2">أتمتة المذكرات</h4>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">قم بإنشاء لائحة اعتراضية احترافية مدعمة بأحدث المبادئ القضائية في دقائق.</p>
            <Button variant="outline" className="w-full rounded-xl text-xs font-bold">ابدأ الصياغة الآن</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
