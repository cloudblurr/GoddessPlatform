import { requireCreator } from "@/lib/guards";
import { HelpCircle, MessageSquare, Book, Mail } from "lucide-react";

export default async function SupportPage() {
  await requireCreator();

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      <header className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="text-sm font-mono tracking-[0.2em] text-[#C9A84C] uppercase mb-2">Help Center</h2>
          <h1 className="text-4xl font-heading font-medium tracking-tight">Support</h1>
          <p className="text-white/60 mt-2">Get help and submit support tickets</p>
        </div>
      </header>

      {/* Support Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-white/10 bg-[#ffffff05]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#C9A84C]/10">
              <MessageSquare size={20} className="text-[#C9A84C]" />
            </div>
            <h3 className="font-medium">Submit Ticket</h3>
          </div>
          <p className="text-sm text-white/60 mb-4">
            Get help from our support team
          </p>
          <button className="px-4 py-2 rounded-lg bg-[#C9A84C] text-black text-sm font-medium hover:bg-white transition-all">
            Create Ticket
          </button>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-[#ffffff05]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#C9A84C]/10">
              <Book size={20} className="text-[#C9A84C]" />
            </div>
            <h3 className="font-medium">Knowledge Base</h3>
          </div>
          <p className="text-sm text-white/60 mb-4">
            Browse guides and tutorials
          </p>
          <button className="px-4 py-2 rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] text-sm hover:bg-[#C9A84C]/20 transition-all">
            View Docs
          </button>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-[#ffffff05]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#C9A84C]/10">
              <HelpCircle size={20} className="text-[#C9A84C]" />
            </div>
            <h3 className="font-medium">FAQs</h3>
          </div>
          <p className="text-sm text-white/60 mb-4">
            Common questions and answers
          </p>
          <button className="px-4 py-2 rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] text-sm hover:bg-[#C9A84C]/20 transition-all">
            View FAQs
          </button>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-[#ffffff05]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#C9A84C]/10">
              <Mail size={20} className="text-[#C9A84C]" />
            </div>
            <h3 className="font-medium">Contact Us</h3>
          </div>
          <p className="text-sm text-white/60 mb-4">
            Reach out directly via email
          </p>
          <a
            href="mailto:support@goddessplatform.com"
            className="inline-block px-4 py-2 rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] text-sm hover:bg-[#C9A84C]/20 transition-all"
          >
            Send Email
          </a>
        </div>
      </div>

      {/* Recent Tickets */}
      <section className="mt-4">
        <h3 className="text-lg font-medium text-white/80 mb-4">Recent Tickets</h3>
        <div className="p-12 rounded-2xl border border-white/10 bg-[#ffffff05] text-center">
          <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
            <MessageSquare size={32} className="text-white/40" />
          </div>
          <h4 className="text-lg font-medium mb-2">No support tickets</h4>
          <p className="text-sm text-white/50">
            Your support ticket history will appear here
          </p>
        </div>
      </section>

    </div>
  );
}
