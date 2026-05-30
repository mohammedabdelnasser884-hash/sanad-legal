"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Context ──────────────────────────────────────────────────────────────────

interface CommandContextValue {
  search: string;
  setSearch: (v: string) => void;
  onSelect?: (value: string) => void;
}

const CommandContext = React.createContext<CommandContextValue>({
  search: "",
  setSearch: () => {},
});

// ── Command (root container) ─────────────────────────────────────────────────

interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelect?: (value: string) => void;
}

const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  ({ className, children, onSelect, ...props }, ref) => {
    const [search, setSearch] = React.useState("");
    return (
      <CommandContext.Provider value={{ search, setSearch, onSelect }}>
        <div
          ref={ref}
          className={cn(
            "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </CommandContext.Provider>
    );
  }
);
Command.displayName = "Command";

// ── CommandInput ──────────────────────────────────────────────────────────────

const CommandInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, value, onChange, ...props }, ref) => {
  const { setSearch } = React.useContext(CommandContext);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (onChange) onChange(e);
  };

  return (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      <input
        ref={ref}
        value={value}
        onChange={handleChange}
        className={cn(
          "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
});
CommandInput.displayName = "CommandInput";

// ── CommandList ────────────────────────────────────────────────────────────────

const CommandList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
));
CommandList.displayName = "CommandList";

// ── CommandEmpty ───────────────────────────────────────────────────────────────

const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("py-6 text-center text-sm", className)}
    {...props}
  />
));
CommandEmpty.displayName = "CommandEmpty";

// ── CommandGroup ───────────────────────────────────────────────────────────────

const CommandGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { heading?: string }
>(({ className, heading, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    )}
    {...props}
  >
    {heading && (
      <div cmdk-group-heading="" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
        {heading}
      </div>
    )}
    {children}
  </div>
));
CommandGroup.displayName = "CommandGroup";

// ── CommandSeparator ───────────────────────────────────────────────────────────

const CommandSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
));
CommandSeparator.displayName = "CommandSeparator";

// ── CommandItem ────────────────────────────────────────────────────────────────

interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onSelect?: (value: string) => void;
  disabled?: boolean;
}

const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
  ({ className, value, onSelect, disabled, children, ...props }, ref) => {
    const ctx = React.useContext(CommandContext);
    const handleSelect = () => {
      if (disabled) return;
      const v = value ?? "";
      if (onSelect) onSelect(v);
      else if (ctx.onSelect) ctx.onSelect(v);
    };
    return (
      <div
        ref={ref}
        role="option"
        aria-disabled={disabled}
        onClick={handleSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleSelect();
        }}
        tabIndex={disabled ? -1 : 0}
        className={cn(
          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CommandItem.displayName = "CommandItem";

// ── CommandShortcut ────────────────────────────────────────────────────────────

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn("mr-auto text-xs tracking-widest text-muted-foreground", className)}
    {...props}
  />
);
CommandShortcut.displayName = "CommandShortcut";

// ── CommandDialog ──────────────────────────────────────────────────────────────

interface CommandDialogProps extends DialogPrimitive.DialogProps {
  children: React.ReactNode;
}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => (
  <DialogPrimitive.Root {...props}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content className="fixed left-[50%] top-[20%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-0 gap-4 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5 rounded-xl border bg-popover shadow-2xl">
          {children}
        </Command>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);

// ── hook to access search value from outside ───────────────────────────────────

export function useCommandSearch() {
  return React.useContext(CommandContext);
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
};
