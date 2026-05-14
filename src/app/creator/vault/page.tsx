import { requireCreator } from "@/lib/guards";
import VaultManager from "./VaultManager";
import { readStore } from "@/lib/store";

export default async function VaultPage() {
  await requireCreator();
  const store = await readStore();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 w-full h-full">
      <header className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="text-sm font-mono tracking-[0.2em] text-[#C9A84C] uppercase mb-2">Sirhx / Cloudreve</h2>
          <h1 className="text-4xl font-heading font-medium tracking-tight">The Vault</h1>
        </div>
      </header>

      <div className="flex-1 w-full">
        <VaultManager initialItems={store.vaultItems} />
      </div>
    </div>
  );
}
