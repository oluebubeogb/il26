import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GROUPS = [
  { code: "A", name: "Group A", displayOrder: 1 },
  { code: "B", name: "Group B", displayOrder: 2 },
  { code: "C", name: "Group C", displayOrder: 3 },
  { code: "D", name: "Group D", displayOrder: 4 },
];

const TEAMS = [
  // Group A
  { name: "Amuzukwu", slug: "amuzukwu", shortName: "AMZ", groupCode: "A" },
  { name: "Umuhu Ajata", slug: "umuhu-ajata", shortName: "UMA", groupCode: "A" },
  { name: "Ikeaha FC", slug: "ikeaha-fc", shortName: "IKE", groupCode: "A" },
  { name: "Ossah FC", slug: "ossah-fc", shortName: "OSS", groupCode: "A" },
  // Group B
  { name: "Ndume Okpu FC", slug: "ndume-okpu-fc", shortName: "NDO", groupCode: "B" },
  { name: "Umuajiji FC", slug: "umuajiji-fc", shortName: "UMJ", groupCode: "B" },
  { name: "Umuana FC", slug: "umuana-fc", shortName: "UMN", groupCode: "B" },
  { name: "Ugba FC", slug: "ugba-fc", shortName: "UGB", groupCode: "B" },
  // Group C
  { name: "Nkata FC", slug: "nkata-fc", shortName: "NKA", groupCode: "C" },
  { name: "Afaraukwu FC", slug: "afaraukwu-fc", shortName: "AFA", groupCode: "C" },
  { name: "Okwuta FC", slug: "okwuta-fc", shortName: "OKW", groupCode: "C" },
  { name: "Iyienyi FC", slug: "iyienyi-fc", shortName: "IYI", groupCode: "C" },
  // Group D
  { name: "Ajata Okwuru FC", slug: "ajata-okwuru-fc", shortName: "AJO", groupCode: "D" },
  { name: "Amuzuoro FC", slug: "amuzuoro-fc", shortName: "AMR", groupCode: "D" },
  { name: "Avonkwu FC", slug: "avonkwu-fc", shortName: "AVO", groupCode: "D" },
  { name: "Amatoh FC", slug: "amatoh-fc", shortName: "AMT", groupCode: "D" },
];

// Dates are Africa/Lagos. We store as UTC midnight of that calendar day
// so display can convert to Lagos. Kick-off times left null (Time TBC).
function lagosDateToUtc(year: number, month: number, day: number): Date {
  // Approximate: Lagos is UTC+1, store as 00:00 UTC of that day for date-only
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
}

