import * as React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {/* Desktop Sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      <SidebarInset className="flex flex-col min-h-screen">
        <main className="flex-1 overflow-y-auto subtle-scroll bg-[#F5F6FA]">
          {children}
        </main>
        {/* Mobile Bottom Nav */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
