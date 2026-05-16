import { getDemoCreator, generateDemoFeedPosts } from "@/lib/demo-mode";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle, Share2 } from "lucide-react";
import Image from "next/image";

type PageProps = {
  params: Promise<{ creatorId: string }>;
};

export default async function DemoCreatorFeedPage({ params }: PageProps) {
  const { creatorId } = await params;
  const creator = getDemoCreator(creatorId);

  if (!creator) {
    notFound();
  }

  const feedPosts = generateDemoFeedPosts(creatorId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a0a] to-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
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

        {/* Creator Profile */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="relative h-40">
            <Image
              src={creator.banner}
              alt={creator.name}
              fill
              sizes="100vw"
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          </div>
          <div className="p-6 -mt-12 relative">
            <div className="flex items-end gap-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-black">
                <Image
                  src={creator.avatar}
                  alt={creator.name}
                  fill
                  sizes="6rem"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 pb-2">
                <h1 className="text-2xl font-bold text-white">{creator.name}</h1>
                <p className="text-sm text-white/50">{creator.handle}</p>
              </div>
              <div className="pb-2">
                <div className="rounded-lg bg-[#C9A84C] px-4 py-2 text-sm font-medium text-black">
                  ${creator.monthlyPrice}/mo
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-white/70">{creator.bio}</p>
            <div className="mt-4 flex gap-6 text-sm">
              <div>
                <span className="font-bold text-white">{creator.subscriberCount.toLocaleString()}</span>
                <span className="text-white/50 ml-1">subscribers</span>
              </div>
              <div>
                <span className="font-bold text-white">{creator.postCount}</span>
                <span className="text-white/50 ml-1">posts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feed Posts */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Feed</h2>
          {feedPosts.map((post) => (
            <article
              key={post.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-medium text-white">{post.title}</h3>
                <span className="rounded-full border border-[#C9A84C]/40 px-3 py-1 text-xs text-[#C9A84C]">
                  {post.access === "subscription"
                    ? "Included"
                    : post.priceCents
                    ? `$${(post.priceCents / 100).toFixed(2)}`
                    : "Free"}
                </span>
              </div>

              <p className="text-sm text-white/70">{post.description}</p>

              {post.contentKind === "poll" && post.pollOptions ? (
                <div className="space-y-2">
                  {post.pollOptions.map((option, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="w-full rounded-lg border border-white/15 bg-black/25 px-4 py-3 text-left text-sm text-white/80 hover:bg-black/40 transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : post.videoUrl ? (
                <div className="rounded-xl overflow-hidden border border-white/10">
                  {post.type === "photo" ? (
                    <Image
                      src={post.thumbnailUrl || post.videoUrl}
                      alt={post.title}
                      width={800}
                      height={450}
                      className="w-full aspect-video object-cover"
                    />
                  ) : post.type === "audio" ? (
                    <audio src={post.videoUrl} controls className="w-full" />
                  ) : (
                    <video
                      src={post.videoUrl}
                      controls
                      poster={post.thumbnailUrl}
                      className="w-full aspect-video bg-black"
                    />
                  )}
                </div>
              ) : null}

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                  >
                    <Heart size={18} />
                    <span>{post.likes}</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                  >
                    <MessageCircle size={18} />
                    <span>{post.comments}</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
                <span className="text-xs text-white/50">{post.postedAt}</span>
              </div>
            </article>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Link
            href={`/demo/${creatorId}/store`}
            className="flex-1 rounded-lg border border-white/20 px-4 py-3 text-center text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            View Store
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
