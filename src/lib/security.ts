import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "";

export function requireSessionSecret() {
  if (process.env.NODE_ENV === "production" && SESSION_SECRET.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters in production.");
  }
}

function sign(value: string) {
  requireSessionSecret();
  const secret = SESSION_SECRET || "development-only-secret-change-me";
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createSignedSession(adminId: number) {
  const issuedAt = Date.now();
  const nonce = randomBytes(12).toString("base64url");
  const payload = `${adminId}.${issuedAt}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

export function readSignedSession(token?: string) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;

  const payload = parts.slice(0, 3).join(".");
  const expected = sign(payload);
  const provided = parts[3];
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  if (expectedBuffer.length !== providedBuffer.length) return null;
  if (!timingSafeEqual(expectedBuffer, providedBuffer)) return null;

  const adminId = Number(parts[0]);
  const issuedAt = Number(parts[1]);
  if (!Number.isInteger(adminId) || adminId <= 0) return null;
  if (!Number.isFinite(issuedAt)) return null;

  const maxAgeMs = 1000 * 60 * 60 * 12;
  if (Date.now() - issuedAt > maxAgeMs) return null;

  return { adminId, issuedAt };
}

export function isProductionHttps() {
  return process.env.NODE_ENV === "production";
}