const GROUP_FIXTURES = [
  // 1. Sun 11 Oct 2026 — Group A — Amuzukwu vs Ossah FC
  { date: [2026, 10, 11], group: "A", home: "amuzukwu", away: "ossah-fc" },
  // 2. Thu 15 Oct 2026 — Group B — Ndume Okpu FC vs Umuajiji FC
  { date: [2026, 10, 15], group: "B", home: "ndume-okpu-fc", away: "umuajiji-fc" },
  // 3. Sat 17 Oct 2026 — Group C — Nkata FC vs Afaraukwu FC
  { date: [2026, 10, 17], group: "C", home: "nkata-fc", away: "afaraukwu-fc" },
  // 4. Thu 22 Oct 2026 — Group D — Ajata Okwuru FC vs Amuzuoro FC
  { date: [2026, 10, 22], group: "D", home: "ajata-okwuru-fc", away: "amuzuoro-fc" },
  // 5. Sat 24 Oct 2026 — Group A — Umuhu Ajata vs Ikeaha FC
  { date: [2026, 10, 24], group: "A", home: "umuhu-ajata", away: "ikeaha-fc" },
  // 6. Sun 25 Oct 2026 — Group B — Umuana FC vs Ugba FC
  { date: [2026, 10, 25], group: "B", home: "umuana-fc", away: "ugba-fc" },
  // 7. Thu 29 Oct 2026 — Group C — Okwuta FC vs Iyienyi FC
  { date: [2026, 10, 29], group: "C", home: "okwuta-fc", away: "iyienyi-fc" },
  // 8. Sat 31 Oct 2026 — Group D — Avonkwu FC vs Amatoh FC
  { date: [2026, 10, 31], group: "D", home: "avonkwu-fc", away: "amatoh-fc" },
  // 9. Sun 1 Nov 2026 — Group A — Amuzukwu vs Umuhu Ajata
  { date: [2026, 11, 1], group: "A", home: "amuzukwu", away: "umuhu-ajata" },
  // 10. Thu 5 Nov 2026 — Group B — Ndume Okpu FC vs Umuana FC
  { date: [2026, 11, 5], group: "B", home: "ndume-okpu-fc", away: "umuana-fc" },
  // 11. Sat 7 Nov 2026 — Group C — Nkata FC vs Okwuta FC
  { date: [2026, 11, 7], group: "C", home: "nkata-fc", away: "okwuta-fc" },
  // 12. Sun 8 Nov 2026 — Group D — Ajata Okwuru FC vs Avonkwu FC
  { date: [2026, 11, 8], group: "D", home: "ajata-okwuru-fc", away: "avonkwu-fc" },
  // 13. Thu 12 Nov 2026 — Group A — Ikeaha FC vs Ossah FC
  { date: [2026, 11, 12], group: "A", home: "ikeaha-fc", away: "ossah-fc" },
  // 14. Sat 14 Nov 2026 — Group B — Umuajiji FC vs Ugba FC
  { date: [2026, 11, 14], group: "B", home: "umuajiji-fc", away: "ugba-fc" },
  // 15. Thu 19 Nov 2026 — Group C — Afaraukwu FC vs Iyienyi FC
  { date: [2026, 11, 19], group: "C", home: "afaraukwu-fc", away: "iyienyi-fc" },
  // 16. Thu 26 Nov 2026 — Group D — Amuzuoro FC vs Amatoh FC
  { date: [2026, 11, 26], group: "D", home: "amuzuoro-fc", away: "amatoh-fc" },
  // 17. Sat 28 Nov 2026 — Group A — Amuzukwu vs Ikeaha FC
  { date: [2026, 11, 28], group: "A", home: "amuzukwu", away: "ikeaha-fc" },
  // 18. Thu 3 Dec 2026 — Group B — Ndume Okpu FC vs Ugba FC
  { date: [2026, 12, 3], group: "B", home: "ndume-okpu-fc", away: "ugba-fc" },
  // 19. Sat 5 Dec 2026 — Group C — Nkata FC vs Iyienyi FC
  { date: [2026, 12, 5], group: "C", home: "nkata-fc", away: "iyienyi-fc" },
  // 20. Sun 6 Dec 2026 — Group D — Ajata Okwuru FC vs Amatoh FC
  { date: [2026, 12, 6], group: "D", home: "ajata-okwuru-fc", away: "amatoh-fc" },
  // 21. Thu 10 Dec 2026 — Group A — Umuhu Ajata vs Ossah FC
  { date: [2026, 12, 10], group: "A", home: "umuhu-ajata", away: "ossah-fc" },
  // 22. Sat 12 Dec 2026 — Group B — Umuajiji FC vs Umuana FC
  { date: [2026, 12, 12], group: "B", home: "umuajiji-fc", away: "umuana-fc" },
  // 23. Sun 13 Dec 2026 — Group C — Afaraukwu FC vs Okwuta FC
  { date: [2026, 12, 13], group: "C", home: "afaraukwu-fc", away: "okwuta-fc" },
  // 24. Thu 17 Dec 2026 — Group D — Amuzuoro FC vs Avonkwu FC
  { date: [2026, 12, 17], group: "D", home: "amuzuoro-fc", away: "avonkwu-fc" },
];

