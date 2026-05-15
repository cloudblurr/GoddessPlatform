import { requireCreator } from "@/lib/guards";
import { r2IsConfigured } from "@/lib/r2";
import R2VaultManager from "./R2VaultManager";

export default async function StoragePage() {
  await requireCreator();
  const configured = r2IsConfigured();

  return (
    <div className="relative flex w-full flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-[#C9A84C]/10 blur-[100px]" />
      <div className="pointer-events-none absolute top-32 -left-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-[120px]" />
      <R2VaultManager configured={configured} />
    </div>
  );
}
