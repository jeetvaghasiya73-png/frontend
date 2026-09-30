/**
 * Cleanly formats scraped service, industry, or category strings.
 * Converts raw stringified Python dicts, JSON arrays/objects, or messy scraped headers
 * into clean, readable text (e.g. "Designer • Office, Restaurant").
 */
export function formatServiceText(raw?: string | null): string {
  if (!raw || typeof raw !== "string") return "General Services";
  
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "[]" || trimmed === "{}" || trimmed === "null" || trimmed === "None") {
    return "General Services";
  }

  // 1. Try parsing if it's a valid JSON array or object
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        const items = parsed
          .map((item) => (typeof item === "string" ? item : item?.att || item?.val || item?.name || ""))
          .filter(Boolean);
        if (items.length > 0) return items.join(", ");
      }
    } catch {
      // Ignore JSON parse error and fallback to regex extraction below
    }
  }

  // 2. Extract 'att' or 'val' from Python stringified dicts like [{'att': 'Designer', ...}]
  if (trimmed.includes("'att':") || trimmed.includes('"att":') || trimmed.includes("'val':") || trimmed.includes('"val":')) {
    const sections = trimmed.split("|");
    const extractedCategories: string[] = [];

    for (const sec of sections) {
      // Find all 'att': '...' or "att": "..."
      const attMatches = [...sec.matchAll(/['"]att['"]\s*:\s*['"]([^'"]+)['"]/gi)];
      const valMatches = [...sec.matchAll(/['"]val['"]\s*:\s*['"]([^'"]+)['"]/gi)];

      const values: string[] = [];
      attMatches.forEach((m) => {
        if (m[1] && m[1].trim()) values.push(m[1].trim());
      });

      if (values.length === 0) {
        valMatches.forEach((m) => {
          if (m[1] && m[1].trim()) values.push(m[1].trim());
        });
      }

      if (values.length > 0) {
        const uniqueVals = Array.from(new Set(values));
        extractedCategories.push(uniqueVals.join(", "));
      }
    }

    if (extractedCategories.length > 0) {
      // Deduplicate items across all categories
      const allUnique = Array.from(
        new Set(extractedCategories.flatMap((cat) => cat.split(", ").map((s) => s.trim())))
      ).filter(Boolean);

      if (allUnique.length > 0) {
        return allUnique.join(" • ");
      }
    }
  }

  // 3. Fallback: Cleanup remaining code markers, brackets, quotes, URLs
  let clean = trimmed
    .replace(/http[s]?:\/\/\S+/gi, "")
    .replace(/\/Vadodara\/\S+/gi, "")
    .replace(/nct-\d+/gi, "")
    .replace(/['"\[\]\{\}]/g, "")
    .replace(/\b(att|val|image|avl|url|image_url)\b\s*:\s*/gi, "")
    .replace(/Profession:|Project Type:|Furniture type:|Type:/gi, "")
    .replace(/,\s*,+/g, ",")
    .replace(/\s+/g, " ")
    .trim();

  // Strip leading/trailing commas or pipes
  clean = clean.replace(/^[,\s|]+|[,\s|]+$/g, "");

  return clean || "General Services";
}

/**
 * Checks if a website URL is valid, real, and not a placeholder like "none", "null", "N/A", etc.
 */
export function isValidWebsite(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const cleaned = url.trim().toLowerCase();
  if (
    !cleaned ||
    cleaned === "none" ||
    cleaned === "null" ||
    cleaned === "n/a" ||
    cleaned === "na" ||
    cleaned === "-" ||
    cleaned === "undefined" ||
    cleaned === "false" ||
    cleaned === "http://none" ||
    cleaned === "https://none" ||
    cleaned === "none/" ||
    cleaned.startsWith("http://none") ||
    cleaned.startsWith("https://none")
  ) {
    return false;
  }
  return true;
}

/**
 * Returns a properly formatted HTTPS/HTTP URL if valid, or null if invalid/placeholder.
 */
export function formatWebsiteUrl(url?: string | null): string | null {
  if (!isValidWebsite(url)) return null;
  const trimmed = url!.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Formats any phone number string into a clean 10-digit mobile number.
 * Strips leading zeros ('0'), country codes ('91'), spaces, and non-digit characters.
 * Example: '076228 76422' -> '7622876422', '09173739080' -> '9173739080', '919173739080' -> '9173739080'
 */
export function format10DigitPhone(phone?: string | null): string {
  if (!phone || typeof phone !== "string") return "7990738939";
  let digits = phone.trim().replace(/\D/g, "");
  if (!digits) return "7990738939";
  while (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  if (digits.startsWith("9191")) {
    digits = digits.slice(4);
  } else if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  if (digits.length > 10) {
    digits = digits.slice(-10);
  }
  if (digits.length !== 10) {
    return "7990738939";
  }
  return digits;
}

/**
 * Returns a tel: dialer link for a phone number using strictly 10 digits without leading 0.
 * Example: '076228 76422' -> 'tel:7622876422'
 */
export function formatDialerUrl(phone?: string | null): string {
  const clean = format10DigitPhone(phone);
  return clean ? `tel:${clean}` : "tel:";
}

export const IST_TIMEZONE = "Asia/Kolkata";
export const IST_LOCALE = "en-IN";

/**
 * Accurately parses any date representation (ISO with offset, ISO naive, SQLite string, epoch number, Date)
 * into a valid Date object.
 *
 * Critical rule for Indian Standard Time (IST):
 * - If a string contains explicit timezone info (e.g. "Z", "+05:30", "-04:00"), it is parsed as an exact moment in time.
 * - If a string is naive (e.g. "2026-09-30 18:21:14" or "2026-09-30T18:21:14") without timezone offset,
 *   standard SQL databases store naive timestamps in UTC. Adding 'Z' ensures JavaScript treats it as UTC,
 *   so formatting with timeZone: "Asia/Kolkata" accurately adds +05:30 to show Indian Standard Time.
 */
export function parseDateSafely(dateInput?: string | number | Date | null): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;
  if (typeof dateInput === "number") {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  }

  const str = String(dateInput).trim();
  if (!str || str === "null" || str === "undefined" || str === "N/A") return null;

  // 1. If string already has a timezone indicator (+HH:MM, -HH:MM, or trailing Z)
  if (/Z|[+-]\d{2}:?\d{2}$/i.test(str)) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  // 2. If naive ISO or SQL format (e.g., '2026-09-30 18:21:14' or '2026-09-30T18:21:14')
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(str)) {
    const normalized = str.replace(" ", "T") + "Z";
    const d = new Date(normalized);
    if (!isNaN(d.getTime())) return d;
  }

  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Formats any date string/object into Indian Standard Time (IST - Asia/Kolkata).
 * Output example: "28 Sep 2026" or "Sep 28, 2026"
 */
export function formatISTDate(
  dateInput?: string | number | Date | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateInput) return "N/A";
  try {
    const d = parseDateSafely(dateInput);
    if (!d) return "N/A";
    return d.toLocaleDateString("en-IN", {
      timeZone: IST_TIMEZONE,
      month: "short",
      day: "numeric",
      year: "numeric",
      ...options,
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats time into Indian Standard Time (IST - Asia/Kolkata).
 * Output example: "10:30 PM"
 */
export function formatISTTime(
  dateInput?: string | number | Date | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateInput) return "";
  try {
    const d = parseDateSafely(dateInput);
    if (!d) return "";
    return d.toLocaleTimeString("en-IN", {
      timeZone: IST_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      ...options,
    });
  } catch {
    return "";
  }
}

/**
 * Formats full date and time into Indian Standard Time (IST - Asia/Kolkata).
 * Output example: "28 Sep 2026, 10:30 PM"
 */
export function formatISTDateTime(
  dateInput?: string | number | Date | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateInput) return "N/A";
  try {
    const d = parseDateSafely(dateInput);
    if (!d) return "N/A";
    return d.toLocaleString("en-IN", {
      timeZone: IST_TIMEZONE,
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      ...options,
    });
  } catch {
    return String(dateInput);
  }
}

