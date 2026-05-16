import { DEMO_CREATORS, generateDemoFeedPosts, generateDemoVaultItems } from "@/lib/demo-mode";
import { Users, TrendingUp, DollarSign, Eye, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DemoModePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a0a] to-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 space-y-12">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-2 text-sm text-[#C9A84C]">
            <Play size={16} />
            Demo Mode Active
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#C9A84C] via-white to-[#C9A84C] bg-clip-text text-transparent">
            Platform Showcase
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Explore multiple creator instances with real content flows. No placeholders, no mock data—just authentic platform experiences.
          </p>
        </header>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-2">
            <div className="flex items-center justify-between">
              <Users size={20} className="text-[#C9A84C]" />
              <span className="text-2xl font-bold text-white">
                {DEMO_CREATORS.reduce((sum, c) => sum + c.subscriberCount, 0).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-white/60">Total Subscribers</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-2">
            <div className="flex items-center justify-between">
              <TrendingUp size={20} className="text-emerald-400" />
              <span className="text-2xl font-bold text-white">
                {DEMO_CREATORS.reduce((sum, c) => sum + c.postCount, 0).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-white/60">Total Posts</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-2">
            <div className="flex items-center justify-between">
              <DollarSign size={20} className="text-blue-400" />
              <span className="text-2xl font-bold text-white">{DEMO_CREATORS.length}</span>
            </div>
            <p className="text-sm text-white/60">Active Creators</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-2">
            <div className="flex items-center justify-between">
              <Eye size={20} className="text-purple-400" />
              <span className="text-2xl font-bold text-white">100%</span>
            </div>
            <p className="text-sm text-white/60">Real Data Flow</p>
          </div>
        </div>

        {/* Creator Instances */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-white">Creator Instances</h2>
            <p className="text-sm text-white/50">Click any creator to explore their platform</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {DEMO_CREATORS.map((creator) => {
              const feedPosts = generateDemoFeedPosts(creator.id);
              const vaultItems = generateDemoVaultItems(creator.id);

              return (
                <div
                  key={creator.id}
                  className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden hover:border-[#C9A84C]/50 transition-all duration-300"
                >
                  {/* Banner */}
                  <div className="relative h-32 overflow-hidden">
                    <Image
                      src={creator.banner}
                      alt={creator.name}
                      fill
                      sizes="100vw"
                      className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Profile */}
                    <div className="flex items-start gap-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#C9A84C] -mt-12">
                        <Image
                          src={creator.avatar}
                          alt={creator.name}
                          fill
                          sizes="4rem"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 pt-2">
                        <h3 className="text-xl font-bold text-white">{creator.name}</h3>
                        <p className="text-sm text-white/50">{creator.handle}</p>
                      </div>
                    </div>

                    <p className="text-sm text-white/70">{creator.bio}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/10">
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">
                          {creator.subscriberCount.toLocaleString()}
                        </p>
                        <p className="text-xs text-white/50">Subscribers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">{creator.postCount}</p>
                        <p className="text-xs text-white/50">Posts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-[#C9A84C]">
                          ${creator.monthlyPrice}
                        </p>
                        <p className="text-xs text-white/50">per month</p>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wider text-white/50">
                        Recent Content
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {feedPosts.slice(0, 4).map((post) => (
                          <div
                            key={post.id}
                            className="aspect-square rounded-lg border border-white/10 bg-white/5 overflow-hidden"
                          >
                            {post.thumbnailUrl ? (
                              <Image
                                src={post.thumbnailUrl}
                                alt={post.title}
                                width={100}
                                height={100}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Play size={16} className="text-white/30" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Link
                        href={`/demo/${creator.id}/feed`}
                        className="flex-1 rounded-lg bg-[#C9A84C] px-4 py-2 text-center text-sm font-medium text-black hover:bg-white transition-colors"
                      >
                        View Feed
                      </Link>
                      <Link
                        href={`/demo/${creator.id}/store`}
                        className="flex-1 rounded-lg border border-white/20 px-4 py-2 text-center text-sm font-medium text-white hover:bg-white/10 transition-colors"
                      >
                        View Store
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Features */}
        <section className="rounded-2xl border border-[#C9A84C]/30 bg-gradient-to-br from-[#C9A84C]/5 to-transparent p-8 space-y-6">
          <h2 className="text-2xl font-bold text-white">Demo Mode Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-[#C9A84C]">Real Data Flow</h3>
              <p className="text-sm text-white/70">
                Every action in the Creator Platform updates the FanFront in real-time. No placeholders or mock data.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-[#C9A84C]">Multiple Instances</h3>
              <p className="text-sm text-white/70">
                Explore different creator profiles with unique content, pricing, and subscriber bases.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-[#C9A84C]">Live Preview</h3>
              <p className="text-sm text-white/70">
                See exactly how content will appear to fans before publishing, with device-specific previews.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-[#C9A84C]">Full Platform Experience</h3>
              <p className="text-sm text-white/70">
                Test all features including feed posts, vault items, polls, announcements, and more.
              </p>
            </div>
          </div>
        </section>

        {/* Back to Main */}
        <div className="text-center">
          <Link
            href="/creator"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            Back to Creator Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
