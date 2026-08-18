import "server-only";

import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const CEO_SESSION_COOKIE = "speak_ceo_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

function getDashboardPassword() {
  return process.env.CEO_DASHBOARD_PASSWORD?.trim() ?? "";
}

function hash(value: string) {
  return createHash("sha256").update(value).digest();
}

function signExpiry(expiresAt: string, password: string) {
  return createHmac("sha256", password).update(expiresAt).digest("hex");
}

function createSessionValue(password: string) {
  const expiresAt = String(
    Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  );
  return `${expiresAt}.${signExpiry(expiresAt, password)}`;
}

function isValidSessionValue(value: string, password: string) {
  const [expiresAt, signature, ...extra] = value.split(".");

  if (!expiresAt || !signature || extra.length > 0) {
    return false;
  }

  const expiry = Number(expiresAt);
  if (!Number.isSafeInteger(expiry) || expiry <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expectedSignature = signExpiry(expiresAt, password);
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(signature, "utf8"),
    Buffer.from(expectedSignature, "utf8"),
  );
}

export function isCeoPasswordConfigured() {
  return Boolean(getDashboardPassword());
}

export function verifyCeoPassword(candidate: string) {
  const password = getDashboardPassword();

  if (!password) {
    return false;
  }

  return timingSafeEqual(hash(candidate), hash(password));
}

export async function createCeoSession() {
  const password = getDashboardPassword();

  if (!password) {
    throw new Error("CEO_DASHBOARD_PASSWORD is not configured.");
  }

  const cookieStore = await cookies();
  cookieStore.set(CEO_SESSION_COOKIE, createSessionValue(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearCeoSession() {
  const cookieStore = await cookies();
  cookieStore.delete(CEO_SESSION_COOKIE);
}

export async function isCeoAuthenticated() {
  const password = getDashboardPassword();

  if (!password) {
    return false;
  }

  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(CEO_SESSION_COOKIE)?.value;

  return sessionValue
    ? isValidSessionValue(sessionValue, password)
    : false;
}

export async function requireCeoSession() {
  if (!(await isCeoAuthenticated())) {
    redirect("/dashboard/login");
  }
}
