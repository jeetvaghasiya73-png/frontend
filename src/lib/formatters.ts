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
  if (!phone || typeof phone !== "string") return "";
  let digits = phone.trim().replace(/\D/g, "");
  if (!digits) return "";
  while (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  if (digits.length > 10) {
    digits = digits.slice(-10);
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

