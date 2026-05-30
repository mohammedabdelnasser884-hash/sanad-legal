"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Gavel, Calendar, BookOpen, Sparkles } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "الرئيسية", href: "/dashboard"     },
  { icon: Gavel,           label: "القضايا",  href: "/cases"         },
  { icon: Sparkles,        label: "المساعد",  href: "/ai-assistant", center: true },
  { icon: Calendar,        label: "الجدول",   href: "/calendar"      },
  { icon: BookOpen,        label: "المكتبة",  href: "/documents"     },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-around h-16 px-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        if (item.center) {
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center -mt-6">
              <div
                className="h-14 w-14 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: "#1E2B4A" }}
              >
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-[10px] mt-1 font-bold" style={{ color: "#1E2B4A" }}>
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 py-1 px-3">
            <item.icon
              className="h-5 w-5"
              style={{ color: isActive ? "#C9A84C" : "#9CA3AF" }}
            />
            <span
              className="text-[10px] font-semibold"
              style={{ color: isActive ? "#C9A84C" : "#9CA3AF" }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