const KNOCKOUT_FIXTURES = [
  { date: [2026, 12, 19], round: "QF1", homeSlot: "Winner Group A", awaySlot: "Runner-up Group B" },
  { date: [2026, 12, 20], round: "QF2", homeSlot: "Winner Group B", awaySlot: "Runner-up Group A" },
  { date: [2026, 12, 24], round: "QF3", homeSlot: "Winner Group C", awaySlot: "Runner-up Group D" },
  { date: [2026, 12, 26], round: "QF4", homeSlot: "Winner Group D", awaySlot: "Runner-up Group C" },
  { date: [2026, 12, 27], round: "SF1", homeSlot: "Winner QF1", awaySlot: "Winner QF3" },
  { date: [2026, 12, 31], round: "SF2", homeSlot: "Winner QF2", awaySlot: "Winner QF4" },
  { date: [2027, 1, 2], round: "THIRD", homeSlot: "Loser SF1", awaySlot: "Loser SF2" },
  { date: [2027, 1, 3], round: "FINAL", homeSlot: "Winner SF1", awaySlot: "Winner SF2" },
];

async function main() {
  console.log("Seeding Ibeku League 2026...");

  // Groups
  for (const g of GROUPS) {
    await prisma.group.upsert({
      where: { code: g.code },
      update: { name: g.name, displayOrder: g.displayOrder },
      create: g,
    });
  }
  console.log("✓ Groups");

  const groups = await prisma.group.findMany();
  const groupMap = Object.fromEntries(groups.map((g) => [g.code, g.id]));

  // Teams
  for (const t of TEAMS) {
    await prisma.team.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        shortName: t.shortName,
        groupId: groupMap[t.groupCode],
      },
      create: {
        name: t.name,
        slug: t.slug,
        shortName: t.shortName,
        groupId: groupMap[t.groupCode],
      },
    });
  }
  console.log("✓ Teams");

  const teams = await prisma.team.findMany();
  const teamMap = Object.fromEntries(teams.map((t) => [t.slug, t.id]));

  // Group fixtures (idempotent by stage+home+away+date)
  for (const f of GROUP_FIXTURES) {
    const existing = await prisma.match.findFirst({
      where: {
        stage: "GROUP",
        homeTeamId: teamMap[f.home],
        awayTeamId: teamMap[f.away],
        groupId: groupMap[f.group],
      },
    });

    if (!existing) {
      await prisma.match.create({
        data: {
          stage: "GROUP",
          groupId: groupMap[f.group],
          homeTeamId: teamMap[f.home],
          awayTeamId: teamMap[f.away],
          kickoffAt: lagosDateToUtc(f.date[0], f.date[1], f.date[2]),
          status: "SCHEDULED",
        },
      });
    }
  }
  console.log("✓ Group fixtures");

  // Knockout fixtures
  for (const f of KNOCKOUT_FIXTURES) {
    const stage =
      f.round.startsWith("QF")
        ? "QUARTER_FINAL"
        : f.round.startsWith("SF")
          ? "SEMI_FINAL"
          : f.round === "THIRD"
            ? "THIRD_PLACE"
            : "FINAL";

    const existing = await prisma.match.findFirst({
      where: { stage, round: f.round },
    });

    if (!existing) {
      await prisma.match.create({
        data: {
          stage,
          round: f.round,
          homeSlot: f.homeSlot,
          awaySlot: f.awaySlot,
          kickoffAt: lagosDateToUtc(f.date[0], f.date[1], f.date[2]),
          status: "SCHEDULED",
        },
      });
    }
  }
  console.log("✓ Knockout fixtures");

  // App settings
  await prisma.appSetting.upsert({
    where: { key: "sponsor" },
    update: {
      value:
        "Ibeku League 2026 is sponsored by High Chief Dickson Oguguo Nzenwa Aku Bara-Oha 1 Of Ibeku Ancient Kingdom.",
    },
    create: {
      key: "sponsor",
      value:
        "Ibeku League 2026 is sponsored by High Chief Dickson Oguguo Nzenwa Aku Bara-Oha 1 Of Ibeku Ancient Kingdom.",
    },
  });

  await prisma.appSetting.upsert({
    where: { key: "competition_name" },
    update: { value: "Ibeku League 2026" },
    create: { key: "competition_name", value: "Ibeku League 2026" },
  });

  console.log("✓ Settings");
  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
