import { getDemoCreator, generateDemoVaultItems } from "@/lib/demo-mode";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, ShoppingCart } from "lucide-react";
import Image from "next/image";
import FuturisticPlayer from "@/components/media/FuturisticPlayer";

type PageProps = {
  params: Promise<{ creatorId: string }>;
};

export default async function DemoCreatorStorePage({ params }: PageProps) {
  const { creatorId } = await params;
  const creator = getDemoCreator(creatorId);

  if (!creator) {
    notFound();
  }

  const vaultItems = generateDemoVaultItems(creatorId);

  const toPlayerType = (type?: string): "video" | "audio" | "image" => {
    if (type === "audio") return "audio";
    if (type === "photo") return "image";
    return "video";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a0a] to-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Demo
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
            Demo Mode
          </div>
        </div>

        {/* Creator Header */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#C9A84C]">
            <Image
              src={creator.avatar}
              alt={creator.name}
              fill
              sizes="4rem"
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{creator.name}</h1>
            <p className="text-sm text-white/50">{creator.handle} • Store</p>
          </div>
        </div>

        {/* Store Items Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Premium Content</h2>
            <p className="text-sm text-white/50">{vaultItems.length} items available</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaultItems.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden group hover:border-[#C9A84C]/50 transition-all"
              >
                <div className="aspect-video relative overflow-hidden bg-black">
                  {item.videoUrl ? (
                    <FuturisticPlayer
                      type={toPlayerType(item.type)}
                      src={item.type === "photo" ? item.thumbnailUrl || item.videoUrl : item.videoUrl}
                      title={item.title}
                      isLocked={true}
                    />
                  ) : item.thumbnailUrl ? (
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart size={48} className="text-white/20" />
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-lg font-medium text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-white/65 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#C9A84C]">
                      ${item.priceCents ? (item.priceCents / 100).toFixed(2) : "0.00"}
                    </span>
                    <span className="text-xs text-white/50">{item.mood}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <div className="flex items-center gap-1">
                      <Eye size={14} />
                      <span>{item.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ShoppingCart size={14} />
                      <span>{item.purchases}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full rounded-lg bg-[#C9A84C] px-4 py-2 text-sm font-medium text-black hover:bg-white transition-colors"
                  >
                    Unlock Now
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Link
            href={`/demo/${creatorId}/feed`}
            className="flex-1 rounded-lg border border-white/20 px-4 py-3 text-center text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            View Feed
          </Link>
          <Link
            href="/demo"
            className="flex-1 rounded-lg bg-[#C9A84C] px-4 py-3 text-center text-sm font-medium text-black hover:bg-white transition-colors"
          >
            Back to Demo
          </Link>
        </div>
      </div>
    </div>
  );
}
