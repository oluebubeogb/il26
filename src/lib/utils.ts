import { clsx, type ClassValue } from "clsx";
import { formatInTimeZone } from "date-fns-tz";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const LAGOS = "Africa/Lagos";

export function formatMatchDate(date: Date | string | null | undefined): string {
  if (!date) return "Date TBC";
  const d = typeof date === "string" ? new Date(date) : date;
  return formatInTimeZone(d, LAGOS, "EEE d MMM yyyy");
}

export function formatMatchTime(date: Date | string | null | undefined): string {
  if (!date) return "Time TBC";
  // If time is midnight UTC we treat as date-only → Time TBC
  const d = typeof date === "string" ? new Date(date) : date;
  const hours = d.getUTCHours();
  const mins = d.getUTCMinutes();
  if (hours === 0 && mins === 0) return "Time TBC";
  return formatInTimeZone(d, LAGOS, "HH:mm");
}

export function formatMatchDateTime(date: Date | string | null | undefined): string {
  if (!date) return "Date & Time TBC";
  const d = typeof date === "string" ? new Date(date) : date;
  const time = formatMatchTime(d);
  const day = formatMatchDate(d);
  if (time === "Time TBC") return day;
  return `${day} · ${time}`;
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    SCHEDULED: "Scheduled",
    LIVE: "Live",
    HALF_TIME: "Half-time",
    FULL_TIME: "Full-time",
    POSTPONED: "Postponed",
    CANCELLED: "Cancelled",
  };
  return map[status] || status;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    SCHEDULED: "bg-slate-100 text-slate-700",
    LIVE: "bg-red-100 text-red-700 animate-pulse",
    HALF_TIME: "bg-amber-100 text-amber-800",
    FULL_TIME: "bg-emerald-100 text-emerald-800",
    POSTPONED: "bg-orange-100 text-orange-800",
    CANCELLED: "bg-gray-200 text-gray-600",
  };
  return map[status] || "bg-slate-100 text-slate-700";
}

export function teamInitials(name: string, shortName?: string | null): string {
  if (shortName) return shortName.slice(0, 3).toUpperCase();
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}
