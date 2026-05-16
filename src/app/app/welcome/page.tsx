import Link from "next/link";
import { requireSubscriber } from "@/lib/guards";

export default async function WelcomePage() {
  const session = await requireSubscriber();

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
      <p className="text-xs uppercase tracking-[0.2em] text-[#C9A84C]">Access Granted</p>
      <h1 className="mt-2 text-3xl font-semibold">Welcome inside the sanctum.</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        You are signed in as <span className="text-white">{session.role}</span>. Use the navigation to explore
        the feed, unlock drops, and browse your private gallery.
      </p>
      <Link
        href="/app"
        className="mt-6 inline-flex rounded-full border border-[#C9A84C]/40 px-4 py-2 text-sm text-[#C9A84C] transition hover:bg-[#C9A84C]/10"
      >
        Go to Daily Feed
      </Link>
    </section>
  );
}
