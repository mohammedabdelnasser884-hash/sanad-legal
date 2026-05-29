"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquareCode, 
  Send, 
  Sparkles, 
  FileText, 
  History, 
  Scale,
  Globe,
  PlusCircle,
  BrainCircuit
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            مساعد سند القانوني الذكي
          </h2>
          <p className="text-muted-foreground">ذكاء اصطناعي قانوني متقدم متخصص في الأنظمة السعودية.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="rounded-full bg-accent/10 text-accent border-accent/20 px-4 py-1">
            مدعوم بتقنية Gemini 2.5
          </Badge>
          <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 px-4 py-1">
            خبير في الأنظمة السعودية
          </Badge>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-220px)]">
        {/* Sidebar Tools */}
        <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto subtle-scroll pl-2">
          <Card className="border-none bg-card/50 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-headline">أدوات ذكية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors">
                <FileText className="h-4 w-4" /> تحليل العقود
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors">
                <PlusCircle className="h-4 w-4" /> صياغة بند قانوني
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors">
                <Scale className="h-4 w-4" /> استخراج الاستشهادات
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors">
                <BrainCircuit className="h-4 w-4" /> ملخص الدعوى
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors">
                <Globe className="h-4 w-4" /> ترجمة قانونية
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none bg-card/50 shadow-md flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-headline flex items-center justify-between">
                المحادثات الأخيرة <History className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "تحليل نظام المعاملات المدنية...",
                "صياغة اتفاقية عدم إفصاح",
                "ملخص نظام العمل السعودي",
                "تدقيق الامتثال: قضية-02"
              ].map((chat, i) => (
                <div key={i} className="text-sm p-3 rounded-xl bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors truncate">
                  {chat}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <Card className="lg:col-span-3 border-none bg-card/50 shadow-xl flex flex-col overflow-hidden relative">
          <CardHeader className="border-b border-border/50 px-6 py-4 flex flex-row items-center justify-between bg-card/80 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <MessageSquareCode className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-headline">جلسة استشارة جديدة</CardTitle>
                <CardDescription className="text-xs">تحدث مع مساعد سند القانوني</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-8 max-w-4xl mx-auto">
              {/* AI Welcome Message */}
              <div className="flex gap-4 items-start">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shrink-0 mt-1">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="bg-secondary/50 rounded-2xl rounded-tr-none p-5 text-sm leading-relaxed max-w-[85%] border border-border/50">
                  <p className="font-semibold text-primary mb-2">مرحباً بك في مساعد سند القانوني</p>
                  <p className="mb-4">يمكنني مساعدتك في البحث القانوني، صياغة العقود، وتحليل المستندات وفق الأنظمة السعودية. كيف يمكنني خدمتك اليوم؟</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <button className="text-right p-3 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-xs transition-colors">
                      "صغ لي لائحة اعتراضية على حكم عمالي"
                    </button>
                    <button className="text-right p-3 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-xs transition-colors">
                      "حلل بنود المسؤولية في هذا العقد"
                    </button>
                  </div>
                </div>
              </div>

              {/* User Mock Message */}
              <div className="flex gap-4 items-start flex-row-reverse">
                <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-1 border border-border">
                  <span className="text-xs font-bold">أ.س</span>
                </div>
                <div className="bg-primary/10 rounded-2xl rounded-tl-none p-5 text-sm leading-relaxed max-w-[85%] border border-primary/20">
                  <p>ما هي شروط فترة التجربة في نظام العمل السعودي لعقد محدد المدة؟</p>
                </div>
              </div>

              {/* AI Mock Response */}
              <div className="flex gap-4 items-start">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shrink-0 mt-1">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="bg-secondary/50 rounded-2xl rounded-tr-none p-5 text-sm leading-relaxed max-w-[85%] border border-border/50">
                  <p className="mb-4">وفقاً للمادة 82 من نظام العمل السعودي، إليك النقاط الجوهرية لفترة التجربة:</p>
                  <ul className="list-disc pr-5 space-y-2 mb-4">
                    <li>يجب النص عليها صراحة في عقد العمل.</li>
                    <li>لا تزيد مدتها الأصلية عن <strong>90 يوماً</strong>.</li>
                    <li>يجوز تمديدها باتفاق مكتوب بين الطرفين لمدة لا تتجاوز <strong>180 يوماً</strong> في الإجمالي.</li>
                    <li>لا تدخل إجازة عيدي الفطر والأضحى والإجازة المرضية في حساب فترة التجربة.</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2">المصادر النظامية:</p>
                    <Badge variant="outline" className="text-[10px] bg-background">نظام العمل السعودي - المادة 82</Badge>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 border-t border-border/50 bg-card/80 backdrop-blur">
            <div className="relative group max-w-4xl mx-auto">
              <Textarea 
                placeholder="اسأل سؤالك القانوني باللغة العربية..." 
                className="min-h-[100px] rounded-2xl bg-secondary/50 border-border pl-20 pt-4 resize-none focus:ring-primary/20 transition-all text-sm"
              />
              <div className="absolute left-4 bottom-4 flex items-center gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary">
                  <PlusCircle className="h-5 w-5" />
                </Button>
                <Button size="icon" className="h-10 w-10 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-4 italic">
              الذكاء الاصطناعي قد يخطئ. يرجى التحقق دائماً من المصادر النظامية الرسمية.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
