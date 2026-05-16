"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Drawer({ open, onOpenChange, children }: DrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
}

const DrawerContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-lg rounded-t-2xl border border-border bg-background p-4 shadow-lg",
        className,
      )}
      {...props}
    >
      <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" aria-hidden="true" />
      {children}
    </div>
  ),
);
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-1.5", className)} {...props} />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-base font-semibold leading-tight", className)} {...props} />
));
DrawerTitle.displayName = "DrawerTitle";

const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DrawerDescription.displayName = "DrawerDescription";

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-4 flex items-center gap-2", className)} {...props} />
);
DrawerFooter.displayName = "DrawerFooter";

export {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
};