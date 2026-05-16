import { requireCreator } from "@/lib/guards";
import { r2IsConfigured } from "@/lib/r2";
import R2VaultManager from "./R2VaultManager";

export default async function StoragePage() {
  await requireCreator();
  const configured = r2IsConfigured();

  return (
    <div className="space-y-6 animate-fade-in">
      <R2VaultManager configured={configured} />
    </div>
  );
}
