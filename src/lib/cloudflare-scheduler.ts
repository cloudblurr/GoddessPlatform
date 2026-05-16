export type WorkerDeliveryPayload = {
  id: string;
  contentKind: string;
  title: string;
  scheduledFor: string;
  deployTarget: string;
  mediaUrl?: string;
  storageKey?: string;
};

type WorkerEnqueueResult = {
  queued: boolean;
  reason?: string;
};

export async function enqueueCloudflareDelivery(payload: WorkerDeliveryPayload): Promise<WorkerEnqueueResult> {
  const workerUrl = process.env.CLOUDFLARE_WORKER_SCHEDULER_URL || "";
  if (!workerUrl) {
    return { queued: false, reason: "Missing CLOUDFLARE_WORKER_SCHEDULER_URL" };
  }

  const workerToken =
    process.env.CLOUDFLARE_WORKER_SCHEDULER_TOKEN ||
    process.env.CLOUDFLARE_API_TOKEN ||
    "";

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (workerToken) {
    headers.Authorization = `Bearer ${workerToken}`;
  }

  try {
    const res = await fetch(workerUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      return { queued: false, reason: `Worker responded ${res.status}` };
    }

    return { queued: true };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Unknown worker request error";
    return { queued: false, reason };
  }
}
