"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquareCode,
  Files,
  Calendar,
  Settings,
  CreditCard,
  Bell,
  Scale,
  LogOut,
  Gavel,
  ShieldCheck,
  Search,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlobalSearch } from "@/components/layout/global-search";

const navItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", href: "/dashboard" },
  { icon: Gavel, label: "إدارة القضايا", href: "/cases" },
  { icon: MessageSquareCode, label: "المساعد الذكي", href: "/ai-assistant" },
  { icon: Users, label: "الموكلين", href: "/clients" },
  { icon: Files, label: "العقود والمستندات", href: "/documents" },
  { icon: Calendar, label: "المواعيد والجلسات", href: "/calendar" },
];

const secondaryNav = [
  { icon: Bell, label: "الإشعارات", href: "/notifications" },
  { icon: CreditCard, label: "الفوترة والرسوم", href: "/billing" },
  { icon: Settings, label: "إعدادات المكتب", href: "/settings" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

      <Sidebar variant="sidebar" collapsible="icon" side="right">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/40 shrink-0 ring-2 ring-primary/20">
              <Scale className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden truncate">
              <span className="font-headline font-bold text-foreground">سند القانوني</span>
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">مكتب أحمد السلطان</span>
            </div>
          </div>

          {/* Search button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="mt-3 flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/30 px-3 py-2 text-sm text-muted-foreground transition-all duration-200 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2"
            title="بحث (Ctrl+K)"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden flex-1 text-right">بحث...</span>
            <kbd className="group-data-[collapsible=icon]:hidden pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-60">
              ⌘K
            </kbd>
          </button>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden pr-2 font-bold text-muted-foreground/50">القائمة المهنية</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.label}
                      className={
                        pathname === item.href
                          ? "bg-primary/15 text-primary font-bold border border-primary/30 shadow-sm shadow-primary/10"
                          : "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition-all duration-200"
                      }
                    >
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden pr-2 font-bold text-muted-foreground/50">الإدارة والنظام</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {secondaryNav.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.label}
                      className={
                        pathname === item.href
                          ? "bg-primary/15 text-primary font-bold border border-primary/30 shadow-sm shadow-primary/10"
                          : "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition-all duration-200"
                      }
                    >
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-sidebar-border bg-sidebar-background/80 backdrop-blur-sm">
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-sidebar-accent/30 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:bg-transparent">
                <Avatar className="h-10 w-10 rounded-xl border border-primary/30 shadow-sm shadow-primary/10 shrink-0">
                  <AvatarImage src="https://picsum.photos/seed/lawyer1/100/100" />
                  <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold">أ.س</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden flex-1">
                  <span className="text-sm font-bold truncate">أحمد السلطان</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground truncate font-bold text-accent uppercase tracking-tighter">محامي مرخص</span>
                    <ShieldCheck className="h-3 w-3 text-accent" />
                  </div>
                </div>
                <button className="group-data-[collapsible=icon]:hidden hover:text-destructive transition-all duration-200 p-2 rounded-lg hover:bg-destructive/10">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
