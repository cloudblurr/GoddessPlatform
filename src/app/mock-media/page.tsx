export default function MockMediaPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 text-center text-white">
      <div className="rounded-2xl border border-white/15 bg-black/40 p-8">
        <h1 className="text-2xl font-semibold">Media Preview Endpoint</h1>
        <p className="mt-3 text-sm text-white/70">
          Secure media token validation succeeded. This placeholder confirms the media route is reachable.
        </p>
      </div>
    </main>
  );
}
