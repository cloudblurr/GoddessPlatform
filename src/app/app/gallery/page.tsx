import { canAccessContent } from "@/lib/content";
import { requireSubscriber } from "@/lib/guards";
import { readStore } from "@/lib/store";

export default async function GalleryPage() {
  const session = await requireSubscriber();
  const store = await readStore();

  const accessible = [...store.feedPosts, ...store.vaultItems].filter((item) => canAccessContent(session, item));

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-3xl font-semibold">Gallery</h1>
        <p className="mt-1 text-white/60">Your unlocked collection.</p>
      </header>

      {accessible.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/70">
          No unlocked items yet.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accessible.map((item) => (
            <article key={item.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h2 className="font-medium">{item.title}</h2>
              <p className="mt-1 text-sm text-white/65">{item.description}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
