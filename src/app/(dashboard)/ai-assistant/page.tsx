"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Send,
  PlusCircle,
  FileText,
  Scale,
  BrainCircuit,
  Globe,
  History,
  RotateCcw,
  Copy,
  CheckCheck,
  Loader2,
  MessageSquareCode,
  ChevronLeft,
  BookOpen,
  Gavel,
  ShieldCheck,
  Briefcase,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `أنت مساعد قانوني ذكي متخصص في القانون السعودي، تعمل ضمن منصة "سند القانوني برو" لمكتب المحامي أحمد السلطان.

خبراتك تشمل:
- نظام العمل السعودي ولوائحه التنفيذية
- نظام المعاملات المدنية
- نظام الشركات ونظام الاستثمار
- أنظمة التحكيم والتقاضي أمام المحاكم السعودية
- أنظمة الملكية الفكرية والعلامات التجارية
- الأحوال الشخصية والأسرة وفق الفقه الإسلامي
- نظام مكافحة الجرائم المعلوماتية والاقتصادية
- أنظمة العقارات والمقاولات

أسلوبك:
- أجب دائماً باللغة العربية الفصحى الواضحة
- كن دقيقاً ومستنداً إلى المواد النظامية عند الإمكان
- نظّم إجاباتك بعناوين وقوائم عند الحاجة
- أشر دائماً إلى المصادر والأنظمة ذات الصلة
- لا تقدم فتوى قاطعة دون التأكيد على ضرورة الاستشارة المباشرة مع المحامي
- كن مهنياً وموجزاً في نفس الوقت

ملاحظة مهمة: هذه استشارة أولية للبحث والمعلومات. القرار النهائي للمحامي المختص.`;

const SUGGESTED_QUESTIONS = [
  { icon: Scale, text: "اشرح نظام العمل السعودي وحقوق الموظف", category: "عمالي" },
  { icon: FileText, text: "صيغة عقد إيجار تجاري وفق النظام السعودي", category: "عقارات" },
  { icon: Briefcase, text: "ما هي شروط تأسيس شركة ذات مسؤولية محدودة؟", category: "شركات" },
  { icon: Gavel, text: "إجراءات رفع دعوى أمام المحكمة التجارية", category: "تقاضي" },
  { icon: ShieldCheck, text: "ما هي حقوق المستهلك في نظام حماية المستهلك؟", category: "حماية" },
  { icon: BookOpen, text: "اشرح نظام التحكيم التجاري وإجراءاته", category: "تحكيم" },
];

const TOOLS = [
  { icon: FileText,    label: "تحليل عقد",          prompt: "حلل العقد التالي وأبرز البنود المهمة والمخاطر القانونية: " },
  { icon: PlusCircle,  label: "صياغة بند قانوني",    prompt: "اكتب لي بنداً قانونياً احترافياً يتعلق بـ: " },
  { icon: Scale,       label: "استخراج استشهادات",   prompt: "ما هي المواد النظامية والأحكام القضائية ذات الصلة بموضوع: " },
  { icon: BrainCircuit,label: "ملخص دعوى قانونية",  prompt: "لخّص لي هذه القضية القانونية وأبرز نقاط القوة والضعف: " },
  { icon: Globe,       label: "ترجمة قانونية",       prompt: "ترجم النص القانوني التالي إلى العربية مع الشرح: " },
];

