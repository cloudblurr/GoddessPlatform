import { requireCreator } from "@/lib/guards";
import { r2IsConfigured } from "@/lib/r2";
import R2VaultManager from "./R2VaultManager";

export default async function StoragePage() {
  await requireCreator();
  const configured = r2IsConfigured();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 w-full h-full">
      <header className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <p className="text-xs font-mono tracking-[0.2em] text-[#C9A84C] uppercase mb-2">
            Cloudflare R2 · xanna-media
          </p>
          <h1 className="text-4xl font-heading font-medium tracking-tight">The Vault</h1>
          <p className="text-sm text-white/50 mt-1">
            Upload, manage and publish your content — stored securely in R2.
          </p>
        </div>
      </header>

      <R2VaultManager configured={configured} />
    </div>
  );
}
