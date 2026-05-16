import { sendTip } from "@/app/actions";
import { tipTiers } from "@/lib/content";
import { requireSubscriber } from "@/lib/guards";

export default async function OfferingPage() {
  await requireSubscriber();

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-3xl font-semibold">The Offering</h1>
        <p className="mt-1 text-white/60">Send support and earn loyalty points.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {tipTiers.map((tier) => (
          <form key={tier.id} action={sendTip} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <input type="hidden" name="amountCents" value={tier.amountCents} />
            <p className="text-2xl">{tier.emoji}</p>
            <h2 className="mt-2 text-lg font-medium">{tier.label}</h2>
            <p className="mt-1 text-sm text-[#C9A84C]">${(tier.amountCents / 100).toFixed(2)}</p>
            <button
              type="submit"
              className="mt-4 rounded-full border border-[#C9A84C]/40 px-4 py-2 text-sm text-[#C9A84C] transition hover:bg-[#C9A84C]/10"
            >
              Send Tip
            </button>
          </form>
        ))}
      </div>
    </section>
  );
}
