import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  normalizeUsername,
  normalizePhone,
  hashPassword,
} from "@/lib/auth";
import { randomBytes, createHash } from "crypto";
import { z } from "zod";

// Simple in-memory token store for recovery (short-lived).
// In production you may prefer a DB table; this is sufficient for Phase 1.
const recoveryTokens = new Map<
  string,
  { userId: string; expires: number }
>();

const requestSchema = z.object({
  action: z.literal("request"),
  identifier: z.string().min(1),
  birthYear: z.number().int(),
});

const resetSchema = z.object({
  action: z.literal("reset"),
  token: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "request") {
      const parsed = requestSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      }

      const { identifier, birthYear } = parsed.data;
      const normalized = normalizeUsername(identifier);
      const phoneNorm = normalizePhone(identifier);

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { normalizedUsername: normalized },
            { normalizedPhone: phoneNorm },
          ],
          role: "FAN", // only fan recovery
          status: "active",
        },
      });

      // Always return generic message
      const generic = {
        message:
          "If the details match an account, recovery has been prepared.",
      };

      if (!user || user.birthYear !== birthYear) {
        return NextResponse.json(generic);
      }

      const token = randomBytes(24).toString("hex");
      recoveryTokens.set(token, {
        userId: user.id,
        expires: Date.now() + 15 * 60 * 1000, // 15 min
      });

      return NextResponse.json({ ...generic, token });
    }

    if (body.action === "reset") {
      const parsed = resetSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      }

      const { token, newPassword } = parsed.data;
      const entry = recoveryTokens.get(token);
      if (!entry || entry.expires < Date.now()) {
        recoveryTokens.delete(token);
        return NextResponse.json(
          { error: "Invalid or expired recovery token" },
          { status: 400 }
        );
      }

      const passwordHash = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: entry.userId },
        data: { passwordHash },
      });
      recoveryTokens.delete(token);

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error("Recover error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
