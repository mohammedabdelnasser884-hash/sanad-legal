import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, ShieldCheck, Mail, Lock, ArrowRight, Landmark } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-accent/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md space-y-8 relative">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/30 group-hover:scale-110 transition-transform">
              <Scale className="h-8 w-8" />
            </div>
          </Link>
          <h1 className="text-4xl font-headline font-bold">تسجيل دخول المحامين</h1>
          <p className="text-muted-foreground mt-3">سجل دخولك للوصول إلى مكتبك الافتراضي.</p>
        </div>

        <div className="glass rounded-[2.5rem] p-10 shadow-2xl space-y-8 border-white/5">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="pr-1 font-bold">البريد المهني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="lawyer@firm.sa" className="pr-10 h-14 rounded-2xl bg-secondary/30 border-white/10 text-right" dir="ltr" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="password" title="password" className="font-bold">كلمة المرور</Label>
                <Link href="#" className="text-xs text-primary hover:underline font-bold">نسيت كلمة المرور؟</Link>
              </div>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" className="pr-10 h-14 rounded-2xl bg-secondary/30 border-white/10 text-right" dir="ltr" />
              </div>
            </div>
          </div>

          <Button asChild className="w-full h-14 rounded-2xl text-lg shadow-xl shadow-primary/20 font-bold">
            <Link href="/dashboard">دخول النظام <ArrowRight className="mr-2 h-5 w-5 rotate-180" /></Link>
          </Button>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-white/5" />
            <span className="flex-shrink mx-4 text-[10px] uppercase tracking-widest text-muted-foreground font-extrabold">أو عبر المنصات الحكومية</span>
            <div className="flex-grow border-t border-white/5" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 border-white/10 font-bold gap-2">
              <Landmark className="h-4 w-4 text-accent" /> نفاذ
            </Button>
            <Button variant="outline" className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 border-white/10 font-bold">
              مايكروسوفت
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          هل تواجه مشكلة؟{" "}
          <Link href="#" className="text-primary hover:underline font-extrabold">تواصل مع الدعم الفني</Link>
        </p>

        <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase font-extrabold tracking-widest bg-secondary/20 py-3 rounded-full border border-white/5 px-6">
          <ShieldCheck className="h-3 w-3 text-accent" /> تشفير بيانات بمعايير الهيئة السعودية للبيانات والذكاء الاصطناعي (SDAIA)
        </div>
      </div>
    </div>
  );
}
