import * as React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { UserNav } from "@/components/layout/user-nav";
import { Separator } from "@/components/ui/separator";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-6 backdrop-blur-md">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center justify-between">
            <h1 className="font-headline text-lg font-bold tracking-tight text-foreground/90">
              سند القانوني برو <span className="text-primary text-xs font-normal">| نظام مكاتب المحاماة</span>
            </h1>
            <UserNav />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 subtle-scroll">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
