"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Gavel, Users, Files } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { mockCases } from "@/components/cases/mock-data";
import { mockClients } from "@/components/clients/mock-data";
import { mockDocuments } from "@/components/documents/mock-data";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  // Reset search when dialog closes
  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  // Ctrl+K / Cmd+K shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const q = search.trim().toLowerCase();

  const filteredCases = mockCases.filter(
    (c) =>
      !q ||
      c.caseNumber.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
  );

  const filteredClients = mockClients.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
  );

  const filteredDocs = mockDocuments.filter(
    (d) =>
      !q ||
      d.title.toLowerCase().includes(q) ||
      d.type.toLowerCase().includes(q)
  );

  const hasResults =
    filteredCases.length > 0 ||
    filteredClients.length > 0 ||
    filteredDocs.length > 0;

  const navigate = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="ابحث في القضايا والموكلين والمستندات..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        dir="rtl"
      />
      <CommandList dir="rtl">
        {!hasResults && q && (
          <CommandEmpty className="text-muted-foreground py-8">
            لا توجد نتائج لـ &quot;{search}&quot;
          </CommandEmpty>
        )}
        {!hasResults && !q && (
          <CommandEmpty className="text-muted-foreground py-8">
            اكتب للبحث في القضايا والموكلين والمستندات
          </CommandEmpty>
        )}

        {filteredCases.length > 0 && (
          <CommandGroup heading="القضايا">
            {filteredCases.map((c) => (
              <CommandItem
                key={c.id}
                value={c.id}
                onSelect={() => navigate(`/cases`)}
                className="flex items-center gap-3 py-2.5 cursor-pointer"
              >
                <Gavel className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium truncate">{c.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {c.caseNumber}
                  </span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${
                    c.status === "نشطة"
                      ? "bg-green-500/15 text-green-600"
                      : c.status === "مؤجلة"
                      ? "bg-yellow-500/15 text-yellow-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {c.status}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredCases.length > 0 && filteredClients.length > 0 && (
          <CommandSeparator />
        )}

        {filteredClients.length > 0 && (
          <CommandGroup heading="الموكلين">
            {filteredClients.map((c) => (
              <CommandItem
                key={c.id}
                value={c.id}
                onSelect={() => navigate(`/clients`)}
                className="flex items-center gap-3 py-2.5 cursor-pointer"
              >
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium truncate">{c.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {c.phone}
                  </span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                  {c.type}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {(filteredCases.length > 0 || filteredClients.length > 0) &&
          filteredDocs.length > 0 && <CommandSeparator />}

        {filteredDocs.length > 0 && (
          <CommandGroup heading="المستندات">
            {filteredDocs.map((d) => (
              <CommandItem
                key={d.id}
                value={d.id}
                onSelect={() => navigate(`/documents`)}
                className="flex items-center gap-3 py-2.5 cursor-pointer"
              >
                <Files className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium truncate">{d.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {d.clientName}
                  </span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                  {d.type}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
