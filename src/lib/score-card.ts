/** Generate a shareable SVG score card (1200x1200) */

export type ScoreCardData = {
  homeName: string;
  awayName: string;
  homeScore: number | null;
  awayScore: number | null;
  htHome?: number | null;
  htAway?: number | null;
  dateLabel: string;
  groupOrRound: string;
  status: string;
  homeInitials: string;
  awayInitials: string;
};

const SPONSOR =
  "Sponsored by High Chief Dickson Oguguo Nzenwa Aku Bara-Oha 1 Of Ibeku Ancient Kingdom";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function generateScoreCardSvg(d: ScoreCardData): string {
  const scoreText =
    d.homeScore != null && d.awayScore != null
      ? `${d.homeScore} – ${d.awayScore}`
      : "vs";
  const ht =
    d.htHome != null && d.htAway != null
      ? `HT ${d.htHome}-${d.htAway}`
      : "";
  const statusLabel =
    d.status === "FULL_TIME"
      ? "FULL TIME"
      : d.status === "HALF_TIME"
        ? "HALF TIME"
        : d.status === "LIVE"
          ? "LIVE"
          : "MATCH";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#134e4a"/>
      <stop offset="100%" style="stop-color:#0f766e"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1200" fill="url(#bg)"/>
  <rect x="40" y="40" width="1120" height="1120" rx="24" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>

  <text x="600" y="120" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="36" font-weight="700">IBEKU LEAGUE 2026</text>
  <text x="600" y="165" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="system-ui,sans-serif" font-size="22">${esc(d.groupOrRound)} · ${esc(d.dateLabel)}</text>

  <text x="600" y="230" text-anchor="middle" fill="#f59e0b" font-family="system-ui,sans-serif" font-size="20" font-weight="600" letter-spacing="4">${statusLabel}</text>

  <!-- Home -->
  <circle cx="300" cy="420" r="70" fill="rgba(255,255,255,0.15)"/>
  <text x="300" y="430" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="32" font-weight="700">${esc(d.homeInitials)}</text>
  <text x="300" y="540" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="28" font-weight="600">${esc(d.homeName.slice(0, 18))}</text>

  <!-- Score -->
  <text x="600" y="440" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="72" font-weight="800">${esc(scoreText)}</text>
  ${ht ? `<text x="600" y="490" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="system-ui,sans-serif" font-size="20">${esc(ht)}</text>` : ""}

  <!-- Away -->
  <circle cx="900" cy="420" r="70" fill="rgba(255,255,255,0.15)"/>
  <text x="900" y="430" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="32" font-weight="700">${esc(d.awayInitials)}</text>
  <text x="900" y="540" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="28" font-weight="600">${esc(d.awayName.slice(0, 18))}</text>

  <text x="600" y="1050" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-family="system-ui,sans-serif" font-size="16">${esc(SPONSOR.slice(0, 80))}</text>
  <text x="600" y="1085" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-family="system-ui,sans-serif" font-size="14">ibeku-league.com</text>
</svg>`;
}

export type TableCardRow = {
  pos: number;
  name: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gd: number;
  pts: number;
};

export function generateTableCardSvg(
  groupCode: string,
  rows: TableCardRow[]
): string {
  const rowHeight = 48;
  const startY = 280;
  let rowsSvg = "";
  rows.forEach((r, i) => {
    const y = startY + i * rowHeight;
    const bg = i % 2 === 0 ? "rgba(255,255,255,0.08)" : "transparent";
    rowsSvg += `
    <rect x="80" y="${y - 28}" width="1040" height="${rowHeight}" fill="${bg}"/>
    <text x="110" y="${y}" fill="#fff" font-family="system-ui,sans-serif" font-size="20">${r.pos}</text>
    <text x="180" y="${y}" fill="#fff" font-family="system-ui,sans-serif" font-size="20" font-weight="600">${esc(r.name.slice(0, 20))}</text>
    <text x="520" y="${y}" fill="rgba(255,255,255,0.8)" font-family="system-ui,sans-serif" font-size="18" text-anchor="middle">${r.p}</text>
    <text x="600" y="${y}" fill="rgba(255,255,255,0.8)" font-family="system-ui,sans-serif" font-size="18" text-anchor="middle">${r.w}</text>
    <text x="680" y="${y}" fill="rgba(255,255,255,0.8)" font-family="system-ui,sans-serif" font-size="18" text-anchor="middle">${r.d}</text>
    <text x="760" y="${y}" fill="rgba(255,255,255,0.8)" font-family="system-ui,sans-serif" font-size="18" text-anchor="middle">${r.l}</text>
    <text x="860" y="${y}" fill="rgba(255,255,255,0.8)" font-family="system-ui,sans-serif" font-size="18" text-anchor="middle">${r.gd > 0 ? "+" + r.gd : r.gd}</text>
    <text x="980" y="${y}" fill="#f59e0b" font-family="system-ui,sans-serif" font-size="22" font-weight="700" text-anchor="middle">${r.pts}</text>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#134e4a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1200" fill="url(#bg)"/>
  <text x="600" y="100" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="36" font-weight="700">IBEKU LEAGUE 2026</text>
  <text x="600" y="150" text-anchor="middle" fill="#f59e0b" font-family="system-ui,sans-serif" font-size="28" font-weight="600">GROUP ${esc(groupCode)}</text>
  <text x="110" y="230" fill="rgba(255,255,255,0.5)" font-family="system-ui,sans-serif" font-size="14">#</text>
  <text x="180" y="230" fill="rgba(255,255,255,0.5)" font-family="system-ui,sans-serif" font-size="14">TEAM</text>
  <text x="520" y="230" fill="rgba(255,255,255,0.5)" font-family="system-ui,sans-serif" font-size="14" text-anchor="middle">P</text>
  <text x="600" y="230" fill="rgba(255,255,255,0.5)" font-family="system-ui,sans-serif" font-size="14" text-anchor="middle">W</text>
  <text x="680" y="230" fill="rgba(255,255,255,0.5)" font-family="system-ui,sans-serif" font-size="14" text-anchor="middle">D</text>
  <text x="760" y="230" fill="rgba(255,255,255,0.5)" font-family="system-ui,sans-serif" font-size="14" text-anchor="middle">L</text>
  <text x="860" y="230" fill="rgba(255,255,255,0.5)" font-family="system-ui,sans-serif" font-size="14" text-anchor="middle">GD</text>
  <text x="980" y="230" fill="rgba(255,255,255,0.5)" font-family="system-ui,sans-serif" font-size="14" text-anchor="middle">PTS</text>
  ${rowsSvg}
  <text x="600" y="1120" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-family="system-ui,sans-serif" font-size="14">${esc(SPONSOR.slice(0, 70))}</text>
</svg>`;
}
