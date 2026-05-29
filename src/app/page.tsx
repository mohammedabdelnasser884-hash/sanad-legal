import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scale, ArrowLeft, CheckCircle2, ShieldCheck, Globe, Zap, Cpu, Landmark, Gavel } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background overflow-x-hidden">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Scale className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-headline text-xl font-bold tracking-tight text-foreground">
              سند القانوني <span className="text-primary">برو</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">المميزات</Link>
            <Link href="#ai" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">المساعد الذكي</Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">الباقات</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground ml-4">دخول المحامين</Link>
            <Button asChild className="rounded-full px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
              <Link href="/dashboard">ابدأ التجربة مجاناً</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          <div className="container relative z-10 mx-auto px-6">
            <div className="max-w-4xl text-right">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-6">
                <Landmark className="h-3 w-3" /> مخصص للأنظمة العدلية في المملكة العربية السعودية
              </div>
              <h1 className="font-headline text-5xl font-bold tracking-tighter sm:text-7xl mb-8 leading-[1.2]">
                ارتقِ بممارستك القانونية <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">بذكاء اصطناعي يفهم نظامنا.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
                سند القانوني برو هو النظام الرائد المصمم خصيصاً للمكاتب القانونية السعودية. ندمج خبرة المحامي مع قوة الذكاء الاصطناعي لتحليل الأنظمة وصياغة المذكرات بدقة متناهية وفق أحدث التحديثات الملكية.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-start">
                <Button asChild size="lg" className="h-14 px-8 rounded-full text-lg shadow-xl shadow-primary/20 font-bold">
                  <Link href="/login">سجل مكتبك الآن <ArrowLeft className="mr-2 h-5 w-5 rotate-180" /></Link>
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg bg-white/5 backdrop-blur border-white/10 hover:bg-white/10 font-bold">
                  طلب عرض تجريبي للمؤسسات
                </Button>
              </div>
            </div>
          </div>
          
          <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/3 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        </section>

        {/* Features */}
        <section id="features" className="py-24 bg-secondary/30">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="font-headline text-3xl font-bold mb-4 text-white">نظام متكامل صمم ليكون شريكك</h2>
              <p className="text-muted-foreground">أدوات متطورة تغطي كافة جوانب العمل القانوني، من الربط مع منصة ناجز إلى تحليل الثغرات القانونية في العقود.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "ربط تقني مع ناجز",
                  desc: "مزامنة تلقائية لمواعيد الجلسات وتحديثات القضايا لحظة بلحظة مع تنبيهات ذكية للمواعيد النهائية عبر بوابة ناجز.",
                  icon: Gavel
                },
                {
                  title: "خبير الأنظمة السعودية",
                  desc: "محرك ذكاء اصطناعي مدرب على نظام المعاملات المدنية الجديد، نظام الشركات، ونظام العمل السعودي المحدث.",
                  icon: ShieldCheck
                },
                {
                  title: "صياغة قانونية رصينة",
                  desc: "صغ لوائحك ومذكراتك بضغطة زر. نظامنا يقترح عليك الأسانيد والمبادئ القضائية المستقرة في المحكمة العليا.",
                  icon: Cpu
                }
              ].map((feature, i) => (
                <div key={i} className="group p-8 rounded-3xl border border-white/5 bg-card/40 hover:bg-card hover:border-primary/30 transition-all duration-300 text-right">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-headline text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Showcase */}
        <section id="ai" className="py-24 overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 order-2 lg:order-1 text-right">
                <h2 className="font-headline text-4xl font-bold mb-6 leading-tight">
                  مساعدك الذي لا ينام <br />
                  دائماً بجانبك في كل تفصيلة قانونية.
                </h2>
                <div className="space-y-6">
                  {[
                    "تحليل فوري للمخاطر وفق نظام المعاملات المدنية",
                    "صياغة لوائح اعتراضية متوافقة مع قواعد الاستئناف",
                    "استخراج الاستشهادات من المبادئ القضائية السعودية",
                    "تلخيص محاضر الضبط والمذكرات الطويلة في ثوانٍ",
                    "دعم كامل للمصطلحات الشرعية والنظامية المحلية"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 justify-start">
                      <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                      </div>
                      <span className="font-medium text-lg">{item}</span>
                    </div>
                  ))}
                </div>
                <Button size="lg" className="mt-10 rounded-full px-10 h-14 text-lg font-bold">استشر المساعد الذكي الآن</Button>
              </div>
              <div className="flex-1 order-1 lg:order-2 relative">
                <div className="glass rounded-[2rem] p-4 shadow-2xl relative z-10 border-primary/20">
                  <img 
                    src="https://picsum.photos/seed/legalpro/1000/700" 
                    alt="Sanad Interface" 
                    className="rounded-[1.5rem] w-full"
                    data-ai-hint="legal dashboard"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-primary p-6 rounded-2xl shadow-xl hidden md:block border-4 border-background">
                    <p className="text-primary-foreground font-bold text-lg text-right">ثقة قانونية 100%</p>
                    <p className="text-primary-foreground/80 text-xs font-medium text-right">بناءً على أحدث المبادئ القضائية</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-16 bg-sidebar">
        <div className="container mx-auto px-6 text-right">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6 justify-end">
                <span className="font-headline font-bold text-2xl">سند القانوني برو</span>
                <Scale className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground max-w-md leading-relaxed ml-auto">
                نحن في سند نهدف إلى تمكين المنظومة العدلية السعودية بأحدث تقنيات الذكاء الاصطناعي، للمساهمة في تحقيق مستهدفات رؤية المملكة 2030 في التحول الرقمي العدلي.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">روابط هامة</h4>
              <ul className="space-y-4 text-muted-foreground text-sm">
                <li><Link href="#" className="hover:text-primary transition-colors">عن المنصة</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">خطط الاشتراك</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">المركز المعرفي</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">تواصل معنا</h4>
              <ul className="space-y-4 text-muted-foreground text-sm">
                <li>المملكة العربية السعودية، الرياض</li>
                <li>contact@sanadlegal.sa</li>
                <li>الدعم الفني: 800XXXXXXX</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2024 سند للتقنيات القانونية. جميع الحقوق محفوظة.</p>
            <div className="flex gap-8">
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">سياسة الخصوصية</Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">شروط الاستخدام</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
