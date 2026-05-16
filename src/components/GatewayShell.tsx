import { ReactNode } from "react";

export function GatewayShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#050505] text-white">{children}</div>;
}
