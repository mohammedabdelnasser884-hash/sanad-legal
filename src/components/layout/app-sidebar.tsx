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
  ShieldCheck
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

  return (
    <Sidebar variant="sidebar" collapsible="icon" side="right">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 shrink-0">
            <Scale className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden truncate">
            <span className="font-headline font-bold text-foreground">سند القانوني</span>
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">مكتب أحمد السلطان</span>
          </div>
        </div>
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
                    className={pathname === item.href ? "bg-primary/10 text-primary font-bold" : ""}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
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
                    className={pathname === item.href ? "bg-primary/10 text-primary font-bold" : ""}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border bg-sidebar-accent/30">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 p-2 group-data-[collapsible=icon]:p-0">
              <Avatar className="h-10 w-10 rounded-xl border border-primary/20 shrink-0">
                <AvatarImage src="https://picsum.photos/seed/lawyer1/100/100" />
                <AvatarFallback className="rounded-xl bg-primary/10 text-primary">أ.س</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden flex-1">
                <span className="text-sm font-bold truncate">أحمد السلطان</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground truncate font-bold text-accent uppercase tracking-tighter">محامي مرخص</span>
                  <ShieldCheck className="h-3 w-3 text-accent" />
                </div>
              </div>
              <button className="group-data-[collapsible=icon]:hidden hover:text-destructive transition-colors p-2 rounded-lg hover:bg-destructive/10">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
