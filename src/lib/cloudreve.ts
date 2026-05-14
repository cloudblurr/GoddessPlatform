import { cookies } from "next/headers";

const CLOUDREVE_URL = process.env.CLOUDREVE_URL || "https://sirhx.space";
const CLOUDREVE_USER = process.env.CLOUDREVE_USER || "xannalesse@gmail.com";
const CLOUDREVE_PASS = process.env.CLOUDREVE_PASS || "Loveofmylife0";

// Basic singleton to hold cloudreve cookie token locally if needed
// In a serverless env, we might need to authenticate each request or store the session in a KV.
let cloudreveCookie = "";

export async function authenticateCloudreve() {
  if (cloudreveCookie) return cloudreveCookie;
  
  const res = await fetch(`${CLOUDREVE_URL}/api/v3/user/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName: CLOUDREVE_USER, Password: CLOUDREVE_PASS }),
  });

  if (!res.ok) {
    console.error("Cloudreve Auth failed");
    return null;
  }

  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    cloudreveCookie = setCookie.split(";")[0];
  }
  return cloudreveCookie;
}

export async function uploadToCloudreve(file: File, path: string = "/") {
  const cookie = await authenticateCloudreve();
  if (!cookie) throw new Error("Auth failed");

  // Get upload policy
  const policyRes = await fetch(`${CLOUDREVE_URL}/api/v3/file/upload`, {
    method: "PUT",
    headers: {
      "Cookie": cookie,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: file.name,
      path: path,
      size: file.size,
      mimeType: file.type,
    }),
  });

  const policy = await policyRes.json();
  if (policy.code !== 0) {
    throw new Error("Failed to get upload policy: " + policy.msg);
  }

  // Upload the actual file based on policy (could be local or remote storage attached to Cloudreve)
  // For simplicity assuming it's direct upload to Cloudreve handler
  const uploadToken = policy.data; 

  const formData = new FormData();
  formData.append("file", file);

  const uploadRes = await fetch(`${CLOUDREVE_URL}/api/v3/file/upload/${uploadToken}`, {
    method: "POST",
    headers: {
      "Cookie": cookie,
    },
    body: formData,
  });

  const result = await uploadRes.json();
  return result.data;
}

export async function createCloudreveShare(fileId: string, isPublic: boolean = false, expire: number = 0) {
  const cookie = await authenticateCloudreve();
  
  const reqRes = await fetch(`${CLOUDREVE_URL}/api/v3/share`, {
    method: "POST",
    headers: {
      "Cookie": cookie!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: fileId,
      isDir: false,
      password: "",
      preview: true,
      downloads: -1, // unlimited
      expire: expire, // seconds
    })
  });
  
  const result = await reqRes.json();
  return result.data;
}

// God-layer secure URL generator
export function generateSecurePlayToken(fileId: string, userId: string) {
  // Simulating an internally signed token for the third layer
  const timestamp = Date.now();
  const secret = process.env.XANNA_GOD_SECRET || "xAnna0-god";
  const str = `${fileId}:${userId}:${timestamp}:${secret}`;
  // For demo, base64 encode it. In production, use HMAC SHA256.
  return Buffer.from(str).toString("base64");
}

export function verifySecureToken(token: string, fileId: string, userId: string) {
  const decoded = Buffer.from(token, "base64").toString("utf8");
  const [tFileId, tUserId, timestamp, secret] = decoded.split(":");
  if (tFileId !== fileId || tUserId !== userId) return false;
  if (secret !== (process.env.XANNA_GOD_SECRET || "xAnna0-god")) return false;
  if (Date.now() - parseInt(timestamp) > 1000 * 60 * 60 * 24) return false; // 24hr expiry
  return true;
}
