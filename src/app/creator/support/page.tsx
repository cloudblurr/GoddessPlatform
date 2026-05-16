import { requireCreator } from "@/lib/guards";
import { HelpCircle, MessageSquare, Book, Mail } from "lucide-react";

export default async function SupportPage() {
  await requireCreator();

  const items = [
    { icon: MessageSquare, title: "Submit Ticket", sub: "Get help from our team", label: "Create Ticket", primary: true },
    { icon: Book, title: "Knowledge Base", sub: "Browse guides and tutorials", label: "View Docs" },
    { icon: HelpCircle, title: "FAQs", sub: "Common questions and answers", label: "View FAQs" },
    { icon: Mail, title: "Contact Us", sub: "Reach out via email", label: "Send Email", href: "mailto:support@goddessplatform.com" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="border-b border-[var(--glass-border)] pb-5">
        <p className="eyebrow mb-1">Help Center</p>
        <h1 className="text-3xl font-bold tracking-tight">Support</h1>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {items.map(({ icon: Icon, title, sub, label, primary, href }) => (
          <div key={title} className="glass-card p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-dim)] flex items-center justify-center"><Icon size={15} className="text-[var(--accent)]" /></div>
              <h3 className="text-sm font-semibold">{title}</h3>
            </div>
            <p className="text-xs text-[var(--ink-muted)] mb-3">{sub}</p>
            {href ? (
              <a href={href} className="inline-block px-3 py-1.5 rounded-md bg-[var(--accent-dim)] text-[var(--accent)] text-xs font-medium hover:bg-[var(--accent-glow)] transition-colors">{label}</a>
            ) : (
              <button className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${primary ? "bg-[var(--accent)] text-[var(--bg-base)] hover:brightness-110" : "bg-[var(--accent-dim)] text-[var(--accent)] hover:bg-[var(--accent-glow)]"}`}>{label}</button>
            )}
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-sm font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-3">Recent Tickets</h2>
        <div className="glass-card p-10 text-center">
          <MessageSquare size={24} className="text-[var(--ink-faint)] mx-auto mb-3" />
          <p className="text-sm font-medium">No support tickets</p>
          <p className="text-xs text-[var(--ink-muted)] mt-1">Your ticket history will appear here</p>
        </div>
      </section>
    </div>
  );
}
