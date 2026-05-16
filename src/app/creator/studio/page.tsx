import { requireCreator } from "@/lib/guards";
import { readStore } from "@/lib/store";
import StudioComposer from "./StudioComposer";

export default async function BroadcastPage({
  searchParams,
}: {
  searchParams: Promise<{ published?: string; error?: string }>;
}) {
  await requireCreator();
  const store = await readStore();
  const { published, error } = await searchParams;

  return (
    <StudioComposer
      initialFeedPosts={store.feedPosts.slice(0, 8)}
      initialVaultItems={store.vaultItems.slice(0, 8)}
      published={published === "1"}
      error={error}
    />
  );
}
