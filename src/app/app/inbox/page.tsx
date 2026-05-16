import { scrollThreads } from "@/lib/content";
import { requireSubscriber } from "@/lib/guards";

export default async function InboxPage() {
  await requireSubscriber();

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-3xl font-semibold">Inbox</h1>
        <p className="mt-1 text-white/60">Private notes and previews.</p>
      </header>

      <div className="grid gap-3">
        {scrollThreads.map((thread) => (
          <article key={thread.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-medium">{thread.subject}</h2>
              <span className="text-xs text-white/45">{thread.timestamp}</span>
            </div>
            <p className="mt-2 text-sm text-white/70">{thread.preview}</p>
            {thread.ppv ? (
              <p className="mt-2 text-xs text-[#C9A84C]">Contains premium content.</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
