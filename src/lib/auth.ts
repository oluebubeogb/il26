import { cookies } from "next/headers";
import { prisma } from "./prisma";
import * as argon2 from "argon2";
import { createHash, randomBytes } from "crypto";
import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE = "ibeku_session";
const SESSION_DAYS = 14;

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET must be set and at least 16 characters");
  }
  return new TextEncoder().encode(secret);
}

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function normalizePhone(phone: string) {
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("0")) p = "234" + p.slice(1);
  if (p.startsWith("234") === false && p.length === 10) p = "234" + p;
  return p;
}

export async function hashPassword(password: string) {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

export async function verifyPassword(hash: string, password: string) {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, userAgent?: string, ip?: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      userAgent: userAgent?.slice(0, 500),
      ip: ip?.slice(0, 64),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const tokenHash = hashToken(token);
    await prisma.session.deleteMany({ where: { tokenHash } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  if (session.user.status !== "active") return null;

  return {
    id: session.user.id,
    username: session.user.username,
    role: session.user.role as "FAN" | "ADMIN" | "PRIMARY_ADMIN",
    phone: session.user.phone, // only for admin use
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "PRIMARY_ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requirePrimaryAdmin() {
  const user = await requireUser();
  if (user.role !== "PRIMARY_ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function audit(
  actorId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  metadata?: Record<string, unknown>
) {
  await prisma.adminAuditLog.create({
    data: {
      actorId,
      action,
      targetType,
      targetId,
      metadata: metadata ?? undefined,
    },
  });
}
