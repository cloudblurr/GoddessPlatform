export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const authHeader = request.headers.get("authorization") || "";
    if (env.SCHEDULER_TOKEN) {
      const expected = `Bearer ${env.SCHEDULER_TOKEN}`;
      if (authHeader !== expected) {
        return Response.json({ queued: false, error: "unauthorized" }, { status: 401 });
      }
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return Response.json({ queued: false, error: "invalid-json" }, { status: 400 });
    }

    const id = String(payload?.id || "").trim();
    const scheduledFor = String(payload?.scheduledFor || "").trim();
    if (!id || !scheduledFor) {
      return Response.json({ queued: false, error: "missing-id-or-schedule" }, { status: 400 });
    }

    if (env.XANNA_SCHEDULES) {
      await env.XANNA_SCHEDULES.put(
        `schedule:${id}`,
        JSON.stringify({
          ...payload,
          receivedAt: new Date().toISOString(),
        })
      );
    }

    return Response.json({ queued: true, id, scheduledFor });
  },
};
