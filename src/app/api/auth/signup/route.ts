import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  normalizeUsername,
  normalizePhone,
  hashPassword,
  createSession,
} from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
  phone: z.string().min(10).max(20),
  password: z.string().min(8).max(128),
  birthYear: z.number().int().min(1940).max(2015),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input. Check username, phone, password and year of birth." },
        { status: 400 }
      );
    }

    const { username, phone, password, birthYear } = parsed.data;
    const normalizedUsername = normalizeUsername(username);
    const normalizedPhone = normalizePhone(phone);

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { normalizedUsername },
          { normalizedPhone },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Username or phone number already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        normalizedUsername,
        phone: phone.trim(),
        normalizedPhone,
        passwordHash,
        birthYear,
        role: "FAN",
      },
    });

    await createSession(
      user.id,
      req.headers.get("user-agent") || undefined,
      req.headers.get("x-forwarded-for") || undefined
    );

    return NextResponse.json({ ok: true, username: user.username });
  } catch (e) {
    console.error("Signup error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
