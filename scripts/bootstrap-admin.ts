import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").replace(/^0/, "234");
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

async function main() {
  const username = process.env.PRIMARY_ADMIN_USERNAME;
  const password = process.env.PRIMARY_ADMIN_PASSWORD;
  const phone = process.env.PRIMARY_ADMIN_PHONE;

  if (!username || !password || !phone) {
    console.log(
      "PRIMARY_ADMIN_USERNAME / PASSWORD / PHONE not fully set — skipping bootstrap."
    );
    return;
  }

  const normalizedUsername = normalizeUsername(username);
  const normalizedPhone = normalizePhone(phone);

  const existing = await prisma.user.findFirst({
    where: { role: "PRIMARY_ADMIN" },
  });

  if (existing) {
    console.log("Primary admin already exists — not resetting password.");
    return;
  }

  // Also check by username or phone to avoid duplicates
  const byIdentity = await prisma.user.findFirst({
    where: {
      OR: [
        { normalizedUsername },
        { normalizedPhone },
      ],
    },
  });

  if (byIdentity) {
    // Promote existing user if needed
    await prisma.user.update({
      where: { id: byIdentity.id },
      data: { role: "PRIMARY_ADMIN", status: "active" },
    });
    console.log("Promoted existing user to PRIMARY_ADMIN.");
    return;
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  await prisma.user.create({
    data: {
      username: username.trim(),
      normalizedUsername,
      phone: phone.trim(),
      normalizedPhone,
      passwordHash,
      birthYear: 1970, // placeholder for primary admin
      role: "PRIMARY_ADMIN",
      status: "active",
    },
  });

  console.log("Primary admin created successfully.");
}

main()
  .catch((e) => {
    console.error("Bootstrap admin failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
