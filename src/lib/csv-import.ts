import { parse } from "csv-parse/sync";

export type CsvRowResult = {
  rowNumber: number;
  fullName: string | null;
  position: string | null;
  age: number | null;
  phone: string | null;
  jerseyNumber: number | null;
  status: "valid" | "error" | "duplicate";
  error?: string;
};

const NAME_HEADERS = ["name", "player", "full_name", "player_name", "fullname"];
const POSITION_HEADERS = ["position", "pos"];
const AGE_HEADERS = ["age"];
const PHONE_HEADERS = ["phone", "phone_number", "mobile"];
const JERSEY_HEADERS = ["jersey", "jersey_number", "number", "shirt"];

function pick(row: Record<string, string>, keys: string[]): string | null {
  for (const k of keys) {
    const v = row[k];
    if (v != null && String(v).trim() !== "") return String(v).trim();
  }
  return null;
}

function normalizeHeader(h: string): string {
  return h
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

export function parsePlayerCsv(content: string): {
  rows: CsvRowResult[];
  hasHeader: boolean;
} {
  // Strip BOM
  const text = content.replace(/^\uFEFF/, "");

  let records: string[][];
  try {
    records = parse(text, {
      relax_column_count: true,
      skip_empty_lines: true,
      trim: true,
    }) as string[][];
  } catch (e) {
    return {
      rows: [
        {
          rowNumber: 1,
          fullName: null,
          position: null,
          age: null,
          phone: null,
          jerseyNumber: null,
          status: "error",
          error: "Could not parse CSV: " + (e as Error).message,
        },
      ],
      hasHeader: false,
    };
  }

  if (records.length === 0) {
    return { rows: [], hasHeader: false };
  }

  // Detect header
  const first = records[0].map(normalizeHeader);
  const hasHeader = first.some((h) => NAME_HEADERS.includes(h));

  let dataRows: string[][];
  let headers: string[];

  if (hasHeader) {
    headers = first;
    dataRows = records.slice(1);
  } else {
    // Assume first column is name
    headers = ["name"];
    dataRows = records;
  }

  const rows: CsvRowResult[] = [];

  dataRows.forEach((cols, idx) => {
    const rowNumber = hasHeader ? idx + 2 : idx + 1;
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = cols[i] ?? "";
    });
    // Also map by position if no header
    if (!hasHeader && cols[0]) obj["name"] = cols[0];
    if (!hasHeader && cols[1]) obj["position"] = cols[1];
    if (!hasHeader && cols[2]) obj["age"] = cols[2];
    if (!hasHeader && cols[3]) obj["jersey"] = cols[3];

    const fullName = pick(obj, NAME_HEADERS);
    if (!fullName) {
      rows.push({
        rowNumber,
        fullName: null,
        position: null,
        age: null,
        phone: null,
        jerseyNumber: null,
        status: "error",
        error: "Missing player name",
      });
      return;
    }

    const position = pick(obj, POSITION_HEADERS);
    const ageStr = pick(obj, AGE_HEADERS);
    const phone = pick(obj, PHONE_HEADERS);
    const jerseyStr = pick(obj, JERSEY_HEADERS);

    let age: number | null = null;
    if (ageStr) {
      const n = parseInt(ageStr, 10);
      if (isNaN(n) || n < 10 || n > 60) {
        rows.push({
          rowNumber,
          fullName,
          position,
          age: null,
          phone,
          jerseyNumber: null,
          status: "error",
          error: `Invalid age: ${ageStr}`,
        });
        return;
      }
      age = n;
    }

    let jerseyNumber: number | null = null;
    if (jerseyStr) {
      const n = parseInt(jerseyStr, 10);
      if (isNaN(n) || n < 0 || n > 99) {
        rows.push({
          rowNumber,
          fullName,
          position,
          age,
          phone,
          jerseyNumber: null,
          status: "error",
          error: `Invalid jersey: ${jerseyStr}`,
        });
        return;
      }
      jerseyNumber = n;
    }

    rows.push({
      rowNumber,
      fullName,
      position,
      age,
      phone,
      jerseyNumber,
      status: "valid",
    });
  });

  return { rows, hasHeader };
}
