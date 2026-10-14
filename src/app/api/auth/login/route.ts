import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  normalizeUsername,
  normalizePhone,
  verifyPassword,
  createSession,
} from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { identifier, password } = parsed.data;
    const normalized = identifier.includes("@")
      ? identifier // not used
      : normalizeUsername(identifier);
    const phoneNorm = normalizePhone(identifier);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { normalizedUsername: normalized },
          { normalizedPhone: phoneNorm },
        ],
        status: "active",
      },
    });

    if (!user || !(await verifyPassword(user.passwordHash, password))) {
      return NextResponse.json(
        { error: "Invalid username/phone or password" },
        { status: 401 }
      );
    }

    await createSession(
      user.id,
      req.headers.get("user-agent") || undefined,
      req.headers.get("x-forwarded-for") || undefined
    );

    return NextResponse.json({
      ok: true,
      role: user.role,
      username: user.username,
    });
  } catch (e) {
    console.error("Login error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
