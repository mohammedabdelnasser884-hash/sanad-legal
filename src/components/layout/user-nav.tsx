"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserNav() {
  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:flex relative w-64">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="ابحث عن قضايا، مستندات..." 
          className="w-full bg-secondary/50 border border-border rounded-full py-1.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right"
        />
      </div>
      
      <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
        <Bell className="h-5 w-5" />
        <span className="absolute top-2.5 left-2.5 h-2 w-2 rounded-full bg-accent animate-pulse" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://picsum.photos/seed/user/32/32" alt="@user" />
              <AvatarFallback>أ.س</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1 text-right">
              <p className="text-sm font-medium leading-none">أحمد السلطان</p>
              <p className="text-xs leading-none text-muted-foreground">
                lawyer@sanadlegal.pro
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-right justify-end">الملف الشخصي</DropdownMenuItem>
          <DropdownMenuItem className="text-right justify-end">الفوترة</DropdownMenuItem>
          <DropdownMenuItem className="text-right justify-end">الإعدادات</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive text-right justify-end">تسجيل الخروج</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
