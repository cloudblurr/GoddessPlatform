import { unlockContent } from "@/app/actions";
import { canAccessContent, priceLabel } from "@/lib/content";
import { requireSubscriber } from "@/lib/guards";
import { readStore } from "@/lib/store";
import { createPresignedDownload, r2IsConfigured } from "@/lib/r2";

export default async function StorePage() {
  const session = await requireSubscriber();
  const store = await readStore();

  // Get presigned R2 download URLs for unlocked content that has an R2 key
  const unlockedItems = await Promise.all(
    store.vaultItems.map(async (item) => {
      if (canAccessContent(session, item) && item.storageKey && r2IsConfigured()) {
        try {
          const url = await createPresignedDownload(item.storageKey, 3600);
          return { ...item, downloadUrl: url };
        } catch {
          return item;
        }
      }
      return item;
    })
  );

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-3xl font-semibold">Store Drops</h1>
        <p className="mt-1 text-white/60">Purchase and unlock vault content.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {unlockedItems.map((item) => {
          const isUnlocked = canAccessContent(session, item);

          return (
            <article key={item.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h2 className="text-lg font-medium">{item.title}</h2>
              <p className="mt-1 text-sm text-white/65">{item.description}</p>
              <p className="mt-3 text-sm text-[#C9A84C]">{priceLabel(item.priceCents)}</p>

              {isUnlocked ? (
                item.downloadUrl ? (
                  <a
                    href={item.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm text-[#C9A84C] hover:underline"
                  >
                    Download
                  </a>
                ) : item.videoUrl ? (
                  item.type === "photo" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnailUrl || item.videoUrl}
                      alt={item.title}
                      className="mt-3 aspect-video w-full rounded-lg border border-white/10 bg-black object-cover"
                    />
                  ) : item.type === "audio" ? (
                    <audio src={item.videoUrl} controls preload="metadata" className="mt-3 w-full" />
                  ) : (
                    <video
                      src={item.videoUrl}
                      controls
                      preload="metadata"
                      poster={item.thumbnailUrl}
                      className="mt-3 aspect-video w-full rounded-lg border border-white/10 bg-black"
                    />
                  )
                ) : item.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="mt-3 aspect-video w-full rounded-lg border border-white/10 bg-black object-cover"
                  />
                ) : null
              ) : item.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbnailUrl}
                  alt={`${item.title} preview`}
                  className="mt-3 aspect-video w-full rounded-lg border border-white/10 bg-black object-cover opacity-70"
                />
              ) : null}

              {isUnlocked ? (
                <p className="mt-3 text-sm text-emerald-300">✓ Unlocked</p>
              ) : (
                <form action={unlockContent} className="mt-3">
                  <input type="hidden" name="contentId" value={item.id} />
                  <input type="hidden" name="nextPath" value="/app/store" />
                  <button
                    type="submit"
                    className="rounded-full border border-[#C9A84C]/40 px-4 py-2 text-sm text-[#C9A84C] transition hover:bg-[#C9A84C]/10"
                  >
                    Unlock now
                  </button>
                </form>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
