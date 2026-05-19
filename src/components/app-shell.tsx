import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-background text-foreground">{children}</main>;
}
