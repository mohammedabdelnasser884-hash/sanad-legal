"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Scale,
  Bell,
  Users,
  Gavel,
  CalendarDays,
  ClipboardList,
  ChevronLeft,
  Sparkles,
  FileText,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const STATS = [
  {
    label: "القضايا النشطة",
    value: 34,
    change: "+4",
    up: true,
    icon: Gavel,
    iconBg: "#EEF0F8",
    iconColor: "#1E2B4A",
  },
  {
    label: "الموكلين",
    value: 128,
    change: "+12",
    up: true,
    icon: Users,
    iconBg: "#EEF0F8",
    iconColor: "#1E2B4A",
  },
  {
    label: "المهام المعلقة",
    value: 7,
    change: "-2",
    up: false,
    icon: ClipboardList,
    iconBg: "#FFF4F4",
    iconColor: "#E05C5C",
  },
  {
    label: "جلسات الشهر",
    value: 21,
    change: "+3",
    up: true,
    icon: CalendarDays,
    iconBg: "#EEF0F8",
    iconColor: "#1E2B4A",
  },
];

const SESSIONS = [
  {
    title: "شركة الإنشاءات الكبرى",
    court: "المحكمة التجارية — الرياض",
    date: "غداً",
    time: "9:00 ص",
    tag: "بانتظار الحكم",
    tagColor: "#C9A84C",
  },
  {
    title: "تركة فهد الراجحي",
    court: "الأحوال الشخصية — الدائرة الثالثة",
    date: "اليوم",
    time: "10:30 ص",
    tag: "جلسة قادمة",
    tagColor: "#1E2B4A",
  },
  {
    title: "نزاع عقاري — حي الملقا",
    court: "المحكمة العامة",
    date: "25 يونيو",
    time: "11:00 ص",
    tag: "تأجيل",
    tagColor: "#9CA3AF",
  },
];

export default function DashboardPage() {
  const { toast } = useToast();
  const [notifCount] = useState(3);

  function handleAI(feature: string) {
    toast({ title: `جاري فتح: ${feature}` });
  }

  return (
    <div className="min-h-screen" style={{ background: "#F5F6FA" }} dir="rtl">

      {/* HEADER */}
      <div
        className="relative px-5 pt-10 pb-10"
        style={{
          background: "#1E2B4A",
          borderBottomLeftRadius: "32px",
          borderBottomRightRadius: "32px",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <button className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
            </button>
            {notifCount > 0 && (
              <span
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: "#C9A84C" }}
              >
                {notifCount}
              </span>
            )}
          </div>

          <div className="text-left">
            <p className="text-white/60 text-xs">أهلاً بعودتك</p>
            <p className="text-white font-bold text-base">الأستاذ / محمد</p>
          </div>

          <div
            className="h-11 w-11 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: "#C9A84C" }}
          >
            <Scale className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="text-right">
          <p className="text-white/70 text-sm mb-1">سند ⚖️</p>
          <h1 className="text-white text-2xl font-bold leading-snug">
            يومك يبدأ هنا.
          </h1>
          <h2 className="font-bold text-xl" style={{ color: "#C9A84C" }}>
            ٣ جلسات في انتظارك.
          </h2>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 pb-24 mt-5 space-y-6">

        {/* Stats Grid 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 shadow-sm"
              style={{ border: "1px solid #EFEFEF" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-[11px] font-bold flex items-center gap-0.5"
                  style={{ color: stat.up ? "#22C55E" : "#EF4444" }}
                >
                  {stat.up
                    ? <TrendingUp className="h-3 w-3" />
                    : <TrendingDown className="h-3 w-3" />
                  }
                  {stat.change}
                </span>
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center"
                  style={{ background: stat.iconBg }}
                >
                  <stat.icon className="h-5 w-5" style={{ color: stat.iconColor }} />
                </div>
              </div>
              <p className="text-3xl font-black" style={{ color: "#1E2B4A" }}>
                {stat.value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Upcoming Sessions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/calendar"
              className="text-xs font-bold flex items-center gap-1"
              style={{ color: "#C9A84C" }}
            >
              عرض الكل <ChevronLeft className="h-3 w-3" />
            </Link>
            <h3 className="font-bold text-base" style={{ color: "#1E2B4A" }}>
              أقرب الجلسات
            </h3>
          </div>

          <div className="space-y-3">
            {SESSIONS.map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm"
                style={{ border: "1px solid #EFEFEF" }}
              >
                <div
                  className="shrink-0 rounded-xl px-3 py-2 text-center min-w-[52px]"
                  style={{ background: "#F5F6FA" }}
                >
                  <p className="text-[10px] font-bold" style={{ color: "#6B7280" }}>{s.date}</p>
                  <p className="text-xs font-bold" style={{ color: "#1E2B4A" }}>{s.time}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: "#1E2B4A" }}>
                    {s.title}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: "#6B7280" }}>
                    {s.court}
                  </p>
                </div>
                <span
                  className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full text-white"
                  style={{ background: s.tagColor }}
                >
                  {s.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Assistant */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/ai-assistant"
              className="text-xs font-bold flex items-center gap-1"
              style={{ color: "#C9A84C" }}
            >
              عرض الكل <ChevronLeft className="h-3 w-3" />
            </Link>
            <h3 className="font-bold text-base" style={{ color: "#1E2B4A" }}>
              المساعد القانوني الذكي
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAI("تلخيص ملف PDF")}
              className="bg-white rounded-2xl p-4 text-right shadow-sm active:scale-95 transition-transform"
              style={{ border: "1px solid #EFEFEF" }}
            >
              <div
                className="h-11 w-11 rounded-full flex items-center justify-center mb-3"
                style={{ background: "#1E2B4A" }}
              >
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <p className="font-bold text-sm" style={{ color: "#1E2B4A" }}>تلخيص ملف PDF</p>
              <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "#6B7280" }}>
                ارفع ملف قضية واحصل على ملخص
              </p>
            </button>

            <button
              onClick={() => handleAI("صياغة مذكرة قانونية")}
              className="bg-white rounded-2xl p-4 text-right shadow-sm active:scale-95 transition-transform"
              style={{ border: "1px solid #EFEFEF" }}
            >
              <div
                className="h-11 w-11 rounded-full flex items-center justify-center mb-3"
                style={{ background: "#1E2B4A" }}
              >
                <FileText className="h-5 w-5 text-white" />
              </div>
              <p className="font-bold text-sm" style={{ color: "#1E2B4A" }}>صياغة مذكرة قانونية</p>
              <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "#6B7280" }}>
                مذكرات احترافية في ثوانٍ
              </p>
            </button>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