const HISTORY_ITEMS = [
  "تحليل نظام المعاملات المدنية",
  "صياغة اتفاقية عدم إفصاح",
  "ملخص نظام العمل السعودي",
  "تدقيق امتثال - قضية العمالة",
  "شروط الفسخ في عقود البناء",
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      });

      const data = await response.json();
      const content =
        data?.content
          ?.filter((b: { type: string }) => b.type === "text")
          .map((b: { text: string }) => b.text)
          .join("\n") || "عذراً، لم أتمكن من الإجابة. يرجى المحاولة مرة أخرى.";

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "حدث خطأ في الاتصال. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  async function copyMessage(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function clearChat() {
    setMessages([]);
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-88px)] gap-0 animate-in fade-in duration-500" dir="rtl">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h2 className="text-2xl font-headline font-bold flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            مساعد سند الذكي
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5 mr-11">مستشارك القانوني الذكي المتخصص في الأنظمة السعودية</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            متصل
          </span>
          {!isEmpty && (
            <Button variant="ghost" size="sm" onClick={clearChat} className="rounded-xl text-xs gap-2 text-muted-foreground hover:text-foreground border border-white/10">
              <RotateCcw className="h-3.5 w-3.5" /> محادثة جديدة
            </Button>
          )}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">

        {/* ── Sidebar ── */}
        <div className="hidden lg:flex flex-col gap-4 min-h-0">
          {/* Tools */}
          <Card className="border-none bg-card/50 border border-white/5 shrink-0">
            <div className="p-4 border-b border-white/5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">أدوات سريعة</p>
            </div>
            <div className="p-2 space-y-0.5">
              {TOOLS.map((tool) => (
                <button
                  key={tool.label}
                  onClick={() => setInput(tool.prompt)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:text-primary transition-all text-right"
                >
                  <tool.icon className="h-4 w-4 shrink-0" />
                  {tool.label}
                </button>
              ))}
            </div>
          </Card>

          {/* History */}
          <Card className="border-none bg-card/50 border border-white/5 flex-1 min-h-0">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">المحادثات السابقة</p>
              <History className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="p-2 space-y-0.5 overflow-y-auto">
              {HISTORY_ITEMS.map((h, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-all text-right truncate"
                >
                  <MessageSquareCode className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{h}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Chat Panel ── */}
        <div className="lg:col-span-3 flex flex-col min-h-0 bg-card/50 rounded-2xl border border-white/5 overflow-hidden">

          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/10 bg-card/80 backdrop-blur shrink-0">
            <div className="h-8 w-8 rounded-xl bg-primary/15 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold">سند القانوني</p>
              <p className="text-[10px] text-muted-foreground">مستشار قانوني ذكي متخصص بالأنظمة السعودية</p>
            </div>
            <div className="mr-auto flex items-center gap-1.5 text-[10px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              نشط
            </div>
          </div>

          {/* Messages area */}
          <ScrollArea className="flex-1 px-5 py-4">
            <div className="space-y-6 max-w-3xl mx-auto">

              {/* Empty state / welcome */}
              {isEmpty && (
                <div className="py-6 flex flex-col items-center gap-6 text-center">
                  <div className="h-16 w-16 rounded-3xl bg-primary/15 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-headline font-bold mb-1.5">مرحباً بك في مساعد سند الذكي</h3>
                    <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                      مستشارك القانوني الذكي المتخصص في الأنظمة السعودية. اسألني عن أي موضوع قانوني وسأجيبك بدقة ومهنية.
                    </p>
                  </div>

                  {/* Suggested questions */}
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl">
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(q.text)}
                        className="group flex items-start gap-3 p-3.5 rounded-xl border border-white/10 bg-secondary/20 hover:bg-secondary/40 hover:border-primary/30 transition-all text-right"
                      >
                        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                          <q.icon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors leading-snug">
                            {q.text}
                          </p>
                          <span className="text-[10px] text-muted-foreground mt-0.5 inline-block">{q.category}</span>
                        </div>
                        <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onCopy={() => copyMessage(msg.id, msg.content)}
                  copied={copiedId === msg.id}
                />
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-secondary/40 rounded-2xl rounded-tr-none px-5 py-4 border border-white/5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      <span>سند يفكر...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="p-4 border-t border-white/10 bg-card/80 backdrop-blur shrink-0">
            {/* Quick suggestions when chat is active */}
            {isEmpty === false && messages.length < 3 && (
              <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 subtle-scroll">
                {SUGGESTED_QUESTIONS.slice(0, 3).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q.text)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-secondary/30 border border-white/10 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all whitespace-nowrap"
                  >
                    <q.icon className="h-3 w-3" />
                    {q.category}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب سؤالك القانوني هنا... (Enter للإرسال، Shift+Enter لسطر جديد)"
                  rows={1}
                  disabled={loading}
                  className="w-full bg-secondary/20 border border-white/10 rounded-2xl py-3.5 pr-4 pl-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right placeholder:text-muted-foreground resize-none leading-relaxed disabled:opacity-50"
                  style={{ minHeight: "52px", maxHeight: "160px" }}
                />
              </div>
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                size="icon"
                className="h-[52px] w-[52px] rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-40 shrink-0 transition-all hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>

            <p className="text-[10px] text-center text-muted-foreground/60 mt-3">
              الردود للأغراض البحثية فقط • يرجى التحقق مع المحامي المختص قبل اتخاذ أي إجراء قانوني
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ChatMessage ─────────────────────────────────────────────────────────────

function ChatMessage({
  message,
  onCopy,
  copied,
}: {
  message: Message;
  onCopy: () => void;
  copied: boolean;
}) {
  const isUser = message.role === "user";

  const time = message.timestamp.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex gap-3 items-start group ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-1 ${
          isUser
            ? "bg-secondary/60 border border-white/10 text-xs font-bold"
            : "bg-primary/15 text-primary"
        }`}
      >
        {isUser ? "أ.س" : <Sparkles className="h-4 w-4" />}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-1 max-w-[82%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-5 py-4 text-sm leading-relaxed ${
            isUser
              ? "bg-primary/15 border border-primary/20 rounded-2xl rounded-tl-none"
              : "bg-secondary/40 border border-white/5 rounded-2xl rounded-tr-none"
          }`}
        >
          <MessageContent content={message.content} isUser={isUser} />
        </div>

        {/* Footer: time + copy */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? "flex-row-reverse" : ""}`}>
          <span className="text-[10px] text-muted-foreground/60">{time}</span>
          {!isUser && (
            <button
              onClick={onCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-secondary/40"
              title="نسخ"
            >
              {copied ? (
                <CheckCheck className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MessageContent ───────────────────────────────────────────────────────────
// Renders markdown-ish formatting: bold, lists, headers

function MessageContent({ content, isUser }: { content: string; isUser: boolean }) {
  if (isUser) {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  // Split into blocks by double newline
  const blocks = content.split(/\n{2,}/);

  return (
    <div className="space-y-3">
      {blocks.map((block, bi) => {
        const lines = block.split("\n");

        // Heading: starts with # or ##
        if (lines[0].startsWith("## ")) {
          return (
            <h4 key={bi} className="font-headline font-bold text-primary text-base mt-2">
              {lines[0].replace(/^## /, "")}
            </h4>
          );
        }
        if (lines[0].startsWith("# ")) {
          return (
            <h3 key={bi} className="font-headline font-bold text-foreground text-lg mt-1">
              {lines[0].replace(/^# /, "")}
            </h3>
          );
        }

        // List block: lines starting with - or • or number.
        const isList = lines.every((l) =>
          l.trim() === "" || /^(\-|•|\d+[\.\-\)])\s/.test(l.trim())
        );
        if (isList && lines.some((l) => /^(\-|•|\d+[\.\-\)])\s/.test(l.trim()))) {
          return (
            <ul key={bi} className="space-y-1.5 pr-1">
              {lines
                .filter((l) => l.trim())
                .map((line, li) => {
                  const clean = line.replace(/^(\-|•|\d+[\.\-\)])\s+/, "");
                  const isNum = /^\d+[\.\-\)]/.test(line.trim());
                  return (
                    <li key={li} className="flex items-start gap-2 text-sm">
                      <span className={`shrink-0 mt-0.5 font-bold text-primary text-xs ${isNum ? "min-w-[18px]" : ""}`}>
                        {isNum ? line.match(/^\d+/)?.[0] + "." : "•"}
                      </span>
                      <span className="leading-relaxed">{renderInline(clean)}</span>
                    </li>
                  );
                })}
            </ul>
          );
        }

        // Regular paragraph
        return (
          <p key={bi} className="text-sm leading-relaxed">
            {lines.map((line, li) => (
              <span key={li}>
                {renderInline(line)}
                {li < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}
