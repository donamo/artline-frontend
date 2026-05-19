import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type FieldProps = {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function Field({ label, error, children, className }: FieldProps) {
  return (
    <label className={cn("grid gap-1.5 text-sm font-medium", className)}>
      <span className="text-foreground/80">{label}</span>
      {children}
      {error ? <span className="text-xs font-normal text-destructive">{error}</span> : null}
    </label>
  );
}
